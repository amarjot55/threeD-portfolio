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
const spaceTexture = new THREE.TextureLoader().load('/src/assets/space.jpg');
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
const moonPlanet = createPlanet(4, '/src/assets/moon surface.jpg', [-10, 0, 30], 'moonPlanet');

// Create Mars planet with Mars surface texture
const marsPlanet = createPlanet(5, '/src/assets/mars.jpg', [15, 5, -20], 'marsPlanet');

// Create Amar cube with amar's image
const amarCube = createCube(6, '/src/assets/amar pic.jpg', [0, 0, 5]);

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

// Create enhanced rockets
const createRocket = (position, color) => {
  const rocketGroup = new THREE.Group();
  
  // Rocket body
  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: color,
    metalness: 0.8,
    roughness: 0.2
  });
  const rocketBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
  rocketBody.rotation.z = Math.PI / 2;
  
  // Rocket nose cone
  const noseGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
  const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(1.4, 0, 0);
  nose.rotation.z = Math.PI / 2;
  
  // Rocket fins
  const finGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.1);
  const finMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeometry, finMaterial);
    fin.position.set(-1, 0, 0);
    fin.rotation.x = (i * Math.PI) / 2;
    rocketGroup.add(fin);
  }
  
  // Rocket flame
  const flameGeometry = new THREE.ConeGeometry(0.4, 2, 8);
  const flameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFF4500,
    emissive: 0xFF4500,
    emissiveIntensity: 0.8
  });
  const flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.set(-2.5, 0, 0);
  flame.rotation.z = -Math.PI / 2;
  
  rocketGroup.add(rocketBody);
  rocketGroup.add(nose);
  rocketGroup.add(flame);
  rocketGroup.position.set(...position);
  scene.add(rocketGroup);
  
  return rocketGroup;
};

// Create multiple rockets
const rockets = [
  createRocket([-20, 15, -30], 0xFF0000),
  createRocket([25, -10, -25], 0x00FF00),
  createRocket([-15, -20, 20], 0x0000FF),
  createRocket([30, 20, 10], 0xFFFF00),
  createRocket([-25, 10, -15], 0xFF00FF),
  createRocket([20, -15, 25], 0x00FFFF),
  createRocket([-30, 25, -10], 0xFFA500),
  createRocket([35, -5, -35], 0x800080)
];

// Create shooting stars with trails
const createShootingStar = () => {
  const starGroup = new THREE.Group();
  
  // Main star
  const starGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const starMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 1
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  
  // Star trail
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = [];
  const trailColors = [];
  
  for (let i = 0; i < 20; i++) {
    trailPositions.push(-i * 0.3, 0, 0);
    trailColors.push(1, 1, 1 - (i * 0.05));
  }
  
  trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));
  
  const trailMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });
  
  const trail = new THREE.Points(trailGeometry, trailMaterial);
  starGroup.add(star);
  starGroup.add(trail);
  
  // Random starting position
  const x = THREE.MathUtils.randFloatSpread(150);
  const y = THREE.MathUtils.randFloatSpread(150);
  const z = THREE.MathUtils.randFloatSpread(150);
  starGroup.position.set(x, y, z);
  
  // Random direction
  starGroup.userData = {
    velocity: new THREE.Vector3(
      THREE.MathUtils.randFloat(-0.5, 0.5),
      THREE.MathUtils.randFloat(-0.5, 0.5),
      THREE.MathUtils.randFloat(0.5, 1.5)
    )
  };
  
  scene.add(starGroup);
  return starGroup;
};

// Create multiple shooting stars
const shootingStars = [];
for (let i = 0; i < 20; i++) {
  shootingStars.push(createShootingStar());
}

// Create meteor field
const createMeteor = (position) => {
  const meteorGroup = new THREE.Group();
  
  // Meteor body
  const meteorGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  const meteorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    emissive: 0xFFFFFF,
    emissiveIntensity: 0.5
  });
  const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
  
  // Meteor trail
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = [];
  for (let i = 0; i < 10; i++) {
    trailPositions.push(-i * 0.2, 0, 0);
  }
  trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
  
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.5
  });
  
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  meteorGroup.add(meteor);
  meteorGroup.add(trail);
  meteorGroup.position.set(...position);
  meteorGroup.userData = {
    velocity: new THREE.Vector3(
      THREE.MathUtils.randFloat(-0.3, 0.3),
      THREE.MathUtils.randFloat(-0.3, 0.3),
      THREE.MathUtils.randFloat(0.8, 1.5)
    )
  };
  
  scene.add(meteorGroup);
  return meteorGroup;
};

const meteors = [];
for (let i = 0; i < 12; i++) {
  meteors.push(createMeteor([
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100)
  ]));
}

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

// Animation loop
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
  
  // Animate rockets
  rockets.forEach((rocket, index) => {
    rocket.rotation.y += 0.02;
    rocket.position.x += Math.sin(Date.now() * 0.001 + index) * 0.1;
    rocket.position.y += Math.cos(Date.now() * 0.001 + index) * 0.1;
  });
  
  // Animate shooting stars
  shootingStars.forEach(star => {
    star.position.add(star.userData.velocity);
    star.rotation.y += 0.1;
    
    // Reset if out of bounds
    if (star.position.length() > 200) {
      star.position.set(
        THREE.MathUtils.randFloatSpread(150),
        THREE.MathUtils.randFloatSpread(150),
        THREE.MathUtils.randFloatSpread(150)
      );
    }
  });
  
  // Animate meteors
  meteors.forEach(meteor => {
    meteor.position.add(meteor.userData.velocity);
    meteor.rotation.x += 0.05;
    meteor.rotation.y += 0.05;
    
    // Reset if out of bounds
    if (meteor.position.length() > 200) {
      meteor.position.set(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100)
      );
    }
  });
  
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
