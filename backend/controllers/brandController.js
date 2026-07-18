import Brand from '../models/Brand.js';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Private
export const getBrands = async (req, res, next) => {
  try {
    let brands;
    // Reviewers can see all brands, Editors see their own
    if (req.user.role === 'Reviewer') {
      brands = await Brand.find().populate('createdBy', 'name email');
    } else {
      brands = await Brand.find({ createdBy: req.user._id });
    }
    res.json(brands);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Private
export const getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      res.status(404);
      throw new Error('Brand not found');
    }
    res.json(brand);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private (Editor only)
export const createBrand = async (req, res, next) => {
  const { name, industry, description, logoUrl, colors, typography, style, tone, dos, donts, assets } = req.body;

  try {
    if (!name || !industry) {
      res.status(400);
      throw new Error('Brand name and industry are required');
    }

    const brand = await Brand.create({
      name,
      industry,
      description,
      logoUrl,
      colors,
      typography,
      style,
      tone,
      dos,
      donts,
      assets: assets || [],
      createdBy: req.user._id,
    });

    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private (Editor only)
export const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404);
      throw new Error('Brand not found');
    }

    // Verify ownership
    if (brand.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this brand');
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedBrand);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private (Editor only)
export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      res.status(404);
      throw new Error('Brand not found');
    }

    // Verify ownership
    if (brand.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this brand');
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand removed successfully' });
  } catch (error) {
    next(error);
  }
};
