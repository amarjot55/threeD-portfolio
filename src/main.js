import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Create space background
const spaceTexture = new THREE.TextureLoader().load('src/assets/space.jpg');
scene.background = spaceTexture;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add controls for movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;

// Create planets with surface textures
const createPlanet = (radius, texture, position, name) => {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(texture),
    metalness: 0.1,
    roughness: 0.8
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.name = name;
  scene.add(mesh);
  return mesh;
};

// Create cube with texture
const createCube = (size, texture, position) => {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(texture),
    metalness: 0.3,
    roughness: 0.4
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  scene.add(mesh);
  return mesh;
};

// Create moon planet with moon surface texture
const moonPlanet = createPlanet(4, 'src/assets/moon surface.jpg', [-10, 0, 30], 'moonPlanet');

// Create Mars planet with Mars surface texture
const marsPlanet = createPlanet(5, 'src/assets/mars.jpg', [15, 5, -20], 'marsPlanet');

// Create Amar cube with amar's image
const amarCube = createCube(6, 'src/assets/amar pic.jpg', [0, 0, 5]);

// Create additional decorative elements
const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xFF6347,
  metalness: 0.7,
  roughness: 0.2
});
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(0, 0, 0);
scene.add(torus);

// Add stars
const addStar = () => {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
};

Array(200).fill().forEach(addStar);

const createRocket = (position) => {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const rocket = new THREE.Mesh(geometry, material);
    rocket.position.set(position[0], position[1], position[2]);
    scene.add(rocket);
    return rocket;
};

const rockets = [];
for (let i = 0; i < 5; i++) {
    const x = THREE.MathUtils.randFloatSpread(100);
    const y = THREE.MathUtils.randFloatSpread(100);
    const rocket = createRocket([x, y, -50]);
    rockets.push(rocket);
}

const animateRockets = () => {
    rockets.forEach((rocket) => {
        rocket.position.z += 0.5; // Move rocket forward
        if (rocket.position.z > 50) {
            rocket.position.z = -50; // Reset position
        }
    });
};

const createShootingStar = () => {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const shootingStar = new THREE.Mesh(geometry, material);
    
    const x = THREE.MathUtils.randFloatSpread(100);
    const y = THREE.MathUtils.randFloatSpread(100);
    shootingStar.position.set(x, y, -50);
    scene.add(shootingStar);
    
    return shootingStar;
};

const shootingStars = [];
for (let i = 0; i < 10; i++) {
    const shootingStar = createShootingStar();
    shootingStars.push(shootingStar);
}

const animateShootingStars = () => {
    shootingStars.forEach((star) => {
        star.position.z += 1; // Move shooting star forward
        if (star.position.z > 50) {
            star.position.z = -50; // Reset position
            star.position.x = THREE.MathUtils.randFloatSpread(100); // Randomize x position
            star.position.y = THREE.MathUtils.randFloatSpread(100); // Randomize y position
        }
    });
};

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate objects
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;
    
    // Rotate planets
    moonPlanet.rotation.y += 0.005;
    marsPlanet.rotation.y += 0.003;
    
    // Rotate cube
    amarCube.rotation.x += 0.01;
    amarCube.rotation.y += 0.01;

    // Animate rockets and shooting stars
    animateRockets();
    animateShootingStars();
    
    // Update controls
    controls.update();
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll zoom functionality
window.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomFactor = 0.1;
    camera.position.z += event.deltaY * zoomFactor;
    camera.position.z = Math.max(5, camera.position.z); // Prevent zooming too close
});

// Start animation
animate();
