document.addEventListener("DOMContentLoaded", () => {

    // Reveal sections when scrolling
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


    // Mouse interaction for magical hero
    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual) {

        heroVisual.addEventListener("mousemove", (event) => {

            const rect = heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width -
                0.5;

            const y =
                (event.clientY - rect.top) /
                rect.height -
                0.5;

            heroVisual.style.transform =
                `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });


        heroVisual.addEventListener("mouseleave", () => {
            heroVisual.style.transform =
                "perspective(900px) rotateY(0deg) rotateX(0deg)";
        });

    }


    // Smooth active navigation
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
const cameraMessage = document.getElementById("cameraMessage");

const statusText = document.getElementById("statusText");

let hands;
let cameraFeed;
let animationTime = 0;


/* =========================================
   CANVAS SIZE
========================================= */

function resizeCanvas() {
    if (!camera.videoWidth || !camera.videoHeight) return;

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
}

window.addEventListener("resize", resizeCanvas);
camera.addEventListener("loadedmetadata", resizeCanvas);


/* =========================================
   DRAW MAGICAL SHIELD
========================================= */

function drawShield(x, y, size) {

    animationTime += 0.025;

    ctx.save();

    /* Outer glow */

    ctx.shadowBlur = 35;
    ctx.shadowColor = "rgba(255, 120, 20, 0.9)";

    /* Main circle */

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);

    ctx.strokeStyle = "rgba(255, 145, 45, 0.95)";
    ctx.lineWidth = Math.max(3, size * 0.025);

    ctx.stroke();


    /* Inner circle */

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        size * 0.78,
        animationTime,
        animationTime + Math.PI * 1.85
    );

    ctx.strokeStyle = "rgba(255, 190, 90, 0.8)";
    ctx.lineWidth = Math.max(2, size * 0.015);

    ctx.stroke();


    /* Rotating energy ring */

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size * 0.62,
        -animationTime * 1.8,
        Math.PI * 1.2 - animationTime * 1.8
    );

    ctx.strokeStyle = "rgba(255, 95, 20, 0.85)";
    ctx.lineWidth = Math.max(2, size * 0.012);

    ctx.stroke();


    /* Magical radial lines */

    for (let i = 0; i < 8; i++) {

        const angle =
            (Math.PI * 2 / 8) * i +
            animationTime * 0.25;

        const inner = size * 0.72;
        const outer = size * 0.95;

        const x1 = x + Math.cos(angle) * inner;
        const y1 = y + Math.sin(angle) * inner;

        const x2 = x + Math.cos(angle) * outer;
        const y2 = y + Math.sin(angle) * outer;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "rgba(255, 170, 70, 0.7)";
        ctx.lineWidth = Math.max(1, size * 0.008);

        ctx.stroke();
    }


    /* Center glow */

    const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        size * 0.5
    );

    gradient.addColorStop(
        0,
        "rgba(255, 190, 90, 0.25)"
    );

    gradient.addColorStop(
        1,
        "rgba(255, 80, 0, 0)"
    );

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size * 0.5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}


/* =========================================
   HAND TRACKING RESULT
========================================= */

function onResults(results) {

    if (!canvas.width || !canvas.height) {
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


        /* Palm center */

        const palm = landmarks[9];

        const x =
            (1 - palm.x) * canvas.width;

        const y =
            palm.y * canvas.height;


        /* Distance between wrist and middle finger */

        const wrist = landmarks[0];
        const middleFinger = landmarks[12];

        const dx =
            middleFinger.x - wrist.x;

        const dy =
            middleFinger.y - wrist.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        const shieldSize =
            Math.max(
                55,
                Math.min(
                    170,
                    distance * canvas.width * 0.85
                )
            );


        drawShield(
            x,
            y,
            shieldSize
        );


        statusText.textContent =
            "Magic Active ✨";

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


        cameraFeed = new Camera(camera, {

            onFrame: async () => {

                await hands.send({
                    image: camera
                });

            },

            width: 1280,

            height: 720

        });


        await cameraFeed.start();


        cameraArea.classList.add("active");

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
   BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        startMagic
    );

}