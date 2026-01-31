import cv2
import numpy as np

def segment_digits(img):
    # Invert & threshold
    img = cv2.bitwise_not(img)
    _, thresh = cv2.threshold(img, 20, 255, cv2.THRESH_BINARY)

    # Morphology to separate strokes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Find contours
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    # Sort left → right
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

    digits = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)

        # Ignore noise
        if w < 12 or h < 20:
            continue

        digit = thresh[y:y+h, x:x+w]
        digits.append(digit)

    return digits
