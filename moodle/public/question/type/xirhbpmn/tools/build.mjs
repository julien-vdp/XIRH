// Reproducible, self-contained AMD bundle; no student-side CDN dependencies.
import {build} from 'esbuild';
import {readFile, writeFile, mkdir, cp, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const plugin = path.resolve(here, '..');
const result = await build({
    entryPoints: [path.join(plugin, 'amd/src/editor-lazy.js')],
    nodePaths: [path.join(here, 'node_modules')],
    bundle: true, format: 'iife', globalName: 'XirhBpmn', target: 'es2020',
    minify: true, write: false, legalComments: 'inline', tsconfigRaw: {},
});
await mkdir(path.join(plugin, 'amd/build'), {recursive: true});
await writeFile(path.join(plugin, 'amd/build/editor-lazy.min.js'),
    '/* bpmn-js 18.33.0 and dependencies: see vendor/THIRD_PARTY_LICENSES.txt */\n' +
    'define([],function(){' + result.outputFiles[0].text + '\nreturn XirhBpmn;});\n');
const assets = path.join(here, 'node_modules/bpmn-js/dist/assets');
await mkdir(path.join(plugin, 'vendor'), {recursive: true});
await cp(path.join(assets, 'diagram-js.css'), path.join(plugin, 'vendor/diagram-js.css'));
await cp(path.join(assets, 'bpmn-font'), path.join(plugin, 'vendor/bpmn-font'), {recursive: true});
let notices = 'Bundled third-party packages. XIRH integration code is GPL-3.0-or-later.\n' +
    'bpmn-js uses the bpmn.io licence, including its visible watermark requirement.\n' +
    'Source: https://github.com/bpmn-io/bpmn-js\n\n';
for (const name of (await readdir(path.join(here, 'node_modules'))).sort()) {
    if (name.startsWith('.') || name.startsWith('@') || name === 'esbuild') {
        continue;
    }
    const directory = path.join(here, 'node_modules', name);
    const files = await readdir(directory);
    const licence = files.find(file => /^licen[sc]e(\..*)?$/i.test(file));
    if (licence) {
        notices += '\n========== ' + name + ' ==========\n' + await readFile(path.join(directory, licence), 'utf8');
    }
}
await writeFile(path.join(plugin, 'vendor/THIRD_PARTY_LICENSES.txt'), notices);
