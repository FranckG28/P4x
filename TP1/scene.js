import * as THREE from './three.js-master/build/three.module.js'

// import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

var W = 1000;
var H = 700;

var container = document.querySelector('#threejsContainer');

var scene, camera, renderer;

function init() {        
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
        camera.position.set(0, 10, 10);
        camera.lookAt(scene.position);
        scene.add(camera);
        
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(W, H);
        container.appendChild(renderer.domElement);
        
        var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1,20,20),
                new THREE.MeshBasicMaterial( { color: "#FFFFFF" })
        );
        
		scene.add(sphere);
}

function animate() { //a compléter        
        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}


init();
animate();
