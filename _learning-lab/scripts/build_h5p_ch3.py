import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Local illustrations to copy and package
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "ch3_intro.jpg": os.path.join("illustrations", "chapter3", "ch3_intro.png"),
    "ch3_chaos.jpg": os.path.join("illustrations", "chapter3", "ch3_chaos.png"),
    "ch3_symbols.jpg": os.path.join("illustrations", "chapter3", "ch3_symbols.png"),
    "ch3_lanes.jpg": os.path.join("illustrations", "chapter3", "ch3_lanes.png"),
    "ch3_vacation.jpg": os.path.join("illustrations", "chapter3", "ch3_vacation.png"),
    "ch3_onboarding.jpg": os.path.join("illustrations", "chapter3", "ch3_onboarding.png"),
    "ch3_tools.jpg": os.path.join("illustrations", "chapter3", "ch3_tools.png"),
    "ch3_errors.jpg": os.path.join("illustrations", "chapter3", "ch3_errors.png")
}

# Web page contents (130-180 words each, clear, structured, pedagogical HTML)
INTRO_TEXT = """
<h2>Pourquoi parler de BPMN ?</h2>
<p>Dans une organisation, les processus RH sont souvent flous, dispersés ou compris différemment selon les acteurs. Le collaborateur voit sa demande, le manager voit sa validation, les RH gèrent le suivi et la DSI s'assure de la sécurité. Sans un langage commun, chaque projet SIRH risque de devenir un malentendu géant.</p>
<p>BPMN (Business Process Model and Notation) résout ce problème. C'est une notation graphique universelle qui sert à représenter visuellement les processus métier de façon claire et structurée. Il ne s'agit pas de jolis dessins de décoration, mais d'un outil d'analyse et de clarification pour tous.</p>
<p>Savoir lire un diagramme BPMN simple permet de mieux collaborer, d'identifier les goulets d'étranglement, de documenter le travail réel (AS-IS) et de concevoir des parcours cibles optimisés (TO-BE) avec les équipes techniques.</p>
"""

INTRO_EX = """
<p><strong>Exemple concret :</strong> Si une demande de congé est décrite uniquement en texte dans une longue procédure de 5 pages, chaque acteur en aura une interprétation différente. Avec un diagramme BPMN, on voit immédiatement qui démarre, qui prend les décisions, où intervient le système (GTA) et comment la paie est alimentée en sortie.</p>
"""

WHATBPMN_TEXT = """
<h2>Ce que BPMN représente vraiment</h2>
<p>Un diagramme BPMN représente un processus sous forme de flux ordonné. Il modélise le cheminement logique des activités et des informations depuis un événement de départ (déclencheur) jusqu'à un ou plusieurs événements de fin (résultats).</p>
<p>BPMN permet de visualiser : 1. Le déclencheur initial, 2. Les activités réalisées (qui fait quoi), 3. Les règles de décision (aiguillages), 4. Les acteurs impliqués, 5. Les documents ou données échangés, 6. Le résultat final mesurable.</p>
<p>Un bon diagramme BPMN se lit généralement de gauche à droite ou de haut en bas. Il ne cherche pas à être exhaustif : il représente le juste niveau de détail nécessaire pour que le processus soit compris, partagé et exploitable par l'organisation.</p>
"""

WHATBPMN_EX = """
<p><strong>Exemple de terrain :</strong> Dans une demande de formation, le diagramme modélise graphiquement le flux logique : la saisie du souhait par le collaborateur, la validation de la pertinence par son manager, le contrôle du budget par le service formation RH, et enfin l'inscription définitive ou le refus.</p>
"""

SYM_TEXT = """
<h2>Les symboles de base</h2>
<p>Pour lire et concevoir 90% des processus RH, quatre familles de symboles de base suffisent largement. Il n'est pas nécessaire de maîtriser toute la complexité de la norme BPMN 2.0 pour être utile en projet.</p>
<p>Voici ces quatre éléments fondamentaux à retenir :</p>
<ul>
  <li><strong>Événement (Cercle)</strong> : Indique quelque chose qui arrive et déclenche ou conclut le flux (ex: demande reçue, fin du mois).</li>
  <li><strong>Activité (Rectangle arrondi)</strong> : Représente une action ou tâche à accomplir (ex: valider la demande, rédiger le contrat).</li>
  <li><strong>Gateway / Passerelle (Losange)</strong> : Matérialise un aiguillage ou une règle de décision (ex: solde OK ?, accepté ?).</li>
  <li><strong>Flux de séquence (Flèche)</strong> : Indique l'ordre chronologique d'exécution des étapes.</li>
</ul>
"""

SYM_EX = """
<p><strong>Exemple concret :</strong> Pour valider une prime, le processus commence par un cercle (événement : campagne de révision lancée), passe par un rectangle (activité : saisir le montant), arrive sur un losange (décision : montant conforme au budget ?) et se termine par un double cercle (événement de fin : prime validée).</p>
"""

LANES_TEXT = """
<h2>Les acteurs : couloirs (Lanes) et responsabilités</h2>
<p>Un processus RH implique presque toujours plusieurs services ou acteurs. En BPMN, on utilise des couloirs de responsabilité, appelés <strong>Lanes</strong>, pour organiser visuellement qui réalise quelle tâche.</p>
<p>Dans un processus RH, les couloirs typiques représentent : le Collaborateur, le Manager opérationnel, le Gestionnaire RH, la Paie, et parfois la DSI ou le Système SIRH lui-même. Chaque activité (rectangle) est placée précisément dans le couloir de l'acteur responsable de sa réalisation.</p>
<p>Cette structuration graphique permet d'identifier en un coup d'œil où se font les passages de relais, qui prend les décisions clés, et où peuvent se situer les risques de retard ou de déconnexion de flux.</p>
"""

LANES_EX = """
<p><strong>Exemple de terrain :</strong> Lors d'une demande de congé, le collaborateur agit dans sa lane (soumission), le système GTA agit dans la sienne (contrôle automatique du solde), puis le manager intervient dans son propre couloir (validation finale). On visualise instantanément le parcours de la demande.</p>
"""

VACATION_TEXT = """
<h2>Exemple guidé : La demande de congé</h2>
<p>Analysons un processus simple et universel modélisé en BPMN : la demande de congé. Ce diagramme intègre des couloirs pour séparer le Collaborateur, le Système GTA (SIRH), et le Manager.</p>
<p>Le flux suit les étapes suivantes : 1. Le collaborateur soumet sa demande (Événement de début), 2. Le système GTA contrôle le solde disponible (Activité). C'est le premier aiguillage (Gateway) : si le solde est insuffisant, le flux va vers une fin (demande refusée). Si le solde est suffisant, la demande est envoyée au Manager (Activité).</p>
<p>3. Le manager valide ou refuse (Gateway). Le flux se sépare à nouveau. Si la demande est acceptée, le planning est mis à jour (Activité). Enfin, une notification est envoyée au collaborateur (Événement de fin).</p>
"""

VACATION_EX = """
<p><strong>Exemple concret :</strong> Grâce au diagramme, le gestionnaire RH constate que si le solde est insuffisant, le manager n'est même pas sollicité : le processus se termine automatiquement en refus. Cela évite au manager de perdre du temps à traiter des demandes non conformes réglementairement.</p>
"""

ONBOARD_TEXT = """
<h2>Exemple guidé : L'onboarding collaborateur</h2>
<p>Contrairement à une demande de congé, l'onboarding (intégration) est un processus transversal complexe. Il implique de nombreux acteurs (RH, Manager, DSI, Services généraux) et des actions parallèles qui doivent être menées de front.</p>
<p>Le diagramme BPMN montre que dès que l'embauche est validée (Début) : 1. Le service RH rédige le contrat et crée le dossier (Activité dans la lane RH), 2. Parallèlement, le manager renseigne les besoins matériels (lane Manager). C'est ce flux parallèle qui permet à la DSI (lane IT) de préparer les accès et aux services généraux de préparer le badge et le PC.</p>
<p>Le diagramme met en évidence que le processus ne peut se terminer avec succès (Fin) que si l'ensemble de ces chemins parallèles sont complétés.</p>
"""

ONBOARD_EX = """
<p><strong>Exemple concret :</strong> Si le manager ne renseigne pas les besoins à temps, la DSI ne peut pas préparer le poste de travail. Le diagramme BPMN montre visuellement cette dépendance et permet d'éviter que le nouveau collaborateur passe sa première journée sans ordinateur.</p>
"""

TOOLS_TEXT = """
<h2>Les outils de modélisation BPMN</h2>
<p>Pour concevoir des diagrammes BPMN, il existe différentes familles d'outils adaptées à chaque besoin projet et niveau d'expertise.</p>
<ul>
  <li><strong>Dessin simple et collaboratif</strong> (draw.io, Lucidchart, Miro) : Excellents pour débuter, très visuels, collaboratifs et parfaits pour schématiser des parcours pédagogiques simples avec les métiers.</li>
  <li><strong>Modélisation spécialisée</strong> (Bizagi Modeler, Camunda Modeler) : Conçus pour respecter rigoureusement la norme BPMN, documenter précisément les attributs des tâches ou exporter les modèles vers des plateformes techniques.</li>
  <li><strong>Moteurs de workflow et SIRH</strong> : Outils intégrés aux suites logicielles pour exécuter directement le processus modélisé sur le terrain.</li>
</ul>
<p>L'important n'est pas d'utiliser l'outil le plus complexe, mais de privilégier la clarté et la compréhension partagée.</p>
"""

TOOLS_EX = """
<p><strong>Conseil pratique :</strong> Pour un atelier de cadrage avec des managers RH, commencez par un dessin collaboratif simple sur draw.io ou un tableau blanc. La rigueur formelle de la norme s'applique ensuite dans un outil spécialisé (comme Bizagi) lors de la rédaction des spécifications.</p>
"""

ERRORS_TEXT = """
<h2>Les erreurs fréquentes en BPMN</h2>
<p>Un diagramme BPMN mal conçu perd toute son utilité. Pour rester efficace et lisible, vous devez éviter les pièges classiques de modélisation.</p>
<p>Voici les erreurs les plus fréquentes commises par les débutants : 1. Surcharger le diagramme en voulant représenter la moindre micro-tâche informatique, 2. Mélanger les niveaux de détail (mettre côte à côte une grande étape de validation et un clic de souris), 3. Oublier d'indiquer les acteurs dans des couloirs clairs, 4. Laisser des aiguillages (gateways) sans question explicite ni labels sortants ("Oui/Non"), 5. Croiser des flèches dans tous les sens, créant un diagramme illisible.</p>
<p>Un bon diagramme doit rester simple, lisible et adapté à son public.</p>
"""

ERRORS_EX = """
<p><strong>Message de fin :</strong> Un BPMN réussi n'est pas une œuvre d'art abstrait. C'est une passerelle de communication. Si personne ne le comprend, il ne sert à rien.</p>
<br>
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
      <td><strong>1. Langage commun</strong></td>
      <td>BPMN crée un langage visuel unique partagé par les RH, les managers, et la DSI.</td>
    </tr>
    <tr>
      <td><strong>2. Les 4 bases</strong></td>
      <td>Événement (cercle), Activité (rectangle arrondi), Gateway (losange) et Flux (flèche).</td>
    </tr>
    <tr>
      <td><strong>3. Les couloirs (Lanes)</strong></td>
      <td>Permettent de visualiser graphiquement qui fait quoi dans le processus.</td>
    </tr>
    <tr>
      <td><strong>4. Lecture fluide</strong></td>
      <td>Un diagramme suit le flux logique de début à la fin, avec ses aiguillages.</td>
    </tr>
    <tr>
      <td><strong>5. Lisibilité</strong></td>
      <td>Mieux vaut un schéma simple et clair qu'un diagramme trop complexe ou surchargé.</td>
    </tr>
    <tr>
      <td><strong>6. Cadrage SIRH</strong></td>
      <td>Le BPMN sert de base pour identifier les irritants avant d'intégrer un logiciel.</td>
    </tr>
  </tbody>
</table>
<br>
<h3>Mini-exercice d'application :</h3>
<p>Pensez au processus de demande de formation dans votre organisation. Listez le déclencheur (cercle), les 3 ou 4 activités principales (rectangles), le rôle de validation (losange) et la fin (cercle). Vous venez de préparer la structure de votre premier diagramme BPMN !</p>
<br>
<p><strong>Transition vers le chapitre suivant :</strong> Maintenant que nous savons lire et construire des diagrammes simples, comment l'intelligence artificielle peut-elle nous aider ? Dans le prochain chapitre, nous verrons comment l'IA peut analyser, reformuler, documenter ou générer des diagrammes BPMN... mais aussi pourquoi elle ne remplace pas l'expertise métier du terrain.</p>
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
                    make_image_item("Intro Whiteboard", "images/ch3_intro.jpg", "Mascotte XIRH - Golden retriever devant un tableau blanc avec des formes BPMN simples"),
                    make_text_item("Intro Example", INTRO_EX),
                    make_single_choice_set("Intro Quiz", [
                        {
                            "question": "BPMN sert-il uniquement aux informaticiens et développeurs ?",
                            "answers": [
                                "Faux. L'intérêt majeur du BPMN est de créer un langage partagé compréhensible par les métiers (RH, managers, collaborateurs) autant que par la DSI.",
                                "Vrai. C'est une notation informatique purement technique que les opérationnels métier ne doivent jamais regarder."
                            ]
                        }
                    ])
                ],
                "header": "1. Pourquoi BPMN ?"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "1. Pourquoi BPMN ?"
            },
            "subContentId": create_id()
        },
        # Chapter 2: Ce que BPMN représente vraiment
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("WhatBPMN Text", WHATBPMN_TEXT),
                    make_image_item("WhatBPMN Chaos vs Clean", "images/ch3_chaos.jpg", "Visualisation chaos (post-it/mails) à gauche vs diagramme BPMN structuré à droite"),
                    make_text_item("WhatBPMN Example", WHATBPMN_EX),
                    make_single_choice_set("WhatBPMN Reading Quiz", [
                        {
                            "question": "Comment se lit généralement un diagramme BPMN ?",
                            "answers": [
                                "De gauche à droite ou de haut en bas, en suivant le flux de séquence du début à la fin.",
                                "De droite à gauche uniquement, en partant du résultat final pour deviner le déclencheur.",
                                "De manière aléatoire, chaque acteur lisant uniquement son couloir sans se soucier du reste."
                            ]
                        }
                    ])
                ],
                "header": "2. Ce que représente le BPMN"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "2. Ce que représente le BPMN"
            },
            "subContentId": create_id()
        },
        # Chapter 3: Les symboles de base
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Symbols Text", SYM_TEXT),
                    make_image_item("Symbols Map", "images/ch3_symbols.jpg", "Carte des quatre symboles fondamentaux : cercle, rectangle, losange, flèche"),
                    make_text_item("Symbols Example", SYM_EX),
                    make_single_choice_set("Symbols Recognition Quiz", [
                        {
                            "question": "Quel symbole représente une Action ou une Tâche à accomplir (ex: 'Rédiger le contrat') ?",
                            "answers": [
                                "Le rectangle aux bords arrondis (Activité)",
                                "Le cercle (Événement)",
                                "Le losange (Gateway / Passerelle)",
                                "La flèche (Flux de séquence)"
                            ]
                        },
                        {
                            "question": "Quel symbole représente un Déclencheur ou une Fin de processus (ex: 'Demande reçue') ?",
                            "answers": [
                                "Le cercle (Événement)",
                                "Le rectangle aux bords arrondis (Activité)",
                                "Le losange (Gateway / Passerelle)",
                                "La flèche (Flux de séquence)"
                            ]
                        },
                        {
                            "question": "Quel symbole représente une Règle de décision ou un Aiguillage (ex: 'Budget disponible ?') ?",
                            "answers": [
                                "Le losange (Gateway / Passerelle)",
                                "Le cercle (Événement)",
                                "Le rectangle aux bords arrondis (Activité)",
                                "La flèche (Flux de séquence)"
                            ]
                        }
                    ])
                ],
                "header": "3. Les symboles de base"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "3. Les symboles de base"
            },
            "subContentId": create_id()
        },
        # Chapter 4: Les acteurs (pools and lanes)
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Lanes Text", LANES_TEXT),
                    make_image_item("Lanes Map", "images/ch3_lanes.jpg", "Image montrant des lanes (couloirs horizontaux) pour distribuer les actions par acteur"),
                    make_text_item("Lanes Example", LANES_EX),
                    make_single_choice_set("Lanes Quiz", [
                        {
                            "question": "À quoi servent principalement les 'Lanes' (couloirs) dans un diagramme BPMN ?",
                            "answers": [
                                "À identifier clairement quel acteur (collaborateur, manager, RH, système) est responsable de chaque activité.",
                                "À décorer le diagramme avec des lignes horizontales pour le rendre plus esthétique.",
                                "À automatiser la paie directement sans intervention humaine."
                            ]
                        }
                    ])
                ],
                "header": "4. Les acteurs et couloirs"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "4. Les acteurs et couloirs"
            },
            "subContentId": create_id()
        },
        # Chapter 5: Exemple guidé : demande de congé
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Vacation Text", VACATION_TEXT),
                    make_image_item("Vacation Flow", "images/ch3_vacation.jpg", "Diagramme BPMN simplifié du processus de demande de congé avec lanes"),
                    make_text_item("Vacation Example", VACATION_EX),
                    make_single_choice_set("Vacation Quiz", [
                        {
                            "question": "Dans ce processus de demande de congé, à quel moment intervient la première Gateway (décision) ?",
                            "answers": [
                                "Lors du contrôle automatique du solde disponible par le Système GTA (solde suffisant ? Oui / Non).",
                                "Immédiatement après l'envoi de la demande par le collaborateur, avant tout contrôle.",
                                "Uniquement après la décision finale du manager opérationnel."
                            ]
                        }
                    ])
                ],
                "header": "5. Exemple guidé : demande de congé"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "5. Exemple guidé : demande de congé"
            },
            "subContentId": create_id()
        },
        # Chapter 6: Exemple guidé : onboarding collaborateur
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Onboard Text", ONBOARD_TEXT),
                    make_image_item("Onboard Transversal", "images/ch3_onboarding.jpg", "Image illustrant le flux parallèle et transversal des tâches de l'onboarding"),
                    make_text_item("Onboard Example", ONBOARD_EX),
                    make_single_choice_set("Onboard Quiz", [
                        {
                            "question": "Pourquoi le BPMN est-il particulièrement utile pour modéliser l'onboarding ?",
                            "answers": [
                                "Parce qu'il permet de visualiser les activités parallèles menées par les différents services (RH, DSI, manager) et de repérer les dépendances.",
                                "Parce qu'il permet de supprimer automatiquement les réunions d'accueil du premier jour.",
                                "Parce qu'il remplace le contrat de travail du nouveau collaborateur."
                            ]
                        }
                    ])
                ],
                "header": "6. Exemple guidé : onboarding"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "6. Exemple guidé : onboarding"
            },
            "subContentId": create_id()
        },
        # Chapter 7: Les outils de modélisation
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Tools Text", TOOLS_TEXT),
                    make_image_item("Tools Desk", "images/ch3_tools.jpg", "Bureau digital avec trois panneaux : Dessin simple, Modélisation, Automatisation"),
                    make_text_item("Tools Example", TOOLS_EX),
                    make_single_choice_set("Tools Selection Quiz", [
                        {
                            "question": "Quel est le meilleur critère pour choisir un outil de modélisation BPMN pour un projet RH ?",
                            "answers": [
                                "Choisir un outil qui permet de réaliser un diagramme clair, partagé et compris par tous les acteurs du projet.",
                                "Sélectionner le logiciel le plus complexe du marché, même si personne ne sait l'utiliser.",
                                "N'utiliser aucun outil et tout rédiger sous forme de texte brut de 50 pages."
                            ]
                        }
                    ])
                ],
                "header": "7. Outils de modélisation"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "7. Outils de modélisation"
            },
            "subContentId": create_id()
        },
        # Chapter 8: Les erreurs fréquentes
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Errors Text", ERRORS_TEXT),
                    make_image_item("Errors Whiteboard", "images/ch3_errors.jpg", "Tableau blanc montrant un diagramme chaotique à gauche et un diagramme propre à droite"),
                    make_single_choice_set("Errors Best Practices Quiz", [
                        {
                            "question": "Parmi ces pratiques en BPMN, laquelle est une bonne pratique à appliquer systématiquement ?",
                            "answers": [
                                "Formuler les passerelles de décision (gateways) sous forme de question avec des branches nommées (Oui / Non).",
                                "Mettre toutes les activités sur une seule ligne sans utiliser de couloirs d'acteurs (Lanes).",
                                "Ajouter chaque clic de souris et chaque micro-action pour être le plus exhaustif possible."
                            ]
                        },
                        {
                            "question": "Quel est le risque de mélanger différents niveaux de détail dans un même diagramme ?",
                            "answers": [
                                "Rendre le diagramme illisible et mélanger de grandes étapes métier avec des micro-actions techniques.",
                                "Automatiser le processus de recrutement de manière beaucoup trop rapide.",
                                "Forcer la DSI à acheter un outil de dessin collaboratif payant."
                            ]
                        }
                    ]),
                    make_text_item("Errors Synthesis", ERRORS_EX)
                ],
                "header": "8. Les erreurs fréquentes et synthèse"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "8. Les erreurs fréquentes et synthèse"
            },
            "subContentId": create_id()
        }
    ]

    return {
        "showCoverPage": True,
        "bookCover": {
            "coverDescription": "<p style=\"text-align: center;\">Chapitre 3 : Comprendre et lire un diagramme BPMN</p>",
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
    print("Starting H5P Chapter 3 building process with packaged libraries...")
    temp_dir = "h5p_temp_ch3"

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

    # Declare required libraries to extract from test.h5p
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
        "title": "Comprendre et lire un diagramme BPMN",
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
    h5p_filename = os.path.join("h5p", "bpmn_chapter3_intro.h5p")
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
    print("H5P Chapter 3 build completed successfully!")


if __name__ == "__main__":
    main()
