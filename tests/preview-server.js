const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4321;
const DIST_DIR = path.join(__dirname, '../dist');

const redirects = {
  '/rw': '/redwood-city-preschool-center/',
  '/rw/': '/redwood-city-preschool-center/',
  '/homedaycare': '/san-mateo-preschool-daycare/',
  '/homedaycare/': '/san-mateo-preschool-daycare/',
  '/rw.html': '/redwood-city-preschool-center/',
  '/rw.html/': '/redwood-city-preschool-center/',
  '/rw-location-directions.html': '/rw-location-directions/',
  '/rw-location-directions.html/': '/rw-location-directions/',
  '/about.html': '/about/',
  '/about.html/': '/about/',
  '/rw-baking.html': '/rw-baking/',
  '/rw-baking.html/': '/rw-baking/',
  '/homedaycare.html': '/san-mateo-preschool-daycare/',
  '/homedaycare.html/': '/san-mateo-preschool-daycare/',
  '/rw-gardening.html': '/rw-gardening/',
  '/rw-gardening.html/': '/rw-gardening/',
  '/services.html': '/services/',
  '/services.html/': '/services/',
  '/contact.html': '/contact/',
  '/contact.html/': '/contact/',
  '/rw-gymnastics.html': '/rw-gymnastics/',
  '/rw-gymnastics.html/': '/rw-gymnastics/',
  '/roots-n-wings-montessori-school': '/redwood-city-preschool-center/',
  '/roots-n-wings-montessori-school/': '/redwood-city-preschool-center/',
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

  // Dynamic /blog/:slug redirect (excluding assets and root list page)
  if (pathname.startsWith('/blog/') && pathname !== '/blog/' && !pathname.startsWith('/blog/c/') && !pathname.endsWith('.js') && !pathname.endsWith('.css') && !pathname.endsWith('.json')) {
    const slug = pathname.replace('/blog/', '').replace(/\/$/, '');
    if (slug) {
      res.writeHead(301, {
        'Location': `/blog/?p=${slug}`,
        'Content-Type': 'text/html',
      });
      res.end(`<!doctype html><title>Redirecting</title><h1>301 Redirect</h1>Redirecting to <a href="/blog/?p=${slug}">/blog/?p=${slug}</a>`);
      return;
    }
  }

  // 2. Serve Static Files
  let filePath = path.join(DIST_DIR, pathname);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '/index.html')) {
    filePath = filePath + '/index.html';
  } else if (pathname.endsWith('/') || !path.extname(filePath)) {
    if (pathname.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    } else {
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
