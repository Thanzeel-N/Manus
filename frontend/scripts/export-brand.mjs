import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

// SVG presentation preserves the transparent PNG pixels and removes empty margins.
const source = 'public/brand/manus-transparent.png';
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = 0, bottom = 0;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  if (data[(y * info.width + x) * 4 + 3] > 20) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
}
const padding = 8;
const box = `${left-padding} ${top-padding} ${right-left+padding*2+1} ${bottom-top+padding*2+1}`;
const raster = `<image width="${info.width}" height="${info.height}" href="data:image/png;base64,${readFileSync(source).toString('base64')}"/>`;
// The source contains red and black ink. This presentation filter maps black to
// white while keeping the red close to #ee2b20; source alpha remains untouched.
const filter = '<defs><filter id="on-dark" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-.067 0 0 0 1 -.835 0 0 0 1 -.885 0 0 0 1 0 0 0 1 0"/></filter></defs>';
for (const mode of ['light', 'dark']) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}"><title>Manu’s Car World</title>${filter}<g${mode === 'dark' ? ' filter="url(#on-dark)"' : ''}>${raster}</g></svg>`;
  writeFileSync(`public/brand/logo-${mode}.svg`, svg);
  writeFileSync(`backend/showroom/static/showroom/brand/logo-${mode}.svg`, svg);
}
// The compact icon uses only the red car emblem, with transparent surroundings.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="520 -155 1000 1000">${filter}<style>@media(prefers-color-scheme:dark){g{filter:url(#on-dark)}}</style><g><svg x="545" y="170" width="950" height="320" viewBox="545 170 950 320">${raster}</svg></g></svg>`;
writeFileSync('app/icon.svg', icon);
writeFileSync('backend/showroom/static/showroom/brand/icon.svg', icon);
console.log({ width: info.width, height: info.height, alpha: true, viewBox: box });
