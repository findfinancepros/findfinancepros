// Regenerate favicons. Run: npm i --no-save sharp png-to-ico && node scripts/generate-favicons.js
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const BG = '#1a2332';
const FG = '#d4a853';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function svg(size) {
  const rx = Math.max(2, Math.round(size * 0.18));
  // Tuned per-size so "FFP" stays legible at 16px.
  let fontSize, y, letterSpacing, family, weight;
  if (size <= 16) {
    fontSize = Math.round(size * 0.58);
    y = Math.round(size * 0.72);
    letterSpacing = -0.4;
    family = '"Helvetica Neue", Arial, sans-serif';
    weight = 800;
  } else if (size <= 32) {
    fontSize = Math.round(size * 0.5);
    y = Math.round(size * 0.7);
    letterSpacing = -0.5;
    family = '"Helvetica Neue", Arial, sans-serif';
    weight = 800;
  } else {
    fontSize = Math.round(size * 0.44);
    y = Math.round(size * 0.64);
    letterSpacing = -1;
    family = 'Georgia, "Times New Roman", serif';
    weight = 700;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${rx}" fill="${BG}"/>
    <text x="${size / 2}" y="${y}" text-anchor="middle" font-family='${family}' font-weight="${weight}" font-size="${fontSize}" fill="${FG}" letter-spacing="${letterSpacing}">FFP</text>
  </svg>`;
}

async function renderPng(size, outfile) {
  const buf = await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, outfile), buf);
  return buf;
}

(async () => {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const png16 = await renderPng(16, 'favicon-16x16.png');
  const png32 = await renderPng(32, 'favicon-32x32.png');
  await renderPng(180, 'apple-touch-icon.png');

  const ico = await pngToIco([png16, png32]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico);

  console.log('Generated:');
  for (const f of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png']) {
    const s = fs.statSync(path.join(PUBLIC_DIR, f)).size;
    console.log(`  public/${f} (${s} bytes)`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
