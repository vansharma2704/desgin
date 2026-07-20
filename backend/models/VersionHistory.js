import mongoose from 'mongoose';

const versionHistorySchema = new mongoose.Schema(
  {
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      default: 'Instagram',
    },
    canvasSize: {
      type: String,
      default: '1080x1080',
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const VersionHistory = mongoose.model('VersionHistory', versionHistorySchema);
export default VersionHistory;
