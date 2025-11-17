import cv2
import imutils
import numpy as np
import pytesseract

# If using Windows, uncomment this and add your tesseract.exe path:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load image
img = cv2.imread("vehicle_number_by_its_plate/1.jpg")
img = cv2.resize(img, (600, 400))

# Convert to grayscale + edge detection
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray = cv2.bilateralFilter(gray, 13, 15, 15)
edged = cv2.Canny(gray, 30, 200)

# Find contours
contours = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
contours = imutils.grab_contours(contours)
contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

screenCnt = None

# Search for number plate contour
for c in contours:
    peri = cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, 0.018 * peri, True)

    if len(approx) == 4:
        screenCnt = approx
        break

# If no contour found
if screenCnt is None:
    print("No contour detected")
else:
    cv2.drawContours(img, [screenCnt], -1, (0, 0, 255), 3)

    # Mask and crop
    mask = np.zeros(gray.shape, np.uint8)
    cv2.drawContours(mask, [screenCnt], -1, 255, -1)

    new_image = cv2.bitwise_and(img, img, mask=mask)

    (x, y) = np.where(mask == 255)
    (topx, topy) = (np.min(x), np.min(y))
    (bottomx, bottomy) = (np.max(x), np.max(y))
    Cropped = gray[topx:bottomx + 1, topy:bottomy + 1]

    # Extract text
    text = pytesseract.image_to_string(Cropped, config='--psm 11')
    print("Detected license plate Number is:", text)

    # Resize for display
    img = cv2.resize(img, (500, 300))
    Cropped = cv2.resize(Cropped, (400, 200))
    gray = cv2.resize(gray, (500, 300))
    edged = cv2.resize(edged, (500, 300))

    cv2.imshow("Original", img)
    cv2.imshow("Plate", Cropped)
    cv2.imshow("Gray", gray)
    cv2.imshow("Edges", edged)

    cv2.waitKey(0)
    cv2.destroyAllWindows()
