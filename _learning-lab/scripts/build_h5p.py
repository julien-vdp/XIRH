import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Paths to the generated images in the brain workspace
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "m1_lifecycle.jpg": os.path.join("illustrations", "course_rh", "m1_lifecycle.png"),
    "m2_interconnections.jpg": os.path.join("illustrations", "course_rh", "m2_interconnections.png"),
    "m3_comparison.jpg": os.path.join("illustrations", "course_rh", "m3_comparison.png"),
    "m3_iso_vs_sirh.jpg": os.path.join("illustrations", "course_rh", "m3_iso_vs_sirh.png"),
    "m4_bpmn_demo.jpg": os.path.join("illustrations", "course_rh", "m4_bpmn_demo.png"),
    "m4_bpmn_errors.jpg": os.path.join("illustrations", "course_rh", "m4_bpmn_errors.png"),
    "m5_case_study.jpg": os.path.join("illustrations", "course_rh", "m5_case_study.png")
}

# HTML Contents for chapters (Clean semantic HTML without custom style tags)
INTRO_TEXT = """
<h2>Bienvenue sur XIRH Academy</h2>
<p>Ce cours interactif est conçu pour vous, étudiants Bac+4 et professionnels des Ressources Humaines. L'objectif est de vous donner des outils concrets pour <strong>comprendre, analyser et modéliser les processus RH</strong> grâce au standard <strong>BPMN (Business Process Model and Notation)</strong>, dans une perspective d'implémentation de projets SIRH.</p>

<blockquote>
  <strong>« Un bon projet SIRH ne commence pas par une démo outil. Il commence par une question simple : comment le travail se fait-il vraiment aujourd'hui, et comment voulons-nous qu'il se fasse demain ? »</strong>
</blockquote>

<h3>Objectifs d'apprentissage :</h3>
<ul>
  <li>Définir et cartographier les processus RH essentiels.</li>
  <li>Comprendre la plus-value de l'analyse des processus avant toute phase de choix ou de paramétrage SIRH.</li>
  <li>Distinguer l'approche documentaire (ex: ISO 9001) d'une approche opérationnelle SIRH.</li>
  <li>Lire et dessiner des diagrammes de processus lisibles en BPMN 2.0.</li>
  <li>Repérer les irritants et opportunités d'amélioration.</li>
  <li>Travailler sur un cas d'entreprise réaliste (Novalia Services).</li>
</ul>
"""

M1_TEXT = """
<h2>Module 1 — Comprendre ce qu'est un processus</h2>
<p>Un processus n'est pas une simple procédure administrative ou une liste de tâches désorganisées. C'est le flux vital de l'entreprise qui crée de la valeur.</p>

<h3>1. Qu'est-ce qu'un processus RH ?</h3>
<p>Un processus est un <strong>ensemble d'activités corrélées</strong> qui transforment un élément d'entrée (déclencheur ou besoin) en un résultat ou élément de sortie (valeur pour le client interne ou externe).</p>
<p>Chaque processus répond à des caractéristiques clés :</p>
<ul>
  <li><strong>Un déclencheur</strong> (ex: "Le besoin de recruter est validé")</li>
  <li><strong>Des acteurs</strong> (Collaborateurs, Managers, RH, DSI, etc.)</li>
  <li><strong>Des étapes ou activités</strong> (Évaluer, valider, saisir, contrôler)</li>
  <li><strong>Des informations/documents</strong> (Fiche de poste, CV, contrat, fiche de paie)</li>
  <li><strong>Un résultat concret</strong> (ex: "Le candidat est embauché et équipé")</li>
</ul>

<blockquote>
  <strong>« Digitaliser un mauvais processus ne le rend pas meilleur : cela permet simplement de faire plus vite quelque chose de mal conçu. »</strong>
</blockquote>

<h3>2. Les différences conceptuelles clés</h3>
<p>Il est crucial de ne pas confondre les termes suivants, notamment lors de discussions avec l'IT ou les directions qualité :</p>
<ul>
  <li><strong>Tâche</strong> : Une action élémentaire isolée (ex: "Saisir le numéro de sécurité sociale").</li>
  <li><strong>Activité</strong> : Un ensemble cohérent de tâches réalisées par un même actor (ex: "Saisir les variables de paie").</li>
  <li><strong>Procédure</strong> : Un document explicatif figé décrivant comment exécuter une action (le "mode d'emploi").</li>
  <li><strong>Processus</strong> : La chaîne globale de bout en bout qui traverse plusieurs services pour délivrer un résultat (ex: "Embaucher un salarié").</li>
  <li><strong>Workflow</strong> : L'automatisation informatique de l'enchaînement des tâches au sein d'un outil (ex: le circuit de validation de congé dans le SIRH).</li>
  <li><strong>Projet</strong> : Une démarche temporaire unique avec un début et une fin pour créer un produit ou service spécifique (ex: "Déployer un nouveau module de GTA").</li>
</ul>
"""

M1_EXERCICES = """
<h3>Activité d'assimilation : tâche, activité, processus ou projet ?</h3>
<p>Lisez les exemples suivants et entraînez-vous mentalement à les catégoriser. Les réponses correctes sont détaillées ci-dessous.</p>

<p><strong>Exemple 1 :</strong> "Envoyer un mail de confirmation de rendez-vous d'entretien au candidat."<br>
<span style="color:#2563eb;">➔ C'est une <strong>Tâche</strong>. (Action unitaire, simple et rapide).</span></p>

<p><strong>Exemple 2 :</strong> "Recruter et intégrer un nouveau collaborateur."<br>
<span style="color:#2563eb;">➔ C'est un <strong>Processus</strong>. (Chaîne globale d'activités impliquant le candidat, le manager, le recruteur, l'administration, l'IT...).</span></p>

<p><strong>Exemple 3 :</strong> "Paramétrer et déployer un module de gestion des temps (GTA) sur 3 filiales."<br>
<span style="color:#2563eb;">➔ C'est un <strong>Projet</strong>. (Objectif temporaire, unique, avec un budget et un calendrier précis).</span></p>

<p><strong>Exemple 4 :</strong> "Valider une demande de formation sur le portail SIRH."<br>
<span style="color:#2563eb;">➔ C'est une <strong>Activité</strong> ou <strong>Tâche</strong> dans le cadre d'un workflow de formation.</span></p>
"""

M2_TEXT = """
<h2>Module 2 — Les principaux processus RH et leurs interconnexions</h2>
<p>Les services RH sont trop souvent perçus comme des silos (la Paie, la Formation, le Recrutement). En réalité, les données et les événements s'enchaînent tout au long du cycle de vie du collaborateur.</p>

<h3>1. Le cycle de vie collaborateur</h3>
<p>Voici la carte séquentielle du cycle de vie que nous suivons chez XIRH Academy :</p>
<blockquote>
  <strong>Attraction ➔ Recrutement ➔ Embauche ➔ Onboarding ➔ Administration ➔ Temps/Absences ➔ Paie ➔ Formation ➔ Performance ➔ Mobilité ➔ Engagement ➔ Offboarding</strong>
</blockquote>

<h3>2. Descriptif des 10 grands processus RH</h3>

<p><strong>1. Recrutement</strong><br>
Débute par la formalisation d'un besoin de recrutement (remplacement, croissance) par un manager, sa validation budgétaire par la direction, la multidiffusion de l'annonce, le sourcing, les entretiens, jusqu'à la proposition d'embauche acceptée.</p>

<p><strong>2. Onboarding / Intégration</strong><br>
Prépare l'arrivée du collaborateur sur les plans administratif (DPAE, contrat), matériel (PC, téléphone) et logistique (badge, accès SIRH) pour garantir une expérience collaborateur réussie dès le premier jour.</p>

<p><strong>3. Administration du Personnel</strong><br>
Gère le dossier unique du salarié, les avenants de contrats, les changements de situation familiale ou bancaire, et assure la conformité légale.</p>

<p><strong>4. Gestion des Temps et Activités (GTA)</strong><br>
Suit les plannings, valide les demandes de congés ou RTT, gère le télétravail, les heures supplémentaires, les arrêts maladie et transmet ces éléments à la paie.</p>

<p><strong>5. Paie</strong><br>
Calcule le salaire brut à partir des données contractuelles et des variables (heures supp, absences, primes), procède aux contrôles, édite les bulletins et transmet les déclarations sociales (DSN).</p>

<p><strong>6. Formation et Développement</strong><br>
Recueille les besoins, planifie les sessions de développement des compétences, gère les inscriptions, évalue les formations et met à jour le référentiel de compétences de l'entreprise.</p>

<p><strong>7. Performance et Entretiens</strong><br>
Organise la campagne d'entretiens annuels ou professionnels, définit les objectifs et suit le plan d'action.</p>

<p><strong>8. Mobilité et Évolution</strong><br>
Gère les souhaits de carrière des collaborateurs, les opportunités internes et coordonne les mutations géographiques ou fonctionnelles.</p>

<p><strong>9. Rémunération et Avantages Sociaux</strong><br>
Pilote les campagnes d'augmentation salariale, la distribution de bonus, l'intéressement, la participation et les avantages (mutuelle, tickets resto).</p>

<p><strong>10. Offboarding / Sortie</strong><br>
Gère le départ du collaborateur (démission, retraite, licenciement), le calcul du solde de tout compte, la désactivation des accès IT et la restitution du matériel.</p>

<h3>3. Les interconnexions de données : l'effet domino</h3>
<p>Une modification ou une action sur un processus amont a un impact direct sur les processus en aval :</p>
<ul>
  <li><strong>Exemple d'une promotion interne</strong> : La mobilité déclenche la création d'un avenant (Administration), qui modifie le salaire (Rémunération), ce qui impacte le calcul des variables de paie (Paie) et modifie le manager validant les congés (GTA), tout en redéfinissant les objectifs individuels (Performance) et nécessitant une formation d'onboarding managérial (Formation).</li>
</ul>
"""

M3_TEXT = """
<h2>Module 3 — Pourquoi analyser un processus avant de digitaliser ?</h2>

<h3>1. L'analyse de processus : le fondement du projet SIRH</h3>
<p>Trop d'organisations choisissent un progiciel RH à partir d'une simple présentation commerciale séduisante. Résultat ? L'entreprise adapte son organisation aux contraintes de l'outil, ou paie des sommes astronomiques en développements spécifiques.</p>

<blockquote>
  <strong>« Un SIRH n’est pas une baguette magique. C’est plutôt un amplificateur. Si le processus est clair, il peut l’accélérer. Si le processus est chaotique, il peut transformer le chaos artisanal en chaos industriel. »</strong>
</blockquote>

<p>L'analyse de processus RH permet de :</p>
<ul>
  <li><strong>Cartographier le AS-IS (l'existant)</strong> : Comment travaille-t-on <em>réellement</em> sur le terrain ?</li>
  <li><strong>Identifier les Pain points (irritants)</strong> : Où sont les saisies multiples, les ruptures de flux (impression papier inutile), les validations redondantes et les retards ?</li>
  <li><strong>Concevoir le TO-BE (la cible)</strong> : Comment le processus doit-il fonctionner une fois modernisé ?</li>
  <li><strong>Déterminer les Quick wins</strong> : Des améliorations simples et immédiates sans attendre l'outil (ex: standardiser un modèle de mail).</li>
  <li><strong>Définir les exigences fonctionnelles</strong> : Rédiger le cahier des charges pour l'éditeur SIRH (ex: "Le système doit pouvoir gérer 3 niveaux de validation de congés").</li>
</ul>

<h3>2. L'approche Qualité ISO 9001 vs L'analyse Processus SIRH</h3>
<p>Bien que l'approche ISO 9001 favorise la maîtrise et l'amélioration continue, elle diffère grandement d'une démarche projet SIRH qui exige de l'agilité, de la fluidité et une excellente expérience utilisateur.</p>

<table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Critère</th>
      <th>Approche ISO 9001 Classique</th>
      <th>Analyse Processus Orientée SIRH</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Finalité première</strong></td>
      <td>Conformité aux normes, maîtrise des risques, traçabilité documentaire.</td>
      <td>Simplification des tâches, automatisation, amélioration de l'expérience collaborateur.</td>
    </tr>
    <tr>
      <td><strong>Livrables clés</strong></td>
      <td>Procédures d'organisation écrites, fiches processus qualité.</td>
      <td>Diagrammes de flux (BPMN), liste d'irritants, liste d'exigences SIRH.</td>
    </tr>
    <tr>
      <td><strong>Acteurs impliqués</strong></td>
      <td>Direction qualité, auditeurs, responsables de service.</td>
      <td>Opérationnels RH, managers, collaborateurs, DSI, éditeurs de logiciels.</td>
    </tr>
    <tr>
      <td><strong>Risque majeur</strong></td>
      <td>Documentation lourde, rigide et parfois déconnectée de la réalité.</td>
      <td>Analyse trop superficielle se limitant à copier l'existant sans le repenser.</td>
    </tr>
    <tr>
      <td><strong>Question clé</strong></td>
      <td>« Le processus est-il conforme et maîtrisé par écrit ? »</td>
      <td>« Comment optimiser le flux de données et le digitaliser intelligemment ? »</td>
    </tr>
  </tbody>
</table>
"""

M3_DIAGNOSTIC = """
<h3>Mini-Cas d'Analyse : Demande de formation chez "Bricocorp"</h3>
<p>Voici la description d'un processus existant. Lisez-le attentivement pour en déceler les failles :</p>

<blockquote>
  <strong>Le processus actuel :</strong><br>
  Un salarié souhaite suivre une formation. Il envoie un e-mail à son manager. Le manager y répond parfois favorablement (ou oublie le mail). Si le manager accepte, le RH reçoit un mail et recopie les informations dans un tableur Excel de suivi du budget. Les demandes sont arbitrées lors d'un comité mensuel RH. Après arbitrage, le RH fait l'inscription manuellement dans le portail de l'organisme de formation. À la fin de la session, le RH reçoit la feuille d'émargement au format PDF par mail de l'organisme de formation, et la stocke sur un disque partagé en cochant la case 'fait' dans Excel.
</blockquote>

<h3>Diagnostic de ce processus :</h3>
<ul>
  <li><strong>Ruptures de flux (Pain points)</strong> : Communication par mails libres, recopies manuelles multiples dans Excel, absence de relance automatique.</li>
  <li><strong>Risques</strong> : Perte d'e-mails de demande, erreurs de saisie du budget Excel, documents PDF d'émargement stockés de manière non sécurisée ou perdus.</li>
  <li><strong>Pistes SIRH (TO-BE)</strong> : Formulaire de demande en ligne dans le SIRH (LMS), validation managériale automatisée avec alertes par e-mail, décompte automatique du budget de formation et archivage numérique sécurisé de l'émargement.</li>
</ul>
"""

M4_TEXT = """
<h2>Module 4 — Les diagrammes BPMN : principes généraux</h2>
<p>BPMN (Business Process Model and Notation) est la notation graphique universelle pour modéliser les processus. Elle permet de jeter un pont de communication entre les métiers RH, la DSI et les éditeurs SIRH.</p>

<h3>1. Les éléments de base du BPMN</h3>
<p>Pour lire et concevoir un diagramme standard, seuls quelques symboles sont indispensables :</p>

<table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Symbole</th>
      <th>Représentation</th>
      <th>Exemple d'usage RH</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Début</strong></td>
      <td>Cercle simple à trait fin.</td>
      <td>Un collaborateur demande un congé.</td>
    </tr>
    <tr>
      <td><strong>Fin</strong></td>
      <td>Cercle à trait épais ou double.</td>
      <td>Le congé est enregistré et validé.</td>
    </tr>
    <tr>
      <td><strong>Activité / Tâche</strong></td>
      <td>Rectangle aux coins arrondis. Contient toujours un verbe à l'infinitif + un COD (ex: "Valider la demande").</td>
      <td>"Vérifier le solde disponible".</td>
    </tr>
    <tr>
      <td><strong>Passerelle / Gateway</strong></td>
      <td>Un losange. Représente des décisions ou des aiguillages de flux. Les branches sortantes doivent être labellisées (ex: "Oui / Non", "Accepté / Refusé").</td>
      <td>"Solde suffisant ?" ➔ Oui (poursuite) / Non (refus).</td>
    </tr>
    <tr>
      <td><strong>Flux de séquence</strong></td>
      <td>Une flèche continue. Indique l'ordre d'exécution des tâches.</td>
      <td>Relie l'étape de saisie à celle de validation.</td>
    </tr>
    <tr>
      <td><strong>Lanes (Couloirs)</strong></td>
      <td>Divisions horizontales ou verticales représentant les acteurs.</td>
      <td>Couloir "Collaborateur", couloir "Manager", couloir "RH".</td>
    </tr>
  </tbody>
</table>

<h3>2. Règles d'or pour un bon diagramme BPMN</h3>
<blockquote>
  <strong>« Un bon diagramme BPMN n'est pas celui qui utilise tous les symboles complexes de la norme. C'est celui qu'un gestionnaire RH, un manager et un consultant technique comprennent en 30 secondes sans explication orale. »</strong>
</blockquote>
<ul>
  <li>Toujours démarrer par <strong>un seul et unique événement de début</strong> clairement identifié.</li>
  <li>Utiliser des <strong>verbes d'action</strong> pour nommer les activités (Saisir, Valider, Envoyer, Contrôler) plutôt que des noms (ex: "Saisie de données").</li>
  <li>Poser une question claire dans les losanges de décision et nommer chaque branche sortante.</li>
  <li>Maintenir le flux de gauche à droite ou de haut en bas. Éviter les flèches qui se croisent dans tous les sens (effet spaghetti).</li>
  <li>Séparer les rôles grâce aux couloirs (Lanes) pour identifier qui fait quoi.</li>
</ul>
"""

M4_EXERCICE_BPMN = """
<h3>Exercice : Demande de formation (Traduction en BPMN)</h3>
<p>Lisez la description textuelle et visualisez sa traduction BPMN :</p>

<blockquote>
  <strong>Description du processus :</strong><br>
  Un collaborateur demande une formation. Le manager en vérifie la pertinence. Si la demande n'est pas jugée pertinente, elle est refusée. Si elle est pertinente, le RH vérifie le budget. Si le budget est insuffisant, la demande est mise en attente. Si le budget est disponible, le RH inscrit le collaborateur et met à jour le plan de compétences.
</blockquote>

<h3>Décomposition pour modélisation :</h3>
<ul>
  <li><strong>Événement de début</strong> : Demande de formation initiée par le collaborateur.</li>
  <li><strong>Rôles (Lanes)</strong> : Collaborateur, Manager, RH.</li>
  <li><strong>Décision 1 (Manager)</strong> : "Demande pertinente ?" ➔ Non (Fin : Demande refusée) / Oui (Activité suivante).</li>
  <li><strong>Décision 2 (RH)</strong> : "Budget disponible ?" ➔ Non (Fin : Demande en attente) / Oui (Activité suivante : Inscrire le salarié et mettre à jour le plan).</li>
  <li><strong>Événement de fin</strong> : Demande validée et traitée.</li>
</ul>
"""

M5_TEXT = """
<h2>Module 5 — Cas fil rouge : Novalia Services</h2>
<p>Mettez-vous dans la peau d'un consultant AMOA SIRH junior. L'entreprise Novalia Services (850 salariés) a un problème majeur sur son processus d'onboarding (intégration).</p>

<h3>Le constat d'existant (AS-IS) chez Novalia Services :</h3>
<ol>
  <li>Le recrutement d'un candidat est validé dans l'ATS (système de recrutement).</li>
  <li>Le recruteur envoie manuellement un e-mail au service RH avec les informations du candidat.</li>
  <li>Le RH saisit à nouveau ces informations pour créer le dossier dans le SIRH (double saisie).</li>
  <li>Le RH envoie un e-mail au futur manager pour confirmer la date d'arrivée et les besoins matériels. Le manager répond tardivement ou oublie.</li>
  <li>Le RH transmet par fichier Excel les données à la paie pour le contrat.</li>
  <li>Le RH envoie un e-mail à l'IT pour commander les accès et le PC. L'IT réclame des informations complémentaires car le mail est incomplet.</li>
  <li>Le jour de l'arrivée, le collaborateur n'a souvent ni PC, ni badge, ni accès aux outils. Le RH passe sa journée au téléphone à relancer tout le monde.</li>
</ol>

<h3>Travail demandé à l'apprenant :</h3>
<ol>
  <li><strong>Identifier les acteurs</strong> du processus d'onboarding.</li>
  <li><strong>Repérer les 3 principaux irritants (pain points)</strong> du processus actuel.</li>
  <li><strong>Formuler 3 exigences fonctionnelles</strong> pour concevoir le processus cible (TO-BE) dans le futur SIRH.</li>
</ol>
"""

M5_CORRECTION = """
<h3>Correction et analyse pour le Cas Novalia Services</h3>

<p><strong>1. Liste des acteurs identifiés :</strong></p>
<ul>
  <li><strong>Candidat / Futur collaborateur</strong> (Bénéficiaire final).</li>
  <li><strong>Recruteur</strong> (Déclencheur dans l'ATS).</li>
  <li><strong>Gestionnaire RH</strong> (Coordinateur principal).</li>
  <li><strong>Manager opérationnel</strong> (Validateur de date et matériel).</li>
  <li><strong>Gestionnaire de paie</strong> (Rédacteur du contrat).</li>
  <li><strong>Service IT / Support DSI</strong> (Fournisseur de matériel et d'accès).</li>
  <li><strong>Services Généraux</strong> (Fournisseur de badge).</li>
</ul>

<p><strong>2. Les irritants majeurs (Pain Points) :</strong></p>
<ul>
  <li><strong>Ruptures de flux et doubles saisies</strong> : Recopier manuellement les données de l'ATS vers le SIRH, puis dans Excel pour la paie.</li>
  <li><strong>Absence de workflow structuré</strong> : Dépendance totale à des e-mails manuels qui se perdent ou sont incomplets.</li>
  <li><strong>Manque de visibilité</strong> : Le RH n'a aucun tableau de bord pour savoir si le PC est prêt ou si le contrat est signé avant le jour J.</li>
</ul>

<p><strong>3. Exigences fonctionnelles cibles (TO-BE) :</strong></p>
<ul>
  <li><strong>EF-01 (Intégration)</strong> : Le système doit transférer automatiquement les données du candidat de l'ATS vers le Core RH lors du passage au statut 'Embauché'.</li>
  <li><strong>EF-02 (Workflow Manager)</strong> : Le manager doit recevoir une notification automatique à J-15 avec un formulaire obligatoire pour choisir le profil matériel du nouvel arrivant.</li>
  <li><strong>EF-03 (Suivi et Alertes)</strong> : Un tableau de bord de suivi doit alerter le RH par une notification rouge si les accès IT ne sont pas validés à J-3.</li>
</ul>
"""

M6_FLASHCARDS = """
<h2>Glossaire : Révisions des concepts clés</h2>
<p>Voici les définitions indispensables pour maîtriser le sujet :</p>
<ul>
  <li><strong>Processus</strong> : Ensemble d'activités corrélées ou en interaction qui transforme des éléments d'entrée en éléments de sortie (valeur ajoutée).</li>
  <li><strong>Workflow</strong> : Automatisation logicielle d'un flux de tâches à réaliser par différents acteurs selon des règles prédéfinies dans un outil.</li>
  <li><strong>BPMN</strong> : Business Process Model and Notation. Standard international de modélisation graphique des processus métier.</li>
  <li><strong>AS-IS / TO-BE</strong> : <em>AS-IS</em> représente le processus dans son état actuel (existant), tandis que le <em>TO-BE</em> décrit le processus futur optimisé (cible).</li>
  <li><strong>Irritant / Pain Point</strong> : Dysfonctionnement, lourdeur ou goulot d'étranglement qui ralentit le processus et dégrade l'expérience collaborateur ou la qualité des données.</li>
  <li><strong>Passerelle (Gateway)</strong> : Losange en BPMN matérialisant un choix logique ou un aiguillage de flux selon des critères définis.</li>
  <li><strong>Lane (Couloir)</strong> : Division horizontale ou verticale d'un pool dans un diagramme BPMN représentant un rôle, un service ou une entité organisationnelle.</li>
  <li><strong>Exigence fonctionnelle</strong> : Description d'un besoin métier ou d'un service attendu d'un logiciel pour résoudre un problème ou soutenir un processus.</li>
  <li><strong>DSN</strong> : Déclaration Sociale Nominative. Transmission mensuelle unique des données de paie des salariés aux organismes sociaux.</li>
  <li><strong>ATS</strong> : Applicant Tracking System. Logiciel utilisé par les RH pour gérer le processus de recrutement, du sourcing à la proposition.</li>
  <li><strong>Core RH</strong> : Base de données centrale contenant l'ensemble des données d'identité, de structure administrative et de carrière d'un collaborateur.</li>
  <li><strong>Offboarding</strong> : Processus coordonné de sortie d'un salarié comprenant le solde de tout compte, la restitution du matériel et la coupure des accès informatiques.</li>
  <li><strong>Déclencheur (Trigger)</strong> : Événement initial qui lance le déroulement d'un processus (ex: réception d'un arrêt de travail).</li>
  <li><strong>Quick Win</strong> : Action corrective simple, peu coûteuse et rapide à mettre en place pour corriger un dysfonctionnement immédiat.</li>
  <li><strong>Tâche BPMN</strong> : Activité élémentaire non décomposable représentée par un rectangle à bords arrondis.</li>
</ul>
"""

SYNTHESE_TEXT = """
<h2>Synthèse finale et conclusion</h2>
<p>L'analyse et la modélisation de processus RH avec BPMN n'est pas un exercice théorique de documentation qualité. C'est l'outil indispensable pour piloter la transformation digitale des Ressources Humaines.</p>

<blockquote>
  <strong>Les 4 piliers à retenir :</strong>
  <ul>
    <li><strong>Simplifier avant d'informatiser</strong> : N'automatisez jamais un processus qui ne fonctionne pas manuellement.</li>
    <li><strong>Parler le même langage</strong> : Utilisez BPMN pour aligner les RH, le management et l'informatique sur une vision commune.</li>
    <li><strong>Penser données et interconnexions</strong> : La donnée RH est fluide. Un recrutement réussi nourrit l'onboarding, qui nourrit le Core RH, qui nourrit la paie.</li>
    <li><strong>Soigner l'expérience collaborateur</strong> : La fluidité d'un processus se ressent directement sur l'intégration ou le quotidien des salariés.</li>
  </ul>
</blockquote>
"""

def make_column_item(library, params, title="Untitled"):
    return {
        "content": {
            "library": library,
            "params": params,
            "subContentId": str(uuid.uuid4()),
            "metadata": {
                "contentType": library.split(" ")[0].replace("H5P.", ""),
                "license": "U",
                "title": title
            }
        },
        "useSeparator": "auto"
    }

def make_text_item(title, text_html):
    params = {
        "text": text_html.strip().replace("\n", " ").replace("  ", " ")
    }
    return make_column_item("H5P.AdvancedText 1.1", params, title)

def make_image_item(title, image_path, alt_text):
    params = {
        "contentName": "Image",
        "decorative": False,
        "alt": alt_text,
        "file": {
            "path": image_path,
            "mime": "image/jpeg",
            "width": 1024,
            "height": 1024,
            "copyright": {
                "license": "U"
            }
        },
        "expandImage": "Agrandir l'image",
        "minimizeImage": "Réduire l'image"
    }
    return make_column_item("H5P.Image 1.1", params, title)

def make_single_choice_set(title, questions_list):
    choices = []
    for q in questions_list:
        choices.append({
            "question": f"<p>{q['question']}</p>",
            "answers": [f"<p>{ans}</p>" for ans in q['answers']],
            "subContentId": str(uuid.uuid4())
        })
    params = {
        "choices": choices,
        "behaviour": {
            "timeoutCorrect": 0,
            "timeoutWrong": 0,
            "soundEffectsEnabled": True,
            "enableRetry": True,
            "enableSolutionsButton": True,
            "passPercentage": 100,
            "autoContinue": False
        },
        "l10n": {
            "showSolutionButtonLabel": "Afficher la solution",
            "retryButtonLabel": "Recommencer",
            "solutionViewTitle": "Solution",
            "correctText": "Correct !",
            "incorrectText": "Incorrect !",
            "muteButtonLabel": "Couper le son",
            "closeButtonLabel": "Fermer",
            "slideOfTotal": "Question :num sur :total",
            "nextButtonLabel": "Suivant",
            "scoreBarLabel": "Vous avez obtenu :num sur :total points",
            "solutionListQuestionNumber": "Question :num",
            "shouldSelect": "Devrait être sélectionné",
            "shouldNotSelect": "Ne devrait pas être sélectionné",
            "a11yShowSolution": "Afficher la solution. La tâche sera marquée avec sa réponse correcte.",
            "a11yRetry": "Recommencer la tâche. Réinitialiser toutes les réponses et recommencer."
        },
        "overallFeedback": [
            {
                "from": 0,
                "to": 100,
                "feedback": "Vous avez obtenu :numcorrect sur :maxscore réponses correctes."
            }
        ]
    }
    return make_column_item("H5P.SingleChoiceSet 1.11", params, title)

def generate_content_json():
    def create_id():
        return str(uuid.uuid4())

    # Build Chapters using correct H5P.Column structure
    chapters = [
        # Chapter 1: Introduction
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Intro Text", INTRO_TEXT),
                    make_image_item("Cover Image", "images/cover.jpg", "Couverture de XIRH Academy - René Magritte & Golden Retriever")
                ],
                "header": "Introduction & Objectifs"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Introduction & Objectifs"
            },
            "subContentId": create_id()
        },
        # Chapter 2: Module 1
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Module 1 Text", M1_TEXT),
                    make_image_item("Module 1 Lifecycle", "images/m1_lifecycle.jpg", "Cycle de vie collaborateur - René Magritte & Golden Retriever"),
                    make_text_item("Module 1 Exercices", M1_EXERCICES),
                    make_single_choice_set("Module 1 Quiz", [
                        {
                            "question": "Un processus RH doit-il obligatoirement être digitalisé ou géré par un SIRH ?",
                            "answers": [
                                "Faux, un processus peut être manuel, partiel ou totalement informatisé.",
                                "Vrai, un processus non digitalisé est considéré comme une simple tâche.",
                                "Vrai, la norme BPMN interdit la modélisation de processus manuels."
                            ]
                        },
                        {
                            "question": "Quelle est la définition exacte d'une tâche ?",
                            "answers": [
                                "Une action unitaire et élémentaire exécutée par un actor.",
                                "Un enchaînement d'activités complexe traversant plusieurs services.",
                                "Un document décrivant comment faire le travail."
                            ]
                        },
                        {
                            "question": "Complétez la phrase d'or : 'Digitaliser un mauvais processus...'",
                            "answers": [
                                "...ne le rend pas meilleur, il fait juste faire plus vite une erreur.",
                                "...est impossible avec le standard BPMN 2.0.",
                                "...est le moyen le plus rapide de le corriger automatiquement."
                            ]
                        }
                    ])
                ],
                "header": "Module 1 : Qu'est-ce qu'un processus ?"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Module 1 : Qu'est-ce qu'un processus ?"
            },
            "subContentId": create_id()
        },
        # Chapter 3: Module 2
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Module 2 Text", M2_TEXT),
                    make_image_item("Module 2 Interconnections", "images/m2_interconnections.jpg", "Interconnexions des processus RH - René Magritte"),
                    make_single_choice_set("Module 2 Quiz", [
                        {
                            "question": "Quel processus RH est directement alimenté en données par la validation du recrutement dans l'ATS ?",
                            "answers": [
                                "L'onboarding / intégration.",
                                "La gestion des temps et des activités (GTA).",
                                "L'évaluation annuelle de la performance."
                            ]
                        },
                        {
                            "question": "Si un salarié passe à temps partiel, quels processus sont immédiatement impactés ?",
                            "answers": [
                                "Administration, GTA, contrat (avenant) et Paie.",
                                "Recrutement et formation uniquement.",
                                "Uniquement la paie."
                            ]
                        }
                    ])
                ],
                "header": "Module 2 : Les processus RH et interconnexions"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Module 2 : Les processus RH et interconnexions"
            },
            "subContentId": create_id()
        },
        # Chapter 4: Module 3
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Module 3 Text", M3_TEXT),
                    make_image_item("Module 3 Comparison", "images/m3_comparison.jpg", "AS IS vs TO BE - René Magritte & Golden Retriever"),
                    make_image_item("Module 3 ISO vs SIRH", "images/m3_iso_vs_sirh.jpg", "ISO vs SIRH - Balance surréaliste"),
                    make_text_item("Module 3 Diagnostic", M3_DIAGNOSTIC),
                    make_single_choice_set("Module 3 Quiz", [
                        {
                            "question": "Que signifient les termes 'AS-IS' et 'TO-BE' ?",
                            "answers": [
                                "Le processus existant (actuel) et le processus cible (futur).",
                                "Le processus papier et le processus informatisé.",
                                "Le processus réglementaire et le processus non-conforme."
                            ]
                        },
                        {
                            "question": "Quelle est l'orientation principale de l'analyse processus SIRH par rapport à la qualité ISO 9001 ?",
                            "answers": [
                                "La simplification, l'automatisation et l'expérience utilisateur.",
                                "La conformité documentaire absolue et la traçabilité papier.",
                                "Le respect strict des organigrammes hiérarchiques."
                            ]
                        }
                    ])
                ],
                "header": "Module 3 : Pourquoi analyser avant de digitaliser ?"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Module 3 : Pourquoi analyser avant de digitaliser ?"
            },
            "subContentId": create_id()
        },
        # Chapter 5: Module 4
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Module 4 Text", M4_TEXT),
                    make_image_item("Module 4 BPMN Demo", "images/m4_bpmn_demo.jpg", "Diagramme BPMN - René Magritte & Golden Retriever"),
                    make_image_item("Module 4 BPMN Errors", "images/m4_bpmn_errors.jpg", "Erreurs BPMN fréquentes - Mer de flèches"),
                    make_text_item("Module 4 Exercice", M4_EXERCICE_BPMN),
                    make_single_choice_set("Module 4 Quiz", [
                        {
                            "question": "Comment doit être rédigé le libellé d'une tâche/activité en BPMN ?",
                            "answers": [
                                "Un verbe d'action à l'infinitif + un COD (ex: Saisir les données).",
                                "Un nom commun représentatif (ex: Saisie de données).",
                                "Le titre de l'acteur qui la réalise (ex: Gestionnaire de Paie)."
                            ]
                        },
                        {
                            "question": "Quel symbole représente une décision logique ou un aiguillage de flux ?",
                            "answers": [
                                "Le losange (Passerelle / Gateway).",
                                "Le rectangle aux bords arrondis (Activité).",
                                "Le cercle à trait fin (Début)."
                            ]
                        }
                    ])
                ],
                "header": "Module 4 : Les diagrammes BPMN"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Module 4 : Les diagrammes BPMN"
            },
            "subContentId": create_id()
        },
        # Chapter 6: Module 5
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Module 5 Text", M5_TEXT),
                    make_image_item("Module 5 Case Study", "images/m5_case_study.jpg", "Cas pratique Novalia - René Magritte & Golden Retriever"),
                    make_text_item("Module 5 Correction", M5_CORRECTION)
                ],
                "header": "Module 5 : Cas pratique Novalia Services"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Module 5 : Cas pratique Novalia Services"
            },
            "subContentId": create_id()
        },
        # Chapter 7: Flashcards & Synthese
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Glossaire & Flashcards", M6_FLASHCARDS),
                    make_text_item("Synthèse", SYNTHESE_TEXT)
                ],
                "header": "Glossaire & Synthèse"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Glossaire & Synthèse"
            },
            "subContentId": create_id()
        },
        # Chapter 8: Final Evaluation
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Eval Intro", "<h3>Évaluation Finale du Module</h3><p>Cette évaluation valide vos acquis sur le module de gestion de processus RH. Elle est notée sur 20 points. Répondez aux questions du QCM ci-dessous pour tester votre score.</p>"),
                    make_single_choice_set("Quiz d'évaluation finale", [
                        {
                            "question": "Q1. Quelle est l'abréviation de BPMN ?",
                            "answers": [
                                "Business Process Model and Notation",
                                "Business Procedure Manager Network",
                                "Basic Protocol Model Normalization"
                            ]
                        },
                        {
                            "question": "Q2. Quelle est la première étape indispensable lors du choix d'un outil SIRH ?",
                            "answers": [
                                "Analyser l'existant (AS-IS) et définir les processus cibles (TO-BE)",
                                "Contacter le commercial de l'éditeur le plus connu",
                                "Faire coder une interface sur mesure par les équipes techniques"
                            ]
                        },
                        {
                            "question": "Q3. Que modélise une Lane (couloir) dans un diagramme BPMN ?",
                            "answers": [
                                "Un acteur ou un rôle spécifique",
                                "Un logiciel ou un système informatique de stockage",
                                "Une étape temporelle dans la journée"
                            ]
                        },
                        {
                            "question": "Q4. Quel est le principal défaut de l'approche ISO 9001 classique dans un projet SIRH ?",
                            "answers": [
                                "La sur-documentation et la rigidité administrative déconnectée du terrain",
                                "L'absence totale de documentation réglementaire",
                                "La simplicité excessive de ses modèles"
                            ]
                        },
                        {
                            "question": "Q5. Que déclenche une promotion interne au niveau des processus RH ?",
                            "answers": [
                                "Une cascade de processus interconnectés (Mobilité, Administration, Paie, GTA, Performance)",
                                "Uniquement le processus de recrutement externe",
                                "Aucun processus RH, c'est une décision purement managériale"
                            ]
                        }
                    ])
                ],
                "header": "Évaluation Finale (Notée)"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "Évaluation Finale (Notée)"
            },
            "subContentId": create_id()
        }
    ]

    return {
        "showCoverPage": True,
        "bookCover": {
            "coverDescription": "<p style=\"text-align: center;\">Cours complet : Processus RH et BPMN</p>",
            "coverMedium": {
                "library": "H5P.Image 1.1",
                "metadata": {
                    "contentType": "Image",
                    "license": "U",
                    "title": "Couverture"
                },
                "params": {
                    "contentName": "Image",
                    "decorative": False,
                    "alt": "Couverture du cours",
                    "file": {
                        "path": "images/cover.jpg",
                        "mime": "image/jpeg",
                        "width": 1024,
                        "height": 1024,
                        "copyright": {"license": "U"}
                    },
                    "expandImage": "Agrandir l'image",
                    "minimizeImage": "Réduire l'image"
                },
                "subContentId": create_id()
            }
        },
        "chapters": chapters,
        "behaviour": {
            "defaultTableOfContents": True,
            "progressIndicators": True,
            "progressAuto": True,
            "displaySummary": True,
            "baseColor": "#2563eb",
            "enableRetry": True,
            "showSummaryPage": True,
            "enableFeedback": True
        },
        "read": "Lire le livre",
        "displayTOC": "Afficher la table des matières",
        "hideTOC": "Masquer la table des matières",
        "nextPage": "Page suivante",
        "previousPage": "Page précédente",
        "chapterCompleted": "Page complétée !",
        "partCompleted": "@pages sur @total complétées",
        "incompleteChapter": "Page incomplète",
        "navigateToTop": "Retourner en haut",
        "markAsFinished": "J'ai terminé cette page",
        "fullscreen": "Plein écran",
        "exitFullscreen": "Quitter le plein écran",
        "bookProgressSubtext": "@count sur @total pages",
        "interactionsProgressSubtext": "@count sur @total interactions",
        "submitReport": "Soumettre le rapport",
        "restartLabel": "Recommencer",
        "summaryHeader": "Résumé",
        "allInteractions": "Toutes les interactions",
        "unansweredInteractions": "Interactions sans réponse",
        "scoreText": "@score / @maxscore",
        "leftOutOfTotalCompleted": "@left sur @max interactions complétées",
        "noInteractions": "Aucune interaction",
        "score": "Score",
        "summaryAndSubmit": "Résumé & soumission",
        "noChapterInteractionBoldText": "Vous n'avez interagi avec aucune page.",
        "noChapterInteractionText": "Vous devez interagir avec au moins une page avant de pouvoir voir le résumé.",
        "yourAnswersAreSubmittedForReview": "Vos réponses ont été soumises pour examen !",
        "bookProgress": "Progression dans le livre",
        "interactionsProgress": "Progression des interactions",
        "a11y": {
            "progress": "Page @page sur @total.",
            "menu": "Basculer le menu de navigation"
        },
        "totalScoreLabel": "Score total"
    }



def main():
    print("Starting H5P building process with packaged libraries...")
    temp_dir = "h5p_temp"

    # Clean previous temp folder if it exists
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

    # Create folder structure
    os.makedirs(temp_dir)
    os.makedirs(os.path.join(temp_dir, "content"))
    os.makedirs(os.path.join(temp_dir, "content", "images"))

    # Copy images and ensure they are JPEGs
    print("Copying generated images...")
    for target_name, src_path in IMAGE_SOURCES.items():
        if os.path.exists(src_path):
            shutil.copy(src_path, os.path.join(temp_dir, "content", "images", target_name))
            print(f"Copied {src_path} -> {target_name}")
        else:
            print(f"WARNING: Image source not found: {src_path}")

    # Declare required libraries to extract from test.h5p (excluding H5P.Column which comes from column_hub.h5p)
    required_libraries = [
        "FontAwesome-4.5",
        "H5P.AdvancedText-1.1",
        "H5P.Components-1.0",
        "H5P.FontIcons-1.0",
        "H5P.Image-1.1",
        "H5P.InteractiveBook-1.15",
        "H5P.JoubelUI-1.3",
        "H5P.Question-1.5",
        "H5P.SingleChoiceSet-1.11",
        "H5P.Transition-1.0",
        "jQuery.ui-1.10"
    ]

    h5p_hub_file = "test.h5p"
    if not os.path.exists(h5p_hub_file):
        print("Template package test.h5p not found. Downloading...")
        h5p_hub_url = "https://hub-api.h5p.org/v1/content-types/H5P.InteractiveBook"
        urllib.request.urlretrieve(h5p_hub_url, h5p_hub_file)

    column_hub_file = "column_hub.h5p"
    if not os.path.exists(column_hub_file):
        print("Column package column_hub.h5p not found. Downloading...")
        column_hub_url = "https://hub-api.h5p.org/v1/content-types/H5P.Column"
        urllib.request.urlretrieve(column_hub_url, column_hub_file)

    print("Extracting library folders from test.h5p...")
    with zipfile.ZipFile(h5p_hub_file, 'r') as z:
        for name in z.namelist():
            for lib in required_libraries:
                if name.startswith(lib + "/"):
                    z.extract(name, temp_dir)
                    break

    print("Extracting H5P.Column-1.22 from column_hub.h5p...")
    with zipfile.ZipFile(column_hub_file, 'r') as z:
        for name in z.namelist():
            if name.startswith("H5P.Column-1.22/"):
                z.extract(name, temp_dir)

    # Generate metadata (h5p.json) with strictly String type version variables
    h5p_metadata = {
        "title": "Comprendre, analyser et modéliser les processus RH avec BPMN",
        "language": "fr",
        "mainLibrary": "H5P.InteractiveBook",
        "embedTypes": ["iframe"],
        "license": "U",
        "defaultLanguage": "fr",
        "preloadedDependencies": [
            { "machineName": "FontAwesome", "majorVersion": "4", "minorVersion": "5" },
            { "machineName": "H5P.AdvancedText", "majorVersion": "1", "minorVersion": "1" },
            { "machineName": "H5P.Column", "majorVersion": "1", "minorVersion": "22" },
            { "machineName": "H5P.Components", "majorVersion": "1", "minorVersion": "0" },
            { "machineName": "H5P.FontIcons", "majorVersion": "1", "minorVersion": "0" },
            { "machineName": "H5P.Image", "majorVersion": "1", "minorVersion": "1" },
            { "machineName": "H5P.InteractiveBook", "majorVersion": "1", "minorVersion": "15" },
            { "machineName": "H5P.JoubelUI", "majorVersion": "1", "minorVersion": "3" },
            { "machineName": "H5P.Question", "majorVersion": "1", "minorVersion": "5" },
            { "machineName": "H5P.SingleChoiceSet", "majorVersion": "1", "minorVersion": "11" },
            { "machineName": "H5P.Transition", "majorVersion": "1", "minorVersion": "0" },
            { "machineName": "jQuery.ui", "majorVersion": "1", "minorVersion": "10" }
        ]
    }

    print("Writing h5p.json...")
    with open(os.path.join(temp_dir, "h5p.json"), "w", encoding="utf-8") as f:
        json.dump(h5p_metadata, f, ensure_ascii=False, indent=2)

    # Generate content (content/content.json)
    print("Writing content.json...")
    h5p_content = generate_content_json()
    with open(os.path.join(temp_dir, "content", "content.json"), "w", encoding="utf-8") as f:
        json.dump(h5p_content, f, ensure_ascii=False, indent=2)

    # Create ZIP archive (and rename as .h5p)
    os.makedirs("h5p", exist_ok=True)
    h5p_filename = os.path.join("h5p", "bpmn_course_rh.h5p")
    print(f"Creating H5P archive: {h5p_filename}...")
    
    # We zip everything INSIDE temp_dir into the archive
    with zipfile.ZipFile(h5p_filename, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Store it with path relative to the temp_dir root, ALWAYS using forward slashes
                arcname = os.path.relpath(file_path, temp_dir).replace('\\', '/')
                zip_file.write(file_path, arcname)

    # Clean up temp folder
    shutil.rmtree(temp_dir, ignore_errors=True)
    print("H5P build completed successfully!")


if __name__ == "__main__":
    main()
