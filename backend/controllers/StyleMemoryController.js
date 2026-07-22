import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Campaign from '../models/Campaign.js';
import Asset from '../models/Asset.js';
import Design from '../models/Design.js';
import GenerationHistory from '../models/GenerationHistory.js';
import VersionHistory from '../models/VersionHistory.js';
import OpenAIService from '../services/OpenAIService.js';
import GeminiService from '../services/GeminiService.js';
import { buildOptimizedPrompt } from '../utils/promptBuilder.js';

/**
 * @desc    Analyze uploaded style references and store style memory
 * @route   POST /api/ai/analyze-style
 * @access  Private (Editor only)
 */
export const analyzeStyle = async (req, res, next) => {
  const { imageUrls, brandId, campaignId } = req.body;

  try {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(400);
      throw new Error('imageUrls is required and must be an array of image urls or base64 data strings');
    }

    let styleMemory, metadata;

    // Try Gemini first (free), then fall back to OpenAI
    if (GeminiService.isAvailable()) {
      console.log('[analyzeStyle] Using Gemini Vision (free tier)');
      const result = await GeminiService.extractStyleMemory(imageUrls);
      styleMemory = result.styleMemory;
      metadata = result.metadata;
    } else {
      console.log('[analyzeStyle] Gemini not available, trying OpenAI...');
      const result = await OpenAIService.extractStyleMemory(imageUrls);
      styleMemory = result.styleMemory;
      metadata = result.metadata;
    }

    // Persist style memory to Brand if requested
    if (brandId && mongoose.isValidObjectId(brandId)) {
      await Brand.findByIdAndUpdate(brandId, { $set: { styleMemory } });
    }

    // Persist style memory to Campaign if requested
    if (campaignId && mongoose.isValidObjectId(campaignId)) {
      await Campaign.findByIdAndUpdate(campaignId, { $set: { styleMemory } });
    }

    res.json({
      success: true,
      styleMemory,
      metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate image via Style Memory + Prompt Builder pipeline
 * @route   POST /api/ai/generate
 * @access  Private (Editor only)
 */
export const generateDesignPipeline = async (req, res, next) => {
  const { brandId, campaignId, userPrompt, platform, canvasSize, designId } = req.body;

  try {
    if (!brandId || !campaignId) {
      res.status(400);
      throw new Error('brandId and campaignId are required');
    }

    // 1. Load Brand
    const brand = await Brand.findById(brandId);
    if (!brand) {
      res.status(404);
      throw new Error('Brand not found');
    }

    // 2. Load Campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    // 3. Load Assets
    const assets = await Asset.find({ brandId });

    // Identify assets roles
    const logoAsset = brand.logoUrl || '';
    const products = assets.filter(a => a.fileType === 'Product Images' || a.fileName.toLowerCase().includes('product'));
    const environments = assets.filter(a => a.fileType === 'Environment Images' || a.fileName.toLowerCase().includes('env') || a.fileName.toLowerCase().includes('bg'));

    // Retrieve active Style Memory: Campaign-level overrides Brand-level
    const activeStyleMemory = (campaign.styleMemory && campaign.styleMemory.colors && campaign.styleMemory.colors.length > 0)
      ? campaign.styleMemory
      : brand.styleMemory;

    // 4. Build AI Prompt
    const compiledPrompt = buildOptimizedPrompt({
      brand,
      campaign,
      styleMemory: activeStyleMemory,
      userPrompt,
      platform: platform || 'Instagram Post',
      canvasSize: canvasSize || '1080x1080',
      brandGuidelines: brand.style || '',
      logoUrl: logoAsset,
      productImages: products,
      environmentImages: environments
    });

    // 5. Generate Image via Modular AI Service
    const model = 'dall-e-3';
    let generationResult;
    try {
      generationResult = await OpenAIService.generateImage(compiledPrompt, model, '1024x1024');
    } catch (apiError) {
      // Log failed run in history
      await GenerationHistory.create({
        brandId,
        campaignId,
        designId: designId || null,
        promptUsed: compiledPrompt,
        modelUsed: model,
        status: 'Failed',
        errorMessage: apiError.message
      });
      throw apiError;
    }

    const { imageUrl, metadata } = generationResult;

    // 6. Save or Update Design
    let design;
    if (designId && mongoose.isValidObjectId(designId)) {
      design = await Design.findById(designId);
      if (design) {
        design.generatedPrompt = compiledPrompt;
        design.prompt = userPrompt || design.prompt;
        design.generatedImage = imageUrl;
        design.imageUrl = imageUrl;
        design.isDraft = false;
        design.status = 'Completed';
        await design.save();
      }
    }

    if (!design) {
      design = await Design.create({
        brandId,
        campaignId,
        name: campaign.name + ' Design',
        platform: platform || 'Instagram',
        canvasSize: canvasSize || '1080x1080',
        prompt: userPrompt || '',
        generatedPrompt: compiledPrompt,
        generatedImage: imageUrl,
        imageUrl: imageUrl,
        isDraft: false,
        status: 'Completed'
      });
    }

    // 7. Track in Version History
    const previousVersionsCount = await VersionHistory.countDocuments({ designId: design._id });
    await VersionHistory.create({
      designId: design._id,
      versionNumber: previousVersionsCount + 1,
      imageUrl: imageUrl,
      prompt: userPrompt || '',
      platform: platform || 'Instagram',
      canvasSize: canvasSize || '1080x1080',
      heading: design.heading || '',
      subHeading: design.subHeading || '',
      bodyText: design.bodyText || '',
      ctaText: design.ctaText || '',
      createdBy: req.user._id
    });

    // 8. Track in Generation History
    const generationHistory = await GenerationHistory.create({
      brandId,
      campaignId,
      designId: design._id,
      promptUsed: compiledPrompt,
      modelUsed: model,
      imageUrl: imageUrl,
      generationTimeMs: metadata.generationTimeMs,
      costEstimate: metadata.costEstimate,
      status: 'Success'
    });

    res.json({
      success: true,
      design,
      generationHistory,
      promptUsed: compiledPrompt
    });
  } catch (error) {
    next(error);
  }
};
