import cv2

from modules.hand_tracking import HandTracker


camera = cv2.VideoCapture(0)

hand_tracker = HandTracker()


while True:

    success, frame = camera.read()

    if not success:
        print("Camera open nahi ho raha")
        break

    frame = hand_tracker.find_hands(frame)

    cv2.imshow(
        "Virtual Dr. Strange",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


camera.release()
cv2.destroyAllWindows()