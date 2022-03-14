# Aller plus loin : ouverture à des applications concrètes

Ce dernier TP vous propose de choisir parmi 3 thématiques pour mettre en application concrètement ce que vous avez pu découvrir jusqu'à maintenant sur le sujet de l'image de synthèse. 

Vous pouvez évidemment essayer de faire plusieurs thématiques, les mettre en application en les fusionnant. 
Il vous est tout de même demandé de vous tenir à au moins une thématique comme ligne directrice, et d'aller le plus loin possible sur celle-ci. Evitez de trop vous disperser.

Les sujets sont totalement ouverts et exigent de votre part un travail de réflexion et de préparation, pour savoir où aller et comment y arriver. 
Certaines étapes possibles, en jargon pro "jalons" ou "milestones" ou "deadlines", vous sont proposées à titre d'exemple dans l'énoncé. Rien ne vous oblige à vous y conformer, d'ailleurs les possibilités sont multiples.

N'hésitez pas à proposer des objectifs ambitieux, qui vous permettrons de prolonger après le module votre mini-projet, si vous n'arrivez pas au bout de vos idées. 
Cela sera toujours un plus dans votre portfolio de développeur.

Pour chaque thème, quelques suggestions d'objectifs sont proposés. Ces listes sont données à titre indicatif, n'hésitez pas à créer vous même votre objectif. 
Il faut aussi comprendre qu'une seule de ces suggestions constitue en soi un objectif qu'on pourrait se donner pour ce TP4. N'essayez même pas d'en faire 2.

### Quelques conseils

- Etant donné l'envergure de l'objectif, il vous faut forcément vous organiser sur la structure du code (fichiers, classes, fonctions), sauf à vous perdre définitivement dedans.
- N'hésitez pas à vous inspirer de visuels trouvés sur internet pour avoir une idée de ce que vous aimeriez atteindre. Evidemment, être ambitieux tout en ayant la tête sur les épaules 
sur ce que vous pouvez produire dans le temps imparti.
- Structurez vos tâches pour avoir en point de mire vos objectifs lointains, tout en ayant des tâches "terminables" dans un laps de temps courts.
- Essayez d'intégrer des tâches représentatives en relation avec le sujet du module (rendu 3D). Par exemple, il est très possible de faire beaucoup de code sur les thèmes 1 et 2 sans vraiment aborder l'aspect synthèse d'images. Ce serait quand même dommage de faire trop de hors sujet.
- Vu l'envergure des sujets, limitez la conception de votre architecture à votre cas d'utilisation. N'essayez pas de faire un système/moteur générique, qui fait tout même le café. Concentrez vous sur les résultats concrets. Quitte à faire quelques raccourcis douteux (pensez à le préciser dans votre code/rapport quand même).

### Exemple de démarche :
- Je définis un objectif concret : "J'ai décidé de faire un système de particules (thème 1) simulant une fontaine d'eau type ce qu'on peut voir en marbre dans un jardin Louis XVI".
- Je me pose des questions : Quelles sont les étapes intermédiaires que je peux réaliser à partir de ce que je connais ? quels sont les sujets que je vais devoir étudier ?
- J'esquisse quelques pistes d'étapes intermédiaires et de prolongements possibles :
    1. Calculer des position de particules qui tombent en forme de fontaine (je ne me pose pas la question de comment les afficher pour l'instant)
    2. travailler sur le visuel des particules (particules 3D ? billboard ? shaders custom ?). Il faudrait que ça ressemble quand meme un peu à de l'eau.
    3. Amélioration du prototype par touche :
        - collision avec le sol ? avec la fontaine en marbre ? (croisement avec le thème 2)
        - ajouter un modèle de fontaine en marbre chiné sur internet ?
    4. Ajout d'un fond d'eau dans la fontaine : prise d'initiative hors des particules, mais qui reste un bon défi et peut ouvrir à pas mal de choses
    5. Ou bien tenter un rendu en metaballs ? (ça risque de foirer monumentalement)
- A partir de ces grandes lignes, j'arrive a identifier des petites étapes me permettant d'avancer vers mon objectif
    1. simuler une particule : est-ce que je choisis une simulation physique (gravité?) ou mathématiques (parabole) ? déjà un choix technique ici.
        - ah tiens j'ai oublié de me poser la question de quand est-ce que la particule meurt.
    2. je valide mon modèle, en l'affichant en 3D (avec une sphère, un AxisHelper, d'une manière ou d'une autre)
        - je n'oublie pas de structurer mon code. Une classe Particule serait peut-être judicieuse.
    3. j'essaie avec plusieurs, voire beaucoup de particules : se pose la question de la randomisation/génération. Je valide, je peaufine.
    4. J'étudie le rendu en billboard.
    5. etc.

## Thème 1 : Moteur de particules

Ce première thème vous propose de concevoir votre propre moteur (simplifié) de particules. L'objectif au final sera de proposer un moteur de particules en situation dans
une application concrète démontrant les possibilités de votre code. L'idée est évidemment de ne pas utiliser directement la class THREE.ParticleSystem, 
mais elle peut vous donner une idée de ce qui est faisable.

### Exemples d'objectifs possibles :
- Visuel d'un objet type "fontaine"
- Visuel d'une scène type "feux d'artifice"
- Visuel de fumée, brouillard, brume ou nuages
- Visuel d'une explosion (projections de gravats, sable, terre + fumée)
- Simulation de fluides (Smoothed Particle Hydrodynamics) (Attention ! sujet vraiment très ambitieux)
- Metaballs (sujet plus orienté sur le rendu que sur l'évolution des particules)

### Quelques pistes de recherches : 
Explorez le concept de *billboard* en 3D.

## Thème 2 : Moteur de physique

Ce second thème vous propose de concevoir votre propre moteur (simplifié) de physique. Comme pour les particules, une application concrète vous servira de fil rouge. N'hésitez pas à voir sur internet ce qui peut se faire.

Le problème du moteur physique se décompose en 3 grands axes :
- la détection de collision (interpénétration des objets)
- la simulation physique (modèle physique choisi, mécanique du point/solide, intégration de Verlet, etc)
- la performance et l'optimisation (hors de votre portée)

Le travail de moteur physique peut se faire en 2D (plus simple) ou en 3D. Les applications résultantes seront différentes.

### Exemples d'objectifs possibles :
- faire une simulation 3D de piscine à boules
- Chamboule-tout (3D), lancer un projectile depuis la caméra
- faire une simulation 2D de destruction de ponts (type Bridge Constructor, World of Goo)
- faire un flipper (ambitieux, simu 2D si on suppose que la bille ne rebondit pas)
- faire un billard
- Simuler un drapeau, un morceau de tissu ou de la gelée (jelly) (attention ! sujet difficile)
- Simulation de fluides (Smoothed Particle Hydrodynamics) (Attention ! sujet vraiment très ambitieux)

### Quelques pistes de recherches : 
Le modèle d'intégration de Verlet ([ici](https://gamedevelopment.tutsplus.com/tutorials/simulate-tearable-cloth-and-ragdolls-with-simple-verlet-integration--gamedev-519) 
ou [là](https://www.gamedev.net/articles/programming/math-and-physics/a-verlet-based-approach-for-2d-game-physics-r2714/))
est un modèle physique assez accessible et simple à comprendre sans trop de base en mécanique.

La collision entre objets nécessite de tester les objets avec tous les autres potentiellement présents pour une collision. C'est intensif en calcul. Il existe des méthodes pour 
accélérer le calcul, mais c'est largement hors de votre portée et hors sujet pour l'instant. Donc le plus simple reste la méthode par force brute, testez toutes les collisions possibles.
Si toutefois votre objectif serait de simuler massivement, ce peut être un bon prolongement de sujet pour le thème 2.

## Thème 3 : Shaders avancés : Rendu non réaliste (Non-Realistic Rendering, NPR) ou  (ou autres)

Le TP3 vous a permis d'aborder la programmation des shaders. Vous avez maintenant la main sur la couleur de chaque pixel à l'écran. Cette thématique ne requiert aucune grosse compétence
en optique/physique/électromagnétisme. L'idée est de proposer un travail basé sur la programmation de shaders. 
Evidemment pour le rendu type manga, n'utilisez pas directement la classe Three.MeshToonMaterial mais n'hésitez pas à vous en inspirer et à glaner des morceaux de code sur internet.

### Exemples d'objectifs possibles :
- un visuel type manga/animé, avec les contours noirs en plein/délié
- un visuel stylisé (monochrome ou coloré par exemple) avec les ombres crayonnées
- Postprocessing (classe three.EffectComposer) : tilt-shift, sepia, motion blur, ou autres
- Metaballs (sujet plus orienté sur le rendu que sur l'évolution des particules)
 
# Nota Bene

Comme vous pouvez le constater, certains sujets sont transverses et recouvrent un peu plusieurs thèmes. L'idée est vraiment de vous laisser l'initiative de composer vous même votre sujet, 
il faut quelque part faire preuve d'un peu de bon sens et de pertinence pour éviter le hors-sujet. Exemple de hors-sujet : développer un programme centré sur une problématique réseau/web/online.
