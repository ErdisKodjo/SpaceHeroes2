import fs from 'node:fs';

const src = process.argv[2];
const b = fs.readFileSync(src);
console.log(b.readUInt32BE(16), b.readUInt32BE(20), b.length);
