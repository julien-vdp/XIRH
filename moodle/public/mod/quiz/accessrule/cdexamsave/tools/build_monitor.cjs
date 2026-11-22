// Build the AMD monitor with the repository's existing Terser installation.
const fs = require('node:fs');
const path = require('node:path');
const terser = require(path.resolve(__dirname, '../../../../../../../node_modules/terser'));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'amd/src/monitor.js'), 'utf8')
    .replace('define([', 'define("quizaccess_cdexamsave/monitor", [');
(async () => {
    const result = await terser.minify({'../src/monitor.js': source}, {
        sourceMap: {filename: 'monitor.min.js', url: 'monitor.min.js.map', includeSources: true},
    });
    fs.writeFileSync(path.join(root, 'amd/build/monitor.min.js'), result.code + '\n');
    fs.writeFileSync(path.join(root, 'amd/build/monitor.min.js.map'), result.map);
})().catch(error => { console.error(error); process.exitCode = 1; });
