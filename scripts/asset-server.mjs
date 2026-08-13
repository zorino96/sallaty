#!/usr/bin/env node
// Tiny CORS-enabled static server used only to hand local store assets to the
// Play Console tab (Chrome exempts http://localhost from mixed-content blocking,
// so an HTTPS page can fetch from it). Serves the repo read-only on :4610.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve('.');
const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.aab': 'application/octet-stream', '.apk': 'application/vnd.android.package-archive',
  '.md': 'text/plain; charset=utf-8', '.json': 'application/json',
};

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  const rel = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]))
    .replace(/^[/\\]+/, '')
    .replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    res.statusCode = 404; res.end('not found'); return;
  }
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  res.setHeader('Content-Length', statSync(file).size);
  createReadStream(file).pipe(res);
}).listen(4610, () => console.log('asset server on http://localhost:4610'));
