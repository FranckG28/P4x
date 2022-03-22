import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTools.js';


/************ SCENE THREE JS **************/

var W = window.innerWidth;
var H = window.innerHeight;

const maxLightPos = 20;
const floorSize = 200;
const fov = 50;
const polygons = 42;

var container = document.querySelector('#threejsContainer');

var scene, camera, renderer;

const lightColor = "#FFFFFF";

/* Chargement des classes */
const objTool = new OBJTool();
const textureLoader = new THREE.TextureLoader();

/* SCENE */
scene = new THREE.Scene();

/* CAMERA */
camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 1000);
camera.position.set(0, 10, 30);
camera.lookAt(scene.position);

/* LUMIERES */
const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.castShadow = true;
light.position.x = 3;
light.position.y = 5;
light.position.z = 4;
light.intensity = 1.0;
scene.add( light );

/* CIEL */

const skyLoader = new THREE.TextureLoader();
skyLoader.load(
        // resource URL
        'sky.jpg',

        // onLoad callback
        function ( texture ) {

                var geometry = new THREE.SphereGeometry(500, 60, 40);
                var material = new THREE.MeshBasicMaterial();
                material.map = texture;
                material.side = THREE.BackSide;
                var skydome = new THREE.Mesh(geometry, material);

                scene.add(skydome);
                
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
                console.error( 'An error happened.' );
        }
);




/************ CANNON JS **************/

let world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

const phongMaterial = new THREE.MeshPhongMaterial()
const normalMaterial = new THREE.MeshNormalMaterial()

/* SOL */
textureLoader.load(
        // resource URL
        'moon.png',

        // onLoad callback
        function ( texture ) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = 10;
                texture.repeat.y = 10;
                let geo = new THREE.CircleGeometry(floorSize,polygons);
                let mat = new THREE.MeshPhongMaterial();
                mat.map = texture;
                mat.side = THREE.DoubleSide;
                var floor = new THREE.Mesh(geo, mat);
                floor.position.set(0, -0.01, 0)
                floor.rotateX(objTool.makeAngle(90))
                floor.receiveShadow = true;
                scene.add(floor)
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
                console.error( 'An error happened.' );
        }
);

const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)






const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
const cubeMesh = new THREE.Mesh(cubeGeometry, normalMaterial)
cubeMesh.position.x = -3
cubeMesh.position.y = 3
cubeMesh.castShadow = true
scene.add(cubeMesh)
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cubeBody = new CANNON.Body({ mass: 1 })
cubeBody.addShape(cubeShape)
cubeBody.position.x = cubeMesh.position.x
cubeBody.position.y = cubeMesh.position.y
cubeBody.position.z = cubeMesh.position.z
world.addBody(cubeBody)


/************ INTERFACE ************/
var gui = new dat.GUI();

var lightFolder = gui.addFolder("Light");
var camFolder = gui.addFolder("Camera");

var parameters = {
        x: light.position.x,
        y: light.position.y,
        z: light.position.z,
        intensity: light.intensity,
        color: lightColor,
        fov: fov,
};

var posX = lightFolder.add(parameters, 'x').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
var posY = lightFolder.add(parameters, 'y').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
var posZ = lightFolder.add(parameters, 'z').min(-maxLightPos).max(maxLightPos).step(0.1).listen();
var lightIntensity = lightFolder.add(parameters, 'intensity').min(0).max(10).step(0.1).listen();
var lightColorGUI = lightFolder.addColor(parameters, 'color').listen();

var fovGUI = camFolder.add(parameters, 'fov').min(10).max(180).step(0.1).listen();


posX.onChange(function (value) { 
        light.position.set(value, light.position.y, light.position.z) 
});
posY.onChange(function (value) { 
        light.position.set(light.position.x, value, light.position.z) 
});
posZ.onChange(function (value) { 
        light.position.set(light.position.x, light.position.y, value) 
});
lightIntensity.onChange(function (value) { 
        light.intensity = value; 
        shaderSphere.material.uniforms.lightIntensity.value = value;

});
lightColorGUI.onChange(function (value) {
        light.color.set(value);
});

fovGUI.onChange(function(value) {
        camera.fov = value;
        camera.updateProjectionMatrix();
});

lightFolder.open();
camFolder.open();

/************ RENDU ************/
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setSize(W, H);
container.appendChild(renderer.domElement);

/************ CONTROLES ************/
const controls = new OrbitControls( camera, renderer.domElement );
//controls.enableDamping = true;



/************ ANIMATION **************/

const clock = new THREE.Clock()
let delta

function animate() { 

        controls.update()

        //delta = clock.getDelta()
        delta = Math.min(clock.getDelta(), 0.1)
        world.step(delta)

        cubeMesh.position.set(
                cubeBody.position.x,
                cubeBody.position.y,
                cubeBody.position.z
        )
        cubeMesh.quaternion.set(
                cubeBody.quaternion.x,
                cubeBody.quaternion.y,
                cubeBody.quaternion.z,
                cubeBody.quaternion.w
        )

        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}

animate();


