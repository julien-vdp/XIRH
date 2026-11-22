# Diagramme BPMN · XIRH

Une question de quiz Moodle où l’étudiant dessine un processus dans son navigateur. Compatible avec les quiz surveillés par CD ExamFocus XIRH, les QCM et les questions Composition du même quiz. Aucune application ni aucun compte externe pour les étudiants.

## Créer une question

1. Dans le cours, ajouter une activité **Test** (Quiz), ou ouvrir un test existant.
2. Dans **Questions**, choisir **Ajouter → une question → Diagramme BPMN**.
3. Donner un nom à la question. Dans **Texte de la question**, écrire la consigne. Définir la **Note par défaut**.
4. Enregistrer puis prévisualiser la question. Le dessin commence sur une page blanche.
5. Pour un examen surveillé, activer **CD ExamFocus** dans les paramètres du test, avec son plein écran et son barème par examen.

Le **feedback général** peut contenir le corrigé. Sa visibilité dépend des options de relecture du test : ne pas rendre le corrigé accessible pendant une épreuve si ce n’est pas souhaité.

Exemple de consigne : « Un salarié transmet une demande de congé. Le responsable vérifie les disponibilités puis accepte ou refuse. Le salarié est informé de la décision. Représentez ce processus avec un début, des tâches, une décision et les deux issues. Nommez les activités et les branches de la décision. »

## Dessiner

- Glisser **Début**, **Tâche**, **Décision** ou **Fin** sur le canevas. On peut aussi cliquer sur la palette puis sur le canevas.
- Déplacer une forme en la faisant glisser. Les flèches raccordées suivent le déplacement ; leurs points de passage sont ajustables.
- Sélectionner la forme de départ, choisir **Relier**, puis cliquer sur la destination.
- Double-cliquer sur une forme ou une flèche pour modifier son libellé. **Entrée** valide ; **Échap** annule la saisie. Le bouton **Écrire** fait la même chose pour l’élément sélectionné.
- **Annuler**, **Rétablir**, **Supprimer**, zoom et **Tout voir** sont disponibles. Les événements et décisions utilisent les libellés externes habituels en BPMN ; les tâches portent leur texte à l’intérieur.

Le dessin devient la réponse native du quiz, avec son enregistrement automatique, son historique et sa reprise de tentative. Le statut de l’atelier indique que le dessin est prêt à être enregistré ; le statut de sauvegarde du quiz reste la référence pour confirmer l’enregistrement sur le serveur. Aucun stockage local partagé entre étudiants ou tentatives.

## Corriger

Dans le test, ouvrir **Résultats → Évaluation manuelle**. Consulter le diagramme en lecture seule, attribuer la note et saisir le commentaire. Le zoom reste disponible. Le résultat attend une correction ; aucun algorithme ne prétend juger le sens du processus dessiné. ExamFocus conserve ses incidents et ses déductions après correction manuelle.

## Installation et maintenance

Le dossier est `public/question/type/xirhbpmn`. Lancer la mise à niveau Moodle après publication. Aucun tableau supplémentaire ni modification des activités existantes. Les données des réponses et leur effacement/export de confidentialité sont pris en charge par le moteur de questions Moodle.

Développement testé avec Moodle 5.2.4 et PHP 8.3. Le format est un sous-ensemble BPMN 2.0 XML : début, fin, tâche, passerelle exclusive et flux de séquence. Les diagrammes ne sont jamais exécutés. La validation interdit notamment DTD, entités, scripts, éléments étrangers, identifiants dupliqués et flux sans destination valide. Limites : 1 Mio, 150 formes, 300 flèches. Une réponse endommagée est conservée sous forme de texte échappé ; elle n’est pas chargée dans l’éditeur.

### Bibliothèques

[bpmn-js](https://github.com/bpmn-io/bpmn-js), version **18.33.0**, fournit les gestes d’édition et le rendu BPMN. Les assets et le code sont servis par Moodle, sans CDN ni service externe. Le filigrane bpmn.io et son lien sont conservés conformément à sa licence. Les notices de toutes les dépendances embarquées figurent dans `vendor/THIRD_PARTY_LICENSES.txt`. Le code d’intégration XIRH est sous GPL v3 ou ultérieure ; les bibliothèques conservent leurs licences respectives.

### Recompiler

Dans `tools`, exécuter `npm ci --ignore-scripts`, puis `npm run build`. Le fichier verrouillé fixe les versions. Publier le fichier `amd/build/editor-lazy.min.js` et les assets `vendor`. Le chargement différé évite d’alourdir les pages Moodle qui n’utilisent pas de dessin. Ne pas remplacer ce bundle par une compilation Grunt sans sa chaîne de dépendances.

### Vérifications

Avec l’environnement PHPUnit Moodle initialisé :

```sh
php vendor/bin/phpunit --testsuite qtype_xirhbpmn_testsuite
```

Les tests couvrent les limites et la validation XML, la création d’une question en base, la sauvegarde/reprise native, la remise en attente de correction, la note manuelle et l’échappement en relecture. Compléter avec un essai dans le navigateur : glisser-déposer, flèches nommées, texte en cours de saisie, annulation, plusieurs questions, relecture et tentative surveillée en plein écran.
