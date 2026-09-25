// Planetary Data
const planets = [
    { name: "MOON", gravity: 0.166, file: "MOON.png", jumpHeight: -140, duration: 1.8 },
    { name: "MERCURY", gravity: 0.38, file: "MERCURY.png", jumpHeight: -90, duration: 1.2 },
    { name: "VENUS", gravity: 0.91, file: "VENUS.png", jumpHeight: -55, duration: 0.8 },
    { name: "MARS", gravity: 0.38, file: "MARS.png", jumpHeight: -90, duration: 1.2 },
    { name: "JUPITER", gravity: 2.36, file: "JUPITER.png", jumpHeight: -20, duration: 0.4 },
    { name: "SATURN", gravity: 0.92, file: "SATURN.png", jumpHeight: -54, duration: 0.8 },
    { name: "URANUS", gravity: 0.89, file: "URANUS.png", jumpHeight: -56, duration: 0.85 },
    { name: "NEPTUNE", gravity: 1.12, file: "NEPTUNE.png", jumpHeight: -45, duration: 0.7 },
];

// Configuration
const astronautImagePath = "assets/ASTRONAUT.png";
const earthPlanet = { name: "EARTH", gravity: 1.0, jumpHeight: -60, duration: 0.85 };

let activePlanetIndex = -1;

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
        earthWeightDisplay.textContent = `${earthWeight.toFixed(1)} ${currentUnit}`;
    }

    // Update weights for all other planets
    planets.forEach((planet, index) => {
        const weightDisplay = document.getElementById(`weight-${index}`);
        if (weightDisplay) {
            const calculatedWeight = (earthWeight * planet.gravity).toFixed(1);
            weightDisplay.textContent = `${calculatedWeight} ${currentUnit}`;
        }
    });

    // Trigger Earth jump animation on successful calculation
    handleEarthClick();
}

// Earth Click Handler
function handleEarthClick() {
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
        `;

        grid.appendChild(item);
    });
}

// Planet Click Handler
function handlePlanetClick(index) {
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

// App Initialization
window.onload = () => {
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