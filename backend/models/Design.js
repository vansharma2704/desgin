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
      enum: ['Draft', 'Generating', 'Completed', 'Submitted For Review', 'Pending', 'Pending Review', 'IN_REVIEW', 'Approved', 'Rejected', 'Changes Requested', 'Archived'],
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
    assignedReviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    submissionType: {
      type: String,
      enum: ['AI Generated', 'Uploaded Design'],
      default: 'AI Generated',
    },
    description: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Map generatedImage/imageUrl and sync assignedReviewerId/reviewer & submittedBy/createdBy
designSchema.pre('save', function (next) {
  if (this.generatedImage && !this.imageUrl) {
    this.imageUrl = this.generatedImage;
  } else if (this.imageUrl && !this.generatedImage) {
    this.generatedImage = this.imageUrl;
  }

  // Synchronize reviewer and assignedReviewerId
  if (this.assignedReviewerId && !this.reviewer) {
    this.reviewer = this.assignedReviewerId;
  } else if (this.reviewer && !this.assignedReviewerId) {
    this.assignedReviewerId = this.reviewer;
  }

  // Synchronize createdBy and submittedBy
  if (this.submittedBy && !this.createdBy) {
    this.createdBy = this.submittedBy;
  } else if (this.createdBy && !this.submittedBy) {
    this.submittedBy = this.createdBy;
  }

  // Auto-set submittedAt if status is entering review and submittedAt is not set
  const reviewStatuses = ['Pending', 'Pending Review', 'Submitted For Review', 'IN_REVIEW'];
  if (reviewStatuses.includes(this.status) && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  next();
});

const Design = mongoose.model('Design', designSchema);
export default Design;
