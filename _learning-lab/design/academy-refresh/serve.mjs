import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const assetRoot = path.join(root, 'moodle/public/pix/xirh');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png' };
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file;
    if (pathname === '/skin-check.html') {
      file = path.join(root, '_local-lab/academy-qa/skin-check.html');
    } else if (pathname === '/theme-style.css') {
      file = path.join(root, 'moodle/public/theme/boost/style/academy-refresh.css');
    } else if (pathname.startsWith('/academy-preview/')) {
      const publicPreview = path.join(root, 'public/academy-preview');
      file = path.resolve(publicPreview, '.' + pathname.slice('/academy-preview'.length));
      if (!file.startsWith(publicPreview + path.sep)) { res.writeHead(404); res.end(); return; }
    } else if (pathname.startsWith('/learning/pix/xirh/')) {
      file = path.join(assetRoot, path.basename(pathname));
    } else if (pathname === '/public/logo.png') {
      file = path.join(root, 'public/logo.png');
    } else {
      const name = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (!['index.html','academy.css','preview.css','preview.js','accueil.html'].includes(name)) {
        res.writeHead(404); res.end('Page introuvable'); return;
      }
      file = path.join(here, name);
    }
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  } catch { res.writeHead(404); res.end('Fichier introuvable'); }
});
const port = Number(process.env.XIRH_PREVIEW_PORT || 4180);
server.listen(port,'127.0.0.1',() => console.log(`Local: http://127.0.0.1:${port}/academy-preview/index.html`));
