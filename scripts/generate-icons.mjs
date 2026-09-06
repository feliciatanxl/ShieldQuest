import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

await mkdir('public/icons', { recursive: true });
const svg = await readFile('public/favicon.svg');
await Promise.all(
  [192, 512].map((size) =>
    sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`),
  ),
);
// The central shield stays inside the maskable icon's 80% safe zone.
const maskable = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><rect width="100" height="100" fill="#285e48"/><path d="M50 24L73 34V50Q73 67 50 77Q27 67 27 50V34Z" fill="#efd58d"/><path d="M50 36L54 47L65 51L54 55L50 67L46 55L35 51L46 47Z" fill="#285e48"/></svg>',
);
await sharp(maskable).png().toFile('public/icons/maskable-512.png');
