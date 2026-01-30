/*********************************************************
 * Canvas Setup
 *********************************************************/
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const canvasGuide = document.getElementById("canvasGuide");

let isDrawing = false;
let brushSize = 24;

/* High DPI fix */
const ratio = window.devicePixelRatio || 1;
const size = 280;

canvas.width = size * ratio;
canvas.height = size * ratio;
canvas.style.width = size + "px";
canvas.style.height = size + "px";
ctx.scale(ratio, ratio);

/* Initial canvas background */
ctx.fillStyle = "black";
ctx.fillRect(0, 0, size, size);
ctx.strokeStyle = "white";
ctx.lineCap = "round";
ctx.lineJoin = "round";

/*********************************************************
 * Drawing Logic
 *********************************************************/
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    canvasGuide.classList.add("hidden");
    enablePredict();
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

function stopDrawing() {
    isDrawing = false;
}

/*********************************************************
 * Brush Slider Logic
 *********************************************************/
const slider = document.getElementById("brushSlider");
const sliderFill = document.getElementById("sliderFill");
const brushValue = document.getElementById("brushValue");

function updateBrush() {
    brushSize = Number(slider.value);
    brushValue.textContent = brushSize;

    const min = slider.min;
    const max = slider.max;
    const percent = ((brushSize - min) / (max - min)) * 100;
    sliderFill.style.width = percent + "%";
}

slider.addEventListener("input", updateBrush);
updateBrush();

/*********************************************************
 * Clear Canvas
 *********************************************************/
document.getElementById("clearBtn").addEventListener("click", () => {
    const ratio = window.devicePixelRatio || 1;

    // Reset transform & clear everything
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore DPI scale
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);

    // Restore brush
    ctx.strokeStyle = "white";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    canvasGuide.classList.remove("hidden");
    disablePredict();
    resetResultUI();
    resetFeedback();
});


/*********************************************************
 * Predict Button Enable / Disable
 *********************************************************/
const predictBtn = document.getElementById("predictSingleBtn");

function enablePredict() {
    predictBtn.disabled = false;
}

function disablePredict() {
    predictBtn.disabled = true;
}


/*********************************************************
 * API call for Prediction
 *********************************************************/

/*
const dataURL = canvas.toDataURL("image/png");

const res = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL })
});

*/

/*********************************************************
 * Dummy Prediction (Frontend Testing)
 *********************************************************/
predictBtn.addEventListener("click", fakePredict);

function fakePredict() {
    showLoading();

    setTimeout(() => {
        const dummyData = {
            prediction: 7,
            confidence: 92.4,
            probabilities: [0.01, 0.01, 0.02, 0.01, 0.03, 0.02, 0.03, 0.92, 0.02, 0.03]
        };

        renderPrediction(dummyData);
        hideLoading();
    }, 800);
}

/*********************************************************
 * Render Prediction UI
 *********************************************************/
function renderPrediction(data) {
    document.getElementById("predictionEmpty").classList.add("hidden");
    document.getElementById("predictionResult").classList.remove("hidden");

    document.getElementById("resultDigit").textContent = data.prediction;
    document.getElementById("topConfidence").textContent = data.confidence + "%";

    renderConfidenceBars(data);
    showFeedback();
}

/*********************************************************
 * Confidence Bars
 *********************************************************/
function renderConfidenceBars(data) {
    const container = document.getElementById("confidenceBars");
    const section = document.getElementById("confidenceSection");

    container.innerHTML = "";
    section.classList.remove("hidden");

    data.probabilities.forEach((value, digit) => {
        const bar = document.createElement("div");
        bar.className = "confidence-bar";

        bar.innerHTML = `
            <div class="bar-label">${digit}</div>
            <div class="bar-container">
                <div class="bar-fill ${digit === data.prediction ? "predicted" : ""}"
                     style="width:${value * 100}%"></div>
            </div>
            <div class="bar-value ${digit === data.prediction ? "predicted" : ""}">
                ${(value * 100).toFixed(1)}%
            </div>
        `;

        container.appendChild(bar);
    });
}

/*********************************************************
 * Reset Result UI
 *********************************************************/
function resetResultUI() {
    document.getElementById("predictionEmpty").classList.remove("hidden");
    document.getElementById("predictionResult").classList.add("hidden");
    document.getElementById("confidenceSection").classList.add("hidden");
}


/*********************************************************
 * Feed Back shows
 *********************************************************/

function showFeedback() {
    const feedback = document.getElementById("feedbackCard");
    const multiResults = document.getElementById("multiResults");

    // Show feedback ONLY when multiResults is hidden (single digit mode)
    if (multiResults.classList.contains("hidden")) {
        feedback.classList.remove("hidden");
    }
}

function resetFeedback() {
    document.getElementById("feedbackCard").classList.add("hidden");
    document.getElementById("feedbackSuccess").classList.add("hidden");
}

const feedbackYes = document.getElementById("feedbackYes");
const feedbackNo = document.getElementById("feedbackNo");

const feedbackSuccess = document.getElementById("feedbackSuccess");
const feedbackIncorrect = document.getElementById("feedbackIncorrect");

// YES → success
feedbackYes.addEventListener("click", () => {
    feedbackSuccess.classList.remove("hidden");
    feedbackIncorrect.classList.add("hidden");
});

// NO → incorrect
feedbackNo.addEventListener("click", () => {
    feedbackIncorrect.classList.remove("hidden");
    feedbackSuccess.classList.add("hidden");
});


/*********************************************************
 * Multi-Digits Feature
 *********************************************************/

const multiToggleBtn = document.getElementById("multiModeBtn");

const singleResults = document.getElementById("singleResults");
const multiResults = document.getElementById("multiResults");

const modeBadge = document.getElementById("modeBadge");
const currentModeMetric = document.getElementById("currentModeMetric");

let isMultiMode = false;
multiToggleBtn.addEventListener("click", togglePredictionMode);


// Increase Canvas width for multi-digits 

const canvasContainer = document.getElementById("canvasContainer");

if (multiToggleBtn) {
    multiToggleBtn.addEventListener("click", togglePredictionMode);
}

function togglePredictionMode() {
    isMultiMode = !isMultiMode;

    resizeCanvasForMode(); // ✅ correct position

    if (isMultiMode) {
        canvasContainer.classList.add("multi-mode");
        multiResults.classList.remove("hidden");
        singleResults.classList.add("hidden");

        multiToggleBtn.textContent = "Predict Single Digit";
        predictBtn.textContent = "Predict Multiple Digits";

        modeBadge.textContent = "Multiple Digit Mode";
        currentModeMetric.textContent = "Multiple";
    } else {
        canvasContainer.classList.remove("multi-mode");
        multiResults.classList.add("hidden");
        singleResults.classList.remove("hidden");

        multiToggleBtn.textContent = "Predict Multiple Digits";
        predictBtn.textContent = "Predict Digit";

        modeBadge.textContent = "Single Digit Mode";
        currentModeMetric.textContent = "Single";
    }
}


const drawingCanvas = document.querySelector("#drawingCanvas")

function resizeCanvasForMode() {
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = isMultiMode ? 600 : 280;
    const cssHeight = 280;

    // Save drawing
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    temp.getContext("2d").drawImage(canvas, 0, 0);

    // Resize canvas (resets state)
    canvas.width = cssWidth * ratio;
    canvas.height = cssHeight * ratio;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Restore drawing
    ctx.drawImage(
        temp,
        0, 0, temp.width, temp.height,
        0, 0, cssWidth, cssHeight
    );

    // ✅ RESTORE BRUSH STATE
    ctx.strokeStyle = "white";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
}


/*********************************************************
 * Multi Prediction Show --> multi.js
 *********************************************************/


/*********************************************************
 * Loading Overlay
 *********************************************************/
const loader = document.getElementById("loadingOverlay");

function showLoading() {
    loader.classList.remove("hidden");
}

function hideLoading() {
    loader.classList.add("hidden");
}
