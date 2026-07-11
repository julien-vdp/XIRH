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

# Import text contents from build_h5p.py text templates
from build_h5p import (
    INTRO_TEXT, M1_TEXT, M1_EXERCICES,
    M2_TEXT, M3_TEXT, M3_DIAGNOSTIC, M4_TEXT, M4_EXERCICE_BPMN,
    M5_TEXT, M5_CORRECTION, M6_FLASHCARDS, SYNTHESE_TEXT
)

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

def generate_column_content():
    content_list = []

    # Title & Intro
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param("<h1>Cours complet : Processus RH et BPMN</h1>"), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/cover.jpg", "Couverture du cours"), True))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(INTRO_TEXT), True))

    # Module 1
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M1_TEXT), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m1_lifecycle.jpg", "Cycle de vie collaborateur"), False))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M1_EXERCICES), False))
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param([
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
                "Une action unitaire et élémentaire exécutée par un acteur.",
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
    ]), True))

    # Module 2
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M2_TEXT), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m2_interconnections.jpg", "Interconnexions des processus RH"), False))
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param([
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
    ]), True))

    # Module 3
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M3_TEXT), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m3_comparison.jpg", "AS IS vs TO BE"), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m3_iso_vs_sirh.jpg", "ISO vs SIRH"), False))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M3_DIAGNOSTIC), False))
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param([
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
    ]), True))

    # Module 4
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M4_TEXT), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m4_bpmn_demo.jpg", "BPMN Diagram demo"), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m4_bpmn_errors.jpg", "Erreurs BPMN fréquentes"), False))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M4_EXERCICE_BPMN), False))
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param([
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
    ]), True))

    # Module 5 (Cas Novalia)
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M5_TEXT), False))
    content_list.append(make_column_content_item("H5P.Image 1.1", make_image_param("images/m5_case_study.jpg", "Cas pratique Novalia"), False))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M5_CORRECTION), True))

    # Flashcards & Synthese
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(M6_FLASHCARDS), False))
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param(SYNTHESE_TEXT), True))

    # Evaluation Finale
    content_list.append(make_column_content_item("H5P.AdvancedText 1.1", make_text_param("<h3>Évaluation Finale du Module</h3><p>Cette évaluation valide vos acquis sur le module de gestion de processus RH. Répondez aux questions ci-dessous pour tester votre score.</p>"), False))
    content_list.append(make_column_content_item("H5P.SingleChoiceSet 1.11", make_single_choice_param([
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
    ]), False))

    return {"content": content_list}


def main():
    print("Starting H5P Column building process with packaged libraries...")
    temp_dir = "h5p_temp_col"

    # Clean previous temp folder if it exists
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

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

    # Extract required libraries from test.h5p (excluding H5P.Column which comes from column_hub.h5p)
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
        "title": "Comprendre, analyser et modéliser les processus RH avec BPMN (Column)",
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
    h5p_filename = os.path.join("h5p", "bpmn_course_rh_column.h5p")
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
    print("H5P Column build completed successfully!")


if __name__ == "__main__":
    main()
