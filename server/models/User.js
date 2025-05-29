import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  tgId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  inventory: { type: [String], default: [] }
});

export default mongoose.model('User', userSchema);