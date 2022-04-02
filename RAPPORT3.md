_Franck GUTMANN OS1_

# Rapport de P4x n°3

## Description du projet 

...

## Milestones : 

1. Intégration du moteur physique
2. Création du véhicule
3. Ajouter des obstacles
4. Caméra qui suit la voiture
5. Modeler un beau terrain 

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

Après avoir fait tomber une boule sur le terrain, il est maintenant temps de passer à la création de la voiture.