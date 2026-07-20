import { OpenAI } from 'openai';

class OpenAIService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() && !apiKey.includes('YOUR_OPENAI_API_KEY')) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
    }
  }

  // Cost estimation rates
  static RATES = {
    'dall-e-3': 0.040, // per image (1024x1024)
    'dall-e-2': 0.020,
    'gpt-4o-mini-input': 0.150 / 1000000,  // per token
    'gpt-4o-mini-output': 0.600 / 1000000,
    'gpt-4o-input': 5.00 / 1000000,
    'gpt-4o-output': 15.00 / 1000000
  };

  /**
   * Analyze reference images to extract Style Memory
   * @param {Array<string>} imageUrls - Array of base64 data URLs or public URLs of reference images
   */
  async extractStyleMemory(imageUrls) {
    if (!this.openai) {
      throw new Error('OpenAI client is not initialized. Please verify your OPENAI_API_KEY.');
    }

    // Call GPT-4o-mini with images to analyze their design/style properties
    const content = [
      {
        type: 'text',
        text: `Analyze the provided reference images and extract key stylistic design features.
Return a structured JSON object containing the following keys (ensure all keys are returned):
- colors: List of hex codes representing the primary color palette.
- typography: { heading: string, body: string, accent: string }
- spacing: string describing the layout density, margin details, and whitespace usage.
- composition: string describing alignment, layout structure, framing, grids, and angles.
- lighting: string describing direction, quality, color, intensity of lights, and shadows.
- branding: string describing how logos or brand elements are placed and integrated.
- illustrationStyle: string describing illustrations, vector arts, 3D elements, or photography.
- visualHierarchy: string describing size distribution, focal elements, and flow.
- mood: string describing emotional tone, color-feeling, and general vibe.
- ctaStyle: string describing action buttons, placement, colors, and layout for CTA.

Respond ONLY with the JSON object. Do not wrap it in markdown or formatting blocks.`
      }
    ];

    // Append images
    for (const url of imageUrls) {
      // Ensure url is in a readable format for OpenAI API (either base64 data url or public url)
      content.push({
        type: 'image_url',
        image_url: {
          url: url,
        }
      });
    }

    const startTime = Date.now();
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const duration = Date.now() - startTime;
    const jsonText = response.choices[0].message.content;
    const parsed = JSON.parse(jsonText);

    // Calculate cost estimate
    const promptTokens = response.usage?.prompt_tokens || 0;
    const completionTokens = response.usage?.completion_tokens || 0;
    const cost = (promptTokens * OpenAIService.RATES['gpt-4o-mini-input']) + 
                 (completionTokens * OpenAIService.RATES['gpt-4o-mini-output']);

    return {
      styleMemory: parsed,
      metadata: {
        model: 'gpt-4o-mini',
        durationMs: duration,
        costEstimate: cost,
        tokensUsed: response.usage
      }
    };
  }

  /**
   * Generate an image using a prompt
   * @param {string} prompt - Fully compiled prompt
   * @param {string} model - AI Model, defaults to dall-e-3
   * @param {string} size - Canvas size
   */
  async generateImage(prompt, model = 'dall-e-3', size = '1024x1024') {
    if (!this.openai) {
      throw new Error('OpenAI client is not initialized. Please verify your OPENAI_API_KEY.');
    }

    const startTime = Date.now();
    const response = await this.openai.images.generate({
      model: model,
      prompt: prompt,
      n: 1,
      size: size,
    });
    const duration = Date.now() - startTime;

    const imageUrl = response.data[0].url;
    const cost = OpenAIService.RATES[model] || OpenAIService.RATES['dall-e-3'];

    return {
      imageUrl,
      metadata: {
        modelUsed: model,
        generationTimeMs: duration,
        costEstimate: cost,
        size
      }
    };
  }
}

export default new OpenAIService();
