import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PACK_NAME = 'AinnnAinn';

const OUTPUT_DIR = path.resolve('stickers/ainnn');

if (!BOT_TOKEN) {
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadPack() {

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${PACK_NAME}`;
  const res = await fetch(url);
  const data = await res.json();

 
  if (!data.ok) {
    return;
  }

  const stickers = data.result.stickers;


  for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    const fileId = sticker.file_id;

    const fileRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
      continue;
    }

    const filePath = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    const imgRes = await fetch(fileUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const ext = filePath.endsWith('.webm') ? 'webm' : 'webp';
    const filename = `${i + 1}.${ext}`;

    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);

  }

}

downloadPack();
