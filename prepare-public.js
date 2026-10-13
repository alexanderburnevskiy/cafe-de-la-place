const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy static HTML & JS
const filesToCopy = [
  'index.html',
  'admin.html',
  'client-widget.html',
  'config.js',
  'widget.js',
  'embed-example.html',
  'staff-dashboard.html'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Copy assets folder recursively
const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(publicDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  if (!fs.existsSync(assetsDest)) {
    fs.mkdirSync(assetsDest, { recursive: true });
  }
  const assetFiles = fs.readdirSync(assetsSrc);
  for (const f of assetFiles) {
    fs.copyFileSync(path.join(assetsSrc, f), path.join(assetsDest, f));
  }
}

console.log('Public directory ready for deployment.');
