import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "assets", "optimized");
const manifestPath = path.join(outputDir, "manifest.json");
const images = [
  { name: "manusSign", source: "images/manus1.webp", widths: [480, 800, 1200, 1536] },
  { name: "manusShowroom", source: "images/manus2.webp", widths: [480, 800, 1200, 1600] },
  { name: "team", source: "images/SNM09644.webp", widths: [480, 800, 1200, 1600], ratio: 16 / 9 },
  { name: "homeTeam", source: "images/SNM09466.webp", widths: [480, 800, 1200, 1600] },
  { name: "contactCar", source: "assets/modal-contact-car.webp", widths: [320, 480, 800] },
  { name: "displayFloor", source: "assets/dealership-showroom.webp", widths: [480, 800, 1200, 1600] },
  { name: "lounge", source: "assets/showroom-lounge.webp", widths: [480, 800, 1200, 1376] },
  { name: "consultation", source: "images/Modern Dealership Consultation.webp", widths: [480, 800, 1200, 1536] },
  { name: "inspection", source: "images/SNM09532.webp", widths: [480, 800, 1200, 1600] },
  { name: "delivery", source: "assets/showroom-delivery.webp", widths: [480, 800, 1200, 1376] },
];

await mkdir(outputDir, { recursive: true });
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

for (const image of images) {
  const sourcePath = path.join(root, "public", image.source);
  const metadata = await sharp(sourcePath).metadata();
  const ratio = image.ratio || metadata.width / metadata.height;
  const outputs = [];

  for (const width of image.widths) {
    const resize = image.ratio
      ? { width, height: Math.round(width / ratio), fit: "cover", position: "centre", withoutEnlargement: true }
      : { width, withoutEnlargement: true };
    const buffer = await sharp(sourcePath)
      .rotate()
      .resize(resize)
      .webp({ quality: 80, effort: 5 })
      .toBuffer();
    const outputMetadata = await sharp(buffer).metadata();
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const filename = `${image.name}-${width}-${hash}.webp`;
    await writeFile(path.join(outputDir, filename), buffer);
    outputs.push({ width, height: outputMetadata.height, filename, bytes: buffer.length });
  }

  const preferred = outputs.find(({ width }) => width === 800) || outputs[0];
  manifest[image.name] = {
    src: `/assets/optimized/${preferred.filename}`,
    width: preferred.width,
    height: preferred.height,
    bytes: preferred.bytes,
    srcSet: outputs.map(({ width, filename }) => `/assets/optimized/${filename} ${width}w`).join(", "),
  };
  console.log(`${image.name}: ${outputs.map(({ width, bytes }) => `${width}w=${bytes}B`).join(", ")}`);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const referencedFiles = new Set(
  Object.values(manifest).flatMap((entry) => [
    path.basename(entry.src),
    ...entry.srcSet.split(", ").map((candidate) => path.basename(candidate.split(" ")[0])),
  ]),
);

for (const filename of await readdir(outputDir)) {
  if (filename.endsWith(".webp") && !referencedFiles.has(filename)) {
    await unlink(path.join(outputDir, filename));
    console.log(`Removed stale optimized image: ${filename}`);
  }
}
