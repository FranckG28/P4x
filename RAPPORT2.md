_Franck GUTMANN OS1_

# Rapport de P4x n°2

Après avoir ajouté une sphère et intégré un shader sur le modèle de l'exemple `basicshader` fourni, j'ai passé un petit moment à expérimenter les possibilités des shaders.  

Le premier shader que j'ai implémenté est une variante de celui présenté dans l'exemple `uniforms.html`. Comme ce dernier, celui ci fait aussi varier la couleur de l'objet, mais cette fois ci de manière fluide, sans qu'il n'y ai jamais de "saut" soudain de couleur. 

Dans l'exemple le saut de couleur qui survient est lié à l'utilisation de la fonction `fract`. Cette dernière retourne la partie décimale d'un nombre. Ainsi, dès que les valeurs incrémentés franchissait un nouvel entier, la composante de couleur en question passait soudainement de `0.99` à `0.00`.

Pour remédier à cela, je me suis inspiré de ce que nous avions déjà vu sur les shaders en `S4x`. En utilisant des fonctions trigonométriques `sinus` et `cosinus`, les valeurs sont interpolées entre 0 et 1, et ce sans jamais de saut brutal. Ainsi, les couleurs varient en permanance sans "saut" :

<img src="https://i.gyazo.com/e272deb32fb2da0dd2387b305a8cc447.gif)" alt="illustration" width="400"/>

C'est une variable appelée `time` qui est incrémenté à chaque image qui est responsable de cette variation. Ainsi, modifier la valeur de son incrément modifie la vitesse de variation des couleurs. J'ai donc ajouté ce paramètre à l'interface `dat-gui` afin de pouvoir la faire varier librement
J'ai egalement défini des coefficients différents pour chaque composantes `rgb`, afin que ces dernieres ne soit pas égales et ainsi obtenir des couleurs au lieu de niveaux de gris.

```js
/* Variation de couleur de myPixelShader */
let time = 0;
let timeIncrement = 0.01;
let rCoef = 7;
let gCoef = 5;
let bCoef = 3;

function animate() { 

        time+= timeIncrement;

        //on l'assigne au registre uniform déclaré dans le pixel shader
        shaderSphere.material.uniforms.rgb.value.set(
                Math.cos(time*rCoef/100),
                Math.sin(time*gCoef/100),
                Math.cos(time*bCoef/100)
        );

        requestAnimationFrame(animate);
        renderer.render(scene, camera);       
}
```

Par la suite, afin de préparer l'implémentation d'un shader plus avancé, j'ai importé la classe `VertexNormalsHelper` afin de visualiser les normales à ma forme. On remarque au premier coup d'oeuil que ces dernières sont correctement orientées. En effet, cela se vérifie en affichant les valeurs du vecteur normal de chaque point sous forme des composantes RGB de la boule :

<img src="images/rapport2/3.png" alt="illustration" width="400"/>

J'ai continué la découverte des shaders en étudiant l'exemple `varying.html`.
En ajoutant un paramètre `varying` interpolé par le VertexShader puis passé au FragmentShader, j'ai pu implémenté une variation de couleur selon la position x, y, et z du pixel. Combiné à la valeur des composants `rgb` qui varient avec le temps selon des fonctions trigonométriques, cela donne des "lignes" dont l'épaisseur et l'espacement varie.

<img src="images/rapport2/2.png" alt="illustration" width="400"/>

Après ces petites "expérimentations", j'ai commencé à implémenter un éclairage de lambert. J'ai tout d'abord rencontré quelques difficultés notamment pour trouver les bonnes données à utiliser, ainsi que les fonctions de normalisation et de produit scalaire. 
De plus, j'ai utilisé pendant un moment la `normalMatrix`, qui est elle même la transposée inverse de la `modelViewMatrix`, qui dépend de la position de la caméra. Ainsi, la lumière était relative à la rotation de la caméra, ce qui n'est pas le résultat correct attendu. Après quelques recherche supplémentaire, j'ai finalement trouver la bonne manière de faire.

<img src="images/rapport2/4.png" alt="illustration" width="400"/>
<img src="images/rapport2/5.png" alt="illustration" width="400"/>

Néanmoins, comme on peut le voir, ce shader n'est pas sensible à l'intensité de la lumière. J'ai donc cherché à ajouter l'intensité de la lumière dans le calcul. 

Je n'ai d'abord pas réussi à transmettre correctement l'intensité de la lumièr au shader, car j'oubliais de mettre à jour la valeur qu'elle était changée via l'interface. Au final, j'ai crée une nouvel uniforms de type `float`,contenant la valeur de l'intensité de la lumière. En multipliant cette derniere à au vecteur rgb souhaité, j'obtient bien le résultat escompté.

<img src="images/rapport2/6.png" alt="illustration" width="400"/>

Dernière chose à faire : rendre le shader sensible à la couleur de la lumière. C'est chose faite en moins d'une minute en ajoutant une nouvelle `uniform` de la couleur de la lumière que je multiplie au résultat. Voici le code final du pixel shader de mon éclairage Lambert  :

```c
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
        }
```

<img src="images/rapport2/7.png" alt="illustration" width="400"/>

Après avoir fait ça, j'ai implémenter pu implémenter le `toon shading` sans difficultés. En partant du shader précédant et en "seuillant" le produit scalaire pour ne lui laisser que 3 valeurs possible, on obtient bien le résultat attendu :

```c
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
        }
```

<img src="images/rapport2/8.png" alt="illustration" width="400"/>

J'ai ensuite essayé d'ajouter ces shaders aux modeles `obj`. Cela s'est avéré plus compliqué que prévu, car alors qu'auparavant on appliquait le shader sur un seul Mesh, un model `.obj` est composé de plusieurs Mesh. Il a donc fallu trouver un moyen d'appliquer ce shader material à tout les mesh qui composent l'objet. Après quelques recherches en ligne et l'aide de mes camarades, j'ai réussi à appliquer mes shaders aux modèles. J'ai donc enrichi ma fonction d'ajout d'un modèle OBJ d'un argument `material`

```js
const createOBJModel = function(model, material, x, y, z, rX, rY, rZ, scale)
```

<img src="images/rapport2/9.png" alt="illustration" width="400"/>

Prochain objectif : implémenter le phong shader. Il était un peu plus compliqué à mettre en place que les précédents. Il a fallu d'abord calculer le scalaire entre le vecteur représentant la différence entre la position de la caméra et le pixel et la direction de la lumière. 
Suite à ça, j'ai calculé à la fois la visibilité que devait avoir ce reflet en ce point, et la valeur de ce reflet. Ce dernier résultat est monté à la puissance de l'intensité de la lumière. J'ai multiplié l'intensité de la lumière par `20.0` dans ce calcul, sinon le reflet était bien trop "dilaté" et ne donnait pas le résultat recherché.

Comme pour le lambert shader, la couleur de l'objet est multiplié par l'intensité et la couleur de la lumière.

Et le résultat est l'addition de la couleur multiplié par le scalaire de la direction de la lumière et de la normale, comme pour le lambert shader, et de la valeur du reflet multiplié par la couleur de l'objet ainsi que par l'opacité du reflet.

<img src="images/rapport2/10.png" alt="illustration" width="400"/>
<img src="images/rapport2/11.png" alt="illustration" width="400"/>

```c
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
        }
```

