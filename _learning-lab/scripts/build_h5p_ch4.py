import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Local illustrations to copy and package
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "ch4_intro.jpg": os.path.join("illustrations", "chapter4", "ch4_intro.png"),
    "ch4_domino.jpg": os.path.join("illustrations", "chapter4", "ch4_domino.png"),
    "ch4_low_code.jpg": os.path.join("illustrations", "chapter4", "ch4_low_code.png"),
    "ch4_rh_examples.jpg": os.path.join("illustrations", "chapter4", "ch4_rh_examples.png"),
    "ch4_agent.jpg": os.path.join("illustrations", "chapter4", "ch4_agent.png"),
    "ch4_risk.jpg": os.path.join("illustrations", "chapter4", "ch4_risk.png"),
    "ch4_bpmn_transition.jpg": os.path.join("illustrations", "chapter4", "ch4_bpmn_transition.png"),
    "ch4_synthesis.jpg": os.path.join("illustrations", "chapter4", "ch4_synthesis.png")
}

# Web page contents (130-180 words each, clear, structured, pedagogical HTML)
INTRO_TEXT = """
<h2>Pourquoi parler d'automatisation et de processus ?</h2>
<p>Les organisations disposent aujourd'hui d'outils performants capables d'automatiser une multitude de tâches courantes : envoyer des e-mails automatiques, transférer des fichiers, alimenter des tableaux croisés, ou confier à des intelligences artificielles le soin de résumer des rapports et de proposer des réponses aux collaborateurs.</p>
<p>Pourtant, plus les technologies d'automatisation gagnent en puissance, plus la rigueur dans la description et l'analyse préalable des processus métier devient indispensable. Les outils n'ont pas de discernement propre : ils se contentent d'exécuter aveuglément la logique configurée. Si le processus d'origine est mal conçu, incomplet ou erroné, l'automatisation ne fera qu'amplifier et propager ces défauts à grande vitesse.</p>
<p>Avant d'automatiser quoi que ce soit, il faut donc impérativement comprendre le fonctionnement du processus métier. L'automatisation ne transforme pas un mauvais fonctionnement en bon fonctionnement : elle lui donne simplement des baskets.</p>
"""

INTRO_EX = """
<p><strong>Exemple concret :</strong> Si les critères de routage d'une demande d'absence RH sont mal définis à la base, automatiser ce circuit d'e-mails ne résout rien : cela permettra simplement d'envoyer de façon instantanée et répétée le mauvais dossier à la mauvaise personne, surchargeant les boîtes de réception.</p>
"""

AUTOM_TEXT = """
<h2>Qu'est-ce que l'automatisation ?</h2>
<p>L'automatisation consiste à déléguer à un système informatique ou à un logiciel l'exécution séquentielle d'une action ou d'un enchaînement d'actions, en se basant sur des règles logiques prédéfinies et un événement de départ.</p>
<p>Toute automatisation de processus repose sur cinq briques fondamentales :</p>
<ul>
  <li><strong>Le Déclencheur (Trigger)</strong> : L'événement initiateur (ex: réception d'un formulaire).</li>
  <li><strong>La Condition</strong> : La règle de décision (ex: si le budget dépasse 1000€).</li>
  <li><strong>L'Action</strong> : La tâche exécutée par la machine (ex: créer un dossier).</li>
  <li><strong>La Donnée</strong> : Les informations manipulées (ex: nom, date d'entrée).</li>
  <li><strong>La Notification / Contrôle</strong> : L'alerte ou le point de validation humain en sortie.</li>
</ul>
<p>Un automatisme est donc une déclinaison technique de processus, qui nécessite de parfaitement maîtriser ce qui se passe avant, pendant et après son exécution.</p>
"""

AUTOM_EX = """
<p><strong>Exemple de terrain :</strong> Lorsqu'une absence est validée par le manager dans la GTA, un flux automatisé met immédiatement à jour le planning d'équipe, décompte le solde de congés dans le SIRH, envoie une notification de confirmation au salarié, et prépare le flux de variables pour la paie à la fin du mois.</p>
"""

LOWCODE_TEXT = """
<h2>Low-code et no-code : l'automatisation accessible</h2>
<p>Les technologies no-code et low-code transforment la façon de concevoir des projets SIRH. Elles permettent de construire des applications métiers, des formulaires ou des workflows de validation sans nécessiter de solides compétences en développement informatique.</p>
<ul>
  <li><strong>No-code</strong> : Construction entièrement visuelle par glisser-déposer de blocs logiques.</li>
  <li><strong>Low-code</strong> : Rendu principalement visuel, avec possibilité d'ajouter des formules ou du code pour des règles plus complexes.</li>
</ul>
<p>Ces outils (comme Power Automate, Make ou Zapier) connectent facilement des applications distinctes. Ils permettent de configurer en quelques clics des circuits de données : "Dès qu'un nouveau formulaire d'intégration est reçu, créer un compte utilisateur, envoyer un e-mail de bienvenue et alerter le tuteur."</p>
"""

LOWCODE_EX = """
<p><strong>Exemple RH :</strong> Pour le suivi des entretiens professionnels, un flux no-code peut collecter les retours via un formulaire en ligne, les compiler dans un tableau de bord partagé, et créer automatiquement une tâche d'inscription en formation dans le SIRH si le besoin est coché.</p>
"""

RH_TEXT = """
<h2>Exemples RH d'automatisation</h2>
<p>L'automatisation s'applique à tous les jalons clés du cycle de vie du collaborateur. Elle permet de fiabiliser les données et d'éliminer les ressaisies manuelles à faible valeur ajoutée.</p>
<p>Voici les cas d'usage RH les plus fréquents en entreprise :</p>
<ul>
  <li><strong>Onboarding</strong> : Une embauche acceptée déclenche parallèlement les contrats, la commande de badge, la tâche DSI (configuration du PC) et l'alerte logistique.</li>
  <li><strong>Administration</strong> : La soumission d'un justificatif met à jour le dossier et alerte le service paye.</li>
  <li><strong>GTA / Absences</strong> : Une absence acceptée met à jour le planning et envoie l'information en paie.</li>
  <li><strong>Offboarding</strong> : Une sortie confirmée planifie la coupure des accès réseau et la restitution des matériels.</li>
</ul>
<p>Dans tous ces cas, la donnée d'entrée doit être irréprochable sous peine d'effets dominos catastrophiques.</p>
"""

RH_EX = """
<p><strong>Exemple de terrain :</strong> Si la date de début d'un salarié est saisie avec une erreur (ex: le 1er juillet au lieu du 1er juin) dans le formulaire d'onboarding, la DSI préparera ses accès réseau un mois trop tard et la paie ne comptabilisera pas son premier mois de travail. L'automatisation du processus a propagé l'erreur instantanément.</p>
"""

AGENT_TEXT = """
<h2>Les agents IA : de l'exécution à l'assistance active</h2>
<p>Un agent IA est un système qui utilise un modèle d'intelligence artificielle pour comprendre des demandes, raisonner sur des situations complexes, choisir et utiliser des outils, puis proposer ou réaliser des actions dans un cadre défini.</p>
<p>Il se distingue d'une automatisation classique par sa flexibilité :</p>
<ul>
  <li><strong>Automatisation simple</strong> : "Si A arrive, faire obligatoirement B" (règle rigide).</li>
  <li><strong>Agent IA</strong> : Analyse l'intention (e-mail d'un collaborateur), cherche l'information (solde de congés), rédige un projet de réponse, et propose au gestionnaire de la valider.</li>
</ul>
<p>Les agents IA (Copilot Studio, Zapier Agents, etc.) augmentent la productivité, mais exigent un cadre strict de permissions et de sécurité pour éviter que l'IA ne prenne des décisions critiques sans supervision humaine.</p>
"""

AGENT_EX = """
<p><strong>Exemple RH :</strong> Un collaborateur envoie un e-mail confus : "Je dois partir en urgence pour des raisons familiales, comment faire ?". L'agent IA analyse le texte, identifie le motif, vérifie la politique de congés exceptionnels, prépare la réponse adéquate et préremplit le formulaire dans le SIRH, en attendant le contrôle final du RH.</p>
"""

RISK_TEXT = """
<h2>Les risques d'automatiser sans processus clair</h2>
<p>La simplicité des outils low-code et des assistants IA crée parfois une illusion de facilité. Connecter des systèmes sans analyser rigoureusement le processus réel (AS-IS) présente de graves risques pour l'organisation.</p>
<p>Les pièges les plus fréquents incluent :</p>
<ul>
  <li><strong>Automatiser des inefficacités</strong> : Accélérer des étapes inutiles ou redondantes.</li>
  <li><strong>Ruptures de données</strong> : Multiplier les fichiers de suivi locaux non synchronisés.</li>
  <li><strong>Perte de contrôle</strong> : Envoyer des notifications à la mauvaise personne.</li>
  <li><strong>Failles de sécurité</strong> : Accorder aux agents IA des accès trop larges à des dossiers confidentiels (RGPD).</li>
  <li><strong>Maintenance complexe</strong> : Workflows impossibles à maintenir par manque de documentation.</li>
</ul>
<p>Plus les outils sont agiles et puissants, plus le cadre logique et la gouvernance doivent être verrouillés.</p>
"""

RISK_EX = """
<p><strong>Message fort :</strong> Automatiser sans processus clair, c'est donner les clés de la voiture à quelqu'un qui n'a pas l'adresse. On accélère vers un résultat qui a de grandes chances d'être décevant, voire risqué.</p>
"""

MODEL_TEXT = """
<h2>Pourquoi la modélisation des processus reste essentielle</h2>
<p>La modélisation de processus, notamment via le standard BPMN, n'est pas rendue obsolète par l'automatisation ou les IA. Au contraire, elle devient le socle indispensable pour les concevoir de façon fiable.</p>
<p>Modéliser permet de répondre à des questions incontournables avant toute configuration : Quel est le déclencheur exact ? Qui est responsable de chaque étape (Lanes) ? Quelle donnée précise est nécessaire ? Quels sont les aiguillages logiques (Gateways) ? Où doit-on placer un point de contrôle humain ? Comment gère-t-on les exceptions et les erreurs ?</p>
<p>Le BPMN fournit le plan architectural du processus. Ce plan sert ensuite à expliquer le besoin aux développeurs, à configurer les outils de workflow, ou à guider les agents IA.</p>
"""

MODEL_EX = """
<p><strong>Phrase clé :</strong> Avant de demander à un outil ou à une IA d'agir pour vous, vous devez être capable de lui expliquer la règle. Le diagramme BPMN sert précisément à rendre cette explication visible, structurée et traduisible en logique machine.</p>
"""

SYN_TEXT = """
<h2>Synthèse : les processus comme socle de la transformation</h2>
<p>L'automatisation et l'IA ne remplacent pas l'analyse : elles la rendent stratégique. Pour piloter sereinement des projets SIRH et accompagner la transformation digitale de votre organisation, la maîtrise des processus est votre meilleure compétence.</p>
"""

SYN_EX = """
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
      <td><strong>1. Accélération</strong></td>
      <td>L'automatisation accélère les flux. Si le processus de base est défaillant, elle accélère les erreurs.</td>
    </tr>
    <tr>
      <td><strong>2. Structure logique</strong></td>
      <td>Un automatisme repose sur une chaîne stricte : Déclencheur ➔ Condition ➔ Action ➔ Résultat.</td>
    </tr>
    <tr>
      <td><strong>3. Accessibilité</strong></td>
      <td>Le no-code et le low-code permettent aux RH d'automatiser des tâches sans compétences en développement.</td>
    </tr>
    <tr>
      <td><strong>4. Agents IA</strong></td>
      <td>Ils apportent de la flexibilité (analyse textuelle, suggestions) mais exigent une supervision stricte.</td>
    </tr>
    <tr>
      <td><strong>5. Cadrage et sécurité</strong></td>
      <td>La modélisation prévient les risques d'accès non contrôlés, de doublons de données et de flou des rôles.</td>
    </tr>
    <tr>
      <td><strong>6. Rôle du BPMN</strong></td>
      <td>Le diagramme BPMN sert de plan de montage universel pour expliquer le travail aux outils et aux équipes techniques.</td>
    </tr>
  </tbody>
</table>
<br>
<h3>Mini-activité de réflexion :</h3>
<p><strong>Cas :</strong> Choisissez une tâche RH que vous effectuez régulièrement (ex: envoyer un message de relance, valider un document, extraire un tableau).</p>
<p><strong>Démarche :</strong> Identifiez son déclencheur, les données requises, la règle de décision et le contrôle humain à conserver avant d'envisager un outil.</p>
<p><em>Rétroaction : Vous venez d'appliquer la règle d'or de la digitalisation : partir du processus métier, et non de l'outil technique.</em></p>
<br>
<p><strong>Transition de fin de parcours :</strong> Félicitations, vous avez complété ce parcours d'initiation aux processus RH et à la modélisation BPMN ! Vous disposez désormais du cadre d'analyse nécessaire pour observer l'existant, identifier les irritants de terrain, concevoir les flux de demain et mener à bien vos futurs projets SIRH en toute sérénité.</p>
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
        # Chapter 1: Pourquoi automatiser
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Intro Text", INTRO_TEXT),
                    make_image_item("Intro Way", "images/ch4_intro.jpg", "Mascotte XIRH devant un panneau de commande avec flux de données, montrant le passage du chaos à un workflow clair"),
                    make_text_item("Intro Example", INTRO_EX),
                    make_single_choice_set("Intro Quiz", [
                        {
                            "question": "L'automatisation d'un processus suffit-elle à le rendre efficace ?",
                            "answers": [
                                "Faux. L'automatisation accélère une logique. Si la logique d'origine est mauvaise, elle accélère simplement les erreurs.",
                                "Vrai. Dès qu'un processus est automatisé par un outil, ses défauts se corrigent d'eux-mêmes."
                            ]
                        }
                    ])
                ],
                "header": "1. Automatisation et Processus"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "1. Automatisation et Processus"
            },
            "subContentId": create_id()
        },
        # Chapter 2: Qu'est-ce que l'automatisation
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Autom Text", AUTOM_TEXT),
                    make_image_item("Autom Schema", "images/ch4_domino.jpg", "Chaîne de dominos connectés : déclencheur, condition, action, résultat, notification"),
                    make_text_item("Autom Example", AUTOM_EX),
                    make_single_choice_set("Autom Quiz", [
                        {
                            "question": "Quel élément est indispensable pour démarrer toute automatisation ?",
                            "answers": [
                                "Un déclencheur (Trigger) ou événement de départ (ex: formulaire soumis, date atteinte).",
                                "Une intelligence artificielle générative de dernière génération.",
                                "Une suite logicielle d'entreprise payante."
                            ]
                        }
                    ])
                ],
                "header": "2. Définition de l'automatisation"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "2. Définition de l'automatisation"
            },
            "subContentId": create_id()
        },
        # Chapter 3: Low-code / No-code
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Lowcode Text", LOWCODE_TEXT),
                    make_image_item("Lowcode Builder", "images/ch4_low_code.jpg", "Interface visuelle de construction par blocs connectés pour l'automatisation"),
                    make_text_item("Lowcode Example", LOWCODE_EX),
                    make_single_choice_set("Lowcode Capabilities Quiz", [
                        {
                            "question": "Quelles actions un outil low-code / no-code permet-il d'automatiser ?",
                            "answers": [
                                "Envoyer une alerte, créer une tâche dans un outil tiers, copier des données ou déclencher une validation.",
                                "Remplacer l'intégralité de la réflexion métier et concevoir seul la stratégie d'entreprise.",
                                "Développer de grands programmes logiciels complexes sans aucune logique fonctionnelle."
                            ]
                        }
                    ])
                ],
                "header": "3. No-code / Low-code"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "3. No-code / Low-code"
            },
            "subContentId": create_id()
        },
        # Chapter 4: Exemples RH
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("RH Text", RH_TEXT),
                    make_image_item("RH Panes", "images/ch4_rh_examples.jpg", "Cinq panneaux RH (Onboarding, Admin, GTA, Formation, Offboarding) libérant des icônes d'actions"),
                    make_text_item("RH Example", RH_EX),
                    make_single_choice_set("RH Examples Date Quiz", [
                        {
                            "question": "Dans un onboarding automatisé, quel risque majeur apparaît si la date d'arrivée du salarié est erronée en entrée ?",
                            "answers": [
                                "Les tâches logistiques (PC, accès, badge) seront planifiées au mauvais moment, nuisant à l'intégration.",
                                "L'outil corrigera de lui-même la date en se synchronisant avec le calendrier du manager.",
                                "La paie s'ajustera automatiquement pour rattraper l'écart de date de façon magique."
                            ]
                        }
                    ])
                ],
                "header": "4. Applications RH réelles"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "4. Applications RH réelles"
            },
            "subContentId": create_id()
        },
        # Chapter 5: Les agents IA
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Agent Text", AGENT_TEXT),
                    make_image_item("Agent Assistant", "images/ch4_agent.jpg", "Sphère d'assistance IA connectée à un workflow de données, retriever supervisant à côté"),
                    make_text_item("Agent Example", AGENT_EX),
                    make_single_choice_set("Agent AI Quiz", [
                        {
                            "question": "Qu'est-ce qui distingue un agent IA d'une automatisation simple ?",
                            "answers": [
                                "Il est capable d'interpréter des demandes textuelles complexes et de proposer des actions sur-mesure sous contrôle humain.",
                                "Il fonctionne sans aucune contrainte de sécurité et peut prendre des décisions sensibles de manière autonome.",
                                "Il est 100% fiable et ne nécessite aucun point de contrôle ou validation finale par un RH."
                            ]
                        }
                    ])
                ],
                "header": "5. Les Agents IA"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "5. Les Agents IA"
            },
            "subContentId": create_id()
        },
        # Chapter 6: Les risques
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Risk Text", RISK_TEXT),
                    make_image_item("Risk Fork", "images/ch4_risk.jpg", "Chemin divergent : à gauche un parcours confus plein d'erreurs, à droite un chemin maîtrisé avec contrôles"),
                    make_text_item("Risk Example", RISK_EX),
                    make_single_choice_set("Risk Assessment Quiz", [
                        {
                            "question": "Quels risques majeurs apparaissent si l'on automatise un processus mal maîtrisé ?",
                            "answers": [
                                "L'exposition de données sensibles, la duplication d'erreurs et la création d'un système impossible à maintenir.",
                                "Une amélioration automatique de la qualité des données de l'entreprise.",
                                "Une réduction immédiate de la charge mentale des équipes sans aucune contrepartie."
                            ]
                        }
                    ])
                ],
                "header": "6. Les risques de l'automatisation"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "6. Les risques de l'automatisation"
            },
            "subContentId": create_id()
        },
        # Chapter 7: Modélisation et BPMN
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Model Text", MODEL_TEXT),
                    make_image_item("Model BPMN Flow", "images/ch4_bpmn_transition.jpg", "Diagramme BPMN se transformant logiquement en circuit automatisé et agent IA"),
                    make_text_item("Model Example", MODEL_EX),
                    make_single_choice_set("Model Importance Quiz", [
                        {
                            "question": "Pourquoi la modélisation BPMN reste-t-elle utile dans un contexte d'automatisation et d'IA ?",
                            "answers": [
                                "Parce qu'elle sert de plan architectural pour clarifier la logique métier que les outils devront ensuite exécuter.",
                                "Parce qu'elle remplace l'utilisation des logiciels d'automatisation comme Power Automate.",
                                "Parce qu'elle permet de dessiner des organigrammes hiérarchiques de l'entreprise."
                            ]
                        }
                    ])
                ],
                "header": "7. L'importance de la modélisation"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "7. L'importance de la modélisation"
            },
            "subContentId": create_id()
        },
        # Chapter 8: Synthèse et fin de parcours
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Syn Text", SYN_TEXT),
                    make_image_item("Syn Map", "images/ch4_synthesis.jpg", "Mascotte retriever devant une carte en trois zones : Processus ➔ Automatisation ➔ IA, avec points de contrôle"),
                    make_text_item("Syn Tables and Reflection", SYN_EX)
                ],
                "header": "8. Synthèse et fin de parcours"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "8. Synthèse et fin de parcours"
            },
            "subContentId": create_id()
        }
    ]

    return {
        "showCoverPage": True,
        "bookCover": {
            "coverDescription": "<p style=\"text-align: center;\">Chapitre 4 : Automatisation, low-code et agents IA : pourquoi les processus sont plus importants que jamais</p>",
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
    print("Starting H5P Chapter 4 building process with packaged libraries...")
    temp_dir = "h5p_temp_ch4"

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
        "title": "Automatisation, low-code et agents IA : pourquoi les processus sont plus importants que jamais",
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
    h5p_filename = os.path.join("h5p", "bpmn_chapter4_intro.h5p")
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
    print("H5P Chapter 4 build completed successfully!")


if __name__ == "__main__":
    main()
