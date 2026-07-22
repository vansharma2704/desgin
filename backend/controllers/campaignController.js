import Campaign from '../models/Campaign.js';
import Design from '../models/Design.js';
import Prompt from '../models/Prompt.js';
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

    // Fast aggregated count queries instead of looping per campaign
    const [designCounts, promptCounts] = await Promise.all([
      Design.aggregate([
        { $group: { _id: '$campaignId', count: { $sum: 1 } } }
      ]),
      Prompt.aggregate([
        { $group: { _id: '$campaignId', count: { $sum: 1 } } }
      ])
    ]);

    const designCountMap = new Map(designCounts.map(d => [d._id?.toString(), d.count]));
    const promptCountMap = new Map(promptCounts.map(p => [p._id?.toString(), p.count]));

    const enriched = campaigns.map(c => ({
      ...c,
      designCount: designCountMap.get(c._id.toString()) || 0,
      promptCount: promptCountMap.get(c._id.toString()) || 0,
    }));

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
