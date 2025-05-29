import express from 'express';
import User from '../models/User.js';
const router = express.Router();

router.post('/login', async (req, res) => {
  const { initData } = req.body;
  const tgId = extractTelegramId(initData);
  if (!tgId) return res.status(400).json({ error: 'Invalid Telegram data' });

  let user = await User.findOne({ tgId });
  if (!user) {
    user = new User({ tgId });
    await user.save();
  }

  res.json(user);
});

function extractTelegramId(data) {
  const idMatch = data.match(/user=\{\"id\":(\d+)/);
  return idMatch ? idMatch[1] : null;
}

export default router;