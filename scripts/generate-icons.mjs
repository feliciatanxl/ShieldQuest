import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

/**
 * Renders the PWA icon set from the canonical mark in `public/favicon.svg`.
 *
 * Run with `npm run icons` after changing the mark. The colours here must stay
 * in step with `BrandMark.tsx` and the navy/amber ramps in
 * `design-system/tokens.css` — an icon that drifts from the wordmark is the
 * first thing a user sees and the last thing anyone thinks to check.
 */

await mkdir('public/icons', { recursive: true });

const svg = await readFile('public/favicon.svg');
await Promise.all(
  [192, 512].map((size) =>
    sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`),
  ),
);

/**
 * Maskable variant.
 *
 * Android crops maskable icons to an arbitrary shape, guaranteeing only the
 * central circle of 80% diameter. So this one is full-bleed navy with no
 * rounded corners of its own (the platform supplies the shape) and a smaller
 * shield that stays inside that safe circle.
 */
const maskable = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
     <defs>
       <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#0b2545"/>
         <stop offset="1" stop-color="#061527"/>
       </linearGradient>
     </defs>
     <rect width="100" height="100" fill="url(#m)"/>
     <g transform="translate(29 29) scale(1.75)" fill="none" stroke="#f2ae33"
        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
       <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
     </g>
   </svg>`,
);
await sharp(maskable).png().toFile('public/icons/maskable-512.png');

console.log('Icons written to public/icons/ from public/favicon.svg');
