# XIRH Academy — première proposition visuelle

Préparée le 24 octobre 2026 après consultation de l'accueil, de la catégorie Processus, de la connexion et des options d'inscription du Moodle en ligne.

## Première couche intégrée à Moodle

`moodle/public/theme/boost/style/academy-refresh.css` est chargé par le template `theme/boost/templates/head.mustache`, après les styles existants. La racine de l'URL vient de `config.wwwroot`, fourni par le moteur de templates Moodle. Cette première couche donne un contraste plus marqué à l'accueil existant, colore les domaines, réduit la bannière et améliore les surfaces du catalogue et de la connexion. Elle conserve le contenu stocké en base et les contrôles Moodle. Le mode édition, les activités et l'administration sont exclus des règles de présentation principales.

Cette couche n'installe pas automatiquement le nouvel accueil complet de la maquette. Celui-ci reste une proposition de structure séparée.

L'application Moodle est hébergée séparément de Next.js. Pour voir cette couche sur `/learning/`, elle doit déployer les fichiers `moodle/public/theme/boost/` de ce dépôt. Si le template reste en cache, purger les caches Moodle depuis l'administration. Si le code est fourni par un volume ou une image externe, un push dans ce dépôt peut ne pas suffire. Aucun accès à Coolify ni déploiement de l'application Moodle n'a été vérifié ici.

Retour arrière : retirer la ligne qui charge `academy-refresh.css` dans le template, puis purger les caches. Cette modification du thème standard est isolée et documentée ; elle devra être reportée ou migrée vers un thème enfant lors d'une mise à jour Moodle.

Validation effectuée : syntaxe des scripts Node, `git diff --check`, navigation accueil/catalogue, recherche d'un cours et recherche sans résultat dans le navigateur. La couche CSS Moodle a été contrôlée sur une copie locale des composants publics actuels avec leurs styles : introduction sombre, trois couleurs de domaines et absence de débordement horizontal sur bureau. Le sélecteur du bandeau cible uniquement le bloc contenant le titre principal. Le formulaire de connexion, les rôles inscrits, le serveur PHP et le rendu mobile complet restent à vérifier sur l'installation Moodle.

## Voir la proposition

Depuis la racine XIRH : `node _learning-lab/design/academy-refresh/serve.mjs`.
Lancer d'abord `node _learning-lab/design/academy-refresh/prepare-preview.mjs`, puis ouvrir l'adresse indiquée par le serveur. Accueil et catalogue sont des vues de démonstration ; la recherche filtre les deux cours observés. Les liens de cours et de connexion conduisent au Moodle réel. Aucune authentification ni progression n'est simulée.

## Aperçu via Coolify / Next.js

Le Dockerfile actuel déploie Next.js et copie `public/`, mais exclut `moodle/` via `.dockerignore`. L'aperçu autonome est donc également enregistré dans `public/academy-preview/`, avec ses visuels. Après déploiement, ouvrir `/academy-preview/index.html` sur le domaine de l'application Next.js. Ce chemin affiche la proposition et ne remplace pas `/learning/`.

La génération n'ajoute aucune dépendance et ne change pas le build existant. Relancer `prepare-preview.mjs` après toute modification de la proposition. L'hébergement et la version de l'instance Moodle doivent encore être identifiés pour intégrer réellement le thème.

## Constats vérifiés

- Le site utilise Boost et la police Outfit. Il présente déjà une bannière illustrée, une mascotte et les logos des écoles.
- La bannière occupe environ 160 px sous la navigation, y compris dans le catalogue et la connexion, sans présenter le but de la page.
- L'accueil présente les domaines et les écoles avant de montrer les cours. Les blocs de domaines actuels ne sont pas des liens.
- Le catalogue Processus contient deux cours, avec de longs résumés, des titres répétés et un lien de fichier `bg_processus.png` visible à côté du contenu.
- Le lien « les processus RH » dans le résumé pointe vers une activité H5P précise (id 14) plutôt que vers la présentation du cours.
- Le cours de cartographie refuse l'accès anonyme. Les activités, le tableau de bord étudiant et l'administration n'ont donc pas été audités.
- Les sources locales contiennent des personnalisations dans Boost : `scss/preset/default.scss`, `templates/core/loginform.mustache` et `templates/core/login_panel.mustache`. Le visuel local `hero_bg.png` diffère de la bannière actuellement visible. La présence de ces sources sur GitHub ne prouve pas qu'elles sont toutes déployées.

## Direction proposée

Bleu nuit, vert menthe et fonds clairs ; contraste plus affirmé ; une introduction utile avec une action visible ; de vraies cartes de cours ; trois univers colorés ; les écoles plus bas. Visuels locaux existants réutilisés. Aucune durée, note, progression ni promesse de certification inventée.

## Fichiers et intégration envisagée

- `index.html`, `preview.css`, `preview.js`, `serve.mjs` : aperçu local uniquement.
- `accueil.html` : fragment de contenu dérivé du bloc `<main>` de la proposition, avec les URLs réelles de Moodle. À intégrer dans le contenu d'accueil après vérification de l'éditeur Moodle.
- `academy.css` : styles des composants, limités à `.xa`. À tester dans le champ SCSS brut de Boost, après les styles existants, sur une instance de test.

Le fragment est statique : il affiche explicitement deux cours. Il ne lit pas les inscriptions, les restrictions de visibilité, la progression ni le catalogue Moodle. Pour un catalogue dynamique, utiliser les données et permissions natives de Moodle dans un thème ou un composant dédié.

La recherche et le changement de vue appartiennent seulement à l'aperçu ; ils ne font pas partie du fragment à intégrer. Les catégories Data et Outils sont les catégories réelles observées. Leur contenu n'a pas été inventorié ; le rapprochement « IA & outils » reste un choix éditorial à valider.

Avant intégration : identifier la version et les fichiers réellement déployés, sauvegarder le contenu d'accueil et les réglages du thème, tester en étudiant/enseignant/admin et en mode édition. La disparition du lien de fichier et les résumés trop longs demandent aussi une correction du contenu des cours. Le forum vide peut être retiré de l'accueil via ses réglages, après vérification de son utilité.

Éviter de poursuivre les modifications directement dans les fichiers standard de Boost : elles sont difficiles à maintenir lors des mises à jour. Le choix entre réglages SCSS et thème enfant sera à arrêter une fois la direction visuelle retenue et l'installation réelle vérifiée.
