# XIRH Academy — première proposition visuelle

Préparée le 24 octobre 2026 après consultation de l'accueil, de la catégorie Processus, de la connexion et des options d'inscription du Moodle en ligne.

## Fond vivant

Correction de perceptibilité : la version initiale était bien exécutée en production, mais le mouvement de 26/38 secondes restait presque entièrement derrière les zones opaques. La version `20261024-5` renforce le déplacement du fond et ajoute un mouvement de caméra de 12 secondes dans l'illustration, avec des points lumineux de 7 secondes. La commande « Fond animé » met les quatre animations en pause. Le réglage de réduction du mouvement désactive aussi le mouvement de l'illustration.

`academy-ambient.css` ajoute deux couches décoratives derrière l'accueil : des halos dorés/turquoise et un maillage de facettes avec quelques points lumineux. Le mouvement lent utilise uniquement CSS (transformations et opacité), sans script ni suivi du pointeur. Les couches ne reçoivent aucun clic et ne déplacent pas le contenu.

La case native « Fond animé » met les animations en pause et les relance sans rechargement. Cette préférence reste dans la page courante. Le réglage système `prefers-reduced-motion` désactive les animations et masque ce contrôle ; le décor reste statique. Le fond est exclu du mode édition et de l'impression.

Vérification dans le navigateur : deux animations actives, arrêt effectif des deux couches avec transformations identiques pendant la pause, reprise et absence de débordement horizontal. L'aperçu utilise exactement la même feuille de style et le même contrôle que le thème Moodle.

## Version golden polygonal

La direction ardoise a été remplacée par une présentation illustrée fidèle à l'univers du golden retriever polygonal des cours XIRH : bleu profond, turquoise, ambre et or. `academy-golden.css` est chargé après les deux premières couches. Le même template d'accueil contient désormais la scène principale, les actions Moodle et trois cartes illustrées reliées aux catégories natives Processus, Data et Outils.

Le visuel principal a été généré avec imagegen depuis la couverture de cours existante, puis encodé en WebP avec une variante 960 px. Les trois images de domaines réutilisent les illustrations existantes, optimisées en WebP. Le prompt final et les chemins des sources sont enregistrés dans `golden-art-direction.md`.

La liste de domaines conservée en base est masquée seulement lorsque la nouvelle section illustrée est installée, hors édition. Les écoles restent les contenus de Moodle et sont regroupées sur une ligne sur bureau. Le forum d'annonces est masqué seulement lorsqu'il contient l'état natif `.forumnodiscuss` ; un forum contenant des annonces reste visible. Le mode édition conserve les éléments d'origine.

Le contexte `xirhfrontpage` de `layout/drawers.php` limite le rendu du nouveau template à l'accueil, hors édition : les images du bandeau ne sont donc pas téléchargées sur les pages de cours et d'administration.

`public/academy-preview/index.html` présente maintenant cette version avec les mêmes templates et styles. L'aperçu est autonome : ses images et styles sont servis depuis `public/academy-preview/`. Il ne simule aucun compte ni progression. Les liens ouvrent le Moodle réel.

Validation : huit images chargées dans l'aperçu, liens vers les trois catégories réelles, un seul titre principal visible, ancienne liste de domaines masquée sans doublon, écoles sur trois colonnes et aucun débordement horizontal sur bureau. Contrôle visuel sur une copie des composants Moodle réels et dans une fenêtre de 390 pixels. Les parcours inscrits et l'exécution PHP restent à contrôler après déploiement.

Retour à la version ardoise : retirer le lien `academy-golden.css` du template de tête, restaurer le template d'accueil du commit précédent et purger les caches Moodle. Le contenu stocké en base n'a pas été modifié.

## Version sombre et nouvel en-tête

Le premier déploiement a été constaté en ligne le 24 octobre 2026. Le carrousel restant provenait d'un bloc HTML distinct (`.xirh-top-banner`), avec des décalages de page et de tiroirs. `academy-dark.css`, chargé après la première couche, masque ce carrousel hors du mode édition et remet les décalages à leur valeur normale.

Le template `academy_masthead.mustache`, inclus dans `drawers.mustache`, présente un titre, une illustration vectorielle décorative et deux liens natifs : le catalogue et l'espace personnel. Il est visible uniquement sur l'accueil, hors mode édition. Sur les autres pages il reste masqué ; si les styles sont absents, son `display:none` conserve le rendu existant. L'introduction stockée en base reste présente et sert de repli si le nouveau template n'est pas chargé.

L'accueil, le catalogue et la connexion utilisent désormais une palette bleu ardoise, avec des accents menthe. Les logos conservent un support blanc ; les formulaires et résumés de cours conservent leurs surfaces claires. Les activités et l'administration ne reçoivent pas cette palette. Les décalages de l'ancien bandeau sont retirés sur les pages hors édition pour éviter un espace vide après sa disparition.

Contrôles locaux sur les composants publics réels : ancien bandeau masqué, marge supérieure supprimée, un seul titre principal visible, absence de débordement horizontal sur bureau et contrôle visuel dans une fenêtre de 390 pixels. La vérification PHP et les parcours inscrits nécessitent l'instance Moodle déployée. Après redéploiement, purger les caches Moodle si les nouveaux templates ne sont pas pris en compte.

Retour à la première version : retirer le lien `academy-dark.css` du template `head.mustache`, puis purger les caches. L'en-tête garde alors son état masqué par défaut. Les pages d'aperçu de la première proposition dans `public/academy-preview/` restent un concept séparé ; les fichiers `academy-dark.css` et `academy_masthead.mustache` définissent le nouveau rendu Moodle effectif.

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
