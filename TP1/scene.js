import * as THREE from './three.js-master/build/three.module.js'

// import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

var W = 1000;
var H = 700;

var container = document.querySelector('#threejsContainer');

var scene, camera, renderer;

function init() {        
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(90, W / H, 0.1, 1000);
        camera.position.set(0, 10, 10);
        camera.lookAt(scene.position);
        scene.add(camera);
        
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(W, H);
        container.appendChild(renderer.domElement);
        
        var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1,20,20),
                new THREE.MeshLambertMaterial( { color: "#FFFFFF", })
        );
        scene.add(sphere);

        var cube = new THREE.Mesh(
                new THREE.BoxGeometry(2,2,3, 5, 5, 5),
                new THREE.MeshLambertMaterial( { color: "#0000FF", })
        );
        cube.translateY(5);
        cube.translateZ(-5);
        scene.add(cube);



        var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(2,10,50),
                new THREE.MeshLambertMaterial( { color: "#00FF00", })
        );
        sphere.translateX(8);
        sphere.translateY(4);
        scene.add(sphere);

        var cube2 = new THREE.Mesh(
                new THREE.BoxGeometry(4,2,3, 5, 5, 5),
                new THREE.MeshLambertMaterial( { color: "#FF0000", })
        );
        cube2.translateY(-4);
        cube2.translateZ(4);
        cube2.translateX(9);
        scene.add(cube2);



        
        var sphereLightMaterial = new THREE.MeshLambertMaterial( { color: "#FFFFFF"});
        sphereLightMaterial.transparent = true;
        sphereLightMaterial.opacity = 0.5;
        var sphereLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.5,20,20),
                sphereLightMaterial
        );
        sphereLight.translateY(9);
        scene.add(sphereLight);

        const light = new THREE.PointLight( 0xFFFFFF, 1 );
        light.translateY(10);
        scene.add( light );




        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );
		
        //scene.background = new THREE.Color( 0xff0000 );

}

function animate() { //a compléter        
        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}


init();
animate();
