# CD ExamFocus · XIRH Academy

Édition dérivée de CD ExamFocus 1.0.4, par Carlos Díaz Bueno, sous GNU GPL v3 ou ultérieure. Source importée : `cdiazbu/moodle-quizaccess_cdexamsave`, commit `b2469c0efa5c736840309f961d5af548de975840`. La documentation originale est conservée dans `docs/UPSTREAM_README.md` ; elle décrit la version amont, sans les pénalités XIRH.

Cette édition pour Moodle 5.2 ajoute le plein écran, le barème réglable par test **0 / 2 / 3**, un journal enseignant avec annulation motivée, la synchronisation des notes et l’interface française aux couleurs de XIRH Academy. Aucun logiciel étudiant ni modification du cœur Moodle n’est nécessaire. Ne pas écraser cette édition avec une mise à jour automatique du plugin amont.

Le **mode d’essai formateur** reproduit les alertes et les déductions avec les règles de l’examen, sans enregistrer d’incident ni modifier de note. Il est accessible depuis la page du quiz et depuis la prévisualisation, même si le quiz est masqué aux étudiants. Un essai sans plein écran est proposé pour vérifier les autres alertes lorsque le navigateur refuse le plein écran.

Lire [le guide enseignant et administrateur](GUIDE_XIRH.md) pour l’installation, les réglages et les limites. Les questions de dessin BPMN sont fournies séparément par `qtype_xirhbpmn`.

## Vérifications

Pour recompiler le moniteur : `node tools/build_monitor.cjs`, depuis un dépôt disposant des dépendances de développement Moodle (Terser).

Le [bilan de validation](VALIDATION_XIRH.md) précise les résultats, les avertissements du laboratoire Windows et les scénarios restant à vérifier avant une première épreuve.

```sh
python tools/validate_xirh.py
node tools/monitor_test.cjs
node tools/monitor_test.cjs --built
# Depuis la racine Moodle, dans une installation PHPUnit dédiée :
php vendor/bin/phpunit --testsuite quizaccess_cdexamsave_testsuite
```

`tools/validate_release.py` reste le validateur historique du Marketplace amont (il exclut les traductions embarquées et cible Moodle 4.5) ; utiliser `validate_xirh.py` pour cette édition.

## Construire le ZIP

```sh
python tools/build_release.py --output CD-ExamFocus-1.1.0-xirh.zip
```

Le ZIP contient un seul dossier `cdexamsave/`. Le dossier du plugin peut aussi être livré avec le dépôt XIRH, puis installé avec les notifications ou la commande de mise à niveau Moodle. Licence et mentions d’origine sont conservées dans `LICENSE.md` et les fichiers sources.
