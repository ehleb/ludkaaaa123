import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import userRoutes from './routes/users.js';
import caseRoutes from './routes/cases.js';

import User from './models/User.js';
import Drop from './models/Drop.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const cases = JSON.parse(fs.readFileSync('./config/cases.json'));
const rewards = JSON.parse(fs.readFileSync('./config/rewards.json'));

app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);

app.post('/api/open', async (req, res) => {
  const { tgId, caseId } = req.body;
  const user = await User.findOne({ tgId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const selectedCase = cases[caseId];
  if (!selectedCase) return res.status(400).json({ error: 'Invalid case' });
  if (user.balance < selectedCase.price) return res.status(400).json({ error: 'Not enough balance' });

  const rewardId = pickReward(selectedCase.rewards);
  const drop = new Drop({ tgId, caseId, rewardId });
  await drop.save();
  user.balance -= selectedCase.price;
  user.inventory.push(rewardId);
  await user.save();

  res.json({ reward: rewards[rewardId] });
});

app.post('/api/sell', async (req, res) => {
  const { tgId, rewardId } = req.body;
  const user = await User.findOne({ tgId });
  if (!user || !user.inventory.includes(rewardId)) return res.status(400).json({ error: 'Not found' });

  user.balance += rewards[rewardId].sell_price;
  user.inventory = user.inventory.filter((r) => r !== rewardId);
  await user.save();

  res.json({ balance: user.balance });
});

function pickReward(rewardPool) {
  const total = Object.values(rewardPool).reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;
  let sum = 0;
  for (const [key, chance] of Object.entries(rewardPool)) {
    sum += chance;
    if (rand <= sum) return key;
  }
  return Object.keys(rewardPool)[0];
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)))
  .catch((err) => console.error('❌ DB connection error:', err));