// Read MP4 width and height from tkhd box
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/exercises');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'));

function getDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  // Look for 'tkhd' box
  for (let i = 0; i < buf.length - 30; i++) {
    if (buf.toString('ascii', i, i + 4) === 'tkhd') {
      const version = buf[i + 4];
      const widthOffset = version === 1 ? i + 4 + 88 : i + 4 + 76;
      if (widthOffset + 8 <= buf.length) {
        const width = buf.readUInt32BE(widthOffset) >> 16;
        const height = buf.readUInt32BE(widthOffset + 4) >> 16;
        if (width > 0 && height > 0 && width < 10000 && height < 10000) {
          return { width, height };
        }
      }
    }
  }
  return { width: 'unknown', height: 'unknown' };
}

files.forEach(f => {
  const full = path.join(dir, f);
  const dims = getDimensions(full);
  console.log(`${f}: width=${dims.width}, height=${dims.height}, ratio=${typeof dims.width === 'number' ? (dims.width / dims.height).toFixed(3) : 'N/A'}`);
});
