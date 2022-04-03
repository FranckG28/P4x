_Franck GUTMANN OS1_

# Rapport de P4x n°3

## Description du projet 

...

## Milestones : 

1. Intégration du moteur physique
2. Création du véhicule
3. Modeler le terrain 
4. Ajouter des obstacles
5. Caméra qui suit la voiture


### __0. Démarrage__

Afin de commencer sur des bonnes basses, j'ai supprimé tous les éléments de la scène. J'ai ensuite réorganisé mon code en supprimant tout sauf la lumière, le sol et le ciel. J'ai également appris les `Promise` javascript en créant une classe `OBJTools`.

### __1. Intégration du moteur physique__

[![Image from Gyazo](https://i.gyazo.com/094c573da617120ec6c2d59254d185b5.gif)](https://gyazo.com/094c573da617120ec6c2d59254d185b5)

#### Choix du moteur :

J'ai commencé par devoir choisir un moteur physique. J'ai d'abord voulu utiliser [CANNON.JS](https://schteppe.github.io/cannon.js/). Ce dernier à été conçu spécialement pour le web, et est particulièrement adapté a Three.JS. Malheuresement, il n'est plus développé depuis 2016, et Three.JS à énormément évolué depuis. De plus, la documentation étant très faible, il faut énormément se baser sur des éxemples, qui ne fonctionnent plus aujourd'hui.

J'ai donc décider d'utiliser [ammo.js](https://github.com/kripken/ammo.js/), qui est un simple portage en JavaScript d'un moteur de physique C++ nommé [Bullet](http://bulletphysics.org/).

#### Implémentation du moteur physique :

J'ai réorganiser le code, afin de d'abord initialiser le moteur physique, et dès qu'il est prêt, initialiser Three.JS comme auparavant.

Pour l'initialiser, il faut fournir plusieurs éléments tel quel que la configuration du moteur de colision (algorithme à utiliser ...), le type de monde à utiliser, la gravité ...

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


#### Fonctionnement du moteur physique :

Un moteur physique comme `Bullet Physics Engine` gère la simulation dans son propre monde __physique__, totalement indépendant de celui __graphique__ que l'on à créé jusque là avec Three.JS. 

Dans ce monde physique les simulations sont faites en temps réel par `Bullet`. On peut y créer n'importe quel corp physique. Néanmoins, pour que cela soit visible à l'utilisateur, il est necessaire de _recopier_ en temps réel les positions des corps physiques dans le monde graphique de Three.JS.

Afin d'automatiser ce processus, on tiendra une liste de tout les couples corps physique et Mesh correspondant, donc on recopiera la position et la rotation à chaque instant :

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

### __2. Création d'un véhicule__

[![Image from Gyazo](https://i.gyazo.com/46a3147319f92ad6b82f974d760a5867.gif)](https://gyazo.com/46a3147319f92ad6b82f974d760a5867)

Après avoir fait tomber une boule sur le terrain, il est maintenant temps de passer à la création de la voiture.

Heureusement, Bullet propose un objet `RaycastVehicule` qui gère toute la physique d'un véhicule. Il ne reste plus qu'à suivre la documentation pour l'implémenter.

Il y a énormément de paramètres à fournir pour instancier un véhicule : la taille et position du chassis, taille et position des roues, la friction, les suspensions, la puissance du moteur, des freins, de la rotation des roues ...

Il ne manque plus que le corp rigide correspondant au chassis pour instancier le `RaycastVehicle`. Une fois ce dernier créé et également ajouté au monde physique, on peut y ajouter des roues.

On crée les roues en indiquant leur position, leur taille, leurs caractéristiques, puis on les atachent au véhicule.

Pour finir, on crée une fonction qui sera exécutée à chaque image, qui aura pour mission de modifier le comportement du véhicule selon les touches du clavier activées, et de recopier la position de tout les éléments de la voiture dans le monde graphique.

Après avoir associé les évènements de touche de clavier préssée et relachée, la voiture est fonctionnelle !

[![Image from Gyazo](https://i.gyazo.com/08adf9a51038ab33235134631e5da532.gif)](https://gyazo.com/08adf9a51038ab33235134631e5da532)


Maintenant, j'aimerai le véhicule ressemble un peu plus à une voiture. Pour cela, je vais lui appliquer un modèle 3D. Je me suis basé sur ma classe `OBJTools` créé précédement pour cette fois importer et normaliser un modèle GLTF.

Le chassis du véhicule et des roues étant indépendant, il faut que je sépare les roues du modèle principal afin d'importer les deux séparéments.
Après de __très__ longues recherches pour un modèle 3D gratuit et éditable dans blender pour lequel je pourrais extraire les roues, j'ai fini par obtenir ma voiture en deux fichiers : le chassis et une roue. 

[![Image from Gyazo](https://i.gyazo.com/afc8f44e087a939445f3c2c0622a018a.jpg)](https://gyazo.com/afc8f44e087a939445f3c2c0622a018a)


Pour que les colissions soient correctes, j'ai du modifier en profondeur la façon dont la voiture est créée. Désormais, on ne défini plus la taille du chassis au préalable, mais elle est récupérée à partir du modèle chargée.

J'ai fait de même pour les roues : leur taille est définie par celle du modèle importé. Avant un travail méticuleux pour les placer parfaitment dans les emplacements prévus pour du chassis, il reste un dernier problème à régler. Les roues gauches et droites sont montées dans le même sens. Il faut inverser un côté.

| Roues gauches | Roues droites |
|---------------|---------------|
|[![Image from Gyazo](https://i.gyazo.com/f9513f9eae671af3b76c685750ac4a6d.jpg)](https://gyazo.com/f9513f9eae671af3b76c685750ac4a6d)|[![Image from Gyazo](https://i.gyazo.com/1b78450958d2157341de141a05f24189.png)](https://gyazo.com/1b78450958d2157341de141a05f24189)|

J'ai d'abord essayé de modifier la rotation à chaque image, mais le Mesh de la roue n'étant pas symétrique sur cet axe, le placement n'est pas correct. 

```js
// On vérifie si c'est une roue gauche
if (i==0 || i== 3) {
        // On modifie la rotation de 180°
        wheelMeshes[i].rotateY(180 * (Math.PI/180))
}
```

J'ai à la place créé un nouveau modèle 3D de la roue gauche. La voiture est enfin terminée !

[![Image from Gyazo](https://i.gyazo.com/8d57ea1320fad43c6875d2eef9035911.gif)](https://gyazo.com/8d57ea1320fad43c6875d2eef9035911)

### __3. Modeler le terrain :__

Je m'attaque maintenant à une tâche tout aussi lourde : modeler un terrain. Après quelques recherches, je trouve des moyens de générer un terrain à partir de fonctions simples tels que la fonction sinus. Mais j'ai découvert quelque chose de bien plus intéressant : les heightmaps. Ce sont des images en niveau de gris dont la valeur de chaque pixel indique sa hauteur. Grâce à des outils tels que [Tangram Heightmapper](https://tangrams.github.io/heightmapper/#11.58367/48.2643/7.4866), on peut générer des Heightmap à partir de n'importe quel endroit du monde ! J'ai choisi la zone de Sélestat pour mon terrain, car cela me donne un terrain constitué à moitié de la plaine d'alsace, mais aussi d'une moitié des Vosges.

[![Image from Gyazo](https://i.gyazo.com/b626f07f22ee8a8db2b9c3efcd45d082.png)](https://gyazo.com/b626f07f22ee8a8db2b9c3efcd45d082)

Maintenant le plus complexe m'attend. Il faut que je puisse lire les données contenues dans l'image, et que j'arrive à la fois à générer ce terrain graphiquement avec THREE.js et physiquement avec AMMO.js.

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