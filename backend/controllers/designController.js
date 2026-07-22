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

// @desc    Claim all designs with no createdBy for the current editor
// @route   POST /api/designs/claim-mine
// @access  Private (Editor)
export const claimMyDesigns = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const result = await Design.updateMany(
      { createdBy: null },
      { $set: { createdBy: req.user._id } }
    );
    res.json({
      message: `Claimed ${result.modifiedCount} designs for ${req.user.name}.`,
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
    if (campaignId) {
      query.campaignId = campaignId;
    }

    if (req.user && req.user.role === 'Reviewer') {
      // Security enforcement: A Reviewer can ONLY retrieve designs assigned specifically to them
      query.$or = [
        { assignedReviewerId: req.user._id },
        { reviewer: req.user._id }
      ];
      query.status = { $in: ['Submitted For Review', 'Pending', 'Pending Review', 'IN_REVIEW', 'Approved', 'Rejected', 'Changes Requested', 'Archived'] };
    }

    const designs = await Design.find(query)
      .populate({
        path: 'campaignId',
        populate: { path: 'brandId', select: 'name logoUrl colors assets' }
      })
      .populate('brandId', 'name logoUrl colors assets')
      .populate('reviewer', 'name email')
      .populate('assignedReviewerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('submittedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(designs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get design by ID
// @route   GET /api/designs/:id
// @access  Private
export const getDesignById = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate({
        path: 'campaignId',
        populate: { path: 'brandId', select: 'name logoUrl colors assets' }
      })
      .populate('brandId', 'name logoUrl colors assets')
      .populate('reviewer', 'name email')
      .populate('assignedReviewerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('submittedBy', 'name email');

    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }

    // Backend Authorization Check: Reviewer can ONLY view designs assigned to them
    if (req.user && req.user.role === 'Reviewer') {
      const assignedId = (design.assignedReviewerId?._id || design.assignedReviewerId || design.reviewer?._id || design.reviewer)?.toString();
      if (!assignedId || assignedId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You are not assigned to review this design.' });
      }
    }

    res.json(design);
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
      createdBy: req.user?._id || null,
      submittedBy: req.user?._id || null,
    });
    const populated = await Design.findById(design._id)
      .populate({
        path: 'campaignId',
        populate: { path: 'brandId', select: 'name logoUrl colors assets' }
      })
      .populate('brandId', 'name logoUrl colors assets')
      .populate('createdBy', 'name email')
      .populate('submittedBy', 'name email');
    res.status(201).json(populated);
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

    // Backend Authorization Check: Reviewer can ONLY update designs assigned to them
    if (req.user && req.user.role === 'Reviewer') {
      const assignedId = (design.assignedReviewerId?._id || design.assignedReviewerId || design.reviewer?._id || design.reviewer)?.toString();
      if (!assignedId || assignedId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You are not assigned to review this design.' });
      }
    }

    // Sanitize payload — strip fields whose value is literally "undefined"
    // or that are ObjectId ref fields with a non-ObjectId string value
    const objIdFields = ['brandId', 'campaignId', 'reviewer', 'assignedReviewerId', 'createdBy', 'submittedBy'];
    const payload = { ...req.body };
    for (const field of objIdFields) {
      if (payload[field] !== undefined) {
        const val = payload[field];
        if (val === 'undefined' || val === '' || val === null || !mongoose.isValidObjectId(val)) {
          delete payload[field];
        }
      }
    }

    // If an Editor is submitting a design for review, enforce mandatory reviewer assignment
    const reviewStatuses = ['Pending', 'Pending Review', 'Submitted For Review', 'IN_REVIEW'];
    const isSubmittingForReview = payload.status && reviewStatuses.includes(payload.status);

    if (isSubmittingForReview) {
      const newReviewer = payload.assignedReviewerId || payload.reviewer;
      const existingReviewer = design.assignedReviewerId || design.reviewer;

      if (!newReviewer && !existingReviewer) {
        return res.status(400).json({ message: 'Reviewer assignment is required when submitting a design for review.' });
      }

      if (newReviewer) {
        payload.assignedReviewerId = newReviewer;
        payload.reviewer = newReviewer;
      }
      if (req.user && req.user.role === 'Editor') {
        payload.submittedBy = req.user._id;
        payload.createdBy = design.createdBy || req.user._id;
      }
      payload.submittedAt = new Date();
    }

    // Prevent Reviewers from altering assignment fields
    if (req.user && req.user.role === 'Reviewer') {
      delete payload.assignedReviewerId;
      delete payload.reviewer;
      delete payload.submittedBy;
      delete payload.createdBy;
    }

    const updated = await Design.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'campaignId',
      populate: { path: 'brandId', select: 'name logoUrl colors assets' }
    })
    .populate('brandId', 'name logoUrl colors assets')
    .populate('reviewer', 'name email')
    .populate('assignedReviewerId', 'name email')
    .populate('createdBy', 'name email')
    .populate('submittedBy', 'name email');

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

    if (req.user && req.user.role === 'Reviewer') {
      return res.status(403).json({ message: 'Forbidden: Reviewers cannot delete designs.' });
    }

    await Design.findByIdAndDelete(req.params.id);
    res.json({ message: 'Design deleted successfully' });
  } catch (error) {
    next(error);
  }
};
