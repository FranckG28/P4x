import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import { OBJLoader } from '../three.js-master/examples/jsm/loaders/OBJLoader.js';

var W = window.innerWidth;
var H = window.innerHeight;

const maxLightPos = 100;
const floorSize = 200;
const fov = 50;
const polygons = 42;

const loader = new OBJLoader();

const boxColor = "#DC2626";

const makeAngle = function(angle) {
        return angle * (Math.PI/180);
}

var container = document.querySelector('#threejsContainer');

var scene, camera, renderer;

const lightColor = "#FFFFFF";

/* SCENE */
scene = new THREE.Scene();

/* CAMERA */
camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 1000);
camera.position.set(0, 10, 30);
camera.lookAt(scene.position);

/* SOL */
const floorLoader = new THREE.TextureLoader();
floorLoader.load(
        // resource URL
        'moon.png',

        // onLoad callback
        function ( texture ) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.x = 10;
                texture.repeat.y = 10;
                let geo = new THREE.CircleGeometry(floorSize,polygons);
                let mat = new THREE.MeshLambertMaterial();
                mat.map = texture;
                mat.side = THREE.DoubleSide;
                var floor = new THREE.Mesh(geo, mat);
                floor.position.set(0, -0.01, 0)
                floor.rotateX(makeAngle(90))
                scene.add(floor)
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
                console.error( 'An error happened.' );
        }
);

/* AJOUT DES OBJETS */

var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1,polygons,polygons),
        new THREE.MeshLambertMaterial( { color: "#FFFFFF", })
);
sphere.position.set(2, 1, 3)
scene.add(sphere);


var cube = new THREE.Mesh(
        new THREE.BoxGeometry(2,2,3, polygons, polygons, polygons),
        new THREE.MeshLambertMaterial( { color: "#E11D48", })
);
cube.position.set(-1, 1, -3)
scene.add(cube);

const treeWeight = 0.3;
const treeHeight = 4;
var cone = new THREE.Mesh(
        new THREE.ConeGeometry(treeWeight,treeHeight, polygons),
        new THREE.MeshLambertMaterial( { color: "#713F12", })
);
cone.position.set(8, treeHeight/2, 0)
scene.add(cone);


var ring = new THREE.Mesh(
        new THREE.TorusGeometry( 1, 0.3, polygons, polygons ),
        new THREE.MeshLambertMaterial( { color: "#FACC15", })
);
ring.position.set(8, 2.5, 0)
ring.rotateX(makeAngle(90))
scene.add(ring);


const torusKnot = new THREE.Mesh( 
        new THREE.TorusKnotGeometry( 1, 0.2, polygons*2, polygons ),
        new THREE.MeshLambertMaterial( { color: "#2563EB", }) 
);
torusKnot.position.set(-5, 3, 2)
scene.add( torusKnot );


/* MODELES */
const getObjectBox = function(object) {
        let box3 = new THREE.Box3().setFromObject(object);
        return box3;
}

const getObjectSize = function(object) {
        let vector3 = new THREE.Vector3();
        getObjectBox(object).getSize(vector3);
        
        return vector3;
}

const createOBJModel = function(model,x, y, z, rX, rY, rZ, scale) {
        loader.load(
                model, 
                function(object) {

                        // Mise à l'echelle
                        let size = getObjectSize(object)
                        let s = (1/ size.y) * scale
                        object.scale.set(s, s, s)

                        // Positionnement
                        let adjustedBox = getObjectBox(object);
                        object.position.set(x, Math.abs(adjustedBox.min.y)+y, z)
                        scene.add(object)

                        // Rotation
                        object.rotateX(makeAngle(rX));
                        object.rotateY(makeAngle(rY));
                        object.rotateZ(makeAngle(rZ));
                        
                        // BoxHelper
                        let box = new THREE.BoxHelper(object, boxColor);
                        scene.add(box)

                },
                function(xhr) {},
                function (error) {
                        console.error(error);
                }
        );
}

createOBJModel('bear.obj', 8,0,1,0, 0, 0
, 1)
createOBJModel('cow.obj', 4, 0, 4,0, 0, 0
, 1)
createOBJModel('teapot.obj', 5,0, -2,0, 0, 0
, 1)


/* SHADERS */

// Vertex shader
var myVertexShader = `
  void main() 
  {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);  
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }`
  
// Pixel shader
var myFragmentShader = `  
  void main() 
  { 
    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  }`

const shaderSphere = new THREE.Mesh(
        new THREE.SphereGeometry(4, polygons, polygons),
        new THREE.ShaderMaterial({ vertexShader: myVertexShader, fragmentShader: myFragmentShader })
);
shaderSphere.position.set(10, 15, 5)
scene.add(shaderSphere);


/* LUMIERES */
const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.x = 80;
light.position.y = 100;
light.position.z = 80;
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

/* RENDU */
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(W, H);
container.appendChild(renderer.domElement);

/* CONTROLES */
const controls = new OrbitControls( camera, renderer.domElement );


function animate() { 
        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}

animate();
