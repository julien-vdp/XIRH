import json
import os

def save_template(filepath, mapping_config):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(mapping_config, f, indent=4)

def load_template(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []
