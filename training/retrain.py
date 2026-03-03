# retrain.py

import os
import glob
import cv2
import numpy as np
import tensorflow as tf
from datetime import datetime
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import to_categorical



# ========================================
# 1️. Load MNIST Dataset
# ========================================

def load_mnist_data():
    print("Loading MNIST dataset...")

    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    x_train = x_train / 255.0
    x_test = x_test / 255.0

    x_train = x_train.reshape(-1, 28, 28, 1)
    x_test = x_test.reshape(-1, 28, 28, 1)

    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)

    return x_train, y_train, x_test, y_test


# ========================================
# 2️. Load User Confirmed Data
# ========================================
def load_user_data(path="data/user_confirmed"):

    images = []
    labels = []

    if not os.path.exists(path):
        print("User data folder not found.")
        return np.array([]), np.array([])

    for digit in os.listdir(path):
        digit_path = os.path.join(path, digit)

        if not os.path.isdir(digit_path):
            continue

        for file in os.listdir(digit_path):

            img_path = os.path.join(digit_path, file)

            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

            # 1️ Invert image (important)
            img = 255 - img

            # 2️ Threshold
            _, img = cv2.threshold(img, 50, 255, cv2.THRESH_BINARY)

            # 3️ Crop to bounding box
            coords = cv2.findNonZero(img)
            x, y, w, h = cv2.boundingRect(coords)
            img = img[y:y+h, x:x+w]

            # 4️ Resize while keeping aspect ratio
            img = cv2.resize(img, (20, 20))

            # 5️ Pad to 28x28
            img = np.pad(img, ((4,4),(4,4)), "constant")

            # 6️ Normalize
            img = img / 255.0
            img = img.reshape(28, 28, 1)

            images.append(img)
            labels.append(int(digit))

    if len(images) == 0:
        return np.array([]), np.array([])

    images = np.array(images)
    labels = to_categorical(np.array(labels), 10)

    print(f"Loaded {len(images)} user images.")

    return images, labels


# ========================================
# 3️. Generate Version Name
# ========================================

def generate_version_name():

    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_name = f"best_cnn_v_{now}.h5"

    return version_name


# ========================================
# 4️. Retrain Model
# ========================================

def retrain_model():

    print("Starting Retraining Process...")


    
    print("Searching for latest model...")

    model_files = glob.glob("models/*.h5")

    if not model_files:
        print("No existing model found in models folder!")
        return

    latest_model = max(model_files, key=os.path.getctime)

    print(f"Loading base model: {latest_model}")

    model = load_model(latest_model)
    
    # 🔥 VERY IMPORTANT FIX
    model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

    # Load MNIST
    x_train, y_train, x_test, y_test = load_mnist_data()

    # Load user data
    user_x, user_y = load_user_data()

    if user_x.size == 0:
        print("No user data available for retraining.")
        return

    # Combine datasets
    x_train = np.concatenate((x_train, user_x))
    y_train = np.concatenate((y_train, user_y))

    print("Combined MNIST + User Data")
    print(f"New Training Size: {len(x_train)} samples")

    # Retrain
    model.fit(
        x_train,
        y_train,
        epochs=10,          # small epochs for incremental learning
        batch_size=64,
        validation_data=(x_test, y_test),
        verbose=1
    )

    # Save with version name
    version_name = generate_version_name()

    save_path = os.path.join("models", version_name)
    model.save(save_path)

    print(f"New retrained model saved as: {save_path}")

    print("Retraining Completed Successfully!")




if __name__ == "__main__":
    retrain_model()