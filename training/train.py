# train.py

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.callbacks import ModelCheckpoint


# ==============================
# 1️⃣ Load and Preprocess MNIST
# ==============================

def load_mnist_data():
    print("Loading MNIST dataset...")

    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    # Normalize
    x_train = x_train / 255.0
    x_test = x_test / 255.0

    # Reshape to (28,28,1)
    x_train = x_train.reshape(-1, 28, 28, 1)
    x_test = x_test.reshape(-1, 28, 28, 1)

    # One-hot encode labels
    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)

    print("MNIST loaded successfully.")
    return x_train, y_train, x_test, y_test


# ==============================
# 2️⃣ Build CNN Model
# ==============================

def build_model():

    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import (
        Conv2D,
        MaxPooling2D,
        Flatten,
        Dense,
        Dropout,
        BatchNormalization,
        PReLU
    )

    model = Sequential([

        # -------- Block 1 --------
        Conv2D(32, (3,3), padding="same", input_shape=(28,28,1)),
        BatchNormalization(),
        PReLU(),
        MaxPooling2D((2,2)),

        # -------- Block 2 --------
        Conv2D(64, (3,3), padding="same"),
        BatchNormalization(),
        PReLU(),
        MaxPooling2D((2,2)),

        # -------- Block 3 --------
        Conv2D(128, (3,3), padding="same"),
        BatchNormalization(),
        PReLU(),
        MaxPooling2D((2,2)),  # 28 → 14 → 7 → 3

        # -------- Fully Connected --------
        Flatten(),

        Dense(128),
        BatchNormalization(),
        PReLU(),
        Dropout(0.4),

        Dense(10, activation="softmax")
    ])

    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


# ==============================
# 3️⃣ Train Model
# ==============================

def train_model(model, x_train, y_train, x_test, y_test, epochs=10):

    print("Training started...")

    checkpoint = ModelCheckpoint(
        filepath="models/best_cnn.h5",
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    )

    history = model.fit(
        x_train,
        y_train,
        epochs=epochs,
        batch_size=64,
        validation_data=(x_test, y_test),
        callbacks=[checkpoint]
    )

    print("Training completed.")
    return history


# ==============================
# 4️⃣ Main Function
# ==============================

def main():

    # Create models folder if not exists
    if not os.path.exists("models"):
        os.makedirs("models")

    x_train, y_train, x_test, y_test = load_mnist_data()

    model = build_model()

    train_model(model, x_train, y_train, x_test, y_test, epochs=10)

    print("Best model saved in models/best_cnn.h5")


if __name__ == "__main__":
    main()