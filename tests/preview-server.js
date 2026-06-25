const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4321;
const DIST_DIR = path.join(__dirname, '../dist');

const redirects = {
  '/rw': '/redwood-city-preschool-center',
  '/rw/': '/redwood-city-preschool-center',
  '/homedaycare': '/san-mateo-preschool-daycare',
  '/homedaycare/': '/san-mateo-preschool-daycare',
};

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Handle Redirects
  if (redirects[pathname]) {
    res.writeHead(301, {
      'Location': redirects[pathname],
      'Content-Type': 'text/html',
    });
    res.end(`<!doctype html><title>Redirecting</title><h1>301 Redirect</h1>Redirecting to <a href="${redirects[pathname]}">${redirects[pathname]}</a>`);
    return;
  }

  // 2. Serve Static Files
  let filePath = path.join(DIST_DIR, pathname);
  
  // If requesting directory or a extensionless file, append index.html
  if (pathname.endsWith('/') || !path.extname(filePath)) {
    // If it's a directory, append index.html
    if (pathname.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    } else {
      // It might be a static file reference like "/about" -> "/about/index.html"
      filePath = path.join(filePath, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve 404
        fs.readFile(path.join(DIST_DIR, '404/index.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(err404 ? '404 Not Found' : content404);
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
});
