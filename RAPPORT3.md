_Franck GUTMANN OS1_

# Rapport de P4x n°3

## Description du projet 

[![Image from Gyazo](https://i.gyazo.com/22482babe5ab58582ccef170ffd4de28.gif)](https://gyazo.com/22482babe5ab58582ccef170ffd4de28)

J'ai choisi de créer un véhicule fonctionnel, ainsi qu'un terrain dans lequel il évolue avec des obstacles.

## Milestones : 

1. Intégration du moteur physique
2. Création du véhicule
3. Modeler le terrain 
4. Gameplay
5. Ajouter des obstacles

## __0. Démarrage__

Afin de commencer sur des bonnes basses, j'ai supprimé tous les éléments de la scène. J'ai ensuite réorganisé mon code en supprimant tout sauf la lumière, le sol et le ciel. J'ai également appris les `Promise` javascript en créant une classe `OBJTools`.

## __1. Intégration du moteur physique__

[![Image from Gyazo](https://i.gyazo.com/094c573da617120ec6c2d59254d185b5.gif)](https://gyazo.com/094c573da617120ec6c2d59254d185b5)

#### Choix du moteur :

J'ai commencé par devoir choisir un moteur physique. J'ai d'abord voulu utiliser [CANNON.JS](https://schteppe.github.io/cannon.js/). Ce dernier à été conçu spécialement pour le web, et est particulièrement adapté à Three.JS. Malheuresement, il n'est plus développé depuis 2016, et Three.JS a énormément évolué depuis. De plus, la documentation étant très faible, il faut énormément se baser sur des exemples qui ne fonctionnent plus aujourd'hui.

J'ai donc décider d'utiliser [ammo.js](https://github.com/kripken/ammo.js/), qui est un simple portage en JavaScript d'un moteur de physique C++ nommé [Bullet](http://bulletphysics.org/).

#### Implémentation du moteur physique :

J'ai réorganiser le code, afin de d'abord initialiser le moteur physique, puis dès qu'il est prêt, initialiser Three.JS comme auparavant.

Pour initialiser le moteur phisyque, il faut lui fournir plusieurs éléments tel quel que la configuration du moteur de colision (algorithme à utiliser ...), le type de monde à utiliser, la gravité ...

```js
function setupPhysicsWorld(){

        let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        let overlappingPairCache = new Ammo.btDbvtBroadphase();
        let solver = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

        physicsWorld.setGravity(new Ammo.btVector3(0, -9.87, 0));

}
```


### Fonctionnement du moteur physique :

Un moteur physique comme `Bullet Physics Engine` gère la simulation dans son propre monde __physique__, totalement indépendant de celui __graphique__ que l'on à créé jusque là avec Three.JS. 

Dans ce monde physique les simulations sont faites en temps réel par `Bullet`. On peut y créer n'importe quel corp physique. Néanmoins, pour que cela soit visible à l'utilisateur, il est necessaire de _recopier_ en temps réel les positions des corps physiques dans le monde graphique de Three.JS.

Afin d'automatiser ce processus, je tiendrais une liste de tout les couples corps physique et Mesh correspondant. Puis, à chaque image, je recopie les positions et rotations :

```js
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
```

## __2. Création d'un véhicule__

[![Image from Gyazo](https://i.gyazo.com/46a3147319f92ad6b82f974d760a5867.gif)](https://gyazo.com/46a3147319f92ad6b82f974d760a5867)

Après avoir fait tomber une boule sur le terrain, il est maintenant temps de passer à la création de la voiture.

Heureusement, Bullet propose un objet `RaycastVehicule` qui gère toute la physique d'un véhicule. Il ne reste plus qu'à suivre la documentation (inexistante) pour l'implémenter.

Il y a énormément de paramètres à fournir pour instancier un véhicule : la taille et position du chassis, taille et position des roues, la friction, les suspensions, la puissance du moteur, des freins, de la rotation des roues ...

Il ne manque plus que le corp rigide correspondant au chassis pour instancier le `RaycastVehicle`. Une fois ce dernier créé et également ajouté au monde physique, on peut y ajouter des roues.

Je crée les roues en indiquant leur position, leur taille, leurs caractéristiques, puis je les ataches au véhicule.

Pour finir, j'ai créé une fonction qui sera exécutée à chaque image, qui aura pour mission de modifier le comportement du véhicule selon les touches du clavier activées, et de recopier la position de tout les éléments de la voiture dans le monde graphique.

Après avoir associé les évènements des touches de clavier préssées et relachées, la voiture est fonctionnelle !

<img src="https://i.gyazo.com/08adf9a51038ab33235134631e5da532.gif" width=400 />

Maintenant, j'aimerai le véhicule ressemble un peu plus à une voiture. Pour cela, je vais lui appliquer un modèle 3D. Je me suis basé sur ma classe `OBJTools` créé précédement pour cette fois importer et normaliser un modèle `GLTF`.

Le chassis du véhicule et des roues étant indépendant, il faut que je sépare les roues du modèle principal afin d'importer les deux séparéments.
Après de __très__ longues recherches pour un modèle 3D gratuit et éditable dans blender pour lequel je pourrais extraire les roues, j'ai fini par obtenir ma voiture en deux fichiers : le chassis et une roue. 

<img src="https://i.gyazo.com/afc8f44e087a939445f3c2c0622a018a.jpg" width=400 />



Pour que les colissions soient correctes, j'ai du modifier en profondeur la façon dont la voiture est créée. Désormais, on ne défini plus la taille du chassis au préalable, mais elle est récupérée à partir du modèle chargée.

J'ai fait de même pour les roues : leur taille est définie par celle du modèle importé. Avant un travail méticuleux pour les placer parfaitment dans les emplacements prévus pour du chassis, il reste un dernier problème à régler. Les roues gauches et droites sont montées dans le même sens. Il faut inverser un côté.

| Roues gauches | Roues droites |
|---------------|---------------|
|<img src="https://i.gyazo.com/f9513f9eae671af3b76c685750ac4a6d.jpg" width=200 />|<img src="https://i.gyazo.com/1b78450958d2157341de141a05f24189.png" width=200 />|

J'ai d'abord essayé de modifier la rotation à chaque image, mais le Mesh de la roue n'étant pas symétrique sur cet axe, le placement n'est pas correct. 

```js
// On vérifie si c'est une roue gauche
if (i==0 || i== 3) {
        // On modifie la rotation de 180°
        wheelMeshes[i].rotateY(180 * (Math.PI/180))
        // Ne fonctionne pas
}
```

J'ai à la place créé un nouveau modèle 3D de la roue gauche. La voiture est enfin terminée !


<img src="https://i.gyazo.com/8d57ea1320fad43c6875d2eef9035911.gif" width=400 />

## __3. Modeler le terrain :__

[![Image from Gyazo](https://i.gyazo.com/7f1f23d0f2932aeca17ce06abf308958.gif)](https://gyazo.com/7f1f23d0f2932aeca17ce06abf308958)

Je m'attaque maintenant à une tâche tout aussi lourde : modeler un terrain. Après quelques recherches, je trouve des moyens de générer un terrain à partir de fonctions mathématiques simples tels que la fonction sinus. Mais j'ai découvert quelque chose de bien plus intéressant : les _heightmaps_. Ce sont des images en niveau de gris dont la valeur de chaque pixel indique sa hauteur. Grâce à des outils tels que [Tangram Heightmapper](https://tangrams.github.io/heightmapper/#11.58367/48.2643/7.4866), on peut générer des Heightmap à partir de n'importe quel endroit du monde ! J'ai choisi la zone de Sélestat pour mon terrain, car cela me donne un terrain constitué à moitié de la plaine d'alsace, mais aussi d'une moitié des Vosges.


<img src="https://i.gyazo.com/b626f07f22ee8a8db2b9c3efcd45d082.png" width=400 />

Maintenant le plus complexe m'attend. Il faut que je puisse lire les données contenues dans l'image, et que j'arrive à générer ce terrain à la fois graphiquement avec THREE.js, et physiquement avec AMMO.js.

J'ai dû prêter attention à l'ordre d'execution des choses. En effet, il faut attendre que l'image soit chargée avant de pouvoir récupérer ses données. J'ai pour cela encore utilisé les Promise :

```js
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
```

A l'aide des exemples officiels, en apportant de grandes modifications afin que tout corresponde à mon _Heightmap_ plutôt qu'à des paramètres prédéfinis, j'ai réussi à charger ma _Heightmap_ dans le monde graphique et physique.

## __4. Gameplay__

Avant de commencer à "remplir" le monde d'objets, j'ai pleins de fonctionnalités à apporter afin de rendre le "jeu" bien plus agréable et intéressant à utiliser :

- Adaptation de la taille de la scène lors du redimensionnement de la fenêtre
- Écran de chargement
- Caméra qui suit la voiture
- Overlay (vitesses, aide sur les controles, options ...)
- Déplacer le ciel avec la voiture, pour ne jamais le traverser

En plus de ça, j'ai plusieurs autres idées facultatives à ajouter si j'ai le temps :

- Modification des caractéristiques de la voiture
- Distance de la caméra dynamique
- Permettre de détacher la caméra
- Sons
- Particules derrière le véhicule


#### Adaptation de la taille de la scène lors du redimensionnement de la fenêtre :

C'est la modification la plus simple, il suffit de 3 lignes pour modifier la taille du rendu et la projection de la caméra, et d'associer cet fonction à l'évènement `resize` :

```js
function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
}
```

#### __Écran de chargement__

<img src="https://i.gyazo.com/459b64eecea04e9896e55e36e63f44d9.gif" width=400 />

Je code l'écran de chargement directement dans le fichier HTML, et je le supprime et le remplace par la scène dès que tout est chargé. J'ai ajouté une petite transition à tout ça :

```js
async function start(){

        // Initialisation du monde physique
        setupPhysicsWorld();

        //[...]

        // Affichage de la première image
        animate();

        // Fermeture de l'écran du chargement
        container.appendChild(renderer.domElement)
        loadingScreen.classList.add("m-fadeOut")
        loadingScreen.classList.remove("m-fadeIn")
        setTimeout(() => loadingScreen.remove(), 300);
        
        
} 
```

#### Caméra qui suit la voiture

<img src="https://i.gyazo.com/f2bf3605e521da520a875fc476f3b239.gif" width=400>


J'ai ajouté un nouveau `Object3D` à l'intérieur du mesh du véhicule, avec une position correspondant au décallage voulu de la caméra. Ensuite à chaque image, je déplace la caméra de manière fluide vers l'emplacement de cet Objet. Je modifie aussi la direction vers laquelle regarde la caméra vers le `Mesh` du chassis de la voiture. 

Malheuresement, il n'y a pas de function permettant de changer cette direction de manière fluide, ce qui peut créer des secousses de la caméra. Cela entre aussi en conflit avec OrbitControls.

```js
function animate() {

        // [...]

        // Mise à jour de la caméra
        temp.setFromMatrixPosition(cameraTarget.matrixWorld);
        camera.position.lerp(temp, 0.5);
        camera.lookAt( chassisMesh.position );

        // [...]

}
```

J'ai longement tenté de conserver OrbitControls en mettant à jour la position de l'objet derrière la voiture selon le mouvement d'OrbitControls, mais sans succès :

```js
function controlsEnd(ev) {
        
        isMoving = false;

        let pos = new THREE.Vector3().setFromSphericalCoords( controls.getDistance(), controls.getPolarAngle(),controls.getAzimuthalAngle());

        cameraTarget.position.copy(pos);
        // Ne fonctionne pas

}
```

J'ai du finir par abandonner cette idée ... Néanmoins, j'ai conservé OrbitControls et désactivé le suivi de caméra pendant qu'on effectue un mouvement. Cela permet quand même de pouvoir déplacer la caméra de manière temporaire.


#### Ajout d'un Overlay

<img src="https://i.gyazo.com/4bc3b671e43bde112b0c2e9c3dc80147.jpg" width=400>

Rien de particulier ici, c'est principalement du HTML et du CSS.
La vitesse de la voiture est actualisé à chaque mise à jour physique :

```js 
speedCounter.innerHTML = Math.abs(speed).toFixed(0);
```

#### Déplacer le ciel avec la voiture

Encore une fois un changement simple, il suffit de mettre à jour la position du ciel dans la fonction `animate()` :

```js
// Déplacement du ciel au centre de la voiture
skydome.position.copy(chassisMesh.position)
```

#### Rétablissement des textures et des ombres

Avant de passer au dernier Milestone, j'ai rétabli la texture de lune et ajouté des ombres au véhicule. Malheuresement, la shadowMap est trop petite et on en sort très rapidement. 

La seule solution que j'ai trouvé est de définir mon véhicule comme target de la lumière. Ainsi, la caméra de la lumière qui projette les ombres se dirige automatiquement vers la voiture.

<img src="https://i.gyazo.com/3c9e9b97c6488341b53ff18dc7a520e9.jpg" width=400 />


## __5. Ajouter des obstacles :__

Afin de ne pas avoir à concevoir toute la carte manuellement car c'est très long et c'est plutôt un travail artistique que technique, j'ai ajouté une fonction qui fait tomber un objet d'une couleur, d'une forme, d'une masse et d'une taille aléatoire, à un emplacement aléatoire, toutes les demis secondes.

[![Image from Gyazo](https://i.gyazo.com/3d955b84b9e21a463715200d838a6099.jpg)](https://gyazo.com/3d955b84b9e21a463715200d838a6099)

Certains objets sont tellement lourds qu'ils agissent comme des obstacles pour la voiture.

Pour finir, j'ai publié le projet ici : http://p4x.franck-g.fr/
