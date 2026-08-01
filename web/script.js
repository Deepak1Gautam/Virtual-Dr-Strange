document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       PAGE ANIMATIONS
    ========================================= */

    const sections = document.querySelectorAll(".section");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    sections.forEach((section) => {
        section.classList.add("reveal");
        observer.observe(section);
    });


    /* =========================================
       HERO MOUSE INTERACTION
    ========================================= */

    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual) {

        heroVisual.addEventListener("mousemove", (event) => {

            const rect = heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width - 0.5;

            const y =
                (event.clientY - rect.top) /
                rect.height - 0.5;

            heroVisual.style.transform =
                `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });

        heroVisual.addEventListener("mouseleave", () => {

            heroVisual.style.transform =
                "perspective(900px) rotateY(0deg) rotateX(0deg)";
        });
    }


    /* =========================================
       NAVIGATION
    ========================================= */

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });

    });

});


/* =========================================
   VIRTUAL DR. STRANGE
   LIVE CAMERA + HAND TRACKING
========================================= */

const camera = document.getElementById("camera");
const canvas = document.getElementById("magicCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startCamera");
const cameraArea = document.querySelector(".camera-area");
const statusText = document.getElementById("statusText");

let hands;
let cameraFeed;

let animationTime = 0;
let sparks = [];


/* =========================================
   CANVAS SIZE
========================================= */

function resizeCanvas() {

    if (!camera.videoWidth || !camera.videoHeight) {
        return;
    }

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
}

window.addEventListener("resize", resizeCanvas);

camera.addEventListener(
    "loadedmetadata",
    resizeCanvas
);


/* =========================================
   FINGER COUNT
   Same logic as Python version
========================================= */

function countFingers(landmarks) {

    let fingers = 0;

    // Index
    if (landmarks[8].y < landmarks[6].y) {
        fingers++;
    }

    // Middle
    if (landmarks[12].y < landmarks[10].y) {
        fingers++;
    }

    // Ring
    if (landmarks[16].y < landmarks[14].y) {
        fingers++;
    }

    // Pinky
    if (landmarks[20].y < landmarks[18].y) {
        fingers++;
    }

    return fingers;
}


/* =========================================
   MAGIC SHIELD
   Based on your original Python shield
========================================= */

function drawMagicShield(x, y, radius) {

    animationTime += 0.035;

    const colors = [
        "#ff8c00",
        "#ffff00",
        "#0080ff",
        "#b400ff",
        "#ff00b4"
    ];

    ctx.save();

    /* =====================================
       OUTER GLOW
    ===================================== */

    ctx.save();

    ctx.globalCompositeOperation = "lighter";

    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff7814";

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        radius + 25,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,80,0,0.35)";

    ctx.lineWidth = 20;
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(
        x,
        y,
        radius - 20,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(0,140,255,0.3)";

    ctx.lineWidth = 15;
    ctx.stroke();


    ctx.beginPath();
    ctx.arc(
        x,
        y,
        radius - 55,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(180,0,255,0.3)";

    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.restore();


    /* =====================================
       ROTATING RINGS
    ===================================== */

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(animationTime);

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        radius + 12,
        radius + 12,
        0,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#ff8c00";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();


    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(-animationTime * 1.5);

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        radius - 5,
        radius - 5,
        0,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#0080ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();


    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(animationTime * 2);

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        radius - 22,
        radius - 22,
        0,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#b400ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();


    /* =====================================
       ENERGY SEGMENTS
       24 segments like Python version
    ===================================== */

    for (let i = 0; i < 24; i++) {

        const angle =
            animationTime +
            i * (Math.PI * 2 / 24);

        const innerRadius =
            radius - 18;

        const outerRadius =
            radius + 15;

        const x1 =
            x + Math.cos(angle) * innerRadius;

        const y1 =
            y + Math.sin(angle) * innerRadius;

        const x2 =
            x + Math.cos(angle) * outerRadius;

        const y2 =
            y + Math.sin(angle) * outerRadius;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle =
            colors[i % colors.length];

        ctx.lineWidth = 3;

        ctx.shadowBlur = 12;
        ctx.shadowColor =
            colors[i % colors.length];

        ctx.stroke();
    }


    /* =====================================
       ROTATING TRIANGLES
    ===================================== */

    for (let i = 0; i < 3; i++) {

        const baseAngle =
            animationTime * 0.7 +
            i * (Math.PI * 2 / 3);

        ctx.beginPath();

        for (let j = 0; j < 3; j++) {

            const angle =
                baseAngle +
                j * (Math.PI * 2 / 3);

            const px =
                x +
                92 *
                Math.cos(angle);

            const py =
                y +
                92 *
                Math.sin(angle);

            if (j === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();

        ctx.strokeStyle =
            colors[i];

        ctx.lineWidth = 3;

        ctx.shadowBlur = 10;
        ctx.shadowColor =
            colors[i];

        ctx.stroke();
    }


    /* =====================================
       ROTATING HEXAGON
    ===================================== */

    ctx.beginPath();

    for (let i = 0; i < 6; i++) {

        const angle =
            -animationTime +
            i * (Math.PI / 3);

        const px =
            x +
            62 *
            Math.cos(angle);

        const py =
            y +
            62 *
            Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();

    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff00ff";

    ctx.stroke();


    /* =====================================
       INNER CIRCLES
    ===================================== */

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        48,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 4;
    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        35,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#0080ff";
    ctx.lineWidth = 3;
    ctx.stroke();


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        22,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "#b400ff";
    ctx.lineWidth = 3;
    ctx.stroke();


    /* =====================================
       ENERGY CORE
    ===================================== */

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ffff00";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        17,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffff00";
    ctx.fill();


    ctx.shadowBlur = 10;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        8,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();


    /* =====================================
       MAGICAL PARTICLES
    ===================================== */

    for (let i = 0; i < 18; i++) {

        const angle =
            animationTime * 1.5 +
            i * (Math.PI * 2 / 18);

        const particleRadius = 105;

        const px =
            x +
            particleRadius *
            Math.cos(angle);

        const py =
            y +
            particleRadius *
            Math.sin(angle);

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            colors[i % colors.length];

        ctx.shadowBlur = 15;
        ctx.shadowColor =
            colors[i % colors.length];

        ctx.fill();
    }


    /* =====================================
       CREATE SPARKS
    ===================================== */

    if (Math.random() < 0.20) {

        const sparkAngle =
            animationTime * 2 +
            Math.random() * Math.PI * 2;

        const startRadius =
            radius - 5;

        sparks.push({

            x:
                x +
                startRadius *
                Math.cos(sparkAngle),

            y:
                y +
                startRadius *
                Math.sin(sparkAngle),

            vx:
                Math.cos(sparkAngle) *
                (2.5 + Math.random() * 2.5),

            vy:
                Math.sin(sparkAngle) *
                (2.5 + Math.random() * 2.5),

            life:
                15 + Math.random() * 13,

            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ]
        });
    }


    /* =====================================
       DRAW SPARKS
    ===================================== */

    sparks.forEach((spark) => {

        ctx.beginPath();

        ctx.arc(
            spark.x,
            spark.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = spark.color;

        ctx.shadowBlur = 12;
        ctx.shadowColor = spark.color;

        ctx.fill();


        /* Bright core */

        ctx.beginPath();

        ctx.arc(
            spark.x,
            spark.y,
            1,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fill();


        /* Trail */

        ctx.beginPath();

        ctx.moveTo(
            spark.x -
            spark.vx * 4,

            spark.y -
            spark.vy * 4
        );

        ctx.lineTo(
            spark.x,
            spark.y
        );

        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 1;

        ctx.stroke();


        spark.x += spark.vx;
        spark.y += spark.vy;

        spark.life -= 1;
    });


    sparks = sparks.filter(
        (spark) =>
            spark.life > 0
    );


    ctx.restore();
}


/* =========================================
   ENERGY BEAM
========================================= */

function drawEnergyBeam(
    startX,
    startY,
    endX,
    endY
) {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    /* Glow */

    ctx.shadowBlur = 25;
    ctx.shadowColor =
        "#00c8ff";

    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    ctx.lineTo(
        endX,
        endY
    );

    ctx.strokeStyle =
        "rgba(0,200,255,0.6)";

    ctx.lineWidth = 15;

    ctx.stroke();


    /* Bright core */

    ctx.shadowBlur = 10;

    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    ctx.lineTo(
        endX,
        endY
    );

    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.restore();
}


/* =========================================
   MAGIC BLAST
========================================= */

function drawMagicBlast(
    x,
    y
) {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    for (let i = 0; i < 5; i++) {

        const radius =
            35 +
            i * 18;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            i % 2 === 0
                ? "#00b4ff"
                : "#ff00ff";

        ctx.lineWidth = 3;

        ctx.shadowBlur = 15;

        ctx.stroke();
    }


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        25,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowBlur = 30;
    ctx.shadowColor = "#00b4ff";

    ctx.fill();

    ctx.restore();
}


/* =========================================
   POWER CORE
========================================= */

function drawPowerCore(
    x,
    y
) {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,100,0,0.45)";

    ctx.shadowBlur = 30;
    ctx.shadowColor =
        "#ff6400";

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        20,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowBlur = 20;
    ctx.shadowColor =
        "#ffffff";

    ctx.fill();

    ctx.restore();
}


/* =========================================
   HAND TRACKING RESULT
========================================= */

function onResults(results) {

    if (
        !canvas.width ||
        !canvas.height
    ) {
        resizeCanvas();
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length > 0
    ) {

        const landmarks =
            results.multiHandLandmarks[0];


        /* =====================================
           PALM CENTER
        ===================================== */

        const palm =
            landmarks[9];

        const x =
            (1 - palm.x) *
            canvas.width;

        const y =
            palm.y *
            canvas.height;


        /* =====================================
           FINGER COUNT
        ===================================== */

        const fingerCount =
            countFingers(landmarks);


        /* =====================================
           SHIELD SIZE
        ===================================== */

        const wrist =
            landmarks[0];

        const middleFinger =
            landmarks[12];

        const dx =
            middleFinger.x -
            wrist.x;

        const dy =
            middleFinger.y -
            wrist.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const shieldSize =
            Math.max(
                70,
                Math.min(
                    170,
                    distance *
                    canvas.width *
                    0.85
                )
            );


        /* =====================================
           OPEN HAND = MAGIC SHIELD
        ===================================== */

        if (fingerCount >= 4) {

            drawMagicShield(
                x,
                y,
                shieldSize
            );

            statusText.textContent =
                "MAGIC SHIELD 🛡️";
        }


        /* =====================================
           ONE FINGER = ENERGY BEAM
        ===================================== */

        else if (fingerCount === 1) {

            const indexX =
                (1 - landmarks[8].x) *
                canvas.width;

            const indexY =
                landmarks[8].y *
                canvas.height;


            const endX =
                indexX +
                (indexX - x) * 5;

            const endY =
                indexY +
                (indexY - y) * 5;


            drawEnergyBeam(
                indexX,
                indexY,
                endX,
                endY
            );

            statusText.textContent =
                "ENERGY BEAM ⚡";
        }


        /* =====================================
           TWO FINGERS = MAGIC BLAST
        ===================================== */

        else if (fingerCount === 2) {

            drawMagicBlast(
                x,
                y
            );

            statusText.textContent =
                "MAGIC BLAST 💥";
        }


        /* =====================================
           FIST = POWER CORE
        ===================================== */

        else if (fingerCount === 0) {

            drawPowerCore(
                x,
                y
            );

            statusText.textContent =
                "POWER CORE 🔥";
        }


        else {

            statusText.textContent =
                "Magic Ready ✨";
        }

    } else {

        statusText.textContent =
            "Show Your Hand ✋";
    }
}


/* =========================================
   MEDIAPIPE HANDS
========================================= */

hands = new Hands({

    locateFile: (file) => {

        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }

});


hands.setOptions({

    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence: 0.6,

    minTrackingConfidence: 0.6

});


hands.onResults(onResults);


/* =========================================
   START CAMERA
========================================= */

async function startMagic() {

    try {

        statusText.textContent =
            "Starting Camera...";

        startButton.disabled = true;


        cameraFeed = new Camera(
            camera,
            {

                onFrame: async () => {

                    await hands.send({
                        image: camera
                    });

                },

                width: 1280,

                height: 720

            }
        );


        await cameraFeed.start();


        cameraArea.classList.add(
            "active"
        );


        statusText.textContent =
            "Show Your Hand ✋";


    } catch (error) {

        console.error(error);

        statusText.textContent =
            "Camera Blocked";

        startButton.disabled = false;

        alert(
            "Camera access allow karo, phir Start Magic dobara click karo."
        );
    }
}


/* =========================================
   START MAGIC BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startMagic
    );

}