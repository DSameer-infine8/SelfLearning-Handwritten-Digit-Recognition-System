/*********************************************************
 * Multi Prediction Show 
 *********************************************************/

console.log("multi.js loaded");


const rt = document.getElementById('rt');
const predEl = document.getElementById('pred');
const barsEl = document.getElementById('bars');



/* ===============================
   Prediction Handling
================================ */

/*   Real
predictBtn.addEventListener('click', predict);


var num;

function setPrediction(res) {
    barsEl.innerHTML = '';

    if (!res) {
        predEl.textContent = '';
        num = '';
        // Show empty bars (0–9)
        for (let i = 0; i < num.length; i++) {
            addBar(i, 0, num);
        }
        return;
    }

    predEl.textContent = String(res.prediction);
    num = String(res.prediction);
    res.probabilities.forEach((p, i) => {
        addBar(i, p, num);
    });
}

function addBar(digit, prob, num) {
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = num[digit];

    const bar = document.createElement('div');
    bar.className = 'bar';

    const fill = document.createElement('span');
    fill.style.width = Math.round(prob * 100) + '%';
    bar.appendChild(fill);

    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = (prob * 100).toFixed(1) + '%';

    barsEl.appendChild(label);
    barsEl.appendChild(bar);
    barsEl.appendChild(value);
}

*/

/* ===============================
   Initial State
================================ */

//    setPrediction(null);


/* ===============================
   Backend Prediction Call
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

/* ===============================
   ChatGPT
================================ */

const multiBtn = document.getElementById("multiModeBtn");

multiBtn.addEventListener("click", testMultiDigitDummy);

function testMultiDigitDummy() {
    showLoading();

    setTimeout(() => {
        const dummyMultiData = {
            sequence: "507",
            digits: [
                { digit: 5, confidence: 0.91 },
                { digit: 0, confidence: 0.88 },
                { digit: 7, confidence: 0.94 }
            ]
        };

        renderMultiDigitResult(dummyMultiData);
        hideLoading();
    }, 800);
}

function renderMultiDigitResult(data) {
    // Switch UI panels
    document.getElementById("singleResults").classList.add("hidden");
    document.getElementById("multiResults").classList.remove("hidden");

    // Update mode badge
    document.getElementById("modeBadge").textContent = "Multi Digit Mode";
    document.getElementById("currentModeMetric").textContent = "Multiple";

    // Show detected sequence
    document.getElementById("pred").textContent = data.sequence;

    // Render bars
    const bars = document.getElementById("bars");
    bars.innerHTML = "";

    data.digits.forEach((item, index) => {
        const bar = document.createElement("div");
        bar.style.marginBottom = "10px";

        bar.innerHTML = `
            <div style="display:flex;justify-content:space-between;">
                <strong>Digit ${index + 1}: ${item.digit}</strong>
                <span>${(item.confidence * 100).toFixed(1)}%</span>
            </div>
            <div style="height:6px;background:#333;border-radius:4px;">
                <div style="
                    width:${item.confidence * 100}%;
                    height:100%;
                    background:linear-gradient(90deg,#ff6600,#ff983f);
                    border-radius:4px;">
                </div>
            </div>
        `;

        bars.appendChild(bar);
    });

    // Hide feedback (optional)
    document.getElementById("feedbackCard").classList.add("hidden");
}

function showLoading() {
    document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden");
}



/* ===============================
   Debounce (Real-time prediction)
================================ */
let t = null;
function debouncedPredict() {
    if (!rt.checked) return;
    clearTimeout(t);
    t = setTimeout(predict, 250);
}
