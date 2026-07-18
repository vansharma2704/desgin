import Campaign from '../models/Campaign.js';
import mongoose from 'mongoose';

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
export const getCampaigns = async (req, res, next) => {
  const { brandId } = req.query;
  try {
    const query = {};
    if (brandId && mongoose.isValidObjectId(brandId)) {
      query.brandId = brandId;
    }
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).lean();

    // Enrich with count stats dynamically
    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const [designCount, promptCount] = await Promise.all([
          mongoose.model('Design').countDocuments({ campaignId: c._id }),
          mongoose.model('Prompt').countDocuments({ campaignId: c._id }),
        ]);
        return {
          ...c,
          designCount,
          promptCount,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private (Editor only)
export const createCampaign = async (req, res, next) => {
  const { name, description, brandId } = req.body;

  try {
    if (!name || !brandId) {
      res.status(400);
      throw new Error('Campaign name and Brand ID are required');
    }

    const campaign = await Campaign.create({
      name,
      description: description || '',
      brandId,
      createdBy: req.user._id,
    });

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Editor only)
export const updateCampaign = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this campaign');
    }

    campaign.name = name || campaign.name;
    campaign.description = description !== undefined ? description : campaign.description;

    await campaign.save();
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Editor only)
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this campaign');
    }

    // Cascade delete related Designs and Prompts
    await Promise.all([
      mongoose.model('Design').deleteMany({ campaignId: campaign._id }),
      mongoose.model('Prompt').deleteMany({ campaignId: campaign._id })
    ]);

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};
