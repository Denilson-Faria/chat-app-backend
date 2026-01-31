import express from 'express';
import bot from '../bot.js';

const router = express.Router();

router.get('/stickers/:packName', async (req, res) => {
  try {
    const { AinnnAinn } = req.params;

    
    const stickerSet = await bot.getStickerSet(AinnnAinn);

    const stickers = stickerSet.stickers.map(sticker => ({
      file_id: sticker.file_id,
      emoji: sticker.emoji || '💕',

      
      thumb: sticker.thumbnail
        ? `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${sticker.thumbnail.file_path}`
        : null,

      is_animated: sticker.is_animated,
      is_video: sticker.is_video
    }));


    res.json({ stickers });
  } catch (err) {
    res.status(500).json({ stickers: [] });
  }
});

export default router;
