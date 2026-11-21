# Vérifications · 21 novembre 2026

Édition `1.1.0-xirh`, statut bêta. Aucun déploiement sur le Moodle de production n'a été effectué.

## Résultats automatisés

- Moodle **5.2.4 (20261005)**, PHP **8.3.37**, MariaDB **11.4.5**, PHPUnit **11.5.55**, laboratoire Windows isolé.
- Suite native du plugin : **15 tests, 51 assertions, aucune erreur ni assertion en échec**. La dernière exécution termine néanmoins avec un code de sortie 1 : **45 avertissements PHP** liés au nettoyage Windows des copies temporaires de `sodium.key` par le cœur Moodle (`Permission denied`, puis répertoires non vides), et **11 dépréciations PHPUnit** provenant des annotations historiques des tests amont. Ce résultat ne constitue donc pas une exécution entièrement sans avertissements.
- Scénarios natifs : enregistrement des incidents, progression 0/2/3, renvoi du même UUID, ordre retour/départ inversé, barème figé, synchronisation réelle avec le carnet de notes, nouvelle correction sans double soustraction, annulation motivée et répétée sans double remboursement, conservation des totaux après purge, méthodes d'agrégation, minimum zéro, note remplacée manuellement, droits étudiant et démarrage de page sans arguments AMD surdimensionnés.
- JavaScript : **12 scénarios réussis sur la source et les 12 mêmes sur le fichier compilé**. DOM et réseau simulés ; il ne s'agit pas de 24 parcours réels de navigateur. Couverture de l'entrée, du refus du plein écran, des sorties fusionnées, du barème, des renvois réseau, des accusés de réception perdus, de la tolérance et des exceptions de navigation.
- **29 fichiers PHP** contrôlés sans erreur de syntaxe.
- Structure du paquet, schéma XMLDB, interface française, modules AMD et correspondance des fichiers compilés avec leurs sources : validés par `tools/validate_xirh.py`.

## Vérifications visuelles et limites

Un Moodle local avec comptes de démonstration étudiant et enseignant a servi à vérifier l'écran d'entrée, le masquage des questions avant activation, le refus du plein écran sans pénalité, les réglages 0/2/3 dans le formulaire natif, le suivi en direct, l'historique et le guide intégré. La charte XIRH existante est conservée ; aucun fichier du thème ni du cœur n'est modifié.

Les navigateurs automatisés ont refusé la demande réelle de plein écran (`TypeError: not granted`). Le traitement de ce refus est vérifié ; **le parcours réel plein écran → Alt+Tab → retour n'est pas validé de bout en bout sur un poste étudiant**. La sauvegarde/restauration et la migration depuis une installation amont existante ont été implémentées, sans parcours complet de restauration ou migration dans ce laboratoire.

## Recette avant une première épreuve

1. Installer en préproduction et ouvrir un test avec un compte étudiant réel, sur les navigateurs et appareils prévus.
2. Entrer en plein écran, faire Alt+Tab puis revenir : un avertissement, sans retrait. Refaire : −2 ; refaire : −3 supplémentaires. Vérifier qu'une même absence n'est comptée qu'une fois.
3. Remettre une copie notée 16/20 : vérifier 11/20 dans le carnet, puis corriger une réponse libre et vérifier que les retraits ne sont pas répétés.
4. Annuler la deuxième sortie avec un motif : vérifier le remboursement de 2 points et la conservation du rang des incidents suivants.
5. Vérifier navigation entre pages, remise, durée limitée, coupure/reprise réseau, groupes enseignants et aménagements d'accessibilité. Effectuer une sauvegarde/restauration de test avant de s'appuyer sur ce chemin pour des copies réelles.

Le navigateur constate des pertes de focus ; il ne prouve pas l'utilisation d'une IA et ne détecte pas un téléphone. Le plugin est une aide à la supervision, sans application à installer chez les étudiants.
