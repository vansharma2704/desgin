import Prompt from '../models/Prompt.js';
import { OpenAI } from 'openai';


// @desc    Get prompts
// @route   GET /api/prompts
// @access  Private
export const getPrompts = async (req, res, next) => {
  try {
    let prompts;
    if (req.user.role === 'Reviewer') {
      // Reviewers only see prompts submitted specifically to them
      prompts = await Prompt.find({ reviewer: req.user._id, status: { $ne: 'Draft' } })
        .populate('brand', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      prompts = await Prompt.find({ createdBy: req.user._id })
        .populate('brand', 'name')
        .sort({ createdAt: -1 });
    }
    res.json(prompts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new prompt
// @route   POST /api/prompts
// @access  Private (Editor only)
export const createPrompt = async (req, res, next) => {
  const { prompt, brandId, campaign, campaignId, imageUrl } = req.body;

  try {
    if (!prompt || !brandId) {
      res.status(400);
      throw new Error('Prompt text and Brand ID are required');
    }

    const newPrompt = await Prompt.create({
      prompt,
      brand: brandId,
      campaign: campaign || '',
      campaignId: campaignId || null,
      imageUrl: imageUrl || '',
      createdBy: req.user._id,
      version: 1,
      history: [{ prompt, version: 1 }],
      status: 'Draft',
    });

    const populated = await Prompt.findById(newPrompt._id).populate('brand', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a prompt (edit by Editor or review by Reviewer)
// @route   PUT /api/prompts/:id
// @access  Private
export const updatePrompt = async (req, res, next) => {
  const { prompt, status, feedback, reviewer } = req.body;

  try {
    const existingPrompt = await Prompt.findById(req.params.id);
    if (!existingPrompt) {
      res.status(404);
      throw new Error('Prompt not found');
    }

    if (req.user.role === 'Reviewer') {
      // Reviewer action (Approve / Reject)
      if (!status || !['Approved', 'Rejected'].includes(status)) {
        res.status(400);
        throw new Error('Status must be Approved or Rejected');
      }
      if (status === 'Rejected' && (!feedback || !feedback.trim())) {
        res.status(400);
        throw new Error('Rejection feedback comment is required');
      }

      existingPrompt.status = status;
      existingPrompt.feedback = feedback || '';
      existingPrompt.reviewer = req.user._id;

      await existingPrompt.save();
      const updated = await Prompt.findById(existingPrompt._id)
        .populate('brand', 'name')
        .populate('createdBy', 'name email');
      return res.json(updated);
    } else {
      // Editor action: Edit prompt and increment version
      if (existingPrompt.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this prompt');
      }

      if (prompt && prompt !== existingPrompt.prompt) {
        existingPrompt.version += 1;
        existingPrompt.history.push({ prompt, version: existingPrompt.version });
        existingPrompt.prompt = prompt;
        // Reset review status upon editor modification
        existingPrompt.status = 'Draft';
        existingPrompt.feedback = '';
      }

      // Allow setting a reviewer and status (e.g. submitting for review)
      if (reviewer !== undefined) {
        existingPrompt.reviewer = reviewer;
      }
      if (status !== undefined) {
        existingPrompt.status = status;
      }

      // Allow updating other fields
      if (req.body.imageUrl !== undefined) {
        existingPrompt.imageUrl = req.body.imageUrl;
      }

      await existingPrompt.save();
      const updated = await Prompt.findById(existingPrompt._id).populate('brand', 'name');
      return res.json(updated);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Private (Editor only)
export const deletePrompt = async (req, res, next) => {
  try {
    const existingPrompt = await Prompt.findById(req.params.id);
    if (!existingPrompt) {
      res.status(404);
      throw new Error('Prompt not found');
    }

    if (existingPrompt.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this prompt');
    }

    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate image using OpenAI DALL-E
// @route   POST /api/prompts/generate-image
// @access  Private (Editor only)
export const generateImage = async (req, res, next) => {
  const { prompt } = req.body;

  if (
    !process.env.OPENAI_API_KEY || 
    process.env.OPENAI_API_KEY.includes('YOUR_OPENAI_API_KEY_HERE') || 
    !process.env.OPENAI_API_KEY.trim()
  ) {
    return res.status(400).json({
      message: 'OpenAI API Key is missing or not configured. Please add your OPENAI_API_KEY to the backend/.env file.'
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    
    res.json({ imageUrl: response.data[0].url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate image via OpenAI' });
  }
};
