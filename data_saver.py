import os
import time
import base64
import cv2
import numpy as np

BASE_DIR = "./data/user_confirmed"

def save_feedback(base64_image, label, mode):
    os.makedirs(BASE_DIR, exist_ok=True)

    folder = os.path.join(BASE_DIR, str(label))
    os.makedirs(folder, exist_ok=True)

    image_data = base64_image.split(",")[1]
    image_bytes = base64.b64decode(image_data)
    img_np = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_GRAYSCALE)

    filename = f"{int(time.time())}.png"
    cv2.imwrite(os.path.join(folder, filename), img)
