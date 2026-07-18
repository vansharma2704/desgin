import Prompt from '../models/Prompt.js';
import { OpenAI } from 'openai';

// @desc    Get all prompts
// @route   GET /api/prompts
// @access  Private
export const getPrompts = async (req, res, next) => {
  const { campaignId } = req.query;
  try {
    const query = {};
    if (campaignId) {
      query.campaignId = campaignId;
    }
    const prompts = await Prompt.find(query).sort({ createdAt: -1 });
    res.json(prompts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a prompt
// @route   POST /api/prompts
// @access  Private (Editor only)
export const createPrompt = async (req, res, next) => {
  const { campaignId, prompt, variables } = req.body;
  try {
    if (!campaignId || !prompt) {
      res.status(400);
      throw new Error('campaignId and prompt are required');
    }
    const newPrompt = await Prompt.create({
      campaignId,
      prompt,
      variables: variables || {},
    });
    res.status(201).json(newPrompt);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Private (Editor only)
export const deletePrompt = async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      res.status(404);
      throw new Error('Prompt not found');
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
