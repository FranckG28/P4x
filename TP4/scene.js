import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTools.js';

/************** VARIABLES *****************/

// Instances globales
let physicsWorld, scene, camera, renderer, clock, controls;

/************ MOTEUR PHYSIQUE *************/

 //Ammojs Initialization
 Ammo().then( start )
            
function setupPhysicsWorld(){

        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
                dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
                overlappingPairCache    = new Ammo.btDbvtBroadphase(),
                solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -9,87, 0));

}

function start(){

        setupPhysicsWorld();

        setupGraphicWorld();

        animate();
}

/************ SCENE THREE JS **************/

function setupGraphicWorld() {
        const floorSize = 200;
        const fov = 50;
        const polygons = 42;
        const lightColor = 0xffffff;

        var container = document.querySelector('#threejsContainer');

        /* Chargement des classes */
        const objTool = new OBJTool();
        const textureLoader = new THREE.TextureLoader();

        /* Rendu */
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.setSize(window.innerWidth, window.innerWidth);
        container.appendChild(renderer.domElement);

        /* CLOCK */
        clock = new THREE.Clock();

        /* SCENE */
        scene = new THREE.Scene();

        /* CAMERA */
        camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 10, 30);
        camera.lookAt(scene.position);

        /* CONTROLES */
        controls = new OrbitControls( camera, renderer.domElement );

        /* LUMIERES */
        //Add hemisphere light
        let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        //Add directional light
        let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 100 );
        scene.add( dirLight );

        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        let d = 50;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 13500;

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
}

/************ ANIMATION **************/

function animate() { 

        if (controls) controls.update();

        //let deltaTime = clock.getDelta();

        requestAnimationFrame(animate);
        
        if (renderer && camera && scene) renderer.render(scene, camera); 

}

animate();
