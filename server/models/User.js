import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  profilePicture: String,
  generations: [{ type: Date }],
  isPro: { type: Boolean, default: false },
  stripeCustomerId: { type: String, sparse: true, unique: true },
  subscriptionId: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
