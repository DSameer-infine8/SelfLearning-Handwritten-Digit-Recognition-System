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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);

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
    feedback.classList.remove("hidden");
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
 * Loading Overlay
 *********************************************************/
const loader = document.getElementById("loadingOverlay");

function showLoading() {
    loader.classList.remove("hidden");
}

function hideLoading() {
    loader.classList.add("hidden");
}
