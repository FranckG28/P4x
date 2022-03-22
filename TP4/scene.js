import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTools.js';

/************** VARIABLES *****************/

// Instances globales
let physicsWorld, scene, camera, renderer, clock, controls;

// Loaders
const textureLoader = new THREE.TextureLoader();

// Liste des corps à mettre à jour
let rigidBodies = [];

// Transformation ammo.js
let tmpTrans;

/************ MOTEUR PHYSIQUE *************/

 //Ammojs Initialization
 Ammo().then( start )
            
function setupPhysicsWorld(){

        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
                dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
                overlappingPairCache    = new Ammo.btDbvtBroadphase(),
                solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.87, 0));

}

function start(){

        setupPhysicsWorld();
        tmpTrans = new Ammo.btTransform();

        setupGraphicWorld();
        createFloor();
        createBall();

        animate();

        
}

/************ SCENE THREE JS **************/

function setupGraphicWorld() {
        const fov = 50;
        const lightColor = 0xffffff;

        var container = document.querySelector('#threejsContainer');

        /* Chargement des classes */
        const objTool = new OBJTool();
        const textureLoader = new THREE.TextureLoader();

        /* Rendu */
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
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
        let hemiLight = new THREE.HemisphereLight( lightColor, lightColor, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        //Add directional light
        let dirLight = new THREE.DirectionalLight( lightColor , 1);
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
        textureLoader.load(
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
}

/************ ANIMATION **************/

function animate() { 

        if (controls) controls.update();

        updatePhysics(clock.getDelta());
        
        if (renderer && camera && scene) renderer.render(scene, camera);

        requestAnimationFrame(animate);
}

/***************** MISE A JOUR DE L'AFFICHAGE ******************/
function createFloor(){
    
        let pos = {x: 0, y: 0, z: 0};
        let scale = {x: 50, y: 2, z: 50};
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 0;

        //threeJS Section
        textureLoader.load(
                // resource URL
                'moon.png',

                // onLoad callback
                function ( texture ) {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.x = 10;
                        texture.repeat.y = 10;
                        let geo = new THREE.BoxBufferGeometry();
                        let mat = new THREE.MeshPhongMaterial();
                        mat.map = texture;
                        mat.side = THREE.DoubleSide;
                        let floor = new THREE.Mesh(geo, mat);
                        floor.position.set(pos.x, pos.y, pos.z);
                        floor.scale.set(scale.x, scale.y, scale.z);
                        floor.castShadow = true;
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

        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );


        physicsWorld.addRigidBody( body );
}

    
function createBall(){

        let pos = {x: 0, y: 20, z: 0};
        let radius = 2;
        let quat = {x: 0, y: 0, z: 0, w: 1};
        let mass = 1;

        //threeJS Section
        let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));

        ball.position.set(pos.x, pos.y, pos.z);

        ball.castShadow = true;
        ball.receiveShadow = true;

        scene.add(ball);


        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btSphereShape( radius );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );


        physicsWorld.addRigidBody( body );

        ball.userData.physicsBody = body;
        rigidBodies.push(ball);
}
    
    
function updatePhysics( deltaTime ){

        // Step world
        physicsWorld.stepSimulation( deltaTime, 10 );

        // Update rigid bodies
        for ( let i = 0; i < rigidBodies.length; i++ ) {
                let objThree = rigidBodies[ i ];
                let objAmmo = objThree.userData.physicsBody;
                let ms = objAmmo.getMotionState();
                if ( ms ) {

                ms.getWorldTransform( tmpTrans );
                let p = tmpTrans.getOrigin();
                let q = tmpTrans.getRotation();
                objThree.position.set( p.x(), p.y(), p.z() );
                objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

                }
        }

}