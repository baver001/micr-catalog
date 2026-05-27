import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Minimal sky shader (placeholder for atmospheric scattering)
const vertexShader = `
varying vec3 vWorldPosition;
void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vWorldPosition;
uniform vec3 sunPosition;
void main() {
    vec3 direction = normalize(vWorldPosition);
    float atmosphere = sqrt(1.0 - direction.y);
    vec3 skyColor = mix(vec3(0.1, 0.2, 0.5), vec3(0.9, 0.5, 0.2), atmosphere);
    gl_FragColor = vec4(skyColor, 1.0);
}
`;

const geometry = new THREE.SphereGeometry(500, 64, 64);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide
});

const sky = new THREE.Mesh(geometry, material);
scene.add(sky);

camera.position.z = 1;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
