import cv2
import numpy as np

def segment_digits(img):

    # Light threshold just to find contours
    _, thresh = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    # Sort left → right
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    digits = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)

        # Ignore noise
        if w < 10 or h < 20:
            continue

        # IMPORTANT: crop from ORIGINAL grayscale image
        digit = img[y:y+h, x:x+w]
        digits.append(digit)

    return digits
