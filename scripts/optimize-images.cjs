const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToOptimize = [
  { file: 'aileen-amar.jpeg', quality: 82 },
  { file: 'joy-pacaigue.jpg', quality: 82 },
];

const imagesDir = path.resolve(__dirname, '../public/images');

async function optimizeImages() {
  for (const item of imagesToOptimize) {
    const inputPath = path.join(imagesDir, item.file);
    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}`);
      continue;
    }

    const beforeStats = fs.statSync(inputPath);
    const beforeSizeKB = (beforeStats.size / 1024).toFixed(1);

    const tempPath = path.join(imagesDir, `temp-${item.file}`);
    await sharp(inputPath)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: item.quality, mozjpeg: true })
      .toFile(tempPath);

    fs.renameSync(tempPath, inputPath);
    const afterStats = fs.statSync(inputPath);
    const afterSizeKB = (afterStats.size / 1024).toFixed(1);

    console.log(`Optimized ${item.file}: ${beforeSizeKB} KB -> ${afterSizeKB} KB (reduction: ${(100 - (afterStats.size / beforeStats.size) * 100).toFixed(1)}%)`);
  }
}

optimizeImages().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
