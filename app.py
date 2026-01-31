from flask import Flask, request,render_template, jsonify
import numpy as np
import cv2
import base64
from tensorflow.keras.models import load_model
from data_saver import save_feedback

from utils.preprocess import preprocess_single_digit
from utils.segment import segment_digits

app = Flask(__name__)

# Load trained model
model = load_model("models/best_cnn.h5")

@app.route("/")
def index():
    return render_template("index.html")

# -------------------------------
# Utility: Decode base64 image
# -------------------------------
def decode_image(data_url):
    header, encoded = data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)
    return img


# ===============================
# SINGLE DIGIT PREDICTION
# ===============================
@app.route("/predict", methods=["POST"])
def predict_single():
    try:
        data = request.json
        img = decode_image(data["image"])

        processed = preprocess_single_digit(img)
        assert processed.shape == (28, 28)
        processed = processed.reshape(1, 28, 28, 1)

        probs = model.predict(processed)[0]
        digit = int(np.argmax(probs))
        confidence = round(float(np.max(probs)) * 100, 2)

        return jsonify({
            "prediction": digit,
            "confidence": confidence,
            "probabilities": [round(float(p), 2) for p in probs]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===============================
# MULTI DIGIT PREDICTION
# ===============================
@app.route("/predict-multi", methods=["POST"])
def predict_multi():
    try:
        data = request.json
        img = decode_image(data["image"])

        digit_images = segment_digits(img)

        digits_output = []
        sequence = ""

        for dimg in digit_images:
            processed = preprocess_single_digit(dimg)
            processed = processed.reshape(1, 28, 28, 1)

            probs = model.predict(processed)[0]
            digit = int(np.argmax(probs))
            confidence = round(float(np.max(probs)), 2)

            sequence += str(digit)
            digits_output.append({
                "digit": digit,
                "confidence": confidence
            })

        return jsonify({
            "sequence": sequence,
            "digits": digits_output
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# FEEDBACK (SELF-LEARNING)
# =========================
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    save_feedback(
        data["image"],
        data["label"],
        data["mode"]
    )
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True)