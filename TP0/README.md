# Introduction au développement

Ceci est un premier micro sujet de TP vous permettant de prendre en main quelques concepts propres aux outils de développement.

Ce travail est important et nécessaire pour vous, même s'il ne porte pas directement sur le contenu du module. Il ne sera cependant pas demandé de compte rendu explicite sur ce sujet sauf si vous l'estimez utile.
L'environnement est au choix : Google Chrome ou Mozilla Firefox. Si vous désirez utiliser un autre outil, libre à vous, mais je ne pourrai pas vous aider.

### Rappel

 - [Documentation des outils de développement Mozilla Firefox](https://developer.mozilla.org/fr/docs/Tools/Debugger)
 - [Documentation des outils de développement de Google Chrome](https://developer.chrome.com/docs/devtools/javascript/reference/)

---

## Prise en main d'un débogueur JavaScript intégré dans un navigateur standard.

---

### La console
1. Chargez la page de test debug.html
2. Ouvrez les outils de développement JS/HTML/CSS
3. Observez le message d'erreur dans la console
4. Corrigez l'erreur indiquée dans le code
5. Rechargez la page

---

### Le breakpoint (ou point d'arrêt)
1. Observez le contenu de la page
2. Posez un *breakpoint* en ligne 15
```js
valeurGlobale = 0
```

3. Rechargez la page, observez que l'exécution a été interrompue
4. Observez le contenu de la page à ce moment précis : qu'y a-t-il de différent ?

---

### Itérer dans le code (Stepping)
1. De la situation ci-dessus, itérez dans le code ligne par ligne (*Step Over*) jusqu'à la ligne 22
```js
update()
```

2. Entrez dans l'appel de fonction à l'aide de la fonction *Step In(to)*
3. Continuez à stepper dans le code (*Step Over* ou *Step In*) et observez le contenu de la page évoluer au fur et à mesure de l'exécution des instructions

---

### Visualiser le contenu des variables
1. Rechargez la page, le code s'arrête toujours au breakpoint
2. Ajoutez `valeurGlobale` dans les *watch/watch expressions*
3. Steppez dans le code, observer la valeur évoluer dans les *watch*

---

### Modifier le contenu des variables
1. Ajoutez `valeurLocale` dans les *watch/watch expressions*
2. Rechargez la page
3. Steppez jusqu'à la ligne 22, `valeurLocale` devrait contenir la valeur 1
4. Essayez de modifier le contenu de la variable `valeurLocale` avec la valeur 2 (selon le navigateur choisi, vous pourrez soit modifier la valeur directement dans le panneau des *watch*, soit via le prompt de la console en écrivant le code javascript `valeurLocale = 2` pour assigner une valeur 2 à la variable `valeurLocale`)
5. Résumez l'exécution du code jusqu'à l'exécution complète de la page
6. Observez le contenu de la page. Qu'y a-t-il de différent ?

---

---

### Utilisation des modules javascript
Pour utiliser les dernières versions de ThreeJS vous devrez comprendre les bases des modules en javascript.
Vous devrez faire tourner le code sur un serveur. Deux options simple s'offrent à vous:

1. Utiliser la commande: `python -m SimpleHTTPServer` (ou `python -m http.server` selon la version de python)  depuis le répertoire contenant vos pages web/javascript
2. Utiliser VSCode ou VSCodium avec le plugin LiveServer.

L'utilisation des modules javascript requiert d'utiliser des import/export, similaires à include en C.

Si dans un `fichier1.js` vous avez une fonction `myFunc` et des variables `myVar0` et `myVar1`. Si vous souhaitez pouvoir les utiliser dans `fichier2.js` il faudra les exporter de l'une des deux façons suivantes:

1. 
```js 
// fichier1.js
function myFunc(){console.log("Wololo")};

let myVar0 = 0;
let myVar1 = 1;

export {myFunc, myVar0};
```

2. 
```js 
// fichier1.js
export function myFunc(){console.log("Wololo")};

export let myVar0 = 0;
let myVar1 = 1;
```

Toute variable ou fonction non exportée ne sera accessible que dans le scope du fichier. Ici myVar1 sera locale.
Pour pouvoir utiliser `myVar0` et `myFunc` dans `fichier2.js` il faudra les importer d'une des deux façon suivantes:

1. import ciblé
```js 
// fichier2.js
import {myFunc, myVar0} from './fichier1.js';
myFunc(); /// output: Wololo
console.log(myVar0); /// output: 0
```

2. import complet 
```js 
// fichier2.js
import * as fichier1 from './fichier1.js';
fichier1.myFunc(); /// output: Wololo
console.log(fichier1.myVar0); /// output: 0
```

Les modules offrent plus de possibilités et de sucre syntaxique donc si vous le voulez, vous pourrez lire la [documentation complète](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## Conclusion
Ce petit sujet vous a permis de découvrir des outils basiques que tout développeur, quelque soit le langage, doit avoir le réflexe d'utiliser.

Évidemment, faire un script occasionnellement dans un langage spécifique ne nécessite pas de sortir toute l'artillerie, mais vous devez avoir le réflexe de chercher ces outils si besoin. Ils vous faciliteront la vie au cours d'un développement conséquent, que ce soit un projet de fin d'études ou dans la vie professionnelle.

Des fonctions bien plus avancées existent dans ce genre d'outils (breakpoints conditionnels, call stack, …) et ce, indépendamment du langage. Vous apprendrez naturellement à les utiliser au cours de votre apprentissage et de votre carrière, autant commencer tôt.

Après ce TP, il est donc interdit de déboguer en utilisant des `alert()` ou `print()` et consorts pour afficher le contenu des variables, ce n'est pas professionnel. Vous pouvez cependant utiliser la console pour logger des informations sur le déroulement de l'exécution.
