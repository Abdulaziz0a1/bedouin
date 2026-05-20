import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src  = path.join(__dirname, "../public/images/bedouin-logo-symbol.jpeg");
const dest = path.join(__dirname, "../public/ultra-logo.png");

const OUTPUT = 512;

// Circular SVG mask at the final output size
const circleSvg = Buffer.from(
  `<svg width="${OUTPUT}" height="${OUTPUT}">
     <circle cx="${OUTPUT / 2}" cy="${OUTPUT / 2}" r="${OUTPUT / 2}" fill="white"/>
   </svg>`
);

// Step 1: trim the beige/cream padding so we isolate the logo circle
const trimmed = await sharp(src)
  .trim({ threshold: 30 })  // removes edges that match the corner colour
  .toBuffer();

// Step 2: get trimmed dimensions, ensure a centered square
const trimMeta = await sharp(trimmed).metadata();
const size = Math.min(trimMeta.width, trimMeta.height);

// Step 3: square-crop → resize to 512 → apply circular mask
const squared = await sharp(trimmed)
  .extract({
    left:   Math.floor((trimMeta.width  - size) / 2),
    top:    Math.floor((trimMeta.height - size) / 2),
    width:  size,
    height: size,
  })
  .resize(OUTPUT, OUTPUT)
  .png()
  .toBuffer();

await sharp(squared)
  .composite([{ input: circleSvg, blend: "dest-in" }])
  .png()
  .toFile(dest);

console.log(`✓ Saved circular favicon → ${dest}`);
