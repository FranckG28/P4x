import * as THREE from './three.js-master/build/three.module.js'

import * as dat from './three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

var W = window.innerWidth;
var H = window.innerHeight;

const maxLightPos = 100;
const floorSize = 300;
const fov = 50;

var container = document.querySelector('#threejsContainer');

var scene, camera, renderer;

function init() {       

        const lightColor = "#FFFFFF";

        /* RENDU */
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(W, H);
        container.appendChild(renderer.domElement);

        /* SCENE */
        scene = new THREE.Scene();

        /* CAMERA */
        camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 1000);
        camera.position.set(0, 10, 10);
        camera.lookAt(scene.position);

        /* CONTROLES */
        const controls = new OrbitControls( camera, renderer.domElement );
       

        /* SOL */
        var floor = new THREE.Mesh(
                new THREE.PlaneGeometry(floorSize, floorSize,3, 3),
                new THREE.MeshLambertMaterial( {color: 0x16A34A, side: THREE.DoubleSide})
        )
        floor.rotateX(90*(Math.PI/180))
        scene.add(floor)

        
        /* AJOUT DES OBJETS */

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
        cube2.translateY(4);
        cube2.translateZ(4);
        cube2.translateX(-9);
        scene.add(cube2);



        /* LUMIERES */

        const light = new THREE.PointLight(lightColor);
        light.position.set(10, 50, 20)
        scene.add( light );

        var sphereLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.5,20,20),
                new THREE.MeshBasicMaterial( { color: lightColor })
        );
        sphereLight.material.transparent = true;
        sphereLight.material.opacity = 0.5;
        scene.add(sphereLight);

        const updateSphereLight = function() {
                sphereLight.position.copy(light.position);
        }

        updateSphereLight();

        /* AXES */
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );


        /* INTERFACE */
        var gui = new dat.GUI();

        var lightFolder = gui.addFolder("Light");
        var camFolder = gui.addFolder("Camera");
       
        var parameters = {
           x: light.position.x,
           y: light.position.y,
           z: light.position.z,
           intensity: light.intensity,
           color: lightColor,
           fov: fov
        };

        var posX = lightFolder.add(parameters, 'x').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var posY = lightFolder.add(parameters, 'y').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var posZ = lightFolder.add(parameters, 'z').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var lightIntensity = lightFolder.add(parameters, 'intensity').min(0).max(10).step(0.1).listen();
        var lightColorGUI = lightFolder.addColor(parameters, 'color').listen();

        var fovGUI = camFolder.add(parameters, 'fov').min(10).max(180).step(0.1).listen();


        posX.onChange(function (value) { 
                light.position.set(value, light.position.y, light.position.z) 
                updateSphereLight()
        });
        posY.onChange(function (value) { 
                light.position.set(light.position.x, value, light.position.z) 
                updateSphereLight()
        });
        posZ.onChange(function (value) { 
                light.position.set(light.position.x, light.position.y, value) 
                updateSphereLight()
        });
        lightIntensity.onChange(function (value) { 
                light.intensity = value; 
        });
        lightColorGUI.onChange(function (value) {
                light.color.set(value);
                sphereLight.material.color.set(value);
        });

        fovGUI.onChange(function(value) {
                camera.fov = value;
                camera.updateProjectionMatrix();
        });

        lightFolder.open();
        camFolder.open();

}

function animate() { 
        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}

init();
animate();
