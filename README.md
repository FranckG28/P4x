# P4x - Synthèse d'images
Bienvenue dans le module de synthèse d'images :-)

Vous trouverez dans ce dépôt les ressources nécessaires pour la réalisation des TP.

## Tuto Git

En premier lieu, faites un **fork** de ce dépôt de sorte à en avoir une copie à vous dans laquelle vous pourrez ajouter vos réalisations.
Une fois ce **fork** réalisé, partagez-le avec votre enseignant en allant dans la section "Members" de votre dépôt et en l'ajoutant en tant que "Reporter".

---

Vous pouvez maintenant **cloner** votre dépôt sur votre machine de travail afin de disposer d'un espace de travail local.
Pour pouvoir interagir avec le serveur Gitlab depuis votre machine de travail, 2 méthodes :
- utiliser l'URL en https (pas de mise en place de clé SSH) ou
- ajouter la clé ssh de votre machine à votre profil utilisateur. Toutes les informations nécessaires se trouvent dans la section "SSH keys" de votre profil.

Une fois cela fait, vous pouvez **cloner** votre dépôt :
```sh
git clone https://git.unistra.fr/[votre login]/P4x.git
```
ou
```sh
git clone git@git.unistra.fr:[votre login]/P4x.git
```
Vous vous retrouvez alors devant un dossier P4x qui contient une copie locale de votre dépôt.

---

Vous pouvez maintenant modifier le contenu de fichiers existants et créer de nouveaux dossiers ou fichiers.
Si vous déplacez ou supprimez un fichier ou dossier qui est déjà *sous contrôle*, il vous faudra en informer git en exécutant l'action de la façon suivante :
```sh
git mv ancien_nom nouveau_nom
git rm fichier_à_supprimer
```

A tout moment, vous pouvez *inspecter l'état* de votre dépôt avec la commande :
```sh
git status
```
Vous pourrez par exemple y voir si il y a dans votre dépôt des fichiers qui ne sont pas encore *sous contrôle*.
Si c'est le cas et que vous souhaitez les *ajouter au dépôt*, vous pouvez faire :
```sh
git add fichier_à_ajouter
```
Si des fichiers ont été *modifiés* et que vous souhaitez valider ces modifications, vous pouvez également faire :
```sh
git add fichier_modifié
```
Ces commandes d'ajout (**add**) permettent d'informer git de l'ensemble des modifications que l'on souhaite valider pour le prochain **commit**.
Les **commits** sont les éléments de base qui constituent les étapes successives de l'état du dépôt.
Un **commit** est en réalité un ensemble de **diff** (ajouts/suppressions) sur des fichiers.

Une fois que vous êtes contents de vos modifications et que vous avez ajouté pour le prochain **commit** l'ensemble des fichiers souhaités, vous pouvez faire effectivement ce nouveau **commit** :
```sh
git commit
```
Votre éditeur de texte par défaut va s'ouvrir afin que vous puissiez saisir un **commentaire** (obligatoire) accompagnant le commit.

---

A ce moment là, rien ne s'est passé au niveau réseau et votre dépôt distant n'est pas encore au courant que vous avez fait un nouveau commit.
Pour *envoyer* ce nouveau commit sur votre dépôt, vous pouvez faire :
```sh
git push
```
Cette commande va envoyer votre (ou vos) nouveau(x) commit(s) vers le dépôt distant (a.k.a. **remote**) par défaut.
La **remote** par défaut s'appelle *origin* et c'est celle depuis laquelle vous avez cloné votre copie locale.

Si vous souhaitez travailler sur plusieurs machines, vous pouvez cloner votre dépôt sur chacune de vos machines.
Avant de commencer à travailler, pour récupérer en local les commits que vous n'auriez pas sur cette machine, vous pouvez commencer par faire :
```sh
git pull
```
Cette commande va chercher sur la **remote** par défaut ("origin") les **commits** dont vous ne disposeriez pas encore en local et mettre à jour votre copie de travail de sorte qu'elle intègre ces nouveaux commits.

---

De nouvelles ressources seront ajoutés au fur et à mesure par les enseignants sur le dépôt de référence depuis lequel vous avez forké votre dépôt.
De manière à pouvoir les récupérer, vous pouvez ajouter une nouvelle remote à la configuration de votre dépôt local :
```sh
git remote add upstream https://git.unistra.fr/P4x/P4x.git
```
ou
```sh
git remote add upstream git@git.unistra.fr:P4x/P4x.git
```

Au cas où en cas de mauvaise manipulation :

```sh
git remote remove upstream
```

*upstream* est le nom que l'on choisit ici de donner à cette nouvelle **remote** (on aurait pu choisir un autre nom).
C'est en général comme cela que l'on appelle le dépôt de référence depuis lequel on a forké son dépôt.
Vous pouvez constater qu'il a bien été ajouté en exécutant cette commande (qui liste les remotes connues) :
```sh
git remote -v
```
Pour récupérer les commits ajoutés par vos enseignants sur le dépôt de référence, vous pouvez dorénavant faire :
```sh
git pull upstream main
```
*main* est ici le nom de la **branche** dans laquelle vous travaillez, mais cela, c'est une autre histoire dont on n'a pas forcément besoin pour le moment..
