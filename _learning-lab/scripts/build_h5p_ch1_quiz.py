import os
import json
import shutil
import uuid
import zipfile
import urllib.request

# Local illustrations to copy and package
IMAGE_SOURCES = {
    "cover.jpg": os.path.join("illustrations", "general", "cover.png"),
    "ch1_quiz_cover.jpg": os.path.join("illustrations", "chapter1", "ch1_quiz_cover.png")
}

INTRO_TITLE = "<h1>Évaluation — Comprendre les processus</h1>"
INTRO_TEXT = """
<p>Cette évaluation vérifie votre compréhension des bases de l'analyse processus. Elle porte sur la définition d'un processus, ses composants, son utilité, les notions proches à ne pas confondre, et les premiers réflexes d'analyse.</p>
<p>Prenez le temps de lire les questions : certaines réponses sont volontairement proches. L'évaluation est notée sur 20 points.</p>
"""

# The 20 QCU questions for the quiz
QUESTIONS = [
    # Q1: Vrai/Faux (1 pt)
    {
        "question": "Q1. Un processus commence-t-il toujours par un déclencheur ou un événement identifiable ?",
        "answers": [
            "Vrai. Un processus est obligatoirement déclenché par un événement précis (ex: réception d'une demande, survenance d'une échéance).",
            "Faux. Un processus peut s'exécuter de façon continue sans aucun déclencheur ni point de départ."
        ],
        "feedback": "Vrai. Le déclencheur (trigger) est l'événement qui met le processus en mouvement."
    },
    # Q2: Choix unique (1 pt)
    {
        "question": "Q2. Quel élément parmi les suivants n'est pas indispensable à l'existence d'un processus ?",
        "answers": [
            "Un logiciel informatique spécialisé.",
            "Des activités coordonnées.",
            "Un résultat attendu et mesurable.",
            "Des acteurs ou responsabilités."
        ],
        "feedback": "Le logiciel soutient le processus mais ne le crée pas. Un processus peut exister sur papier ou de façon manuelle."
    },
    # Q3: Briques de processus (1 pt)
    {
        "question": "Q3. Parmi les composants d'un processus, à quoi servent principalement les 'Ressources' ?",
        "answers": [
            "À fournir les outils, informations et documents nécessaires aux acteurs pour réaliser leurs activités.",
            "À déclencher automatiquement le processus au début de la journée.",
            "À remplacer les acteurs humains pour réduire les coûts opérationnels.",
            "À définir la note de procédure rédigée par la direction qualité."
        ],
        "feedback": "Les ressources (données, outils, formulaires) sont les intrants ou aides matérielles requis pour faire le travail."
    },
    # Q4: Définition de Workflow (1 pt)
    {
        "question": "Q4. Quelle est la définition exacte d'un Workflow ?",
        "answers": [
            "La circulation organisée et automatisée des tâches et des validations entre les acteurs au sein d'un outil.",
            "La note de procédure interne décrivant textuellement les étapes d'un service.",
            "L'organisation temporaire d'un projet pour installer un progiciel RH.",
            "La liste ordonnée des compétences nécessaires pour accomplir un poste."
        ],
        "feedback": "Le workflow est l'automatisation et le routage informatique des flux d'activités."
    },
    # Q5: Définition de Projet (1 pt)
    {
        "question": "Q5. Comment se définit un 'Projet' par rapport à un processus ?",
        "answers": [
            "Une démarche temporaire et unique visant à produire un changement ou un livrable spécifique.",
            "Un flux permanent de tâches quotidiennes qui se répètent de manière identique.",
            "L'ensemble des documents d'aide rédigés pour guider les nouveaux arrivants.",
            "Le circuit de validation informatique configuré dans le SIRH."
        ],
        "feedback": "Un projet a un début, une fin et un objectif unique. Un processus est permanent et répétable."
    },
    # Q6: Classement / Échelle (1 pt)
    {
        "question": "Q6. Si l'on classe les notions de la plus simple à la plus globale, quel est l'ordre exact ?",
        "answers": [
            "Tâche ➔ Activité ➔ Processus ➔ Organisation.",
            "Activité ➔ Tâche ➔ Workflow ➔ Procédure.",
            "Projet ➔ Processus ➔ Tâche ➔ Activité.",
            "Procédure ➔ Tâche ➔ Workflow ➔ Projet."
        ],
        "feedback": "La tâche est l'action élémentaire. L'activité regroupe des tâches. Le processus coordonne des activités au sein de l'organisation."
    },
    # Q7: Définition de Processus (1 pt)
    {
        "question": "Q7. Quelle phrase décrit le mieux un processus ?",
        "answers": [
            "Une suite structurée d'activités coordonnées transformant des entrées en un résultat à valeur ajoutée.",
            "Une réunion de cadrage pour décider d'une nouvelle stratégie d'entreprise.",
            "Un progiciel informatique utilisé par les services administratifs.",
            "Une règle juridique ou une convention collective obligatoire pour l'entreprise."
        ],
        "feedback": "Un processus est un flux d'activités coordonnées qui produit un résultat à partir d'un déclencheur."
    },
    # Q8: Mini-cas Acteur (1 pt)
    {
        "question": "Q8. Cas : Un collaborateur demande une attestation. Il envoie un mail. Le RH vérifie son dossier, prépare le document, le fait signer au directeur, puis l'envoie. Dans ce cas, qui est l'acteur principal coordonnant l'activité ?",
        "answers": [
            "Le gestionnaire RH.",
            "Le collaborateur demandeur.",
            "Le directeur RH qui signe.",
            "Le logiciel Word utilisé."
        ],
        "feedback": "Le gestionnaire RH est le rôle responsable de la réalisation et du suivi des étapes clés du traitement."
    },
    # Q9: Mini-cas Résultat (1 pt)
    {
        "question": "Q9. Dans le cas de l'attestation décrit ci-dessus, quel est le résultat final attendu ?",
        "answers": [
            "L'attestation signée et effectivement reçue par le collaborateur.",
            "La vérification du dossier administratif par le gestionnaire RH.",
            "La rédaction du modèle de document sous Word.",
            "Le logiciel de messagerie qui envoie le mail de demande."
        ],
        "feedback": "Le résultat est la valeur livrée au bénéficiaire : l'attestation transmise et validée."
    },
    # Q10: Vrai/Faux (1 pt)
    {
        "question": "Q10. Un processus bien décrit sert avant tout à rigidifier l'organisation pour éviter les initiatives.",
        "answers": [
            "Faux. Il sert à clarifier les rôles, fiabiliser les données et simplifier le travail pour le rendre améliorable.",
            "Vrai. La modélisation a pour unique but de restreindre la liberté des opérationnels."
        ],
        "feedback": "Faux. Un processus est une carte pour s'orienter et optimiser l'action, pas une prison administrative."
    },
    # Q11: Symptôme mal maîtrisé (1 pt)
    {
        "question": "Q11. Quel signal révèle avec certitude un processus mal maîtrisé sur le terrain ?",
        "answers": [
            "La multiplication de tableurs Excel de suivi parallèles pour combler les faiblesses des outils officiels.",
            "L'existence d'étapes de validation claires et mesurées dans le temps.",
            "Le partage d'une base de données unique et fiable entre les services.",
            "La rapidité de traitement des demandes des collaborateurs."
        ],
        "feedback": "La multiplication des Excel de contournement (l'empire Excel) traduit une rupture de confiance dans le processus officiel."
    },
    # Q12: Symptôme relance (1 pt)
    {
        "question": "Q12. Pourquoi les relances manuelles permanentes sont-elles le signe d'un processus défaillant ?",
        "answers": [
            "Elles prouvent qu'il n'y a pas de circuit de validation clair, d'alertes automatiques ou de responsabilités définies.",
            "Elles montrent que les collaborateurs sont particulièrement investis et motivés.",
            "Elles indiquent que le volume d'activité est trop faible pour le service.",
            "Elles sont la preuve que le logiciel utilisé est parfaitement configuré."
        ],
        "feedback": "Si un dossier n'avance que sous la pression de relances manuelles, le processus n'a pas de flux défini."
    },
    # Q13: Première question (1 pt)
    {
        "question": "Q13. Quelle est la première question d'analyse à poser lorsqu'on étudie un processus sur le terrain ?",
        "answers": [
            "Quel événement déclenche le début de votre travail ?",
            "Quel est le coût du futur logiciel SIRH ?",
            "Quel est le nom du directeur informatique ?",
            "Combien de réunions de cadrage faut-il planifier ?"
        ],
        "feedback": "Pour comprendre un flux, il faut d'abord identifier sa source : l'événement déclencheur."
    },
    # Q14: Utilité SIRH (1 pt)
    {
        "question": "Q14. Pourquoi l'analyse processus est-elle indispensable avant de choisir ou de déployer un SIRH ?",
        "answers": [
            "Elle évite de digitaliser et d'accélérer un fonctionnement mal conçu ou inefficace.",
            "Elle permet de négocier une réduction de prix avec l'éditeur du logiciel.",
            "Elle remplace la nécessité de former les salariés à l'utilisation de l'outil.",
            "Elle garantit que l'IT va développer l'application elle-même."
        ],
        "feedback": "Digitaliser un mauvais processus permet simplement de faire plus vite quelque chose de mal conçu."
    },
    # Q15: Dialogue DSI (1 pt)
    {
        "question": "Q15. Comment l'analyse de processus facilite-t-elle le dialogue entre les RH et la DSI ?",
        "answers": [
            "En fournissant un langage commun basé sur des flux logiques et des exigences fonctionnelles précises.",
            "En permettant aux RH d'apprendre à coder eux-mêmes le logiciel.",
            "En forçant la DSI à accepter toutes les demandes des utilisateurs sans filtre.",
            "En éliminant les comités de pilotage de projet."
        ],
        "feedback": "Le processus modélisé sert de passerelle entre les besoins métier des RH et les contraintes techniques de l'informatique."
    },
    # Q16: Diagnostic cas (1 pt)
    {
        "question": "Q16. Cas : Demandes par mail, suivies sur un Excel local, validées lors d'un comité mensuel, puis ressaisies manuellement. Quel est le diagnostic le plus pertinent ?",
        "answers": [
            "Le processus existe mais il est fragile, peu visible et probablement mal maîtrisé.",
            "Le processus est parfait car il combine plusieurs outils.",
            "Il n'y a pas de processus car rien n'est automatisé.",
            "Le dysfonctionnement vient uniquement de la mauvaise volonté des salariés."
        ],
        "feedback": "Les ressaisies, les ruptures de flux (mail vers Excel) et le manque de visibilité indiquent un processus fragile."
    },
    # Q17: Question données d'entrée (1 pt)
    {
        "question": "Q17. À quelle question d'analyse répond la recherche des 'données d'entrée' ?",
        "answers": [
            "Quelle information ou document est nécessaire pour démarrer ?",
            "Qui est le supérieur hiérarchique direct ?",
            "Quel est le score obtenu à l'évaluation finale ?",
            "Dans quel format le fichier final doit-il être exporté ?"
        ],
        "feedback": "Les entrées sont les informations/fichiers indispensables pour commencer à réaliser les activités."
    },
    # Q18: Question contrôles (1 pt)
    {
        "question": "Q18. Quelle question d'analyse permet de cartographier les contrôles du processus ?",
        "answers": [
            "Où et par qui les décisions ou validations sont-elles prises ?",
            "Combien de serveurs informatiques sont nécessaires ?",
            "Quel est le salaire du gestionnaire en charge ?",
            "Combien d'années la procédure va-t-elle rester active ?"
        ],
        "feedback": "Identifier les jalons de validation permet de situer les aiguillages et contrôles de conformité."
    },
    # Q19: Sensibilité RH (1 pt)
    {
        "question": "Q19. Pourquoi les processus RH sont-ils considérés comme particulièrement sensibles ?",
        "answers": [
            "Ils manipulent des données confidentielles (RGPD) et impactent directement la paie et les contrats légaux.",
            "Ils sont toujours entièrement autonomes et sans lien avec d'autres services.",
            "Ils exigent obligatoirement le remplacement des humains par des robots.",
            "Ils sont les seuls processus à ne jamais comporter de règles de décision."
        ],
        "feedback": "Les processus RH touchent à l'humain, aux droits, à la paie et aux obligations réglementaires de l'entreprise."
    },
    # Q20: Risque de digitalisation (1 pt)
    {
        "question": "Q20. Pourquoi dit-on que digitaliser un processus mal compris est risqué ?",
        "answers": [
            "Cela risque d'automatiser et d'accélérer ses défauts, ses inefficacités et ses doublons.",
            "Cela rend l'organisation trop simple et supprime tout intérêt au travail.",
            "Cela empêche définitivement les salariés d'accéder à leurs fiches de paie.",
            "Cela supprime toutes les exigences de sécurité informatique."
        ],
        "feedback": "L'automatisation accélère le flux. Si le flux est défectueux, l'outil ne fait qu'accélérer la production d'erreurs."
    }
]

def make_column_content_item(library, params, use_separator=True):
    # useSeparator in H5P.Column is a select field with values 'auto', 'enabled', 'disabled'
    separator_val = "enabled" if use_separator is True else ("disabled" if use_separator is False else use_separator)
    return {
        "content": {
            "library": library,
            "params": params,
            "subContentId": str(uuid.uuid4()),
            "metadata": {
                "contentType": library.split(" ")[0].replace("H5P.", ""),
                "license": "U",
                "title": "Item"
            }
        },
        "useSeparator": separator_val
    }

def make_text_param(text_html):
    return {
        "text": text_html.strip().replace("\n", " ").replace("  ", " ")
    }

def make_image_param(image_path, alt_text):
    return {
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

def make_single_choice_param(questions_list):
    choices = []
    for q in questions_list:
        choices.append({
            "question": f"<p>{q['question']}</p>",
            "answers": [f"<p>{ans}</p>" for ans in q['answers']],
            "subContentId": str(uuid.uuid4())
        })
    return {
        "choices": choices,
        "behaviour": {
            "timeoutCorrect": 0,
            "timeoutWrong": 0,
            "soundEffectsEnabled": True,
            "enableRetry": True,
            "enableSolutionsButton": True,
            "passPercentage": 50,
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
        # Grade range feedbacks scaled to percentages
        "overallFeedback": [
            {
                "from": 0,
                "to": 49,
                "feedback": "Les bases sont encore fragiles (score inférieur à 10/20). Reprenez le chapitre avant de passer aux processus RH."
            },
            {
                "from": 50,
                "to": 69,
                "feedback": "Les notions principales sont comprises (score entre 10 et 13/20), mais certaines distinctions restent à consolider."
            },
            {
                "from": 70,
                "to": 89,
                "feedback": "Bon niveau de compréhension (score entre 14 et 17/20). Vous pouvez passer au chapitre suivant."
            },
            {
                "from": 90,
                "to": 100,
                "feedback": "Très bonne maîtrise des bases (score supérieur à 18/20). Vous êtes prêt à analyser des processus RH !"
            }
        ]
    }

def generate_column_content():
    content_list = []

    # Title & Intro Card
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(INTRO_TITLE), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/ch1_quiz_cover.jpg", "Mascotte XIRH Academy - Golden retriever low-poly avec diplôme et tableau de scores"), True))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(INTRO_TEXT), True))

    # SingleChoiceSet Quiz containing the 20 questions
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param(QUESTIONS), True))

    # Final transition message
    final_message = """
    <p style="text-align: center; font-style: italic; color: #4b5563;">
      <strong>Message de fin :</strong> Dans le prochain chapitre, nous appliquerons cette logique d'analyse aux grands processus RH réels : recrutement, onboarding, administration, GTA, paie, formation, performance, mobilité et offboarding.
    </p>
    """
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(final_message), False))

    return {"content": content_list}


def main():
    print("Starting H5P Chapter 1 Evaluation building process...")
    temp_dir = "h5p_temp_ch1_quiz"

    # Clean previous temp folder if it exists
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir, ignore_errors=True)

    # Create folder structure
    os.makedirs(temp_dir)
    os.makedirs(os.path.join(temp_dir, "content"))
    os.makedirs(os.path.join(temp_dir, "content", "images"))

    # Copy generated images to temporary build path
    print("Copying generated images...")
    for target_name, src_path in IMAGE_SOURCES.items():
        if os.path.exists(src_path):
            shutil.copy(src_path, os.path.join(temp_dir, "content", "images", target_name))
            print(f"Copied {src_path} -> {target_name}")
        else:
            print(f"WARNING: Image source not found: {src_path}")

    # Extract required libraries from test.h5p
    required_libraries = [
        "FontAwesome-4.5",
        "H5P.AdvancedText-1.1",
        "H5P.FontIcons-1.0",
        "H5P.Image-1.1",
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
        "title": "Évaluation — Comprendre les processus",
        "language": "fr",
        "mainLibrary": "H5P.Column",
        "embedTypes": ["iframe"],
        "license": "U",
        "defaultLanguage": "fr",
        "preloadedDependencies": [
            { "machineName": "FontAwesome", "majorVersion": "4", "minorVersion": "5" },
            { "machineName": "H5P.AdvancedText", "majorVersion": "1", "minorVersion": "1" },
            { "machineName": "H5P.Column", "majorVersion": "1", "minorVersion": "22" },
            { "machineName": "H5P.FontIcons", "majorVersion": "1", "minorVersion": "0" },
            { "machineName": "H5P.Image", "majorVersion": "1", "minorVersion": "1" },
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
    h5p_content = generate_column_content()
    with open(os.path.join(temp_dir, "content", "content.json"), "w", encoding="utf-8") as f:
        json.dump(h5p_content, f, ensure_ascii=False, indent=2)

    # Create ZIP archive (and rename as .h5p)
    os.makedirs("h5p", exist_ok=True)
    h5p_filename = os.path.join("h5p", "bpmn_chapter1_quiz.h5p")
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
    print("H5P Chapter 1 Evaluation build completed successfully!")


if __name__ == "__main__":
    main()
