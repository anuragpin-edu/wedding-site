// Generates the bunny brand mark (GitHub-style rounded square) as:
//   - PWA icons (public/icons/*)
//   - favicon + apple icon (src/app/icon.png, src/app/apple-icon.png)
//   - link-preview / Open Graph image (src/app/opengraph-image.png + twitter-image.png)
// Re-run after editing the SVG below. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const maroon = "#8c2b2b";
const cream = "#f6eedd";
const gold = "#d99a2b";
const bg = "#fdfaf4";

mkdirSync(new URL("../public/icons", import.meta.url), { recursive: true });

// The bunny mark, drawn in a 512x512 box. `rounded` toggles the squircle bg.
function bunnyMark({ rounded = true } = {}) {
  return `
    ${rounded ? `<rect width="512" height="512" rx="120" fill="${maroon}"/>` : ""}
    <g fill="${cream}">
      <ellipse cx="208" cy="196" rx="36" ry="104" transform="rotate(-12 208 196)"/>
      <ellipse cx="304" cy="196" rx="36" ry="104" transform="rotate(12 304 196)"/>
      <circle cx="256" cy="332" r="122"/>
    </g>
    <g fill="${maroon}">
      <ellipse cx="210" cy="200" rx="16" ry="66" transform="rotate(-12 210 200)"/>
      <ellipse cx="302" cy="200" rx="16" ry="66" transform="rotate(12 302 200)"/>
      <circle cx="214" cy="320" r="11"/>
      <circle cx="298" cy="320" r="11"/>
    </g>
    <path d="M240 344 H272 L256 366 Z" fill="${gold}"/>
  `;
}

function iconSvg(size, { rounded = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${bunnyMark({ rounded })}</svg>`;
}

// 1200x630 link-preview image: bunny + names + date on cream.
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${bg}"/>
    <rect x="22" y="22" width="1156" height="586" rx="28" fill="none" stroke="${gold}" stroke-width="3" opacity="0.55"/>
    <g transform="translate(490,66) scale(0.43)">${bunnyMark({ rounded: true })}</g>
    <text x="600" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="600" fill="${maroon}">Anurag &amp; Thanmai</text>
    <text x="600" y="488" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="36" fill="#3a2b21">August 22, 2026</text>
    <text x="600" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="4" fill="${gold}">BUNNYMETANU.COM</text>
  </svg>`;
}

async function png(svg, outRelPath) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(new URL(`../${outRelPath}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  console.log("wrote", outRelPath);
}

// PWA icons
await png(iconSvg(192), "public/icons/icon-192.png");
await png(iconSvg(512), "public/icons/icon-512.png");
await png(iconSvg(512), "public/icons/icon-maskable-512.png"); // solid bg = maskable-safe
await png(iconSvg(180), "public/icons/apple-touch-icon.png");

// Favicon + apple icon (App Router auto-detects these in app/)
await png(iconSvg(256), "src/app/icon.png");
await png(iconSvg(180), "src/app/apple-icon.png");

// Link preview
await png(ogSvg(), "src/app/opengraph-image.png");
await png(ogSvg(), "src/app/twitter-image.png");

console.log("Done.");
