const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const port = Number(process.env.HTTP_PORT || 80);
const backendPort = Number(process.env.BACKEND_PORT || 5000);
const buildRoot = path.resolve(__dirname, '..', 'frontend', 'build');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const ALLOWED_PREFIXES = ['/api/', '/uploads/'];

function isAllowedProxyRoute(pathname) {
  return pathname === '/api' || ALLOWED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function serveFile(req, res, requestedPath) {
  const relativePath = requestedPath === '/' ? '/index.html' : requestedPath;
  const filePath = path.resolve(buildRoot, `.${relativePath}`);
  if (!filePath.startsWith(`${buildRoot}${path.sep}`)) {
    res.writeHead(400);
    res.end('Solicitud invalida');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    const isFile = !error && stats.isFile();
    const fallback = path.join(buildRoot, 'index.html');
    const target = isFile ? filePath : fallback;
    fs.readFile(target, (readError, content) => {
      if (readError) {
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Frontend no construido');
        return;
      }
      const contentType = mimeTypes[path.extname(target).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': isFile ? 'public, max-age=31536000' : 'no-cache' });
      res.end(content);
    });
  });
}

function proxyToBackend(req, res, incomingUrl) {
  // Construir la URL anclada rígidamente al host del backend
  const targetUrl = new URL('http://127.0.0.1');
  targetUrl.port = String(backendPort);
  targetUrl.pathname = incomingUrl.pathname;
  targetUrl.search = incomingUrl.search;

  const safeHeaders = Object.create(null);
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      safeHeaders[key] = value;
    }
  }
  safeHeaders.host = `127.0.0.1:${backendPort}`;

  // Se pasa targetUrl directamente como primer parámetro a http.request
  const proxyRequest = http.request(targetUrl, {
    method: req.method,
    headers: safeHeaders
  }, (proxyResponse) => {
    const responseHeaders = Object.create(null);
    for (const [key, value] of Object.entries(proxyResponse.headers)) {
      if (key.toLowerCase() !== 'location') {
        responseHeaders[key] = value;
      }
    }

    res.writeHead(proxyResponse.statusCode || 502, responseHeaders);
    proxyResponse.pipe(res);
  });

  proxyRequest.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, mensaje: 'Backend no disponible' }));
  });

  req.pipe(proxyRequest);
}

if (!fs.existsSync(path.join(buildRoot, 'index.html'))) {
  throw new Error(`No existe ${path.join(buildRoot, 'index.html')}. Ejecuta npm run build en frontend.`);
}

http.createServer((req, res) => {
  // Parsear la URL de entrada una sola vez de forma controlada
  const parsedIncomingUrl = new URL(req.url || '/', 'http://127.0.0.1');

  if (isAllowedProxyRoute(parsedIncomingUrl.pathname)) {
    proxyToBackend(req, res, parsedIncomingUrl);
    return;
  }

  serveFile(req, res, parsedIncomingUrl.pathname);
}).listen(port, '0.0.0.0', () => {
  console.log(`CDL publicado en http://0.0.0.0:${port}`);
  console.log(`Backend interno: http://127.0.0.1:${backendPort}`);
});