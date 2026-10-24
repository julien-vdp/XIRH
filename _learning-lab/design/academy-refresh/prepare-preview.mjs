// Prépare l'aperçu autonome servi par Next.js et copié par le Dockerfile.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const output = path.join(root, 'public/academy-preview');
await mkdir(path.join(output, 'assets'), {recursive:true});
const page = await readFile(path.join(here,'index.html'),'utf8');
const preview = page.replaceAll('/learning/pix/xirh/','./assets/').replace('/public/logo.png','./assets/logo.png').replace('Aperçu local ·','Aperçu graphique ·');
await writeFile(path.join(output,'index.html'),preview);
for (const file of ['academy.css','preview.css','preview.js']) await copyFile(path.join(here,file),path.join(output,file));
for (const file of ['hero_bg.png','bg_processus.png','bg_digitalisation.png','logo_audencia.png','logo_supdesrh.png','logo_igensia.png','logo.png']) {
  await copyFile(path.join(root,'moodle/public/pix/xirh',file),path.join(output,'assets',file));
}
let fragment = page.match(/<main class="xa"[\s\S]*?<\/main>/)[0];
fragment = fragment.replace(/\s*<div class="preview-search"[\s\S]*?<\/div>/,'').replace(/\s*<p class="preview-empty"[\s\S]*?<\/p>/,'');
await writeFile(path.join(here,'accueil.html'),fragment+'\n');
console.log('Aperçu autonome prêt : public/academy-preview/index.html');
