import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const sizes = [16, 32, 48];
const pngs = sizes.map((size) => fs.readFileSync(path.join(dir, `favicon-${size}.png`)));

const header = 6;
const entry = 16;
const offset0 = header + entry * pngs.length;
const buf = Buffer.alloc(offset0 + pngs.reduce((n, p) => n + p.length, 0));
buf.writeUInt16LE(0, 0);
buf.writeUInt16LE(1, 2);
buf.writeUInt16LE(pngs.length, 4);

let offset = offset0;
pngs.forEach((png, i) => {
  const size = sizes[i];
  const at = header + i * entry;
  buf.writeUInt8(size >= 256 ? 0 : size, at);
  buf.writeUInt8(size >= 256 ? 0 : size, at + 1);
  buf.writeUInt8(0, at + 2);
  buf.writeUInt8(0, at + 3);
  buf.writeUInt16LE(1, at + 4);
  buf.writeUInt16LE(32, at + 6);
  buf.writeUInt32LE(png.length, at + 8);
  buf.writeUInt32LE(offset, at + 12);
  png.copy(buf, offset);
  offset += png.length;
});

fs.writeFileSync(path.join(dir, 'favicon.ico'), buf);
fs.copyFileSync(path.join(dir, 'favicon-32.png'), path.join(dir, 'favicon.png'));
console.log('ico', buf.length);
