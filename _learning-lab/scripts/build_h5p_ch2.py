import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Local illustrations to copy and package
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "ch2_intro.jpg": os.path.join("illustrations", "chapter2", "ch2_intro.png"),
    "ch2_lifecycle.jpg": os.path.join("illustrations", "chapter2", "ch2_lifecycle.png"),
    "ch2_recruitment.jpg": os.path.join("illustrations", "chapter2", "ch2_recruitment.png"),
    "ch2_admin_gta_pay.jpg": os.path.join("illustrations", "chapter2", "ch2_admin_gta_pay.png"),
    "ch2_performance_training.jpg": os.path.join("illustrations", "chapter2", "ch2_performance_training.png"),
    "ch2_domino.jpg": os.path.join("illustrations", "chapter2", "ch2_domino.png"),
    "ch2_offboarding.jpg": os.path.join("illustrations", "chapter2", "ch2_offboarding.png"),
    "ch2_interconnections.jpg": os.path.join("illustrations", "chapter2", "ch2_interconnections.png")
}

# Web page contents (130-180 words each, clear, structured, pedagogical HTML)
INTRO_TEXT = """
<h2>La fonction RH comme système de processus</h2>
<p>Dans une organisation, la fonction RH est trop souvent perçue comme une simple succession d'actions administratives isolées : publier une annonce, faire signer un contrat, ou valider des congés. En réalité, chaque action fait partie d'un ensemble de processus interconnectés.</p>
<p>Les Ressources Humaines accompagnent tout le cycle de vie du collaborateur, depuis les premiers contacts en tant que candidat jusqu'à son départ définitif de l'entreprise. Un processus RH isolé n'existe pas : il est relié à d'autres flux, outils et acteurs. Par exemple, une embauche impacte l'administration, la paie, la DSI, la GTA et la formation. C'est l'effet domino RH.</p>
<p>Comprendre cette approche systémique est indispensable pour tout futur professionnel RH ou SIRH. Cela permet de dialoguer efficacement avec les managers et la DSI, de sécuriser les flux de données et de concevoir des parcours collaborateurs fluides lors des projets de transformation digitale.</p>
"""

INTRO_EX = """
<p><strong>Exemple de terrain :</strong> Lorsqu'un manager recrute un collaborateur, il pense uniquement à combler un besoin opérationnel. Pour les RH, cette action enclenche une chaîne logistique complexe : déclaration DPAE, rédaction du contrat de travail, commande du PC par la DSI, création des accès au réseau, programmation des formations obligatoires et paramétrage du profil dans le SIRH.</p>
"""

LIFECYCLE_TEXT = """
<h2>Le cycle de vie collaborateur</h2>
<p>Le cycle de vie collaborateur est le cadre logique qui structure l'ensemble des processus RH. Il représente le parcours d'un individu au sein de l'organisation, de son premier contact en tant que candidat à son départ.</p>
<p>Ce cycle regroupe douze étapes clés : 1. Attirer, 2. Recruter, 3. Embaucher, 4. Intégrer (onboarding), 5. Administrer, 6. Gérer les temps et absences (GTA), 7. Rémunérer et payer, 8. Former, 9. Évaluer, 10. Accompagner la mobilité, 11. Suivre l'engagement, 12. Gérer la sortie (offboarding).</p>
<p>Il est crucial de comprendre que ce cycle n'est pas linéaire. Un salarié peut alterner entre formation, évaluation et mobilité, changer de rythme de travail ou de service, avant de quitter un jour l'organisation. Chaque événement réactive plusieurs processus du cycle de manière simultanée.</p>
"""

LIFECYCLE_EX = """
<p><strong>Exemple concret :</strong> Un collaborateur recruté comme chargé RH va suivre un onboarding. Après un an, son entretien de performance révèle un fort potentiel. Il suit une formation de management, obtient une promotion interne (mobilité), voit sa rémunération révisée en paie, et change de profil de validation dans l'outil de GTA. Son cycle de vie se déploie à travers plusieurs boucles de processus.</p>
"""

RECRUIT_TEXT = """
<h2>Recrutement et onboarding</h2>
<p>Le recrutement et l'onboarding sont les premiers jalons de l'expérience collaborateur. Bien qu'étroitement liés, ils répondent à des objectifs distincts mais complémentaires.</p>
<p>Le recrutement vise à transformer un besoin en embauche. Il s'étend de la demande du manager à la signature de la promesse d'embauche, en passant par les entretiens et validations budgétaires. L'onboarding (intégration) prend le relais dès la promesse signée. Il prépare l'arrivée sur les plans logistique, administratif, matériel et humain pour garantir que le salarié soit opérationnel et accueilli dans les meilleures conditions dès son premier jour.</p>
<p>Ces processus exigent une coordination parfaite entre les RH, le manager, la DSI, les services généraux et la paie.</p>
"""

RECRUIT_EX = """
<p><strong>Exemple concret :</strong> Un nouveau développeur arrive dans l'entreprise, mais son ordinateur n'est pas configuré et ses accès réseau ne fonctionnent pas. Le problème semble technique, mais il résulte d'un dysfonctionnement du processus d'onboarding : la validation de sa promesse d'embauche n'a pas déclenché automatiquement la tâche de préparation matériel auprès de la DSI.</p>
"""

ADMIN_TEXT = """
<h2>Le socle opérationnel : Administration, Temps et Paie</h2>
<p>L'administration du personnel, la gestion des temps et des activités (GTA), et la paie forment le cœur battant de la gestion RH opérationnelle. Ces trois domaines sont intrinsèquement liés par des flux de données constants.</p>
<p>L'administration RH gère le dossier du salarié (données personnelles, contrat, avenants). La GTA suit la présence, les congés, le télétravail et les heures supplémentaires. La paie compile ces données contractuelles et variables pour éditer le bulletin de salaire et effectuer les déclarations sociales.</p>
<p>Toute anomalie de saisie dans l'administration ou la GTA se répercute immédiatement en paie, générant des erreurs de salaire, des frustrations et des risques juridiques pour l'entreprise.</p>
"""

ADMIN_EX = """
<p><strong>Exemple de terrain :</strong> Un salarié demande à passer à 80% (temps partiel). Cette simple modification nécessite : 1. La rédaction d'un avenant (Administration), 2. La mise à jour de son profil de planification et de ses droits à congés (GTA), 3. La réduction proportionnelle de son salaire de base et des cotisations associées (Paie).</p>
"""

PERF_TEXT = """
<h2>Formation, compétences et performance</h2>
<p>Le développement professionnel des collaborateurs repose sur la synergie entre trois processus clés : l'évaluation de la performance, la gestion des compétences et le plan de développement (formation).</p>
<p>Le processus de performance définit les objectifs et évalue les réalisations de l'année. Les résultats alimentent directement la gestion des compétences, qui identifie les écarts entre les compétences détenues et celles requises pour le poste.</p>
<p>La formation intervient alors comme levier d'action pour combler ces écarts, permettant au salarié d'évoluer, d'atteindre ses nouveaux objectifs ou de préparer une mobilité interne future.</p>
"""

PERF_EX = """
<p><strong>Exemple concret :</strong> Lors de son entretien annuel de performance, un collaborateur exprime le souhait de devenir manager. Le manager valide ce potentiel mais identifie un écart sur les compétences d'animation d'équipe. Il en résulte une demande de formation. Les RH inscrivent le salarié au prochain parcours de management, facilitant sa future évolution.</p>
"""

DOMINO_TEXT = """
<h2>L'effet domino : Mobilité et Évolution</h2>
<p>La mobilité et l'évolution de carrière (changement de poste, de service, promotion ou mutation) sont des événements majeurs. Ils démontrent de façon flagrante l'interconnexion globale des processus RH.</p>
<p>Lorsqu'un collaborateur évolue, une seule décision RH déclenche une cascade d'actions administratives et techniques. Il faut modifier son contrat (avenant), ajuster son salaire et ses primes (paie), changer son manager validant dans le SIRH (GTA), mettre à jour les organigrammes et adapter ses habilitations et accès informatiques (DSI).</p>
<p>Ces processus sont particulièrement sensibles car toute rupture de flux entraîne un retard dans la prise de fonction ou des anomalies sur le bulletin de paie.</p>
"""

DOMINO_EX = """
<p><strong>Exemple concret :</strong> Une collaboratrice est promue responsable de son équipe. Cette promotion déclenche un avenant à son contrat de travail (Administration), une augmentation de son salaire de base et de sa part variable (Rémunération et Paie), un changement de ses droits de validation dans le SIRH (GTA) et l'attribution de nouveaux accès aux répertoires confidentiels de son équipe (DSI).</p>
"""

QVT_TEXT = """
<h2>Engagement, Qualité de vie au travail et Offboarding</h2>
<p>L'expérience collaborateur ne s'arrête pas au quotidien opérationnel ; elle englobe aussi l'écoute continue et la gestion rigoureuse de la sortie (offboarding).</p>
<p>L'engagement et la Qualité de Vie au Travail (QVT) visent à mesurer le climat social et à identifier les irritants pour améliorer le quotidien. L'offboarding gère le départ du collaborateur (démission, fin de contrat, retraite). Ce processus de sortie est crucial : il doit être soigné humainement pour préserver la marque employeur, et géré rigoureusement pour des raisons juridiques et de sécurité informatique.</p>
<p>Un départ mal géré présente des risques majeurs, notamment si les accès aux données de l'entreprise ne sont pas désactivés.</p>
"""

QVT_EX = """
<p><strong>Exemple de terrain :</strong> Un commercial quitte l'entreprise. Si le processus d'offboarding n'est pas structuré, son compte d'accès au CRM reste actif. Il peut ainsi continuer à consulter le portefeuille clients confidentiel de l'entreprise depuis chez lui, créant une faille de sécurité et de conformité RGPD critique.</p>
"""

INTER_TEXT = """
<h2>Synthèse : les interconnexions RH</h2>
<p>En RH, une information n'est jamais seule. Elle voyage, elle déclenche, elle alimente, et parfois elle casse tout quand elle est fausse. Les processus RH ne sont pas que des étapes humaines : ce sont avant tout des flux de données transversaux.</p>
<p>La performance et l'efficacité d'un SIRH reposent sur la fluidité de ces échanges de données entre l'ATS (recrutement), le Core RH (administration), l'outil de GTA et le logiciel de paie.</p>
<p>Comprendre ces interconnexions est l'étape essentielle pour analyser le fonctionnement réel d'une organisation (le AS-IS), repérer les irritants et concevoir les processus de demain (le TO-BE) avant de déployer un outil.</p>
"""

INTER_EX = """
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
      <td><strong>1. Cycle de vie</strong></td>
      <td>Les processus RH accompagnent le collaborateur tout au long de son parcours.</td>
    </tr>
    <tr>
      <td><strong>2. Cartographie globale</strong></td>
      <td>Ils couvrent recrutement, onboarding, admin, GTA, paie, formation, performance, mobilité, rémunération, engagement et offboarding.</td>
    </tr>
    <tr>
      <td><strong>3. Multi-acteurs</strong></td>
      <td>Un processus implique les RH, managers, collaborateurs, DSI, paie, finance et juridique.</td>
    </tr>
    <tr>
      <td><strong>4. Liens transversaux</strong></td>
      <td>Les processus sont connectés par des données d'entrée/sortie et des validations.</td>
    </tr>
    <tr>
      <td><strong>5. Effet Domino</strong></td>
      <td>Une seule modification amont (ex: temps de travail) impacte plusieurs outils et services aval.</td>
    </tr>
    <tr>
      <td><strong>6. Flux de données</strong></td>
      <td>Une donnée erronée se propage et perturbe le SIRH. L'analyse prépare la correction des irritants.</td>
    </tr>
  </tbody>
</table>

<br>
<h3>Activité finale de réflexion (Mini-Cas) :</h3>
<p><strong>Cas :</strong> Un salarié est promu responsable d'équipe à partir du mois prochain.</p>
<p><strong>Réflexion :</strong> Identifiez les processus impactés, les acteurs concernés, les données à mettre à jour et les risques si l'information est mal transmise.</p>
<p><em>Rétroaction : Une promotion peut impacter la mobilité, le contrat (avenant), le poste, le manager, la rémunération, la paie, les objectifs de performance, les accès IT et éventuellement la formation. C'est un excellent exemple d'effet domino RH.</em></p>
<br>
<p><strong>Transition vers le chapitre suivant :</strong> Maintenant que nous avons identifié les principaux processus RH et leurs interconnexions, nous pouvons passer à l'étape suivante : analyser un processus existant. Dans le prochain chapitre, nous verrons comment observer un processus réel, repérer les irritants, distinguer AS IS et TO BE, et formuler des pistes d'amélioration avant de digitaliser.</p>
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
                    make_image_item("Intro Guide", "images/ch2_intro.jpg", "Mascotte XIRH - Golden retriever low-poly devant une carte flottante du cycle de vie collaborateur"),
                    make_text_item("Intro Example", INTRO_EX),
                    make_single_choice_set("Intro Quiz", [
                        {
                            "question": "Un processus RH peut-il avoir des impacts sur plusieurs autres processus ?",
                            "answers": [
                                "Vrai. Une action RH, comme une embauche ou une promotion, déclenche une cascade de tâches et de données qui impactent la paie, la GTA, l'administration et l'IT.",
                                "Faux. Les différents services RH (paie, recrutement, formation) fonctionnent de manière totalement étanche sans aucun échange de données."
                            ]
                        }
                    ])
                ],
                "header": "1. Système de processus RH"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "1. Système de processus RH"
            },
            "subContentId": create_id()
        },
        # Chapter 2: Le cycle de vie collaborateur
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Lifecycle Text", LIFECYCLE_TEXT),
                    make_image_item("Lifecycle Map", "images/ch2_lifecycle.jpg", "Carte ou frise low-poly montrant le cycle de vie collaborateur avec icônes"),
                    make_text_item("Lifecycle Example", LIFECYCLE_EX),
                    make_single_choice_set("Lifecycle Sequence Quiz", [
                        {
                            "question": "Quel est l'enchaînement chronologique le plus logique dans le cycle de vie collaborateur ?",
                            "answers": [
                                "Recrutement ➔ Onboarding ➔ Administration du personnel ➔ Formation ➔ Performance ➔ Offboarding",
                                "Offboarding ➔ Performance ➔ Formation ➔ Administration du personnel ➔ Onboarding ➔ Recrutement",
                                "Administration du personnel ➔ Recrutement ➔ Offboarding ➔ Onboarding ➔ Performance ➔ Formation"
                            ]
                        }
                    ])
                ],
                "header": "2. Le cycle de vie collaborateur"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "2. Le cycle de vie collaborateur"
            },
            "subContentId": create_id()
        },
        # Chapter 3: Recrutement et onboarding
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Recruit Text", RECRUIT_TEXT),
                    make_image_item("Recruit Onboard Panels", "images/ch2_recruitment.jpg", "Scène low-poly avec panneaux Recrutement et Onboarding reliés par des flèches, retriever au milieu"),
                    make_text_item("Recruit Example", RECRUIT_EX),
                    make_single_choice_set("Recruit Onboard Actors Quiz", [
                        {
                            "question": "Parmi les propositions suivantes, quel groupe d'acteurs est le plus fréquemment impliqué de manière coordonnée dans un onboarding réussi ?",
                            "answers": [
                                "Les RH, le manager opérationnel, la DSI (matériel/accès) et les services généraux.",
                                "Le collaborateur uniquement, qui doit se débrouiller seul pour trouver son équipement.",
                                "Le service comptabilité uniquement, au moment de verser le premier salaire."
                            ]
                        }
                    ])
                ],
                "header": "3. Recrutement et onboarding"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "3. Recrutement et onboarding"
            },
            "subContentId": create_id()
        },
        # Chapter 4: Socle opérationnel (Admin, Temps, Paie)
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Admin Text", ADMIN_TEXT),
                    make_image_item("Admin GTA Paie Blocks", "images/ch2_admin_gta_pay.jpg", "Image low-poly montrant les blocs Administration RH ➔ GTA ➔ Paie reliés par des flux de cartes de données"),
                    make_text_item("Admin Example", ADMIN_EX),
                    make_single_choice_set("Admin GTA Paie Case Quiz", [
                        {
                            "question": "Si un salarié change de temps de travail (ex: passage de 100% à 80%), quels processus opérationnels RH doivent être mis à jour ?",
                            "answers": [
                                "L'administration (avenant), la GTA (planning et droits) et la paie (salaire de base et cotisations).",
                                "Uniquement le planning du manager direct, sans aucun impact contractuel ou financier.",
                                "Uniquement le dossier de formation, pour réduire ses heures d'apprentissage."
                            ]
                        }
                    ])
                ],
                "header": "4. Le socle opérationnel : Admin, Temps et Paie"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "4. Le socle opérationnel : Admin, Temps et Paie"
            },
            "subContentId": create_id()
        },
        # Chapter 5: Formation, compétences et performance
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Perf Text", PERF_TEXT),
                    make_image_item("Perf Training Link", "images/ch2_performance_training.jpg", "Scène low-poly avec panneau Performance relié à Formation et Compétences, avec icônes sobres"),
                    make_text_item("Perf Example", PERF_EX),
                    make_single_choice_set("Perf Training Quiz", [
                        {
                            "question": "Quel est le lien le plus logique entre l'entretien de performance et la formation ?",
                            "answers": [
                                "L'entretien permet d'identifier les écarts de compétences, ce qui alimente le plan de développement et de formation.",
                                "La formation est une récompense déconnectée des performances ou du travail réel.",
                                "L'entretien de performance sert uniquement à fixer les primes, sans lien avec l'apprentissage."
                            ]
                        }
                    ])
                ],
                "header": "5. Développer et évaluer"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "5. Développer et évaluer"
            },
            "subContentId": create_id()
        },
        # Chapter 6: Mobilité, rémunération et évolution (effet domino)
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Domino Text", DOMINO_TEXT),
                    make_image_item("Domino Effect", "images/ch2_domino.jpg", "Image effet domino RH low-poly : Promotion interne déclenche contrat, paie, manager, IT"),
                    make_text_item("Domino Example", DOMINO_EX),
                    make_single_choice_set("Domino Effect Quiz", [
                        {
                            "question": "Pourquoi dit-on qu'une promotion interne produit un 'effet domino' ?",
                            "answers": [
                                "Parce qu'elle déclenche une série d'impacts contractuels, financiers, d'accès informatiques et d'organisation dans le SIRH.",
                                "Parce qu'elle force l'ensemble de l'équipe à démissionner simultanément.",
                                "Parce qu'elle ne concerne que le titre de poste sans aucune modification dans les autres outils."
                            ]
                        }
                    ])
                ],
                "header": "6. L'effet domino RH"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "6. L'effet domino RH"
            },
            "subContentId": create_id()
        },
        # Chapter 7: Engagement, QVT et offboarding
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("QVT Text", QVT_TEXT),
                    make_image_item("Offboarding Engagement", "images/ch2_offboarding.jpg", "Carte low-poly avec zone Engagement/Écoute et zone Offboarding, retriever guide sur le chemin"),
                    make_text_item("QVT Example", QVT_EX),
                    make_single_choice_set("Offboarding IT Quiz", [
                        {
                            "question": "Quel est le risque majeur d'un processus d'offboarding mal maîtrisé sur le plan informatique ?",
                            "answers": [
                                "Que les comptes d'accès aux outils et aux données confidentielles restent actifs après le départ du salarié.",
                                "Que le salarié emporte le mobilier de bureau de l'entreprise chez lui sans autorisation.",
                                "Que le calcul du solde de tout compte se fasse de manière totalement aléatoire."
                            ]
                        }
                    ])
                ],
                "header": "7. Écouter et sécuriser la sortie"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "7. Écouter et sécuriser la sortie"
            },
            "subContentId": create_id()
        },
        # Chapter 8: Synthèse : les interconnexions RH
        {
            "library": "H5P.Column 1.22",
            "params": {
                "content": [
                    make_text_item("Inter Text", INTER_TEXT),
                    make_image_item("Interconnections Map", "images/ch2_interconnections.jpg", "Grande carte low-poly des processus RH reliés par des flèches et flux de cartes de données"),
                    make_single_choice_set("Interconnections Scenarios Quiz", [
                        {
                            "question": "Quels processus et rôles sont directement mobilisés par une embauche ?",
                            "answers": [
                                "Recrutement, onboarding, administration du personnel, paie, DSI (accès IT) et le manager.",
                                "Uniquement le service recrutement, les autres services n'intervenant pas.",
                                "Uniquement la formation, pour planifier l'évolution à 5 ans."
                            ]
                        },
                        {
                            "question": "Quels processus et rôles sont impactés par la survenance d'un arrêt maladie ?",
                            "answers": [
                                "La GTA (saisie de l'absence), la paie (indemnités), le manager (planning) et l'administration.",
                                "Uniquement le recrutement, pour remplacer immédiatement le salarié.",
                                "Uniquement le service formation, pour annuler toutes les sessions."
                            ]
                        },
                        {
                            "question": "Quelles dimensions sont touchées par une promotion interne ?",
                            "answers": [
                                "La mobilité, la rémunération, l'administration (avenant), la paie et les accès informatiques.",
                                "Uniquement la QVT, sans aucun impact contractuel ou sur la paie.",
                                "Uniquement le recrutement externe de candidats."
                            ]
                        },
                        {
                            "question": "Quels aspects sont gérés de manière critique lors du départ d'un salarié ?",
                            "answers": [
                                "L'offboarding (documents/solde de tout compte), la clôture des accès informatiques, et la restitution du matériel.",
                                "La gestion de son plan de formation continue pour l'année suivante.",
                                "Le recrutement immédiat d'un remplaçant par le même organisme de formation."
                            ]
                        }
                    ]),
                    make_text_item("Inter Synthesis", INTER_EX)
                ],
                "header": "8. Synthèse et interconnexions"
            },
            "metadata": {
                "contentType": "Column",
                "license": "U",
                "title": "8. Synthèse et interconnexions"
            },
            "subContentId": create_id()
        }
    ]

    return {
        "showCoverPage": True,
        "bookCover": {
            "coverDescription": "<p style=\"text-align: center;\">Chapitre 2 : Les grands processus RH et leurs interconnexions</p>",
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
    print("Starting H5P Chapter 2 building process with packaged libraries...")
    temp_dir = "h5p_temp_ch2"

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
        "title": "Les grands processus RH et leurs interconnexions",
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
    h5p_filename = os.path.join("h5p", "bpmn_chapter2_intro.h5p")
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
    print("H5P Chapter 2 build completed successfully!")


if __name__ == "__main__":
    main()
