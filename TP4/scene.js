import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTool.js';

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
const objtool = new OBJTool();

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
                floor.rotateX(objtool.makeAngle(90))
                scene.add(floor)
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
                console.error( 'An error happened.' );
        }
);


/* LUMIERES */
const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.x = 3;
light.position.y = 5;
light.position.z = 4;
light.intensity = 1.0;
scene.add( light );


/* SHADERS */

/********** LAMBERT *********** */
// Vertex shader
var lambertVertexShader = `
        uniform vec3 lightPos;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main()
        {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * viewMatrix * worldPos;

                vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
                vPosition = worldPos.xyz;
        }`


// Pixel shader
var lambertFragmentShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 rgb;
        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform float lightIntensity;

        void main()
        {
                vec3 color = (rgb*lightIntensity*lightColor) * dot(normalize(vNormal), normalize(lightPos - vPosition));
                gl_FragColor = vec4(color, 1.0);
        }`

/************ TOON ************/

// Pixel shader
var toonFragmentShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 rgb;
        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform float lightIntensity;

        void main()
        {

                float scal = dot(normalize(vNormal), normalize(lightPos - vPosition));

                if (scal < 0.33) {
                        scal = 0.33;
                } else if (scal < 0.66) {
                        scal = 0.66;
                } else {
                        scal = 1.0;
                }

                vec3 color = (rgb*lightIntensity*lightColor) * scal;
                gl_FragColor = vec4(color, 1.0);
        }`


/*** PHONG ***/

var phongFragmentShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform vec3 rgb;
        uniform vec3 cameraPos;
        uniform vec3 lightPos;
        uniform vec3 lightColor;
        uniform float lightIntensity;

        void main()
        {

                vec3 lightDirection = normalize(lightPos - vPosition);
                float scal = dot(lightDirection, normalize(vNormal));
                vec3 toCamera = normalize(cameraPos - vPosition);

                float visibility = dot(toCamera, lightDirection);
                float specular = pow(dot(toCamera, normalize(vNormal)), (lightIntensity*20.0));

                vec3 color = (rgb*lightIntensity*lightColor);
                vec3 diffuse = color * scal;
                vec3 vecSpecular = color * specular * visibility;

                gl_FragColor = vec4(diffuse + vecSpecular, 1.0);
        }`


// *** UNIFORMS ***/
var myRGBUniform = { type: "v3", value: new THREE.Vector3() };
var myLightPosUniform = { type: "v3", value: light.position};
var myLightIntensityUniform = { type: "float", value: light.intensity};
var myLightColorUniform = { type: "v3", value: light.color};
var myCameraPosUniforms = { type: "v3", value: camera.position};

// on associe la déclaration type/conteneur au nom de la variable uniform "rgb"
var myUniforms = { rgb : myRGBUniform, lightPos: myLightPosUniform, lightIntensity: myLightIntensityUniform, lightColor: myLightColorUniform, cameraPos: myCameraPosUniforms};
  
/*** Création des shaders ***/

const lamberShaderMaterial = new THREE.ShaderMaterial({ vertexShader: lambertVertexShader, fragmentShader: lambertFragmentShader, uniforms: myUniforms });

const toonShaderMaterial = new THREE.ShaderMaterial({ vertexShader: lambertVertexShader, fragmentShader: toonFragmentShader, uniforms: myUniforms });

const phongShaderMaterial = new THREE.ShaderMaterial({ vertexShader: lambertVertexShader, fragmentShader: phongFragmentShader, uniforms: myUniforms });


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
