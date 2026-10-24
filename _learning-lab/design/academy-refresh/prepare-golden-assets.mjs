// Optimize the generated hero without changing its composition. Keep source PNG.
import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'../../..');
const source = process.argv[2];
if (!source) throw new Error('Usage: node prepare-golden-assets.mjs <source-png>');
const original = path.join(root,'_learning-lab/illustrations/general/golden-hero-v1.png');
const output = path.join(root,'moodle/public/pix/xirh');
await mkdir(path.dirname(original),{recursive:true});
if (path.resolve(source)!==original) await copyFile(source,original);
for (const width of [1672,960]) {
  const name = width===1672 ? 'golden-universe-v1.webp' : 'golden-universe-v1-960.webp';
  await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:90,effort:6}).toFile(path.join(output,name));
}
for (const [name,input] of [['process','sirh'],['data','analytics'],['ai','ai']]) {
  await sharp(path.join(output,'xirh_carousel_'+input+'.png')).resize({width:900}).webp({quality:86,effort:6}).toFile(path.join(output,'golden-domain-'+name+'.webp'));
}
console.log('Golden hero: source preserved; 1672px and 960px WebP assets prepared.');
