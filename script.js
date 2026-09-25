// Planet Dataset
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

// Astronaut
const astronautImagePath = "assets/ASTRONAUT.png";

// Earth
const earthPlanet = { name: "EARTH", gravity:1.0, jumpHeight: -60, duration: 0.85 };

// Handle clicking on Earth
function handleEarthClick() {
    const jumper = document.getElementById('jumper-earth');
    if (!jumper) return;

    if (activePlanetIndex !== -1 && activePlanetIndex !== 'earth') {
        const prevJumper = document.getElementById(`jumper-${activePlanetIndex}`);
        if (prevJumper) {
            prevJumper.classList.remove('active', 'jumping');
        }
    }

    activePlanetIndex = 'earth';

    jumper.style.setProperty('--jump-height', `${earthPlanet.jumpHeight}px`);
    jumper.style.setProperty('--jump-duration', `${earthPlanet.duration}s`);

    jumper.classList.remove('jumping');
    void jumper.offsetWidth;

    jumper.classList.add('active', 'jumping');
}

let activePlanetIndex = -1

// Render Planet Grid
function renderPlanetCards() {
    const grid = document.getElementById('planetsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    planets.forEach((planet, index) => {
        const item = document.createElement('div');
        item.className = 'planet-item';
        item.setAttribute('data-planet', planet.name);
        item.onclick = () => handlePlanetClick(index);

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

// Jump Physics Trigger (Handle Planet Click)
function handlePlanetClick(index) {
    const planet = planets[index];
    const jumper = document.getElementById(`jumper-${index}`);

    if (!jumper) return;

    if (activePlanetIndex !== index) {
        if (activePlanetIndex === 'earth') {
            const earthJumper = document.getElementById('jumper-earth');
            if (earthJumper) earthJumper.classList.remove('active', 'jumping');
        }
        else if (activePlanetIndex !== -1) {
            const prevJumper = document.getElementById(`jumper-${activePlanetIndex}`);
            if (prevJumper) {
            prevJumper.classList.remove('active', 'jumping');
            }
        }
    }

    activePlanetIndex = index;

    jumper.style.setProperty('--jump-height', `${planet.jumpHeight}px`);
    jumper.style.setProperty('--jump-duration', `${planet.duration}s`);

    jumper.classList.remove('jumping');
    void jumper.offsetWidth;

    jumper.classList.add('active', 'jumping');
}

window.onload = () => {
    renderPlanetCards();
};