import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Local illustrations to copy and package
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "ch1_definition.jpg": os.path.join("illustrations", "chapter1", "ch1_definition.png"),
    "ch1_stairs.jpg": os.path.join("illustrations", "chapter1", "ch1_stairs.png"),
    "m3_comparison.jpg": os.path.join("illustrations", "course_rh", "m3_comparison.png"),
    "ch1_confusion.jpg": os.path.join("illustrations", "chapter1", "ch1_confusion.png"),
    "ch1_transition.jpg": os.path.join("illustrations", "chapter1", "ch1_transition.png")
}

# Academic and highly visual content templates for the 7 screens (120-160 words each)
INTRO_TEXT = """
<h2>Pourquoi parler de processus ?</h2>
<p>Dans une organisation, le travail ne se réalise pas par magie. Il s'organise à travers des enchaînements d'actions coordonnés qui transforment une demande initiale en résultat concret. C'est ce qu'on appelle un processus.</p>
<p>Pensez à des situations courantes : traiter une absence, valider une facture, commander du matériel ou intégrer un nouveau collaborateur. Chacune de ces actions traverse plusieurs services (RH, DSI, Finance) et demande des règles précises pour éviter le chaos.</p>
<p>Le processus permet de rendre visible ce qui est souvent implicite : qui doit agir ? quand ? avec quelles données ? et pour quel résultat ?</p>
<p>Pour votre future carrière, savoir analyser un processus est un atout stratégique. Cela vous permettra de mieux piloter vos projets, de dialoguer efficacement avec les équipes techniques et d'éviter de subir les contraintes des logiciels en adaptant l'outil au travail réel.</p>
"""

INTRO_EX = """
<p><strong>Exemple de terrain :</strong> Imaginez l'arrivée d'un salarié. Sans processus d'intégration (onboarding), le manager oublie de demander le PC, les RH d'établir le contrat, et le salarié passe sa première journée sans accès ni matériel. Un processus clair attribue chaque tâche à un acteur précis dès la validation de l'embauche.</p>
"""

DEF_TEXT = """
<h2>Définition d'un processus</h2>
<p>Pour analyser le travail, il faut s'accorder sur une définition solide. En gestion des organisations, un processus est un ensemble structuré d'activités liées entre elles, déclenché par un événement précis, qui mobilise des acteurs et des ressources (données, documents, outils) pour produire un résultat mesurable apportant de la valeur à un client interne ou externe.</p>
<p>Chaque processus est composé de briques fondamentales :</p>
<ul>
  <li><strong>Le Déclencheur</strong> : L'événement de départ (ex: une alerte).</li>
  <li><strong>Les Entrées</strong> : Les données ou documents de départ (ex: un formulaire).</li>
  <li><strong>Les Activités</strong> : Les étapes de transformation (ex: valider, rédiger).</li>
  <li><strong>Les Décisions</strong> : Les règles logiques (ex: seuil budgétaire).</li>
  <li><strong>Les Acteurs</strong> : Les rôles responsables de chaque action.</li>
  <li><strong>Les Sorties et le Résultat</strong> : Ce qui est produit de façon mesurable.</li>
</ul>
"""

DEF_EX = """
<p><strong>Exemple concret :</strong> Pour une demande de congé, le déclencheur est la saisie des dates par le salarié. Les entrées sont le solde de congés restants. L'activité est l'évaluation par le manager. La règle de décision vérifie si l'équipe est assez nombreuse. La sortie est la notification envoyée. Le résultat final est la mise à jour du planning d'équipe.</p>
"""

DIFF_TEXT = """
<h2>Tâche, activité, procédure, workflow et projet</h2>
<p>Il est fréquent de confondre les termes liés à l'organisation du travail. Pour collaborer efficacement avec les RH, la DSI ou les éditeurs d'outils, vous devez utiliser le bon vocabulaire :</p>
<ul>
  <li><strong>La Tâche</strong> : Action élémentaire et isolée (ex: cliquer sur un bouton de validation).</li>
  <li><strong>L'Activité</strong> : Regroupement de tâches logiques (ex: contrôler la cohérence des justificatifs).</li>
  <li><strong>La Procédure</strong> : Mode d'emploi écrit décrivant comment faire (ex: la note interne expliquant comment poser un congé).</li>
  <li><strong>Le Processus</strong> : Enchaînement global de bout en bout, répétable et permanent (ex: gérer le cycle complet des absences).</li>
  <li><strong>Le Workflow</strong> : Circulation automatisée des flux au sein d'un outil (ex: le routage informatique d'une demande du salarié au manager).</li>
  <li><strong>Le Projet</strong> : Démarche temporaire et unique visant à produire un changement (ex: déployer un nouvel outil de GTA).</li>
</ul>
"""

DIFF_EX = """
<p><strong>Exemple concret :</strong> Si vous devez mettre en place un outil de gestion des absences, vous menez un <strong>projet</strong> (temporaire). Ce projet va concevoir le <strong>processus</strong> cible de gestion des temps, formaliser les <strong>procédures</strong> pour guider les utilisateurs, et paramétrer le <strong>workflow</strong> informatique pour automatiser les validations.</p>
"""

UTILE_TEXT = """
<h2>Pourquoi analyser les processus ?</h2>
<p>L'analyse des processus n'est pas un exercice bureaucratique. C'est le fondement de la performance opérationnelle et du bien-être des équipes au quotidien. Un processus bien conçu permet de :</p>
<ul>
  <li><strong>Clarifier les rôles</strong> : Chacun sait exactement ce qu'il a à faire et quand.</li>
  <li><strong>Réduire les délais</strong> : En éliminant les étapes inutiles ou redondantes.</li>
  <li><strong>Fiabiliser les données</strong> : Moins de ressaisies manuelles signifie moins d'erreurs de paie ou de budget.</li>
  <li><strong>Améliorer l'expérience collaborateur</strong> : Des flux rapides et transparents créent de la confiance.</li>
</ul>
<blockquote>
  <strong>« Un processus n’est pas une prison administrative. C’est une carte : elle permet de comprendre le chemin, de repérer les détours inutiles et d’éviter de perdre tout le monde en route. »</strong>
</blockquote>
<p>Pour votre carrière, maîtriser cette compétence vous donne une posture de conseil recherchée : vous ne subissez pas l'organisation, vous l'optimisez.</p>
"""

UTILE_EX = """
<p><strong>Exemple de terrain :</strong> Sans processus analysé, le service RH reçoit 150 e-mails par jour pour des questions diverses, sans ordre de priorité. En définissant un processus de support RH avec un formulaire dédié et un circuit d'affectation automatique, le temps de réponse moyen passe de 5 jours à 4 heures.</p>
"""

FAIL_TEXT = """
<h2>Les signes d'un processus mal maîtrisé</h2>
<p>Comment repérer un processus en souffrance ? Sur le terrain, les symptômes sont constants et nuisent directement à l'ambiance de travail. Voici les signaux d'alerte majeurs à surveiller :</p>
<ul>
  <li><strong>Le flou des responsabilités</strong> : Le fameux « je pensais que c'était toi qui le faisais ».</li>
  <li><strong>Les saisies multiples</strong> : Saisir le même numéro de sécurité sociale dans trois outils différents.</li>
  <li><strong>L'empire Excel</strong> : La prolifération de fichiers de suivi parallèles car personne ne fait confiance à l'outil officiel.</li>
  <li><strong>Les relances permanentes</strong> : Rien ne bouge sans envoyer de mail de rappel ou téléphoner.</li>
  <li><strong>L'apprentissage par rumeur</strong> : Les nouveaux arrivants découvrent comment travailler en posant des questions au hasard dans les couloirs.</li>
</ul>
"""

FAIL_EX = """
<p><strong>Exemple concret :</strong> Dans une entreprise sans processus de formation structuré, les demandes se font par e-mail libre. Le manager oublie d'y répondre, le RH saisit ce qu'il peut dans un tableau Excel local. À la fin de l'année, le budget formation est dépassé de 20% car plusieurs fichiers de suivi contradictoires circulaient.</p>
"""

QUEST_TEXT = """
<h2>Les premières questions à poser</h2>
<p>L'analyse de processus n'est pas une théorie abstraite. C'est une démarche d'enquête sur le terrain. Votre premier réflexe ne doit pas être de lire la documentation officielle (souvent périmée), mais d'observer et d'interroger les acteurs réels dans leur quotidien.</p>
<p>Pour disséquer un processus, voici les questions clés à poser :</p>
<ol>
  <li>Quel est le **déclencheur exact** de votre action ?</li>
  <li>Quelles **informations ou documents** utilisez-vous en entrée ?</li>
  <li>Quelles **activités** réalisez-vous et selon quelles **décisions** ?</li>
  <li>Vers qui et vers quel outil envoyez-vous le résultat ?</li>
  <li>Quels sont les **délais réels** et les **irritants majeurs** (pain points) ?</li>
</ol>
<blockquote>
  <strong>« Le processus officiel est souvent propre et idéal. Le processus réel, lui, a parfois vécu. C’est justement lui qu’il faut comprendre pour l'améliorer. »</strong>
</blockquote>
"""

QUEST_EX = """
<p><strong>Mini-cas d'application :</strong> Un collaborateur demande une attestation employeur. Il envoie un e-mail à l'administration RH. Le gestionnaire RH vérifie les informations dans le Core RH, prépare l'attestation sous Word, la fait signer au directeur RH, la scanne et la renvoie par e-mail au collaborateur.</p>
"""

TRANS_TEXT = """
<h2>Transition vers les processus RH</h2>
<p>Pourquoi les processus sont-ils si cruciaux en Ressources Humaines ? La fonction RH manipule en permanence des données personnelles sensibles, des obligations légales strictes (contrats, déclarations), des règles financières (paie) et des flux de validation complexes impliquant managers et collaborateurs.</p>
<p>Voici les grands processus RH que nous explorerons dans le chapitre suivant :</p>
<ul>
  <li>Le recrutement et l'onboarding</li>
  <li>L'administration du personnel et la gestion des temps (GTA)</li>
  <li>La paie et la rémunération</li>
  <li>Le développement des compétences (formation, entretiens)</li>
  <li>L'offboarding (les sorties)</li>
</ul>
<p>En RH, une simple action a un effet domino. Une embauche réussie doit immédiatement nourrir le dossier administratif, équiper le collaborateur, paramétrer ses congés et déclencher sa paie.</p>
<blockquote>
  <strong>« En RH, un processus mal conçu ne crée pas seulement du retard : il engendre des erreurs de paie, de la frustration et des risques juridiques majeurs. »</strong>
</blockquote>
"""

TRANS_SYNTHESE = """
<h3>Synthèse finale du chapitre :</h3>
<table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th>Point Clé</th>
      <th>Ce qu'il faut retenir</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Transformation</strong></td>
      <td>Un processus transforme un événement déclencheur en un résultat mesurable.</td>
    </tr>
    <tr>
      <td><strong>2. Composants</strong></td>
      <td>Il implique des acteurs, des données, des décisions logiques et des outils.</td>
    </tr>
    <tr>
      <td><strong>3. Vocabulaire</strong></td>
      <td>Il ne faut pas confondre processus, tâche, procédure, workflow et projet.</td>
    </tr>
    <tr>
      <td><strong>4. Analyse</strong></td>
      <td>Observer le processus réel permet de repérer les irritants et les goulots d'étranglement.</td>
    </tr>
    <tr>
      <td><strong>5. Focus RH</strong></td>
      <td>Les processus RH sont interconnectés et ont un impact direct sur la paie et la législation.</td>
    </tr>
  </tbody>
</table>
"""

TRANS_EX = """
<p><strong>Activité de réflexion finale :</strong><br>
Pensez à une activité courante que vous avez vécue dans une organisation (s'inscrire à l'université, commander un produit, demander un remboursement). Identifiez mentalement le déclencheur, les acteurs impliqués et le résultat final.</p>
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

    chapters = [
        # Chapter 1: Introduction
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Intro Text", INTRO_TEXT),
                    make_image_item("Intro Guide", "images/cover.jpg", "Guide XIRH Academy - Golden Retriever low-poly dans le ciel géométrique"),
                    make_text_item("Intro Example", INTRO_EX),
                    make_single_choice_set("Intro Quiz", [
                        {
                            "question": "Un processus sert-il uniquement à automatiser une activité ?",
                            "answers": [
                                "Faux. Un processus peut être entièrement manuel, partiel ou automatisé. L'important est d'abord de comprendre l'enchaînement des actions.",
                                "Vrai. Si un processus n'est pas automatisé par un outil informatique, il n'a aucune valeur pour l'organisation."
                            ]
                        }
                    ])
                ],
                "header": "1. Pourquoi parler de processus ?"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "1. Pourquoi parler de processus ?"
            },
            "subContentId": create_id()
        },
        # Chapter 2: Definition académique
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Def Text", DEF_TEXT),
                    make_image_item("Def Diagram", "images/ch1_definition.jpg", "Schéma des étapes d'un processus : Déclencheur, Entrées, Activités, Décisions, Sorties, Résultat"),
                    make_text_item("Def Example", DEF_EX),
                    make_single_choice_set("Def Quiz", [
                        {
                            "question": "Quel élément parmi les suivants n'est pas indispensable pour définir un processus ?",
                            "answers": [
                                "Un logiciel informatique spécialisé.",
                                "Un événement déclencheur.",
                                "Un résultat attendu et mesurable.",
                                "Un ensemble d'activités coordonnées."
                            ]
                        }
                    ])
                ],
                "header": "2. Définition académique"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "2. Définition académique"
            },
            "subContentId": create_id()
        },
        # Chapter 3: Vocabulaire
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Diff Text", DIFF_TEXT),
                    make_image_item("Diff Stairs", "images/ch1_stairs.jpg", "Escalier des niveaux : Tâche, Activité, Procédure, Processus, Workflow et Projet"),
                    make_text_item("Diff Example", DIFF_EX),
                    make_single_choice_set("Diff Classification Quiz", [
                        {
                            "question": "Comment classer l'action : 'Envoyer un e-mail au manager' ?",
                            "answers": [
                                "Tâche (Action élémentaire et isolée)",
                                "Processus (Enchaînement de bout en bout)",
                                "Projet (Démarche temporaire et unique)",
                                "Procédure (Note ou mode d'emploi)",
                                "Workflow (Circulation automatisée)"
                            ]
                        },
                        {
                            "question": "Comment classer l'action : 'Traiter une demande de formation de A à Z' ?",
                            "answers": [
                                "Processus (Enchaînement de bout en bout)",
                                "Tâche (Action élémentaire)",
                                "Projet (Démarche temporaire)",
                                "Procédure (Note explicative)",
                                "Workflow (Circulation automatique)"
                            ]
                        },
                        {
                            "question": "Comment classer l'action : 'Déployer un nouvel outil SIRH' ?",
                            "answers": [
                                "Projet (Démarche temporaire avec un livrable unique)",
                                "Tâche (Action isolée)",
                                "Processus (Flux permanent)",
                                "Procédure (Mode d'emploi)",
                                "Workflow (Routage des tâches)"
                            ]
                        },
                        {
                            "question": "Comment classer l'action : 'Rédiger une note expliquant les étapes pour poser un congé' ?",
                            "answers": [
                                "Procédure (Support explicatif décrivant le fonctionnement)",
                                "Tâche (Action simple)",
                                "Processus (Flux permanent)",
                                "Projet (Démarche unique)",
                                "Workflow (Routage automatisé)"
                            ]
                        },
                        {
                            "question": "Comment classer l'action : 'Acheminer automatiquement la demande validée vers le service Paie' ?",
                            "answers": [
                                "Workflow (Circulation organisée et automatisée des flux)",
                                "Tâche (Action manuelle)",
                                "Processus (Chaîne globale)",
                                "Projet (Action temporaire)",
                                "Procédure (Description textuelle)"
                            ]
                        }
                    ])
                ],
                "header": "3. Ne pas confondre les notions"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "3. Ne pas confondre les notions"
            },
            "subContentId": create_id()
        },
        # Chapter 4: Utilité
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Utile Text", UTILE_TEXT),
                    make_image_item("Utile Maze", "images/m3_comparison.jpg", "Labyrinthe low-poly représentant la clarté opérationnelle"),
                    make_text_item("Utile Example", UTILE_EX),
                    make_single_choice_set("Utile Quiz", [
                        {
                            "question": "Parmi les propositions suivantes, quel est le bénéfice principal d'une analyse rigoureuse des processus ?",
                            "answers": [
                                "Clarifier les rôles, fiabiliser les données et éliminer les étapes superflues.",
                                "Remplacer l'intégralité des collaborateurs par des systèmes automatisés.",
                                "Créer des procédures administratives les plus longues et complexes possibles.",
                                "Forcer l'achat du logiciel SIRH le plus cher du marché."
                            ]
                        }
                    ])
                ],
                "header": "4. Utilité des processus"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "4. Utilité des processus"
            },
            "subContentId": create_id()
        },
        # Chapter 5: Signes d'un processus mal maîtrisé
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Fail Text", FAIL_TEXT),
                    make_image_item("Fail Confusion", "images/ch1_confusion.jpg", "Scène de bureau confuse avec post-it et flèches contradictoires"),
                    make_text_item("Fail Example", FAIL_EX),
                    make_single_choice_set("Fail Quiz", [
                        {
                            "question": "Lequel de ces symptômes est un indicateur typique d'un processus mal maîtrisé ?",
                            "answers": [
                                "La multiplication des fichiers Excel parallèles pour combler les faiblesses des outils officiels.",
                                "L'existence d'étapes de validation claires et mesurées dans le temps.",
                                "Le partage d'une base de données unique et fiable entre les services.",
                                "L'absence de relances manuelles pour faire avancer les dossiers."
                            ]
                        }
                    ])
                ],
                "header": "5. Les signes de mauvaise maîtrise"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "5. Les signes de mauvaise maîtrise"
            },
            "subContentId": create_id()
        },
        # Chapter 6: Premières questions d'analyse
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Quest Text", QUEST_TEXT),
                    make_text_item("Quest Case Study", QUEST_EX),
                    make_single_choice_set("Quest Case Quiz", [
                        {
                            "question": "Dans le mini-cas de l'attestation employeur ci-dessus, quel est l'événement déclencheur ?",
                            "answers": [
                                "La réception de l'e-mail de demande envoyé par le collaborateur.",
                                "La signature physique du document par le directeur RH.",
                                "La modification des données du contrat dans le Core RH.",
                                "La création du document Word par le gestionnaire RH."
                            ]
                        }
                    ])
                ],
                "header": "6. Premiers réflexes d'analyse"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "6. Premiers réflexes d'analyse"
            },
            "subContentId": create_id()
        },
        # Chapter 7: Transition RH et Synthèse
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Trans Text", TRANS_TEXT),
                    make_image_item("Trans Panels", "images/ch1_transition.jpg", "Panneaux flottants interconnectés : Recrutement, Onboarding, Paie, etc."),
                    make_text_item("Trans Synthese", TRANS_SYNTHESE),
                    make_text_item("Trans Example", TRANS_EX),
                    make_single_choice_set("Final QCM Evaluation", [
                        {
                            "question": "Pourquoi les processus RH sont-ils considérés comme particulièrement sensibles ?",
                            "answers": [
                                "Ils touchent directement à des données personnelles, à la paie et à la conformité juridique.",
                                "Ils sont obligatoirement gérés par des intelligences artificielles sans contrôle humain.",
                                "Ils ne contiennent jamais d'activités ni d'acteurs identifiés."
                            ]
                        },
                        {
                            "question": "Quelle est la différence fondamentale entre un processus et un projet ?",
                            "answers": [
                                "Le processus est répétable et permanent ; le projet est temporaire et unique.",
                                "Le processus est obligatoire ; le projet est toujours facultatif.",
                                "Le processus utilise des ordinateurs ; le projet se fait uniquement à la main."
                            ]
                        },
                        {
                            "question": "Que permet de mettre en lumière l'analyse d'un processus existant (AS-IS) ?",
                            "answers": [
                                "Les irritants, les goulots d'étranglement et les doubles saisies d'informations.",
                                "Le nom du meilleur logiciel disponible sur le marché.",
                                "L'historique complet de la création de la fonction RH."
                            ]
                        }
                    ]),
                    make_text_item("Final reflection comment", "<p><em>Activité de réflexion : Vous venez d'appliquer le premier réflexe d'analyse processus : transformer une situation fluide en chaîne d'actions observables. Le prochain chapitre appliquera cette méthodologie aux processus RH réels.</em></p>")
                ],
                "header": "7. Transition vers les processus RH"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "7. Transition vers les processus RH"
            },
            "subContentId": create_id()
        }
    ]

    return {
        "showCoverPage": True,
        "bookCover": {
            "coverDescription": "<p style=\"text-align: center;\">Chapitre 1 : Définition, utilité et premiers réflexes d'analyse des processus</p>",
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
                    "alt": "Couverture du cours - Chien dans le ciel",
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
    print("Starting H5P Chapter 1 building process with packaged libraries...")
    temp_dir = "h5p_temp_ch1"

    # Clean previous temp folder if it exists
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir, ignore_errors=True)

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

    # Generate metadata (h5p.json)
    h5p_metadata = {
        "title": "Comprendre les processus : définition, utilité et premiers réflexes d’analyse",
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
    h5p_filename = os.path.join("h5p", "bpmn_chapter1_intro.h5p")
    print(f"Creating H5P archive: {h5p_filename}...")
    
    with zipfile.ZipFile(h5p_filename, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Store it with path relative to the temp_dir root, ALWAYS using forward slashes
                arcname = os.path.relpath(file_path, temp_dir).replace('\\', '/')
                zip_file.write(file_path, arcname)

    # Clean up temp folder
    shutil.rmtree(temp_dir, ignore_errors=True)
    print("H5P Chapter 1 build completed successfully!")


if __name__ == "__main__":
    main()
