const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.json':  'application/json; charset=utf-8',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2'
};

function handler(req, res) {
  let reqPath = req.url.split('?')[0];

  // Route aliases
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  else if (reqPath === '/admin') reqPath = '/admin.html';
  else if (reqPath === '/widget') reqPath = '/client-widget.html';
  else if (reqPath === '/dashboard') reqPath = '/admin.html';
  else if (reqPath === '/favicon.ico') reqPath = '/assets/logo.png';

  if (reqPath === '/debug-paths') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    let dirFiles = [], cwdFiles = [], assetsInDir = false, assetsInCwd = false;
    try { dirFiles = fs.readdirSync(__dirname); } catch(e) { dirFiles = [e.message]; }
    try { cwdFiles = fs.readdirSync(process.cwd()); } catch(e) { cwdFiles = [e.message]; }
    try { assetsInDir = fs.existsSync(path.join(__dirname, 'assets')); } catch(e) {}
    try { assetsInCwd = fs.existsSync(path.join(process.cwd(), 'assets')); } catch(e) {}
    return res.end(JSON.stringify({ __dirname, cwd: process.cwd(), dirFiles, cwdFiles, assetsInDir, assetsInCwd }, null, 2));
  }

  let cleanPath = reqPath.replace(/^\/+/, '');
  let filePath = path.join(__dirname, cleanPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), cleanPath);
  }

  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + cleanPath + ' (searched: ' + filePath + ')');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const isAsset = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.woff2'].includes(ext);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': isAsset ? 'public, max-age=86400' : 'no-cache'
    });
    res.end(content);
  });
}

const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Café de la Place Server running on http://localhost:${PORT}/`);
    console.log(`- Site web : http://localhost:${PORT}/`);
    console.log(`- Admin    : http://localhost:${PORT}/admin`);
    console.log(`- Widget   : http://localhost:${PORT}/client-widget.html`);
  });
}

module.exports = handler;
