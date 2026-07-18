import Design from '../models/Design.js';
import mongoose from 'mongoose';

// @desc    Migrate all Draft designs to Completed
// @route   POST /api/designs/migrate-drafts
// @access  Public (one-time migration)
export const migrateDraftsToCompleted = async (req, res, next) => {
  try {
    const result = await Design.updateMany(
      { $or: [{ status: 'Draft' }, { isDraft: true }] },
      { $set: { status: 'Completed', isDraft: false } }
    );
    res.json({
      message: `Migration complete. Updated ${result.modifiedCount} designs from Draft → Completed.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all designs
// @route   GET /api/designs
// @access  Private
export const getDesigns = async (req, res, next) => {
  const { campaignId } = req.query;
  try {
    const query = {};
    if (req.user.role === 'Reviewer') {
      query.reviewer = req.user._id;
      query.status = { $ne: 'Draft' };
    } else if (campaignId) {
      query.campaignId = campaignId;
    }

    const designs = await Design.find(query)
      .populate({
        path: 'campaignId',
        populate: { path: 'brandId', select: 'name logoUrl colors assets' }
      })
      .populate('brandId', 'name logoUrl colors assets')
      .sort({ updatedAt: -1 });

    res.json(designs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a design
// @route   POST /api/designs
// @access  Private
export const createDesign = async (req, res, next) => {
  try {
    const { campaignId, brandId } = req.body;
    if (!campaignId) {
      res.status(400);
      throw new Error('campaignId is required');
    }

    // Inferred brandId from Campaign if missing
    let activeBrandId = brandId;
    if (!activeBrandId) {
      const Campaign = mongoose.model('Campaign');
      const camp = await Campaign.findById(campaignId);
      if (camp) {
        activeBrandId = camp.brandId;
      }
    }

    if (!activeBrandId) {
      res.status(400);
      throw new Error('brandId is required or could not be inferred from campaign');
    }

    const design = await Design.create({
      ...req.body,
      brandId: activeBrandId,
    });
    res.status(201).json(design);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a design
// @route   PUT /api/designs/:id
// @access  Private
export const updateDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }

    // Sanitize payload — strip fields whose value is literally "undefined"
    // or that are ObjectId ref fields with a non-ObjectId string value
    const objIdFields = ['brandId', 'campaignId', 'reviewer'];
    const payload = { ...req.body };
    for (const field of objIdFields) {
      if (payload[field] !== undefined) {
        const val = payload[field];
        if (val === 'undefined' || val === '' || val === null || !mongoose.isValidObjectId(val)) {
          delete payload[field];
        }
      }
    }

    const updated = await Design.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a design
// @route   DELETE /api/designs/:id
// @access  Private
export const deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }
    await Design.findByIdAndDelete(req.params.id);
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    next(error);
  }
};
