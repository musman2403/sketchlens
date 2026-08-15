import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  instruction: { type: String, required: true },
  imageIndex: { type: Number, required: true }
});

const sketchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  steps: [stepSchema],
  isPublic: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Sketch', sketchSchema);
