import mongoose from 'mongoose';

const promptHistorySchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const promptSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    campaign: {
      type: String,
      default: '',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    feedback: {
      type: String,
      default: '',
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [promptHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Prompt = mongoose.model('Prompt', promptSchema);
export default Prompt;
