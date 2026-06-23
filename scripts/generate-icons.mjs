// Generates placeholder PWA icons (maroon monogram). Re-run after editing the
// SVG below, or replace the PNGs in public/icons with real branding later.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync(new URL("../public/icons", import.meta.url), { recursive: true });

const maroon = "#8c2b2b";
const cream = "#f6eedd";
const gold = "#d99a2b";

// `pad` leaves a safe margin so the monogram survives maskable cropping.
function svg(size, pad = 0) {
  const inner = size - pad * 2;
  const fontSize = inner * 0.42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${maroon}"/>
    <text x="50%" y="50%" dy="0.06em" text-anchor="middle" dominant-baseline="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}"
      font-weight="600" fill="${cream}">A<tspan fill="${gold}">&amp;</tspan>T</text>
  </svg>`;
}

async function render(name, size, pad = 0) {
  await sharp(Buffer.from(svg(size, pad)))
    .png()
    .toFile(new URL(`../public/icons/${name}`, import.meta.url).pathname.replace(/^\//, process.platform === "win32" ? "" : "/"));
  console.log("wrote", name);
}

await render("icon-192.png", 192);
await render("icon-512.png", 512);
await render("icon-maskable-512.png", 512, 64);
await render("apple-touch-icon.png", 180);
console.log("Done.");
