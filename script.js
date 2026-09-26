// Planetary Data
const planets = [
    { name: "MOON", gravity: 0.166, gravityMs2: 1.62, file: "MOON.png", jumpHeight: -140, duration: 1.8 },
    { name: "MERCURY", gravity: 0.38, gravityMs2: 3.70, file: "MERCURY.png", jumpHeight: -90, duration: 1.2 },
    { name: "VENUS", gravity: 0.90, gravityMs2: 8.87, file: "VENUS.png", jumpHeight: -55, duration: 0.8 },
    { name: "MARS", gravity: 0.38, gravityMs2: 3.71, file: "MARS.png", jumpHeight: -90, duration: 1.2 },
    { name: "JUPITER", gravity: 2.53, gravityMs2: 24.8, file: "JUPITER.png", jumpHeight: -20, duration: 0.4 },
    { name: "SATURN", gravity: 1.06, gravityMs2: 10.4, file: "SATURN.png", jumpHeight: -54, duration: 0.8 },
    { name: "URANUS", gravity: 0.90, gravityMs2: 8.87, file: "URANUS.png", jumpHeight: -56, duration: 0.85 },
    { name: "NEPTUNE", gravity: 1.14, gravityMs2: 11.15, file: "NEPTUNE.png", jumpHeight: -45, duration: 0.7 },
];

// Configuration
const astronautImagePath = "assets/ASTRONAUT.png";
const earthPlanet = { name: "EARTH", gravity: 1.0, jumpHeight: -60, duration: 0.85 };

let activePlanetIndex = -1;

// Sounds
let soundEnabled = true;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playJumpSound() {
    if (!soundEnabled) return;

    try {
        const ctx = getAudioContext();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        osc.type = 'sine';

        // Pitch sweeps for jump effect
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(filter);
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    }
    catch (e) {
        console.warn("Audio Context could not play:", e);
    }
}

// Weight Counter Animation
function animateValue(element, start, end, duration, unit) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = (progress * (end - start) + start).toFixed(1);
        element.textContent = `${currentValue} ${unit}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step)
}

// Calculation Logic
function calculatePlanetWeights() {
    const earthInput = document.getElementById('earthWeight');
    const unitSelect = document.getElementById('unitSelect');

    if (!earthInput) return;

    const rawValue = earthInput.value.trim();
    const earthWeight = parseFloat(rawValue);

    // Reset display if input is cleared or invalid
    if (isNaN(earthWeight) || earthWeight <= 0) {
        const earthWeightDisplay = document.querySelector('.earth-hero-card .weight-tag');
        if (earthWeightDisplay) earthWeightDisplay.textContent = `--`;

        planets.forEach((_, index) => {
            const weightDisplay = document.getElementById(`weight-${index}`);
            if (weightDisplay) weightDisplay.textContent = `--`;
        });
        return;
    }

    const currentUnit = unitSelect ? unitSelect.value : 'kg';

    // Update Earth Display Weight
    const earthWeightDisplay = document.querySelector('.earth-hero-card .weight-tag');
    if (earthWeightDisplay) {
        animateValue(earthWeightDisplay, 0, earthWeight, 400, currentUnit);
    }

    // Update weights for all other planets
    planets.forEach((planet, index) => {
        const weightDisplay = document.getElementById(`weight-${index}`);
        if (weightDisplay) {
            const calculatedWeight = parseFloat((earthWeight * planet.gravity).toFixed(1));
            animateValue(weightDisplay, 0, calculatedWeight, 400, currentUnit);
        }
    });

    // Trigger Earth jump animation on successful calculation
    handleEarthClick();
}

// Earth Click Handler
function handleEarthClick() {
    playJumpSound();

    const jumper = document.getElementById('jumper-earth');
    if (!jumper) return;

    jumper.style.setProperty('--jump-height', `${earthPlanet.jumpHeight}px`);
    jumper.style.setProperty('--jump-duration', `${earthPlanet.duration}s`);

    jumper.classList.remove('jumping');
    void jumper.offsetWidth;

    jumper.classList.add('active', 'jumping');
}

// Grid Initialization
function renderPlanetCards() {
    const grid = document.getElementById('planetsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    planets.forEach((planet, index) => {
        const item = document.createElement('div');
        item.className = 'planet-item';
        item.setAttribute('data-planet', planet.name);
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Jump on ${planet.name}`);

        item.onclick = () => handlePlanetClick(index);
        item.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlanetClick(index);
            }
        }

        item.innerHTML = `
            <div class="jumper-container">
                <img id="jumper-${index}" class="astronaut-img" src="${astronautImagePath}" alt="Astronaut">
            </div>
            <div class="planet-visual-container">
                <img class="planet-img" src="assets/${planet.file}" alt="${planet.name}">
            </div>
            <div class="planet-name">${planet.name}</div>
            <div class="planet-weight-display" id="weight-${index}">--</div>  
            <div class="planet-gravity-display">${planet.gravityMs2} m/s² (${planet.gravity}g)</div>
        `;

        grid.appendChild(item);
    });
}

// Planet Click Handler
function handlePlanetClick(index) {
    playJumpSound();

    const planet = planets[index];
    const jumper = document.getElementById(`jumper-${index}`);

    if (!jumper) return;

    if (activePlanetIndex !== index && activePlanetIndex !== -1) {
        const prevJumper = document.getElementById(`jumper-${activePlanetIndex}`);
        if (prevJumper) {
            prevJumper.classList.remove('active', 'jumping');
        }
    }

    activePlanetIndex = index;

    jumper.style.setProperty('--jump-height', `${planet.jumpHeight}px`);
    jumper.style.setProperty('--jump-duration', `${planet.duration}s`);

    jumper.classList.remove('jumping');
    void jumper.offsetWidth;

    jumper.classList.add('active', 'jumping');
}

// Star Canvas Background Function
function initStarfield() {
    const canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const numStars = Math.floor((width * height) / 3000);
    const stars = [];
    const mouse = { x: -1000, y: -1000 };

    // Generate stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.8 + 0.2,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.15,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        const newNumStars = Math.floor((width * height) / 3000);
        stars.length = 0;

        for (let i = 0; i < newNumStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2 + 0.3,
                alpha: Math.random() * 0.8 + 0.2,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.15,
                twinkleSpeed: Math.random() * 0.02 + 0.005
            });
        }
    });

    // Track mouse position for soft interaction
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach((star) => {
            // Movement
            star.x += star.speedX;
            star.y += star.speedY;

            // Wrap around screen edges
            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;

            // Subtle twinking
            star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.005;
            star.alpha = Math.max(0.1, Math.min(1, star.alpha));

            // Mouse proximity glow effect
            const dx = mouse.x - star.x;
            const dy = mouse.y - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let drawAlpha = star.alpha;

            if (dist < 120) {
                const factor = 1 - dist / 120;
                drawAlpha = Math.min(1, star.alpha + factor * 0.5);
            }

            // Draw star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${drawAlpha})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// App Initialization
window.onload = () => {
    initStarfield();
    renderPlanetCards();

    const calcBtn = document.getElementById('calcBtn');
    const earthInput = document.getElementById('earthWeight');
    const unitSelect = document.getElementById('unitSelect');

    if (calcBtn) {
        calcBtn.addEventListener('click', calculatePlanetWeights);
    }

    if (earthInput) {
        earthInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                calculatePlanetWeights();
            }
        });

        earthInput.addEventListener('input', calculatePlanetWeights);
    }

    if (unitSelect) {
        unitSelect.addEventListener('change', calculatePlanetWeights);
    }
};