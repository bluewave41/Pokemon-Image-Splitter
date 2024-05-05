const fs = require("fs").promises;
const Jimp = require("jimp");

const BLOCK_SIZE = 16;

async function start() {
  const images = (await fs.readdir("./input")).filter((el) =>
    el.toLowerCase().endsWith(".dib")
  );

  for (const image of images) {
    await parseImage(image);
  }
}

async function parseImage(path) {
  const name = path.split(".")[0];
  const image = await Jimp.read(`./input/${path}`);
  try {
    await fs.mkdir(`./output/${name}`);
  } catch (e) {}
  const hashes = [];
  const map = [];
  let index = 1;
  const { width, height } = image.bitmap;
  for (var y = 0; y < height; y += BLOCK_SIZE) {
    const row = [];
    for (var x = 0; x < width; x += BLOCK_SIZE) {
      const clone = image.clone().crop(x, y, BLOCK_SIZE, BLOCK_SIZE);
      const hash = await clone.getBase64Async(Jimp.MIME_PNG);
      if (!hashes.includes(hash)) {
        hashes.push(hash);
        await clone.writeAsync(`./output/${name}/${index++}.png`);
      }
      row.push(hashes.indexOf(hash) + 1);
    }
    map.push(row);
  }
  fs.writeFile(
    `./output/${name}/map.json`,
    JSON.stringify({
      name,
      width,
      height,
      tiles: map,
    })
  );
}

start();
