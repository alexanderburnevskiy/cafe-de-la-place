const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Route aliases
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  else if (reqPath === '/admin') reqPath = '/admin.html';
  else if (reqPath === '/widget') reqPath = '/client-widget.html';
  else if (reqPath === '/dashboard') reqPath = '/admin.html';
  else if (reqPath === '/favicon.ico') reqPath = '/assets/logo.png';

  let filePath = path.join(__dirname, reqPath);
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const isAsset = ['.jpg', '.png', '.svg', '.woff2'].includes(ext);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': isAsset ? 'public, max-age=86400' : 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Café de la Place Server running on http://localhost:${PORT}/`);
  console.log(`- Site web & Réservation : http://localhost:${PORT}/`);
  console.log(`- Espace Personnel/Admin : http://localhost:${PORT}/admin`);
  console.log(`- Widget autonome        : http://localhost:${PORT}/client-widget.html`);
});
