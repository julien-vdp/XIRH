#!/usr/bin/env python3
"""Validate the deployable XIRH fork, including its French UI and assessment schema."""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors = []
required = ['version.php', 'rule.php', 'db/install.xml', 'db/upgrade.php', 'db/events.php',
            'history.php', 'guide.php', 'simulation.php', 'classes/local/simulation.php', 'tests/simulation_test.php',
            'GUIDE_XIRH.md', 'LICENSE.md', 'classes/local/penalty_service.php',
            'classes/privacy/provider.php', 'lang/fr/quizaccess_cdexamsave.php',
            'lang/en/quizaccess_cdexamsave.php', 'tests/xirh_penalties_test.php', 'tools/monitor_test.cjs']
for name in required:
    if not (ROOT / name).is_file(): errors.append('Missing ' + name)
schema = ET.parse(ROOT / 'db/install.xml').getroot()
tables = {table.attrib['NAME']: table for table in schema.find('TABLES')}
for name in ['quizaccess_cdexamsave', 'quizaccess_cdexamsave_evt', 'quizaccess_cdexamsave_grade']:
    if name not in tables: errors.append('Missing table ' + name)
for module in ['monitor', 'live_report']:
    source = (ROOT / f'amd/src/{module}.js').read_text(encoding='utf-8')
    built = (ROOT / f'amd/build/{module}.min.js').read_text(encoding='utf-8')
    mapping = json.loads((ROOT / f'amd/build/{module}.min.js.map').read_text(encoding='utf-8'))
    if f'quizaccess_cdexamsave/{module}' not in built: errors.append('Unnamed AMD build: ' + module)
    embedded = mapping.get('sourcesContent', [''])[0].replace(f'define("quizaccess_cdexamsave/{module}", [', 'define([')
    if embedded.replace('\r\n', '\n') != source.replace('\r\n', '\n'): errors.append('Stale AMD build: ' + module)
version = (ROOT / 'version.php').read_text(encoding='utf-8')
if not re.search(r'\$plugin->version = 2026112200;', version): errors.append('Unexpected plugin version')
if not re.search(r'\$plugin->requires = 2026042000;', version): errors.append('Expected Moodle 5.2 target')
for path in ROOT.rglob('*'):
    if path.is_file() and path.suffix in ['.php', '.js', '.css', '.xml', '.md', '.py', '.cjs']:
        if path.read_bytes().startswith(b'\xef\xbb\xbf'): errors.append('UTF-8 BOM: ' + str(path.relative_to(ROOT)))
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: XIRH package structure, assessment schema, French UI and AMD source maps.')
