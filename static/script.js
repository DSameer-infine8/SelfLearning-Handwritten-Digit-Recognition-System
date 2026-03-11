/*********************************************************
 * Canvas Setup
 *********************************************************/
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const canvasGuide = document.getElementById("canvasGuide");
const canvasContainer = document.getElementById("canvasContainer");

let isDrawing = false;
let brushSize = 24;
let isMultiMode = false;

/* High DPI */
const ratio = window.devicePixelRatio || 1;
const BASE_SIZE = 280;
const BRUSH_COLOR = "black";



function initCanvas(width = BASE_SIZE, height = BASE_SIZE) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = BRUSH_COLOR;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
}

initCanvas();

function resizeCanvas(width, height = 280) {
    const ratio = window.devicePixelRatio || 1;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Brush reset
    ctx.strokeStyle = BRUSH_COLOR;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

function getCanvasImage() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 280;
    tempCanvas.height = 280;

    const tctx = tempCanvas.getContext("2d");
    tctx.drawImage(canvas, 0, 0, 280, 280);

    return tempCanvas.toDataURL("image/png");
}


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

canvas.addEventListener("mouseup", () => (isDrawing = false));
canvas.addEventListener("mouseleave", () => (isDrawing = false));

/*********************************************************
 * Brush Slider
 *********************************************************/
const slider = document.getElementById("brushSlider");
const sliderFill = document.getElementById("sliderFill");
const brushValue = document.getElementById("brushValue");

function updateBrush() {
    brushSize = Number(slider.value);
    brushValue.textContent = brushSize;

    const percent =
        ((brushSize - slider.min) / (slider.max - slider.min)) * 100;
    sliderFill.style.width = percent + "%";
}

slider.addEventListener("input", updateBrush);
updateBrush();

/*********************************************************
 * Clear Canvas
 *********************************************************/
document.getElementById("clearBtn").addEventListener("click", () => {
    initCanvas(isMultiMode ? 600 : 280, 280);

    canvasGuide.classList.remove("hidden");
    disablePredict();
    resetFeedback();

    if (isMultiMode) {
        // Stay in MULTI mode
        resetMultiResultUI();
        multiResults.classList.remove("hidden");
        singleResults.classList.add("hidden");
    } else {
        // Stay in SINGLE mode
        resetResultUI();
        singleResults.classList.remove("hidden");
        multiResults.classList.add("hidden");
    }
});


/*********************************************************
 * Predict Button
 *********************************************************/
const predictBtn = document.getElementById("predictSingleBtn");

function enablePredict() {
    predictBtn.disabled = false;
}
function disablePredict() {
    predictBtn.disabled = true;
}

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

/*********************************************************
 * SINGLE DIGIT (Dummy)
 *********************************************************/
predictBtn.addEventListener("click", () => {
    if (isMultiMode) {
        resetMultiResultUI();   // ✅ clear old result
        //fakeMultiPredict();
        realtimeMultiPredict();
    } else {
        singlePredict();
    }
});


async function singlePredict() {
    try {
        showLoading();

        // Capture canvas image
        const image = getCanvasImage();


        // Call backend API
        const res = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image })
        });

        if (!res.ok) {
            throw new Error("Prediction request failed");
        }

        const data = await res.json();

        // Safety check
        if (data.error) {
            throw new Error(data.error);
        }

        // Send result to UI renderer
        renderPrediction({
            prediction: data.prediction,
            confidence: data.confidence,
            probabilities: data.probabilities
        });

    } catch (err) {
        console.error("Single prediction error:", err);
        alert("Prediction failed. Please try again.");
    } finally {
        hideLoading();
    }
}

/*********************************************************
 * Single Result UI
 *********************************************************/
function renderPrediction(data) {
    document.getElementById("predictionEmpty").classList.add("hidden");
    document.getElementById("predictionResult").classList.remove("hidden");

    document.getElementById("resultDigit").textContent = data.prediction;
    document.getElementById("topConfidence").textContent = data.confidence + "%";

    renderConfidenceBars(data);
    showFeedback();
}

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
            </div>`;
        container.appendChild(bar);
    });
}

function resetResultUI() {
    document.getElementById("predictionEmpty").classList.remove("hidden");
    document.getElementById("predictionResult").classList.add("hidden");
    document.getElementById("confidenceSection").classList.add("hidden");
}

/*********************************************************
 * Feedback
 *********************************************************/
/*********************************************************
 * Feedback (Single Digit ONLY)
 *********************************************************/
function showFeedback() {
    // Show feedback only in SINGLE digit mode
    if (!isMultiMode) {
        document.getElementById("feedbackCard").classList.remove("hidden");
    }
}

function resetFeedback() {
    document.getElementById("feedbackCard").classList.add("hidden");
    document.getElementById("feedbackSuccess").classList.add("hidden");
    document.getElementById("feedbackIncorrect").classList.add("hidden");
}

/**
 * YES – Correct
 * → Send feedback to backend
 */
document.getElementById("feedbackYes").onclick = async () => {
    try {
        // Safety: only single digit feedback allowed
        if (isMultiMode) return;

        const imageBase64 = canvas.toDataURL("image/png");

        const predictedDigit = document.getElementById("resultDigit").textContent;

        await fetch("/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: imageBase64,
                label: Number(predictedDigit),
                mode: "single"
            })
        });

        document.getElementById("feedbackSuccess").classList.remove("hidden");

    } catch (err) {
        console.error("Feedback error:", err);
    }
};

/**
 * NO – Incorrect
 * (UI only, no backend save)
 */
document.getElementById("feedbackNo").onclick = () => {
    document.getElementById("feedbackIncorrect").classList.remove("hidden");
};

/*********************************************************
 * MULTI DIGIT MODE
 *********************************************************/
const multiToggleBtn = document.getElementById("multiModeBtn");

multiToggleBtn.addEventListener("click", togglePredictionMode);

function togglePredictionMode() {
    isMultiMode = !isMultiMode;

    if (isMultiMode) {
        // MULTI DIGIT MODE
        canvasContainer.classList.add("multi-mode");
        resizeCanvas(600);

        multiToggleBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="14" height="14"></rect>
            </svg>
            Predict Single Digit
        `;

        modeBadge.textContent = "Multiple Digit Mode";
        currentModeMetric.textContent = "Multiple";

        singleResults.classList.add("hidden");
        multiResults.classList.remove("hidden");

    } else {
        // SINGLE DIGIT MODE
        canvasContainer.classList.remove("multi-mode");
        resizeCanvas(280);

        multiToggleBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Predict Multiple Digits
        `;

        modeBadge.textContent = "Single Digit Mode";
        currentModeMetric.textContent = "Single";

        multiResults.classList.add("hidden");
        singleResults.classList.remove("hidden");
    }

    clearCanvas();
    disablePredict();
    resetResultUI();
    resetMultiResultUI();
    resetFeedback();
    canvasGuide.classList.remove("hidden");
}


function clearCanvas() {
    // Background
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Brush
    ctx.strokeStyle = BRUSH_COLOR;
}



/*********************************************************
 * MULTI DIGIT (Dummy)
 ********************************************************
function fakeMultiPredict() {
    showLoading();
    setTimeout(() => {
        renderMultiDigitResult({
            sequence: "507",
            digits: [
                { digit: 5, confidence: 0.91 },
                { digit: 0, confidence: 0.88 },
                { digit: 7, confidence: 0.94 }
            ]
        });
        hideLoading();
    }, 800);
}
*/

async function realtimeMultiPredict() {
    if (!isMultiMode) return;

    try {
        showLoading();

        const image = canvas.toDataURL("image/png");

        const res = await fetch("/predict-multi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image })
        });

        const data = await res.json();
        if (data.error) return;

        renderMultiDigitResult(data);

    } catch (err) {
        console.error("Realtime multi error:", err);
    } finally {
        hideLoading();
    }
}


function renderMultiDigitResult(data) {
    document.getElementById("pred").textContent = data.sequence;
    const bars = document.getElementById("bars");
    bars.innerHTML = "";

    data.digits.forEach((item, i) => {
        const div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;">
                <strong>Digit ${i + 1}: ${item.digit}</strong>
                <span>${(item.confidence * 100).toFixed(1)}%</span>
            </div>
            <div style="height:6px;background:#333;border-radius:4px;">
                <div style="
                    width:${item.confidence * 100}%;
                    height:100%;
                    background:linear-gradient(90deg,#ff6600,#ff983f);
                    border-radius:4px;">
                </div>
            </div>`;
        bars.appendChild(div);
    });

    document.getElementById("feedbackCard").classList.add("hidden");
}


function resetMultiResultUI() {
    document.getElementById("pred").textContent = "";
    document.getElementById("bars").innerHTML = "";
}

/*********************************************************
 * COPY PREDICTION TO CLIPBOARD
 *********************************************************/
function copyPrediction() {

    const prediction = document.getElementById("pred").textContent;

    if (!prediction) {
        alert("No prediction to copy!");
        return;
    }

    navigator.clipboard.writeText(prediction)
        .then(() => {

            // Optional UI feedback
            const btn = document.getElementById("copyPredictionBtn");
            const oldIcon = btn.innerHTML;

            btn.innerHTML = "✅";

            setTimeout(() => {
                btn.innerHTML = oldIcon;
            }, 1500);

        })
        .catch(err => {
            console.error("Copy failed:", err);
        });
}



/*********************************************************
 * API call for Prediction -Single
 *********************************************************/

/*
const dataURL = canvas.toDataURL("image/png");

const res = await fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL })
});

*/



/* ===============================
   Backend Prediction Call  - Multiple
================================ */

/*
async function predict() {
    try {
        const dataURL = canvas.toDataURL('image/png');

        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataURL })
        });

        const json = await res.json();
        if (json.error) throw new Error(json.error);

        setPrediction(json);
    } catch (err) {
        console.error('Prediction error:', err);
    }
}

*/



