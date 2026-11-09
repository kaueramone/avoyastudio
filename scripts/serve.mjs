import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = resolve('public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml' };
const port = Number(process.env.PORT || 4173);
// Local development serves built SDK code without exposing node_modules.
const { build } = await import('esbuild');
const { mkdir } = await import('node:fs/promises');
await mkdir('tmp/vendor', { recursive: true });
await build({ stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: process.cwd() }, bundle: true, format: 'esm', platform: 'browser', target: ['es2022'], outfile: 'tmp/vendor/supabase.js' });
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/vendor/supabase.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' });res.end(await readFile('tmp/vendor/supabase.js'));return; }
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(path)).isFile()) throw new Error('missing');
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end('Página não encontrada'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
