import Asset from '../models/Asset.js';

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private
export const getAssets = async (req, res, next) => {
  const { brandId } = req.query;
  try {
    const query = {};
    if (brandId) {
      query.brandId = brandId;
    }
    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an asset
// @route   POST /api/assets
// @access  Private
export const createAsset = async (req, res, next) => {
  const { brandId, fileName, fileType, url } = req.body;
  try {
    if (!brandId || !fileName || !fileType || !url) {
      res.status(400);
      throw new Error('brandId, fileName, fileType, and url are required');
    }
    const asset = await Asset.create({
      brandId,
      fileName,
      fileType,
      url,
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private
export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      res.status(404);
      throw new Error('Asset not found');
    }
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset removed successfully' });
  } catch (error) {
    next(error);
  }
};
