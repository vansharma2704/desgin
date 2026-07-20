import mongoose from 'mongoose';

const designSchema = new mongoose.Schema(
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
    name: {
      type: String,
      default: 'Untitled Design',
    },
    platform: {
      type: String,
      default: 'Instagram',
    },
    canvasSize: {
      type: String,
      default: '1080x1080',
    },
    prompt: {
      type: String,
      default: '',
    },
    heading: {
      type: String,
      default: '',
    },
    subHeading: {
      type: String,
      default: '',
    },
    bodyText: {
      type: String,
      default: '',
    },
    ctaText: {
      type: String,
      default: '',
    },
    generatedPrompt: {
      type: String,
      default: '',
    },
    generatedImage: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    referenceImages: {
      type: [String],
      default: [],
    },
    uploadedAssets: {
      type: [String],
      default: [],
    },
    designBrief: {
      type: String,
      default: '',
    },
    brandGuidelines: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Generating', 'Completed', 'Submitted For Review', 'Pending', 'Pending Review', 'Approved', 'Rejected', 'Changes Requested', 'Archived'],
      default: 'Draft',
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Map generatedImage to imageUrl if one is set but not the other
designSchema.pre('save', function (next) {
  if (this.generatedImage && !this.imageUrl) {
    this.imageUrl = this.generatedImage;
  } else if (this.imageUrl && !this.generatedImage) {
    this.generatedImage = this.imageUrl;
  }
  next();
});

const Design = mongoose.model('Design', designSchema);
export default Design;
