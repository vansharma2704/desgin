import mongoose from 'mongoose';

const generationHistorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    promptUsed: {
      type: String,
      required: true,
    },
    modelUsed: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    generationTimeMs: {
      type: Number,
    },
    costEstimate: {
      type: Number,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ['Success', 'Failed'],
      default: 'Success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const GenerationHistory = mongoose.model('GenerationHistory', generationHistorySchema);
export default GenerationHistory;
