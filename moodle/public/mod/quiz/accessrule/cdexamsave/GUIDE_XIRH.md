# Évaluations surveillées · XIRH Academy

Cette édition étend CD ExamFocus 1.0.4 (Carlos Díaz Bueno, GPL v3 ou ultérieure), importé du commit `b2469c0efa5c736840309f961d5af548de975840`. Elle n'utilise aucun code d'Evalio. Le nom technique reste `quizaccess_cdexamsave` : installer cette édition **à la place** de l'édition originale, jamais les deux simultanément. Une mise à jour automatique par la version originale écraserait les ajouts XIRH.

## Installer

Le code se trouve dans `public/mod/quiz/accessrule/cdexamsave`. Après livraison de ce dossier sur le serveur, l'administrateur doit exécuter, depuis la racine Moodle :

```sh
php admin/cli/upgrade.php --non-interactive
php admin/cli/purge_caches.php
```

L'écran **Administration du site → Notifications** permet aussi l'installation. Ne pas remplacer `config.php`. La migration ajoute les tables et champs du plugin ; elle conserve les données d'une installation CD ExamFocus existante. Les anciens réglages restent sans pénalités automatiques jusqu'à activation explicite. Les examens existants ne sont pas activés automatiquement.

## Préparer un examen

1. Créer une activité **Test** dans le cours Moodle concerné. Ajouter les questions QCM et **Composition** pour les réponses libres. Les réponses de composition sont corrigées manuellement dans Moodle.
2. Inscrire les cohortes au cours avec **Synchronisation des cohortes**. Pour séparer les promotions, utiliser les groupes et les restrictions d'accès Moodle.
3. Dans les paramètres du test, ouvrir **XIRH · Évaluation surveillée**. Activer la surveillance, le plein écran et les pénalités automatiques.
4. Le barème proposé est **0 / 2 / 3** : avertissement à la première sortie, retrait de 2 points à la deuxième, puis de 3 points à chaque sortie suivante. Les champs reçoivent les montants à retirer, donc des nombres positifs. Virgule et point décimal sont acceptés.
5. L'unité est celle de la note maximale du test. Sur un test sur 20, `2` signifie −2/20 ; sur un test sur 100, `2` signifie −2/100. Le barème n'est pas un pourcentage. Régler de préférence la note maximale avant le lancement et ne pas la modifier pendant une épreuve.
6. La tolérance proposée est **détection immédiate**. Une tolérance facultative peut ignorer les sorties très brèves. Les règles sont copiées dans chaque tentative à son premier démarrage : changer le barème n'affecte pas une tentative déjà connectée.
7. Paramétrer la durée et les options de relecture natives Moodle. Pour cacher les corrigés pendant l'examen, désactiver l'affichage des bonnes réponses et des notes jusqu'à la clôture. Le plugin ne remplace pas ces réglages.
8. Tester avec un compte étudiant distinct. Les prévisualisations enseignant ne sont pas surveillées.

## Ce que voit l'étudiant

Un écran d'entrée affiche les consignes et le barème. **Entrer dans l'épreuve** demande le plein écran, sans installation. Si le plein écran exigé est refusé ou indisponible, l'écran reste ouvert ; l'étudiant doit réessayer, changer de navigateur ou contacter son formateur. Ce refus initial n'est pas pénalisé. Le chronomètre natif Moodle continue pendant cet écran : vérifier la compatibilité avec un test d'entraînement avant l'examen.

Alt+Tab, un changement d'onglet ou une sortie du plein écran déclenchent une détection. Plusieurs événements d'une même absence correspondent à une seule sortie. La barre fixe présente les sorties et les pénalités **confirmées par le serveur**, sans dévoiler les réponses ni la note des questions. Une alerte rappelle le retrait et permet de reprendre. En mode plein écran, il faut réactiver ce mode si nécessaire.

Les boutons de navigation entre les pages du même test et la remise de copie ne sont pas considérés comme des sorties. Après un changement de page, un nouveau clic peut être nécessaire pour réactiver le plein écran : le navigateur exige un geste utilisateur. Les actualisations ou fermetures involontaires sont des départs potentiels. Les outils externes, liens ouvrant un autre onglet et fenêtres système peuvent produire un incident : le formateur peut annuler une pénalité technique.

Les événements restent en attente locale jusqu'à accusé de réception du serveur. Une reconnexion déclenche une nouvelle transmission avec le même identifiant, sans double sanction. La navigation volontaire attend la synchronisation lorsque des événements sont en attente. La fermeture du navigateur et l'expiration automatique du temps restent des limites techniques : les envois de fermeture sont faits au mieux, sans garantie. Un signal envoyé en retard peut être accepté pendant dix minutes après la remise s'il concerne un départ antérieur à celle-ci. Ne pas effacer les données du navigateur pendant l'épreuve.

## Notes et correction

Exemple sur 20 : note des réponses **16**, première sortie **0**, deuxième **−2**, troisième **−3** → note finale **11/20**. La note finale ne descend pas sous zéro. La perte affichée reste le cumul du barème, même si ce cumul dépasse la note disponible.

Les notes de chaque question et le total brut de chaque tentative restent intacts. La note agrégée du test et celle transmise au carnet de notes prennent en compte les retraits. Le détail natif de la tentative peut donc afficher une note brute différente : le rapport **Historique et pénalités** explique la différence. Les éventuels sous-totaux de sections ne sont pas pénalisés séparément.

Pour plusieurs tentatives, le retrait est calculé sur chacune, puis Moodle applique sa méthode : meilleure note, moyenne, première ou dernière tentative. La correction ultérieure d'une réponse libre et le recalcul des notes repartent des notes originales, sans soustraire deux fois la pénalité. Une note verrouillée ou une modification manuelle explicite dans le carnet de notes est respectée : le plugin ne l'écrase pas.

## Suivre et corriger un incident

Sur la page du test, ouvrir **Ouvrir le suivi en direct**. Le panneau affiche les étudiants connectés, les sorties et les retraits cumulés ; les droits et groupes Moodle limitent les données accessibles.

**Historique et pénalités** conserve les copies remises. Pour un incident technique, saisir un motif puis cliquer **Annuler cette pénalité**. L'incident reste visible comme annulé, avec son auteur et sa date dans les données d'audit. La note est recalculée. Les sorties suivantes ne sont pas renumérotées : annuler la deuxième sortie ne transforme pas la troisième en deuxième. Le droit d'annuler est réservé par défaut aux enseignants éditeurs et responsables.

Les journaux détaillés expirent selon la durée du plugin, 180 jours par défaut. Les règles et totaux utiles à la notation restent associés à la tentative : l'expiration du journal ne fait pas remonter les notes. Après expiration du détail, une correction individuelle d'incident n'est plus possible depuis cet historique ; les outils de notation manuelle Moodle restent disponibles. Le cron Moodle doit fonctionner pour la purge.

## Limites

La surveillance constate des changements de focus ; elle ne sait pas si ChatGPT a été consulté. Elle ne détecte pas un téléphone et ne garantit pas la détection d'un assistant intégré au navigateur ou d'un navigateur modifié. Une fenêtre système ou un outil d'accessibilité peut produire un incident légitime. Prévoir les aménagements nécessaires et informer les étudiants du barème. Aucune caméra, microphone ou capture d'écran n'est ajouté.

Le BPMN est volontairement reporté à une seconde étape.
