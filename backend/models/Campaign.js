import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    styleMemory: {
      colors: { type: [String], default: [] },
      typography: {
        heading: { type: String, default: '' },
        body: { type: String, default: '' },
        accent: { type: String, default: '' }
      },
      spacing: { type: String, default: '' },
      composition: { type: String, default: '' },
      lighting: { type: String, default: '' },
      branding: { type: String, default: '' },
      illustrationStyle: { type: String, default: '' },
      visualHierarchy: { type: String, default: '' },
      mood: { type: String, default: '' },
      ctaStyle: { type: String, default: '' }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
