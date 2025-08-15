import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js';

// Szene, Kamera, Renderer
const container = document.getElementById("container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 5000);
camera.position.set(0, 300, 800);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht
const sunLight = new THREE.PointLight(0xffffff, 2, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Hintergrund: animierte Galaxie-Sterne
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 10000;
const positions = [];
for(let i = 0; i < starsCount; i++) {
  positions.push((Math.random() - 0.5) * 5000);
  positions.push((Math.random() - 0.5) * 5000);
  positions.push((Math.random() - 0.5) * 5000);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Planeten-Daten (Radius, Abstand, Rotation, Farbe)
const planetData = [
  { name: 'Mercury', radius: 3, distance: 50, rotationSpeed: 0.004, color: 0x909090, moons: [] },
  { name: 'Venus', radius: 7, distance: 70, rotationSpeed: 0.002, color: 0xeccc9a, moons: [] },
  { name: 'Earth', radius: 8, distance: 100, rotationSpeed: 0.02, color: 0x2233ff, moons: [{radius: 2, distance: 15, rotationSpeed:0.05}] },
  { name: 'Mars', radius: 5, distance: 140, rotationSpeed: 0.018, color: 0xff5533, moons: [{radius:1, distance: 10, rotationSpeed:0.04}, {radius:0.5, distance: 15, rotationSpeed:0.02}] },
  { name: 'Jupiter', radius: 20, distance: 200, rotationSpeed: 0.04, color: 0xffaa33, moons: [{radius:3, distance: 25, rotationSpeed:0.03}, {radius:2, distance: 35, rotationSpeed:0.02}] },
  { name: 'Saturn', radius: 17, distance: 270, rotationSpeed: 0.038, color: 0xffddaa, moons: [{radius:2, distance: 20, rotationSpeed:0.02}] },
  { name: 'Uranus', radius: 12, distance: 340, rotationSpeed: 0.03, color: 0x66ccff, moons: [] },
  { name: 'Neptune', radius: 12, distance: 400, rotationSpeed: 0.032, color: 0x3366ff, moons: [] }
];

// Planet-Objekte erstellen
const planets = [];
planetData.forEach(pd => {
  const geom = new THREE.SphereGeometry(pd.radius, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: pd.color });
  const mesh = new THREE.Mesh(geom, mat);

  const pivot = new THREE.Object3D();
  pivot.position.set(0,0,0);
  pivot.add(mesh);

  mesh.position.set(pd.distance, 0, 0);
  scene.add(pivot);

  // Monde
  const moons = [];
  pd.moons.forEach(moon => {
    const moonGeom = new THREE.SphereGeometry(moon.radius, 16, 16);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);

    const moonPivot = new THREE.Object3D();
    moonPivot.add(moonMesh);
    moonMesh.position.set(moon.distance,0,0);
    pivot.add(moonPivot);

    moons.push({ mesh: moonMesh, pivot: moonPivot, speed: moon.rotationSpeed });
  });

  planets.push({ mesh, pivot, speed: pd.rotationSpeed, moons });
});

// Sonne
const sunGeom = new THREE.SphereGeometry(30, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

// Animation
function animate() {
  requestAnimationFrame(animate);

  planets.forEach(p => {
    p.pivot.rotation.y += p.speed;
    p.moons.forEach(m => {
      m.pivot.rotation.y += m.speed;
    });
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
