from flask import Flask, request, render_template, jsonify
import numpy as np
import cv2
import base64
import os
import threading
import glob
from tensorflow.keras.models import load_model
from data_saver import save_feedback

from utils.preprocess import preprocess_single_digit
from utils.segment import segment_digits

app = Flask(__name__)

# ==============================
# CONFIG
# ==============================
MODEL_PATH = "models/best_cnn.h5"
USER_DATA_PATH = "data/user_confirmed"
RETRAIN_THRESHOLD = 10

model = load_model(MODEL_PATH)
retraining_in_progress = False


# ==============================
# Utility: Load Latest Model
# ==============================
def load_latest_model():
    global model
    model_files = glob.glob("models/*.h5")
    latest_model = max(model_files, key=os.path.getctime)
    model = load_model(latest_model)
    print(f" Loaded latest model: {latest_model}")


# ==============================
# Utility: Count user images
# ==============================
def count_user_images():
    total = 0
    for root, dirs, files in os.walk(USER_DATA_PATH):
        for file in files:
            if file.endswith(".png"):
                total += 1
    return total


# ==============================
# Background Retraining Function
# ==============================
def retrain_model_background():
    global retraining_in_progress

    retraining_in_progress = True
    print(" Starting automatic retraining...")

    os.system("python training/retrain.py")

    print(" Reloading updated model...")
    load_latest_model()

    retraining_in_progress = False
    print(" Retraining completed!")


# ==============================
# Home
# ==============================
@app.route("/")
def index():
    return render_template("index.html")


# ==============================
# Decode Base64 Image
# ==============================
def decode_image(data_url):
    header, encoded = data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)
    return img


# ==============================
# SINGLE DIGIT PREDICTION
# ==============================
@app.route("/predict", methods=["POST"])
def predict_single():
    try:
        data = request.json
        img = decode_image(data["image"])

        processed = preprocess_single_digit(img)
        processed = processed.reshape(1, 28, 28, 1)

        probs = model.predict(processed)[0]
        digit = int(np.argmax(probs))
        confidence = round(float(np.max(probs)) * 100, 2)

        return jsonify({
            "prediction": digit,
            "confidence": confidence,
            "probabilities": [round(float(p), 4) for p in probs]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# MULTI DIGIT PREDICTION
# ==============================
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
            confidence = round(float(np.max(probs)) * 100, 2)

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


# ==============================
# FEEDBACK (SELF-LEARNING)
# ==============================
@app.route("/feedback", methods=["POST"])
def feedback():
    global retraining_in_progress

    try:
        data = request.get_json()

        save_feedback(
            data["image"],
            data["label"],
            data["mode"]
        )

        total_images = count_user_images()
        print(f" Total user confirmed images: {total_images}")

        # Trigger retraining
        if total_images % RETRAIN_THRESHOLD == 0 and not retraining_in_progress:
            print(" Threshold reached. Triggering retraining...")
            thread = threading.Thread(target=retrain_model_background)
            thread.start()

        return jsonify({"status": "success", "total_images": total_images})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# Run App
# ==============================
if __name__ == "__main__":
    app.run(debug=True)