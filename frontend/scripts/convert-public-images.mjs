import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const sourceExtensions = new Set([".jpg", ".jpeg", ".png"]);

async function convertDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await convertDirectory(source);
      continue;
    }
    if (!entry.isFile()) continue;
    const originalExtension = path.extname(entry.name);
    const extension = originalExtension.toLowerCase();
    if (!sourceExtensions.has(extension)) continue;

    const output = path.join(directory, `${path.basename(entry.name, originalExtension)}.webp`);
    await sharp(source)
      .rotate()
      .webp({ quality: 84, effort: 5 })
      .toFile(output);
    const metadata = await sharp(output).metadata();
    console.log(`${path.relative(publicDir, source)} -> ${path.relative(publicDir, output)} (${metadata.width}x${metadata.height})`);
  }
}

await convertDirectory(publicDir);
