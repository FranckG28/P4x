import * as THREE from './three.js-master/build/three.module.js'

import * as dat from './three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

var W = window.innerWidth;
var H = window.innerHeight;

const maxLightPos = 100;

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
        camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
        camera.position.set(0, 10, 10);
        camera.lookAt(scene.position);

        /* CONTROLES */
        const controls = new OrbitControls( camera, renderer.domElement );
       
        
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
        cube2.translateY(-4);
        cube2.translateZ(4);
        cube2.translateX(9);
        scene.add(cube2);



        /* LUMIERES */

        var sphereLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.5,20,20),
                new THREE.MeshBasicMaterial( { color: lightColor })
        );
        sphereLight.translateY(9);
        sphereLight.material.transparent = true;
        sphereLight.material.opacity = 0.5;
        scene.add(sphereLight);

        const light = new THREE.PointLight(lightColor);
        light.translateY(10);
        scene.add( light );

        /* AXES */
        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );


        /* INTERFACE */
        var gui = new dat.GUI();

        var lightFolder = gui.addFolder("Light");
       
        var parameters = {
           x: light.position.x,
           y: light.position.y,
           z: light.position.z,
           intensity: light.intensity,
           color: lightColor
        };

        var posX = lightFolder.add(parameters, 'x').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var posY = lightFolder.add(parameters, 'y').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var posZ = lightFolder.add(parameters, 'z').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
        var lightIntensity = lightFolder.add(parameters, 'intensity').min(0).max(10).step(0.1).listen();
        var lightColorGUI = lightFolder.addColor(parameters, 'color').listen();


        posX.onChange(function (value) { 
                light.position.set(value, light.position.y, light.position.z) 
                sphereLight.position.set(value, sphereLight.position.y, sphereLight.position.z) 
        });
        posY.onChange(function (value) { 
                light.position.set(light.position.x, value, light.position.z) 
                sphereLight.position.set(sphereLight.position.x, value, sphereLight.position.z) 
        });
        posZ.onChange(function (value) { 
                light.position.set(light.position.x, light.position.y, value) 
                sphereLight.position.set(sphereLight.position.x, sphereLight.position.y, value) 
        });
        lightIntensity.onChange(function (value) { 
                light.intensity = value; 
        });
        lightColorGUI.onChange(function (value) {
                light.color.set(value);
                sphereLight.material.color.set(value);
        });

        lightFolder.open();

}

function animate() { 
        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}

init();
animate();
