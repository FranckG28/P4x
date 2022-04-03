import * as THREE from '../three.js-master/build/three.module.js'

import * as dat from '../three.js-master/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

import OBJTool from './objTools.js';
import GLTFTools from './gltfTools.js';
import TextureTool from './textureTool.js';

/************** VARIABLES *****************/

// Instances globales
let physicsWorld, scene, camera, renderer, clock, controls, tmpTrans;

// Loaders
const textureTool = new TextureTool();
const gltfTool = new GLTFTools();

// Materiaux globaux
let wheelMaterial;

// Sol
let heightData, ammoHeightData;
// Heightfield parameters
const terrainWidthExtents = 100;
const terrainDepthExtents = 100;
const terrainWidth = 128;
const terrainDepth = 128;
const terrainHalfWidth = terrainWidth / 2;
const terrainHalfDepth = terrainDepth / 2;
const terrainMaxHeight = 8;
const terrainMinHeight = -2;

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

        // Initialisation du monde physique
        setupPhysicsWorld();

        // Initialisation du monde graphique
        await setupGraphicWorld();

        // Création du sol
        await createFloor();

        // Création de la balle
        createBall();

        // Création de la voiture
        await createVehicle(new THREE.Vector3(0, 3, 10), new THREE.Quaternion(0, .42, 0, 1))

        // Association des évènements :
        window.addEventListener( 'keydown', keydown);
        window.addEventListener( 'keyup', keyup);

        // Affichage de la première image
        animate();
        
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

        var container = document.querySelector('#threejsContainer');

        /* Chargement des classes */
        const objTool = new OBJTool();
        const textureLoader = new THREE.TextureLoader();

        /* Rendu */
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        renderer.outputEncoding = THREE.sRGBEncoding;
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

        const shadowMapSize = 4096;
        dirLight.shadow.mapSize.width = shadowMapSize;
        dirLight.shadow.mapSize.height = shadowMapSize;

        let d = 100;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.bias = -0.00016;

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
        var geometry = new THREE.SphereGeometry(500, 60, 40);
        var material = new THREE.MeshBasicMaterial();
        material.map = skyTexture;
        material.side = THREE.BackSide;
        var skydome = new THREE.Mesh(geometry, material);

        scene.add(skydome);

}

/***  Fonction executée à chaque image : */
function animate() { 

        // Mise à jour des contrôles
        if (controls) controls.update();

        // Calcul du temps passsé
        const dt = clock.getDelta()

        // Mise à jour des éléments de la voiture
        for (let i = 0; i < syncList.length; i++)
		syncList[i](dt);

        // Mise à jour de la physique
        updatePhysics(dt);

        // Rendu de la scène
        if (renderer && camera && scene) renderer.render(scene, camera);
        requestAnimationFrame(animate);
}

/*** Fonction de création du sol ***/
async function createFloor() {

        heightData = await getFloorData();

        

}


/*** Fonction de génération des données du sol */
function getFloorData() {

        const myPromise = function(resolve, reject) {
        
                // Création de l'image
                const image = new Image();
                image.src = 'selestat.png'

                // Lorsque l'image est chargée
                image.onload = (ev) => {
                        
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

        const wheelAxisHeightBack = .2;
        const wheelAxisHeightFront = .08;

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
        const chassisMesh = await gltfTool.createGLTFObject('low_poly_car/Low-Poly-Racing-Car_CHASSIS.glb', 2)
        scene.add(chassisMesh)

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
                //wheelMeshes[index] = createWheelMesh(radius, width);

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

                // speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h';

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

// // Fonction de création du Mesh correspondant à une roue
// function createWheelMesh(radius, width) {
//         const geometry = new THREE.CylinderGeometry(radius, radius, width, 24, 1);
//         geometry.rotateZ(Math.PI / 2);
//         const mesh = new THREE.Mesh(geometry, wheelMaterial);
//         mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius*.25, 1, 1, 1), wheelMaterial));
//         mesh.castShadow = true;
//         scene.add(mesh);
//         return mesh;
// }

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
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext( '2d' );
    
        const size = 128 * 128, data = new Float32Array( size );
    
        context.drawImage(img,0,0);
    
        for ( var i = 0; i < size; i ++ ) {
            data[i] = 0
        }
    
        const imgd = context.getImageData(0, 0, 128, 128);
        const pix = imgd.data;
    
        let j=0;
        for (let i = 0, n = pix.length; i < n; i += (4)) {
            let all = pix[i]+pix[i+1]+pix[i+2];
            data[j++] = all/30;
        }
    
        return data;
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
        const scaleX = terrainWidthExtents / ( terrainWidth - 1 );
        const scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
        heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

        heightFieldShape.setMargin( 0.05 );

        return heightFieldShape;

}