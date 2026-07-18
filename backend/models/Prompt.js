import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    variables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Prompt = mongoose.model('Prompt', promptSchema);
export default Prompt;
