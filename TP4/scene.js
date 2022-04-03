import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTools.js';
import GLTFTools from './gltfTools.js';
import TextureTool from './textureTool.js';

/************** VARIABLES *****************/

// Instances globales
let physicsWorld, scene, camera, renderer, clock, controls, tmpTrans;

let isMoving = false;

// Elements du DOM
const container = document.querySelector('#threejsContainer');
const loadingScreen = document.querySelector('#loadingScreen');
const speedCounter = document.querySelector("#speedCounter")

// Loaders
const textureTool = new TextureTool();
const gltfTool = new GLTFTools();

// Mesh globaux
let chassisMesh;
let skydome

let dirLight

// Materiaux globaux
let wheelMaterial;

// Sol
let heightData, ammoHeightData;

// Décalage de la caméra
const temp = new THREE.Vector3;
let cameraTarget;

// Heightfield parameters
let terrainWidth;
let terrainDepth;

const terrainScale = 2;

let terrainMaxHeight;
let terrainMinHeight;

// Liste des corps à mettre à jour
let rigidBodies = [];

// Fonctions de mise à jours à executer
let syncList = [];

// Actions de la voiture
let actions = {};
const keysActions = {
        "KeyW":'acceleration',
        "KeyS":'braking',
        "KeyA":'left',
        "KeyD":'right'
};

/************ Fonction de démarrage *************/

// Executer la fonction start dès le chargement de Ammo
Ammo().then( start )


async function start(){

        // Récupération de la Heightmap du sol
        heightData = await getFloorData();

        // Initialisation du monde physique
        setupPhysicsWorld();

        // Initialisation du monde graphique
        await setupGraphicWorld();

        // Création du sol
        await createFloor();

        // Création de la balle
        createBall();

        // Création de la voiture
        await createVehicle(new THREE.Vector3(0, terrainMaxHeight, 10), new THREE.Quaternion(0, .42, 0, 1))

        // Association des évènements :
        window.addEventListener( 'keydown', keydown);
        window.addEventListener( 'keyup', keyup);
        window.addEventListener( 'resize', onWindowResize, false );

        // Affichage de la première image
        animate();

        // Fermeture de l'écran du chargement
        container.appendChild(renderer.domElement)
        loadingScreen.classList.add("m-fadeOut")
        loadingScreen.classList.remove("m-fadeIn")
        setTimeout(() => loadingScreen.remove(), 300);
        
        
}            

/*** Fonction d'initialisation du monde physique */
function setupPhysicsWorld(){

        tmpTrans = new Ammo.btTransform();

        let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        let overlappingPairCache = new Ammo.btDbvtBroadphase();
        let solver = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.87, 0));

}


/*** SCENE THREE JS */
async function setupGraphicWorld() {
        const fov = 50;
        const lightColor = 0xffffff;

        /* Chargement des classes */
        const objTool = new OBJTool();
        const textureLoader = new THREE.TextureLoader();

        /* Rendu */
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setSize(window.innerWidth, window.innerHeight);

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
        controls.addEventListener('start', () => isMoving = true)
        controls.addEventListener('end', () => isMoving = false)

        /* LUMIERES */
        //Add hemisphere light
        let hemiLight = new THREE.HemisphereLight( lightColor, lightColor, 0.1 );
        hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
        hemiLight.position.set( 0, 50, 0 );
        scene.add( hemiLight );

        //Add directional light
        dirLight = new THREE.DirectionalLight( lightColor , 1);
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set( -1, 1.75, 1 );
        dirLight.position.multiplyScalar( 100 );

        dirLight.castShadow = true;

        const shadowMapSize = 4096;
        dirLight.shadow.mapSize.width = shadowMapSize;
        dirLight.shadow.mapSize.height = shadowMapSize;

        let d = 100;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = Math.max(terrainDepth, terrainWidth)/1.5

        dirLight.shadow.bias = -0.00016;

        const helper = new THREE.CameraHelper( dirLight.shadow.camera );
        scene.add( helper );

        
        scene.add( dirLight );
        scene.add( dirLight.target );


        // Initialisation des materiaux
        wheelMaterial = new THREE.MeshNormalMaterial()

        // var parameters = {
        //         bias: dirLight.shadow.bias
        // };

        // var gui = new dat.GUI();

        // var demo = gui.addFolder('Demo');
        // var biasGUI = demo.add( parameters, 'bias').min(-0.001).max(0).step(0.00001).listen();

        // demo.open();
        // biasGUI.onChange(
        //         function(value) 
        //         { 
        //                 dirLight.shadow.bias = value; 
        //         }
        // );


        /* CIEL */
        const skyTexture = await textureTool.loadTexture('sky.jpg');
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        const material = new THREE.MeshBasicMaterial();
        material.map = skyTexture;
        material.side = THREE.BackSide;
        skydome = new THREE.Mesh(geometry, material);

        scene.add(skydome);

}

/***  Fonction executée à chaque image : */
function animate() { 

        requestAnimationFrame(animate);

        // Calcul du temps passsé
        const dt = clock.getDelta()

        // Mise à jour des éléments de la voiture
        for (let i = 0; i < syncList.length; i++)
		syncList[i](dt);

        // Mise à jour de la physique
        updatePhysics(dt);

        // Mise à jour des contrôles
        if (controls) {
                controls.target = chassisMesh.position;
                controls.update();

                // Mise à jour de la caméra
                if (!isMoving) {
                        temp.setFromMatrixPosition(cameraTarget.matrixWorld);
                        camera.position.lerp(temp, 0.1);
                }
        }

        // Déplacement du ciel au centre de la voiture
        skydome.position.copy(chassisMesh.position)

        // Déplacement des ombres


	// Rendu de la scène
        if (renderer && camera && scene) renderer.render(scene, camera);

}

/*** Fonction de création du sol ***/
async function createFloor() {

        // Création du mesh du terrain
        createTerrainGrapics()

        // Création de la forme au format ammo
        const groundShape = await createTerrainShape( heightData );

        const groundTransform = new Ammo.btTransform();
        groundTransform.setIdentity();
        // Shifts the terrain, since bullet re-centers it on its bounding box.
        groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );

        const groundMass = 0;
        const groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
        const groundMotionState = new Ammo.btDefaultMotionState( groundTransform );

        const groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );

        physicsWorld.addRigidBody( groundBody );

}


/*** Fonction de génération des données du sol */
function getFloorData() {

        const myPromise = function(resolve, reject) {
        
                // Création de l'image
                const image = new Image();
                image.src = 'selestat.png'

                // Lorsque l'image est chargée
                image.onload = (ev) => {

                        terrainWidth = image.naturalWidth/terrainScale
                        terrainDepth = image.naturalHeight/terrainScale
                        
                        // Generer la heightmap
                        resolve(generateHeightData(image));

                }

                image.onerror = (ev) => reject(ev)

        }

        return new Promise(myPromise)
        
}

    
/*** Fonction de création de la balle */
function createBall(){

        let pos = {x: 10, y: 20, z: 10};
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
    
    
/*** Fonction de mise à jour du monde physique et de synchronisation avec le monde graphique */
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


/*** Fonction de création du véhicule */
async function createVehicle(pos, quat)  {

        // *** Paramètres du véhicule ***
        const massVehicle = 800;

        const wheelAxisPositionBack = -1.635;
        const wheelAxisFrontPosition = .84;

        const wheelAxisHeightBack = .19;
        const wheelAxisHeightFront = .07;

        const wheelAxisLength = .3;

        const friction = 1000;
        const suspensionStiffness = 20.0;
        const suspensionDamping = 2.3;
        const suspensionCompression = 4.4;
        const suspensionRestLength = 0.6;
        const rollInfluence = 0.2;

        const steeringIncrement = .04;
        const steeringClamp = .5;
        const maxEngineForce = 2000;
        const maxBreakingForce = 100;

        // *** Création du chassis ***

        // Création du mesh du chassis du véhicule
        chassisMesh = await gltfTool.createGLTFObject('low_poly_car/Low-Poly-Racing-Car_CHASSIS.glb', 2)
        chassisMesh.castShadow = true;
        scene.add(chassisMesh)

        // Création de la position de la caméra au sein de la voiture
        cameraTarget = new THREE.Object3D();
        chassisMesh.add(cameraTarget)

        // Decalage de la camera
        cameraTarget.position.set(0, 6, -20);

        dirLight.target = cameraTarget

        // Récupération des informations du chassis à partir du mesh chargé
        const chassisSize = new THREE.Vector3();
        const chassisBox = new THREE.Box3().setFromObject(chassisMesh);
        chassisBox.getSize(chassisSize);

        const chassisWidth = chassisSize.x;
        const chassisHeight = chassisSize.y-1;
        const chassisLength = chassisSize.z;

        const wheelTrackHalfLength = (chassisWidth-wheelAxisLength)/2;

        // Forme du chassis
        const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));

        // Transformation du chassis
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        // Création du l'état du corp
        const motionState = new Ammo.btDefaultMotionState(transform);

        // Calcul de l'inertie de la voiture
        const localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia(massVehicle, localInertia);

        // Création du corp rigide de la voiture
        const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
        body.setActivationState(4);

        // Ajout du corp rigide au monde physique
        physicsWorld.addRigidBody(body);

        // *** Creation de la physique du véhicule ***
        let engineForce = 0;
        let vehicleSteering = 0;
        let breakingForce = maxBreakingForce;
        const tuning = new Ammo.btVehicleTuning();
        const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
        vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(vehicle);

        // *** Création des roues ***
        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;
        const wheelMeshes = [];
        const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

        // Fonction dez création d'une roue
        async function addWheel(isFront, pos, index) {

                // Création du Mesh associé à cette roue
                let path;
                if (index == 0 || index == 3) {
                        path = 'low_poly_car/Low-Poly-Racing-Car_WHEEL_LEFT.glb'
                } else {
                        path = 'low_poly_car/Low-Poly-Racing-Car_WHEEL_RIGHT.glb'
                }

                const wheelMesh = await gltfTool.createGLTFObject(path, .6);
                scene.add(wheelMesh)

                // Récupération des informations de la roue à partir de son mesh
                const wheelSize = new THREE.Vector3();
                const wheelBox = new THREE.Box3().setFromObject(wheelMesh);
                wheelBox.getSize(wheelSize);

                const radius = wheelSize.y/2

                wheelMeshes[index] = wheelMesh

                // Informations de la roue
                const wheelInfo = vehicle.addWheel(
                                pos,
                                wheelDirectionCS0,
                                wheelAxleCS,
                                suspensionRestLength,
                                radius,
                                tuning,
                                isFront);

                // Réglages physiques de la roue
                wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
                wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
                wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
                wheelInfo.set_m_frictionSlip(friction);
                wheelInfo.set_m_rollInfluence(rollInfluence);

                
        }

        // Ajout des 4 roues à l'aide de notre fonction
        await addWheel(true, 
                new Ammo.btVector3(wheelTrackHalfLength, wheelAxisHeightFront, wheelAxisFrontPosition), FRONT_LEFT);
        await addWheel(true, 
                new Ammo.btVector3(-wheelTrackHalfLength, wheelAxisHeightFront, wheelAxisFrontPosition), FRONT_RIGHT);
        await addWheel(false, 
                new Ammo.btVector3(-wheelTrackHalfLength, wheelAxisHeightBack, wheelAxisPositionBack), BACK_LEFT);
        await addWheel(false, 
                new Ammo.btVector3(wheelTrackHalfLength, wheelAxisHeightBack, wheelAxisPositionBack), BACK_RIGHT);

        // Synchronisation de la voiture avec les actions du clavier et l'univers graphique
        function sync(dt) {

                // Obtention de la vitesse de la voiture
                const speed = vehicle.getCurrentSpeedKmHour();

                speedCounter.innerHTML = Math.abs(speed).toFixed(0);

                breakingForce = 0;
                engineForce = 0;

                if (actions.acceleration) {
                        if (speed < -1)
                                breakingForce = maxBreakingForce;
                        else engineForce = maxEngineForce;
                }
                if (actions.braking) {
                        if (speed > 1)
                                breakingForce = maxBreakingForce;
                        else engineForce = -maxEngineForce / 2;
                }
                if (actions.left) {
                        if (vehicleSteering < steeringClamp)
                                vehicleSteering += steeringIncrement;
                }
                else {
                        if (actions.right) {
                                if (vehicleSteering > -steeringClamp)
                                        vehicleSteering -= steeringIncrement;
                        }
                        else {
                                if (vehicleSteering < -steeringIncrement)
                                        vehicleSteering += steeringIncrement;
                                else {
                                        if (vehicleSteering > steeringIncrement)
                                                vehicleSteering -= steeringIncrement;
                                        else {
                                                vehicleSteering = 0;
                                        }
                                }
                        }
                }

                // Définition de la nouvelle force d'acceleration
                vehicle.applyEngineForce(engineForce, BACK_LEFT);
                vehicle.applyEngineForce(engineForce, BACK_RIGHT);

                // Définition de la nouvelle force de freinage
                vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
                vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
                vehicle.setBrake(breakingForce, BACK_LEFT);
                vehicle.setBrake(breakingForce, BACK_RIGHT);

                // Définition de l'axe des roues
                vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
                vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

                // Synchronisation des roues avec l'univers graphique
                let tm, p, q, i;
                const n = vehicle.getNumWheels();
                for (i = 0; i < n; i++) {
                        vehicle.updateWheelTransform(i, true);
                        tm = vehicle.getWheelTransformWS(i);
                        p = tm.getOrigin();
                        q = tm.getRotation();

                        wheelMeshes[i].position.set(p.x(), p.y(), p.z());
                        wheelMeshes[i].quaternion.set(q.x() , q.y(), q.z(), q.w());

                }

                // Synchronisation du chassis avec l'univers graphique
                tm = vehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                chassisMesh.position.set(p.x(), p.y(), p.z());
                chassisMesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }

        syncList.push(sync);
}


// Evenement touche relachée
function keyup(e) {
        if(keysActions[e.code]) {
                actions[keysActions[e.code]] = false;
                e.preventDefault();
                e.stopPropagation();
                return false;
        }
}

// Evenement touche appuyée
function keydown(e) {
        if(keysActions[e.code]) {
                actions[keysActions[e.code]] = true;
                e.preventDefault();
                e.stopPropagation();
                return false;
        }
}

// Fonction de génération du terrain
function generateHeightData(img) {
        const canvas = document.createElement( 'canvas' );
        canvas.width = terrainWidth;
        canvas.height = terrainDepth;
        const context = canvas.getContext( '2d' );
    
        const size = terrainWidth * terrainDepth, data = new Float32Array( size );
    
        context.drawImage(img,0,0);
    
        for ( var i = 0; i < size; i ++ ) {
            data[i] = 0
        }
    
        const imgd = context.getImageData(0, 0, terrainWidth, terrainDepth);
        const pix = imgd.data;
    
        let j=0;
        for (let i = 0, n = pix.length; i < n; i += (4)) {
            let all = pix[i]+pix[i+1]+pix[i+2];
            data[j++] = all/30;
        }

        // Calcul de la hauteur minimale et maximale
        terrainMaxHeight = 0
        terrainMinHeight = Number.MAX_VALUE
        for (let i = 0; i<terrainWidth*terrainDepth; i++) {
                let value = data[i];
                if (value > terrainMaxHeight) {
                        terrainMaxHeight = value
                }
                if (value < terrainMinHeight) {
                        terrainMinHeight = value
                }
        }
    
        return data;
    }


async function createTerrainGrapics() {
        const geometry = new THREE.PlaneBufferGeometry( terrainWidth, terrainDepth, terrainWidth - 1, terrainDepth - 1 );
        geometry.rotateX( - Math.PI / 2 );

        const vertices = geometry.attributes.position.array;

        for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

                // j + 1 because it is the y component that we modify
                vertices[ j + 1 ] = heightData[ i ];

        }

        geometry.computeVertexNormals();

        const groundMaterial = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );

        const texture = await textureTool.loadTexture('moon.png');
        texture.repeat = new THREE.Vector2(50,50)
        groundMaterial.map = texture;

        const terrainMesh = new THREE.Mesh( geometry, groundMaterial );
        
        terrainMesh.receiveShadow = true;
        
        scene.add( terrainMesh );
}


// Fonction de génération du corp physique du sol
function createTerrainShape() {

        // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
        const heightScale = 1;

        // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
        const upAxis = 1;

        // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
        const hdt = "PHY_FLOAT";

        // Set this to your needs (inverts the triangles)
        const flipQuadEdges = false;

        // Creates height data buffer in Ammo heap
        ammoHeightData = Ammo._malloc( 4 * terrainWidth * terrainDepth );

        // Copy the javascript height data array to the Ammo one.
        let p = 0;
        let p2 = 0;
        for ( let j = 0; j < terrainDepth; j ++ ) {
                for ( let i = 0; i < terrainWidth; i ++ ) {

                        // write 32-bit float data to memory
                        Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[ p ];

                        p ++;

                        // 4 bytes/float
                        p2 += 4;
                }
        }

        // Creates the heightfield physics shape
        const heightFieldShape = new Ammo.btHeightfieldTerrainShape(

                terrainWidth,
                terrainDepth,

                ammoHeightData,

                heightScale,
                terrainMinHeight,
                terrainMaxHeight,

                upAxis,
                hdt,
                flipQuadEdges
        );

        // Set horizontal scale
        const scaleX = terrainWidth / ( terrainWidth - 1 );
        const scaleZ = terrainDepth / ( terrainDepth - 1 );
        heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

        heightFieldShape.setMargin( 0.05 );

        return heightFieldShape;

}

// Fonction de redimensionnement de la scène
function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

}