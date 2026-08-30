const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('public/assets/logo-original.png');
let pos = 8;
const chunks = [];
let width, height;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    chunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const idat = Buffer.concat(chunks);
const raw = zlib.inflateSync(idat);

const stride = width * 4 + 1;
const img = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  const filter = raw[y * stride];
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      let val = raw[y * stride + 1 + x * 4 + c];
      const left = x > 0 ? img[((y * width) + (x - 1)) * 4 + c] : 0;
      const up = y > 0 ? img[(((y - 1) * width) + x) * 4 + c] : 0;
      const upleft = (x > 0 && y > 0) ? img[(((y - 1) * width) + (x - 1)) * 4 + c] : 0;

      if (filter === 1) val = (val + left) & 0xff;
      else if (filter === 2) val = (val + up) & 0xff;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upleft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upleft);
        let pr = left;
        if (pb < pa && pb < pc) pr = up;
        else if (pc < pa && pc < pb) pr = upleft;
        val = (val + pr) & 0xff;
      }
      img[((y * width) + x) * 4 + c] = val;
    }
  }
}

// Generate SVG paths / rects
let svgRects = '';
let iconRects = '';

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const r = img[((y * width) + x) * 4];
    const g = img[((y * width) + x) * 4 + 1];
    const b = img[((y * width) + x) * 4 + 2];
    const a = img[((y * width) + x) * 4 + 3];

    const alpha = a / 255;
    const brightness = (r + g + b) / 3 / 255;
    const opacity = alpha * brightness;

    if (opacity > 0.15) {
      const opStr = opacity < 0.95 ? ` opacity="${opacity.toFixed(2)}"` : '';
      const rect = `<rect x="${x}" y="${y}" width="1" height="1"${opStr}/>`;
      svgRects += rect;
      if (x <= 28) {
        iconRects += rect;
      }
    }
  }
}

const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" shape-rendering="crispEdges">${svgRects}</svg>`;
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 30" fill="currentColor" shape-rendering="crispEdges">${iconRects}</svg>`;

fs.writeFileSync('public/assets/collab-ai-logo.svg', fullSvg);
fs.writeFileSync('public/assets/collab-ai-icon.svg', iconSvg);
console.log('Saved SVG files: public/assets/collab-ai-logo.svg and public/assets/collab-ai-icon.svg');