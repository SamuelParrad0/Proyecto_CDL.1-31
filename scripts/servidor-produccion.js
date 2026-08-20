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

function proxyToBackend(req, res) {
  const proxyRequest = http.request({
    hostname: '127.0.0.1',
    port: backendPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${backendPort}` }
  }, (proxyResponse) => {
    res.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
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
  if (req.url.startsWith('/api/') || req.url === '/api' || req.url.startsWith('/uploads/')) {
    proxyToBackend(req, res);
    return;
  }
  serveFile(req, res, new URL(req.url, 'http://localhost').pathname);
}).listen(port, '0.0.0.0', () => {
  console.log(`CDL publicado en http://0.0.0.0:${port}`);
  console.log(`Backend interno: http://127.0.0.1:${backendPort}`);
});
