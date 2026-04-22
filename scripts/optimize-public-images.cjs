/* eslint-disable */
/**
 * One-off script: convert the two oversized PNGs in /public to responsive
 * WebP variants (Lighthouse Mobile flagged ~7.5 MiB savings on these).
 *
 * Run with:  node scripts/optimize-public-images.cjs
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// [source, baseName, widths] – baseName is the new file stem.
const TARGETS = [
  ['WhyMostDiets.png', 'WhyMostDiets', [400, 700, 1024]],
  ['girlthali.png',    'girlthali',    [600, 900, 1400]],
];

(async () => {
  for (const [src, base, widths] of TARGETS) {
    const inputPath = path.join(PUBLIC_DIR, src);
    if (!fs.existsSync(inputPath)) {
      console.warn('skip (missing):', src);
      continue;
    }
    for (const w of widths) {
      const outPath = path.join(PUBLIC_DIR, `${base}-${w}.webp`);
      await sharp(inputPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outPath);
      const { size } = fs.statSync(outPath);
      console.log(`✔ ${path.basename(outPath)}  ${(size / 1024).toFixed(1)} KiB`);
    }
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
