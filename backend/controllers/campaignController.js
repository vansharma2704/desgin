import Campaign from '../models/Campaign.js';

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
export const getCampaigns = async (req, res, next) => {
  const { brandId } = req.query;
  try {
    const query = {};
    if (brandId) {
      query.brand = brandId;
    }

    let campaigns;
    if (req.user.role === 'Reviewer') {
      campaigns = await Campaign.find(query).populate('brand', 'name');
    } else {
      // Editor sees campaigns for their brands
      campaigns = await Campaign.find({ ...query, createdBy: req.user._id }).populate('brand', 'name');
    }

    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private (Editor only)
export const createCampaign = async (req, res, next) => {
  const { name, description, brandId, status } = req.body;

  try {
    if (!name || !brandId) {
      res.status(400);
      throw new Error('Campaign name and brand ID are required');
    }

    const campaign = await Campaign.create({
      name,
      description,
      brand: brandId,
      status: status || 'Draft',
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

    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updated);
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

    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
};
