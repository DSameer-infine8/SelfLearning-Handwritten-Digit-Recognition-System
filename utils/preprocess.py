import cv2
import numpy as np
from scipy import ndimage

def preprocess_single_digit(img):
    # Invert once (MNIST expects white digit on black)
    img = cv2.bitwise_not(img)

    # Remove empty borders
    coords = np.column_stack(np.where(img > 0))
    if coords.size == 0:
        return np.zeros((28, 28), dtype="float32")

    y_min, x_min = coords.min(axis=0)
    y_max, x_max = coords.max(axis=0)
    digit = img[y_min:y_max+1, x_min:x_max+1]

    # Resize keeping aspect ratio
    h, w = digit.shape
    if h > w:
        new_h = 20
        new_w = int(w * (20 / h))
    else:
        new_w = 20
        new_h = int(h * (20 / w))

    digit = cv2.resize(digit, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Pad to 28x28
    canvas = np.zeros((28, 28), dtype=np.uint8)
    x_offset = (28 - new_w) // 2
    y_offset = (28 - new_h) // 2
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = digit

    # Center of mass alignment
    cy, cx = ndimage.center_of_mass(canvas)
    shift_x = int(np.round(14 - cx))
    shift_y = int(np.round(14 - cy))
    canvas = ndimage.shift(canvas, [shift_y, shift_x], mode="constant")

    # Normalize (NO BLUR, NO THRESHOLD)
    canvas = canvas.astype("float32") / 255.0

    return canvas
