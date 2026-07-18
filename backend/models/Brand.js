import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  role: { type: String, required: true },
  previewUrl: { type: String, default: '' }
});

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    colors: {
      type: [String],
      default: [],
    },
    campaigns: {
      type: [String],
      default: ['Product Launch', 'Summer Campaign', 'Winter Collection', 'Brand Awareness'],
    },
    typography: {
      heading: { type: String, default: '' },
      body: { type: String, default: '' },
      accent: { type: String, default: '' },
    },
    style: {
      type: String,
      trim: true,
    },
    tone: {
      type: String,
      trim: true,
    },
    dos: {
      type: [String],
      default: [],
    },
    donts: {
      type: [String],
      default: [],
    },
    assets: {
      type: [assetSchema],
      default: [],
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

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
