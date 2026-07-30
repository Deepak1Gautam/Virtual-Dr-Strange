import cv2
import mediapipe as mp
import math
import numpy as np
import random

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


class HandTracker:

    def __init__(self):

        base_options = python.BaseOptions(
            model_asset_path="hand_landmarker.task"
        )

        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.VIDEO,
            num_hands=2,
            min_hand_detection_confidence=0.3,
            min_hand_presence_confidence=0.3,
            min_tracking_confidence=0.3
        )

        self.detector = vision.HandLandmarker.create_from_options(
            options
        )

        self.timestamp = 0
        self.angle = 0
        self.sparks = []


    # =========================
    # FINGER COUNT
    # =========================

    def count_fingers(self, hand_landmarks):

        fingers = 0

        # Thumb is intentionally ignored
        # This makes rotation more stable

        # Index finger
        if hand_landmarks[8].y < hand_landmarks[6].y:
            fingers += 1

        # Middle finger
        if hand_landmarks[12].y < hand_landmarks[10].y:
            fingers += 1

        # Ring finger
        if hand_landmarks[16].y < hand_landmarks[14].y:
            fingers += 1

        # Pinky finger
        if hand_landmarks[20].y < hand_landmarks[18].y:
            fingers += 1

        return fingers


    # =========================
    # MAGIC SHIELD
    # =========================

    def draw_magic_portal(
        self,
        frame,
        center_x,
        center_y
    ):

        self.angle += 2

        radius = 135

        overlay = np.zeros_like(frame)

        glow = np.zeros_like(frame)


        # =========================
        # OUTER GLOW
        # =========================

        cv2.circle(
            glow,
            (center_x, center_y),
            radius + 25,
            (0, 80, 255),
            20
        )

        cv2.circle(
            glow,
            (center_x, center_y),
            radius - 20,
            (255, 80, 0),
            15
        )

        cv2.circle(
            glow,
            (center_x, center_y),
            radius - 55,
            (180, 0, 255),
            12
        )

        glow = cv2.GaussianBlur(
            glow,
            (0, 0),
            30
        )

        frame = cv2.addWeighted(
            frame,
            1.0,
            glow,
            1.3,
            0
        )


        # =========================
        # COLORS
        # =========================

        colors = [

            (0, 140, 255),      # Orange

            (0, 255, 255),      # Yellow

            (255, 80, 0),       # Blue

            (180, 0, 255),      # Purple

            (255, 0, 180)       # Pink

        ]


        # =========================
        # ROTATING RINGS
        # =========================

        cv2.ellipse(
            overlay,
            (center_x, center_y),
            (radius + 12, radius + 12),
            self.angle,
            0,
            360,
            (0, 140, 255),
            4
        )

        cv2.ellipse(
            overlay,
            (center_x, center_y),
            (radius - 5, radius - 5),
            -self.angle * 1.5,
            0,
            360,
            (255, 80, 0),
            3
        )

        cv2.ellipse(
            overlay,
            (center_x, center_y),
            (radius - 22, radius - 22),
            self.angle * 2,
            0,
            360,
            (180, 0, 255),
            3
        )


        # =========================
        # ENERGY SEGMENTS
        # =========================

        for i in range(24):

            angle = math.radians(
                self.angle + i * 15
            )

            inner_radius = radius - 18
            outer_radius = radius + 15

            x1 = int(
                center_x +
                inner_radius *
                math.cos(angle)
            )

            y1 = int(
                center_y +
                inner_radius *
                math.sin(angle)
            )

            x2 = int(
                center_x +
                outer_radius *
                math.cos(angle)
            )

            y2 = int(
                center_y +
                outer_radius *
                math.sin(angle)
            )

            color = colors[
                i % len(colors)
            ]

            cv2.line(
                overlay,
                (x1, y1),
                (x2, y2),
                color,
                3
            )


        # =========================
        # ROTATING TRIANGLES
        # =========================

        for i in range(3):

            base_angle = math.radians(
                self.angle * 0.7 +
                i * 120
            )

            points = []

            for j in range(3):

                angle = (

                    base_angle +

                    j * math.radians(120)

                )

                x = int(

                    center_x +

                    92 *

                    math.cos(angle)

                )

                y = int(

                    center_y +

                    92 *

                    math.sin(angle)

                )

                points.append(
                    [x, y]
                )

            points = np.array(
                points,
                np.int32
            )

            cv2.polylines(
                overlay,
                [points],
                True,
                colors[i],
                3
            )


        # =========================
        # ROTATING HEXAGON
        # =========================

        hexagon = []

        for i in range(6):

            angle = math.radians(

                -self.angle +

                i * 60

            )

            x = int(

                center_x +

                62 *

                math.cos(angle)

            )

            y = int(

                center_y +

                62 *

                math.sin(angle)

            )

            hexagon.append(
                [x, y]
            )

        hexagon = np.array(
            hexagon,
            np.int32
        )

        cv2.polylines(
            overlay,
            [hexagon],
            True,
            (255, 0, 255),
            4
        )


        # =========================
        # INNER CIRCLES
        # =========================

        cv2.circle(
            overlay,
            (center_x, center_y),
            48,
            (0, 255, 255),
            4
        )

        cv2.circle(
            overlay,
            (center_x, center_y),
            35,
            (255, 80, 0),
            3
        )

        cv2.circle(
            overlay,
            (center_x, center_y),
            22,
            (180, 0, 255),
            3
        )


        # =========================
        # ENERGY CORE
        # =========================

        cv2.circle(
            overlay,
            (center_x, center_y),
            17,
            (0, 255, 255),
            -1
        )

        cv2.circle(
            overlay,
            (center_x, center_y),
            8,
            (255, 255, 255),
            -1
        )


        # =========================
        # MAGICAL PARTICLES
        # =========================

        for i in range(18):

            angle = math.radians(

                self.angle * 1.5 +

                i * 20

            )

            particle_radius = 105

            x = int(

                center_x +

                particle_radius *

                math.cos(angle)

            )

            y = int(

                center_y +

                particle_radius *

                math.sin(angle)

            )

            cv2.circle(

                overlay,

                (x, y),

                4,

                colors[i % len(colors)],

                -1

            )


        # =========================
        # SMALL FIRE SPARKS
        # =========================

        for i in range(3):

            spark_angle = math.radians(

                self.angle * 2 +

                i * 120 +

                random.randint(-25, 25)

            )

            start_radius = radius - 5

            start_x = int(

                center_x +

                start_radius *

                math.cos(spark_angle)

            )

            start_y = int(

                center_y +

                start_radius *

                math.sin(spark_angle)

            )

            speed = random.uniform(

                2.5,

                5

            )

            self.sparks.append({

                "x": start_x,

                "y": start_y,

                "vx": math.cos(

                    spark_angle

                ) * speed,

                "vy": math.sin(

                    spark_angle

                ) * speed,

                "life": random.randint(

                    15,

                    28

                ),

                "color": random.choice(

                    colors

                )

            })


        # =========================
        # DRAW SMALL SPARKS
        # =========================

        for spark in self.sparks:

            x = int(

                spark["x"]

            )

            y = int(

                spark["y"]

            )

            color = spark["color"]


            # Small glow

            cv2.circle(

                overlay,

                (x, y),

                4,

                color,

                -1

            )


            # Tiny bright core

            cv2.circle(

                overlay,

                (x, y),

                1,

                (255, 255, 255),

                -1

            )


            # Thin trail

            trail_x = int(

                x -

                spark["vx"] *

                4

            )

            trail_y = int(

                y -

                spark["vy"] *

                4

            )


            cv2.line(

                overlay,

                (trail_x, trail_y),

                (x, y),

                color,

                1

            )


            # Move spark

            spark["x"] += spark["vx"]

            spark["y"] += spark["vy"]


            # Reduce life

            spark["life"] -= 1


        # Remove dead sparks

        self.sparks = [

            spark

            for spark in self.sparks

            if spark["life"] > 0

        ]


        # =========================
        # SHIELD GLOW
        # =========================

        detail_glow = cv2.GaussianBlur(

            overlay,

            (0, 0),

            10

        )

        frame = cv2.addWeighted(

            frame,

            0.7,

            detail_glow,

            1.5,

            0

        )


        # =========================
        # SHARP DETAILS
        # =========================

        frame = cv2.addWeighted(

            frame,

            0.75,

            overlay,

            1.2,

            0

        )


        return frame


    # =========================
    # ENERGY BEAM
    # =========================

    def draw_energy_beam(

        self,
        frame,
        start_x,
        start_y,
        end_x,
        end_y

    ):

        overlay = np.zeros_like(frame)

        cv2.line(

            overlay,

            (start_x, start_y),

            (end_x, end_y),

            (0, 200, 255),

            15

        )

        cv2.line(

            overlay,

            (start_x, start_y),

            (end_x, end_y),

            (255, 255, 255),

            3

        )

        glow = cv2.GaussianBlur(

            overlay,

            (0, 0),

            20

        )

        frame = cv2.addWeighted(

            frame,

            0.7,

            glow,

            0.8,

            0

        )

        frame = cv2.addWeighted(

            frame,

            0.8,

            overlay,

            1.0,

            0

        )

        return frame


    # =========================
    # MAGIC BLAST
    # =========================

    def draw_magic_blast(

        self,
        frame,
        center_x,
        center_y

    ):

        overlay = np.zeros_like(frame)

        self.angle += 4

        for i in range(5):

            blast_radius = 35 + i * 18

            cv2.circle(

                overlay,

                (center_x, center_y),

                blast_radius,

                (0, 180, 255),

                3

            )

        cv2.circle(

            overlay,

            (center_x, center_y),

            25,

            (255, 255, 255),

            -1

        )

        glow = cv2.GaussianBlur(

            overlay,

            (0, 0),

            20

        )

        frame = cv2.addWeighted(

            frame,

            0.7,

            glow,

            0.8,

            0

        )

        return frame


    # =========================
    # POWER CORE
    # =========================

    def draw_power_core(

        self,
        frame,
        center_x,
        center_y

    ):

        overlay = np.zeros_like(frame)

        cv2.circle(

            overlay,

            (center_x, center_y),

            45,

            (0, 100, 255),

            -1

        )

        cv2.circle(

            overlay,

            (center_x, center_y),

            20,

            (255, 255, 255),

            -1

        )

        glow = cv2.GaussianBlur(

            overlay,

            (0, 0),

            25

        )

        frame = cv2.addWeighted(

            frame,

            0.6,

            glow,

            0.8,

            0

        )

        return frame


    # =========================
    # MAIN HAND TRACKING
    # =========================

    def find_hands(

        self,
        frame

    ):

        rgb_frame = cv2.cvtColor(

            frame,

            cv2.COLOR_BGR2RGB

        )

        mp_image = mp.Image(

            image_format=mp.ImageFormat.SRGB,

            data=rgb_frame

        )

        self.timestamp += 33

        result = self.detector.detect_for_video(

            mp_image,

            self.timestamp

        )


        if result.hand_landmarks:

            for hand_landmarks in result.hand_landmarks:

                height, width, _ = frame.shape

                landmark_points = []


                # =========================
                # LANDMARK POINTS
                # =========================

                for landmark in hand_landmarks:

                    x = int(

                        landmark.x *

                        width

                    )

                    y = int(

                        landmark.y *

                        height

                    )

                    landmark_points.append(

                        (x, y)

                    )


                # =========================
                # PALM CENTER
                # =========================

                palm_x = int(

                    (

                        landmark_points[0][0] +

                        landmark_points[5][0] +

                        landmark_points[9][0] +

                        landmark_points[13][0] +

                        landmark_points[17][0]

                    ) / 5

                )

                palm_y = int(

                    (

                        landmark_points[0][1] +

                        landmark_points[5][1] +

                        landmark_points[9][1] +

                        landmark_points[13][1] +

                        landmark_points[17][1]

                    ) / 5

                )


                finger_count = self.count_fingers(

                    hand_landmarks

                )


                # =========================
                # OPEN HAND = SHIELD
                # =========================

                if finger_count >= 4:

                    frame = self.draw_magic_portal(

                        frame,

                        palm_x,

                        palm_y

                    )

                    cv2.putText(

                        frame,

                        "MAGIC SHIELD",

                        (40, 70),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        1,

                        (0, 220, 255),

                        2

                    )


                # =========================
                # ONE FINGER = BEAM
                # =========================

                elif finger_count == 1:

                    index_x = landmark_points[8][0]

                    index_y = landmark_points[8][1]

                    end_x = int(

                        index_x +

                        (index_x - palm_x) * 5

                    )

                    end_y = int(

                        index_y +

                        (index_y - palm_y) * 5

                    )

                    frame = self.draw_energy_beam(

                        frame,

                        index_x,

                        index_y,

                        end_x,

                        end_y

                    )

                    cv2.putText(

                        frame,

                        "ENERGY BEAM",

                        (40, 70),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        1,

                        (0, 220, 255),

                        2

                    )


                # =========================
                # TWO FINGERS = BLAST
                # =========================

                elif finger_count == 2:

                    frame = self.draw_magic_blast(

                        frame,

                        palm_x,

                        palm_y

                    )

                    cv2.putText(

                        frame,

                        "MAGIC BLAST",

                        (40, 70),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        1,

                        (0, 220, 255),

                        2

                    )


                # =========================
                # FIST = POWER CORE
                # =========================

                elif finger_count == 0:

                    frame = self.draw_power_core(

                        frame,

                        palm_x,

                        palm_y

                    )

                    cv2.putText(

                        frame,

                        "POWER CORE",

                        (40, 70),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        1,

                        (0, 220, 255),

                        2

                    )


        return frame