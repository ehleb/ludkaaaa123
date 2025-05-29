import mongoose from 'mongoose';

const dropSchema = new mongoose.Schema({
  tgId: String,
  caseId: String,
  rewardId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Drop', dropSchema);