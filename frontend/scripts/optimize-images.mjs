import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const sources = {
  hero: "public/assets/dealership-showroom.png",
  visit: "public/assets/dealership-consultation.png",
  choice: "assets/section-choice.png",
  advice: "assets/section-advice.png",
  assessment: "assets/section-assessment.png",
  exchange: "assets/section-exchange.png",
  bmw: "public/assets/bmw.jpg",
  mercedes: "public/assets/mercedes.jpg",
  audi: "public/assets/audi.jpg",
};
const output = "public/assets/optimized";
await mkdir(output, { recursive: true });
const manifest = {};
for (const [name, source] of Object.entries(sources)) {
  const metadata = await sharp(source).metadata();
  const maxWidth = ["bmw", "mercedes", "audi"].includes(name) ? 960 : 1600;
  const widths = [
    ...new Set(
      [480, 800, 1200, 1600].map((w) => Math.min(w, maxWidth, metadata.width)),
    ),
  ];
  const variants = [];
  for (const width of widths) {
    const { data, info } = await sharp(source)
      .resize({ width })
      .webp({ quality: 72, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
    const filename = `${name}-${width}-${hash}.webp`;
    await writeFile(`${output}/${filename}`, data);
    variants.push({
      src: `/assets/optimized/${filename}`,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  }
  const fallback = variants[Math.min(1, variants.length - 1)];
  manifest[name] = {
    ...fallback,
    srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(", "),
  };
  console.log(
    `${name}: ${variants.map((v) => `${v.width}px ${(v.bytes / 1024).toFixed(1)}KB`).join(", ")}`,
  );
}
await writeFile(
  `${output}/manifest.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
