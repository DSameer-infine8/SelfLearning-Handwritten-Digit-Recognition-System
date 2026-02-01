# ✍️ Self-Learning Handwritten Digit Recognition System  
Self-learning handwritten digit recognition system using CNN, Flask, and a browser canvas. The model continuously improves using real user feedback.
### Real-Time Single & Multi-Digit Recognition using CNN + OpenCV

![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-CNN-orange)
![Flask](https://img.shields.io/badge/Flask-Backend-lightgrey)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-green)
![License](https://img.shields.io/badge/License-MIT-brightgreen)

---

## Project Overview

**Self-Learning Handwritten Digit Recognition System** is a full-stack AI application that recognizes **handwritten digits and complete numbers in real time**.

The project supports:
-  **Single digit recognition**
-  **Multiple digit (full number) recognition**
-  **Self-learning through user feedback**

It uses a **CNN trained on the MNIST dataset**, combined with **OpenCV-based image processing**, a **Flask backend**, and an **interactive HTML canvas frontend**.

This project is designed to demonstrate **real-world OCR system architecture**, not just a basic ML demo.

---

## **Key Features**

-  Draw digits directly on a web canvas
-  Predict multiple handwritten digits as a full number
-  CNN-based digit classification (MNIST-trained)
-  Robust image preprocessing & digit segmentation
-  Self-learning system using user-confirmed samples
-  Automatic saving of confirmed handwritten data
-  Real-time prediction API
-  Clean and responsive UI
-  Modular, maintainable backend design

---

## Demo Preview

###  Interactive Canvas UI
_Draw digits using mouse or touch input_

![Canvas Demo](static/ui.gif)

---

### Multi-Digit Recognition
_Draw multiple digits → model predicts the complete number_

![Prediction Demo](static/predict.gif)

---

## Machine Learning Model

- **Model Type:** Convolutional Neural Network (CNN)
- **Framework:** TensorFlow / Keras
- **Dataset:** MNIST + user-confirmed samples
- **Input Shape:** `28 × 28 × 1`
- **Output Classes:** Digits `0–9`
- **Model Files:**
  - `models/mnist_cnn.h5` – base MNIST model
  - `models/best_cnn.h5` – improved / tuned model

📌 The system is designed so that **user-confirmed handwritten digits can later be used to retrain or fine-tune the CNN**, enabling continuous improvement.

---

## Image Processing Pipeline
```
Canvas Drawing
     ↓
Base64 Image Capture
     ↓
Grayscale Conversion
     ↓
Thresholding & Noise Removal
     ↓
Digit Segmentation (Single / Multiple)
     ↓
Resize to 28×28
     ↓
CNN Prediction
     ↓
Final Output (Digit / Number)
```

---

## Project Structure
```
SelfLearning-Handwritten-Digit-Recognition-System/
│
├── app.py                     # Flask backend
├── requirements.txt
│
├── models/                    # CNN models
│   ├── mnist_cnn.h5
│   └── best_cnn.h5
│
├── data/                      # Self-learning dataset
│   └── user_confirmed/
│
├── utils/                     # Image processing utilities
│   ├── preprocess.py
│   └── segment.py
│
├── notebook/                  # Training & experiments
│   └── Final_HandWritten_Model.ipynb
│
├── templates/
│   └── index.html
│
├── static/
│   ├── script.js
│   └── style.css
│
└── README.md
```

> 📌 Virtual environments (`.venv`) and cache folders (`__pycache__`) are intentionally excluded.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|--------|-------|------------|
| `/predict` | POST | Predict a single handwritten digit |
| `/predict-multiple` | POST | Predict multiple digits as a full number |
| `/feedback` | POST | Save user-confirmed samples for learning |

---

## ⚙️ Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript (Canvas API)
- **Machine Learning:** TensorFlow, Keras
- **Computer Vision:** OpenCV
- **Image Handling:** Pillow
- **Numerical Processing:** NumPy

---

## 🖥️ How to Run the Project Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/SelfLearning-Handwritten-Digit-Recognition-System.git
cd SelfLearning-Handwritten-Digit-Recognition-System
```

### Step 2: Create a Virtual Environment (Recommended)

```bash
python -m venv venv
```

#### Activate the virtual environment:
```Windows
venv\Scripts\activate
```

### Step 3: Install Required Dependencies

Make sure you are inside the project root directory, then run:
```bash
pip install -r requirements.txt
```

### Step 4: Run the Flask Application

Start the Flask development server using:
```bash
python app.py
```

### Step 5: Open the Application in Browser

Open your web browser and visit:
```bash
http://127.0.0.1:5000/
```
---
### 🎉 The handwritten digit recognition system is now running.

#### You can:

- Draw a single digit to get digit prediction
- Draw multiple digits to get a full number prediction
- Submit feedback to help the model learn

---
## 🔁 Self-Learning Workflow

- User draws digit(s) on the canvas
- The CNN model predicts the digit or number
- User confirms the correct label
- The image is saved in the dataset directory:
```
  data/user_confirmed/<digit>/
```
- Saved samples can later be used to retrain or fine-tune the CNN

#### This enables continuous improvement of model accuracy over time.
---
---
## 📝 License

### This project is licensed under the MIT License.
### You are free to use, modify, and distribute this project for learning and development purposes.
---
## ⭐ Support & Contribution

### If you find this project useful:

- Star the repository
- Fork the project
- Contribute enhancements or bug fixes
