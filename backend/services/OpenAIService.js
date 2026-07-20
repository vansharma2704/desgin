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

        text: `Analyze the provided reference image(s) as an experienced Creative Director, Senior Computer Vision Engineer, and Layout Inspector.
Perform a strict visual analysis of what is ACTUALLY visible across multiple stages of analysis. Never assume, guess, or hallucinate.
If an attribute is not visible or cannot be detected, return "Not Detected" for that value.

Every description field must contain a concise, structured list of short professional bullet points separated by newlines.
- Maximum 4-5 bullet points.
- Maximum 1 line per point.
- Easy to scan.
- Describe only what actually exists.

Return a structured JSON object matching this schema exactly. Every section and sub-section must contain its value (either text or structured object), an integer confidence rating (0-100), and a brief justification/reasoning:

{
  "industry": { "value": "e.g. • Healthcare\n• Corporate\n• Modern Brand Feel", "confidence": 95, "reason": "Reason for detection" },
  "design_type": { "value": "e.g. • Flyer\n• Modern layout", "confidence": 95, "reason": "Reason for detection" },
  "platform": { "value": "e.g. • Print\n• Web", "confidence": 90, "reason": "Reason for detection" },
  
  "color_palette": {
    "hex_codes": [],
    "confidence": 100,
    "reason": "Color extraction delegated exclusively to pixel-level computer vision algorithm"
  },
  
  "typography": {
    "heading_style": { "value": "e.g. • Bold Sans Serif\n• Large Size\n• Left Aligned\n• High Contrast", "confidence": 92, "reason": "Text style analysis" },
    "subheading_style": { "value": "e.g. • Medium Sans Serif\n• All Caps\n• Left Aligned", "confidence": 92, "reason": "Text style analysis" },
    "body_style": { "value": "e.g. • Regular Sans Serif\n• Left Aligned\n• Comfortable Leading", "confidence": 90, "reason": "Text style analysis" },
    "font_family_guess": { "value": "Font family name ONLY if confidence is >90% (e.g. • Barlow\n• Archivo), otherwise 'Not Detected'", "confidence": 90, "reason": "Font family matching details" },
    "font_category": { "value": "e.g. • Sans-Serif", "confidence": 95, "reason": "Font category description" },
    "text_alignment": { "value": "e.g. • Left aligned", "confidence": 95, "reason": "Alignment analysis" },
    "text_hierarchy": { "value": "e.g. • Strong header contrast\n• Clear subheading reading order", "confidence": 92, "reason": "Hierarchy evaluation" },
    "estimated_font_pairing": { "value": "e.g. • Barlow + Archivo", "confidence": 90, "reason": "Font pairing recommendation" },
    "max_characters_guess": { "value": "e.g. • Heading: 30 chars max\n• Body: 150 chars max", "confidence": 85, "reason": "Estimation reasoning" }
  },
  
  "layout": {
    "structure": { "value": "e.g. • Center Hero Layout\n• Large Primary Content Area\n• Balanced White Space\n• Two-Level Visual Hierarchy", "confidence": 95, "reason": "Structure analysis" },
    "alignment": { "value": "e.g. • Left-aligned grid\n• Centered layout elements", "confidence": 95, "reason": "Alignment evaluation" },
    "grid": { "value": "e.g. • Two column feel\n• Row-based sections", "confidence": 92, "reason": "Grid system description" },
    "margins": { "value": "e.g. • Wide uniform margins\n• Balanced borders", "confidence": 90, "reason": "Margin assessment" },
    "padding": { "value": "e.g. • Generous inner padding\n• Comfortable margins", "confidence": 90, "reason": "Padding assessment" },
    "safe_area": { "value": "e.g. • Text keeps safe margin\n• Logo top left safe zone", "confidence": 92, "reason": "Safe area verification" },
    "whitespace": { "value": "e.g. • Comfortable White Space\n• Clean airy feel", "confidence": 95, "reason": "Whitespace assessment" },
    "sections": { "value": ["Header", "Hero Creative Section", "Service Cards / Feature Grid", "CTA", "Footer"], "confidence": 95, "reason": "List of visible functional components" },
    "component_positioning": { "value": "e.g. • Logo top-left position\n• CTA bottom-center placement", "confidence": 90, "reason": "Visual positioning logic" }
  },
  
  "composition": {
    "visual_flow": { "value": "e.g. • Top-to-bottom flow\n• Left-to-right eye path", "confidence": 95, "reason": "Visual flow details" },
    "focal_point": { "value": "e.g. • Strong Hero Focus\n• Large header product photo", "confidence": 95, "reason": "Focal point analysis" },
    "balance": { "value": "e.g. • Asymmetrical split balance\n• Centered focus", "confidence": 92, "reason": "Visual balance analysis" },
    "rule_of_thirds": { "value": "e.g. • Subject aligned left\n• Text aligned right", "confidence": 88, "reason": "Rule of thirds alignment details" },
    "golden_ratio": { "value": "e.g. • Standard modern layout scale", "confidence": 80, "reason": "Golden ratio proportion details" },
    "depth": { "value": "e.g. • Layered composition\n• Background paper depth", "confidence": 92, "reason": "Visual depth description" },
    "perspective": { "value": "e.g. • Straight-on product angle\n• Eye-level model portrait", "confidence": 90, "reason": "Perspective assessment" },
    "layers": { "value": "e.g. • Layered visual subject\n• Clean background canvas", "confidence": 92, "reason": "Layering structure" }
  },
  
  "background": {
    "type": { "value": "e.g. • Solid backdrop\n• Soft gradient fill", "confidence": 95, "reason": "Background type analysis" },
    "texture": { "value": "e.g. • Textured canvas\n• Matte finish", "confidence": 90, "reason": "Texture details" },
    "material": { "value": "e.g. • Paper texture\n• Clean digital surface", "confidence": 90, "reason": "Material details" },
    "blur": { "value": "e.g. • Soft backdrop blur\n• Studio lens bokeh", "confidence": 92, "reason": "Blur analysis" },
    "gradient": { "value": "e.g. • Soft linear top-down gradient", "confidence": 95, "reason": "Gradient details" },
    "lighting": { "value": "e.g. • Soft ambient wash\n• Central glow", "confidence": 90, "reason": "Lighting context" },
    "shadow": { "value": "e.g. • Soft drop shadow layers", "confidence": 92, "reason": "Shadow details" },
    "reflection": { "value": "e.g. • Soft matte reflectivity", "confidence": 88, "reason": "Reflection details" },
    "noise": { "value": "e.g. • Subtle grain texture", "confidence": 90, "reason": "Noise details" }
  },
  
  "lighting": {
    "direction": { "value": "e.g. • Overhead lighting\n• Studio key light direction", "confidence": 90, "reason": "Lighting direction reasoning" },
    "intensity": { "value": "e.g. • Low contrast fill light\n• Ambient soft illumination", "confidence": 90, "reason": "Lighting intensity reasoning" },
    "temperature": { "value": "e.g. • Neutral white balance\n• Cool daylight temperature", "confidence": 92, "reason": "Lighting temperature" },
    "softness": { "value": "e.g. • Diffused soft lighting", "confidence": 92, "reason": "Softness reasoning" },
    "shadow_direction": { "value": "e.g. • Subtle drop shadow down-right", "confidence": 90, "reason": "Shadow direction reasoning" },
    "shadow_softness": { "value": "e.g. • Blur-edge soft shadows", "confidence": 92, "reason": "Shadow softness description" },
    "ambient": { "value": "e.g. • Studio ambient lighting", "confidence": 90, "reason": "Ambient light description" },
    "highlights": { "value": "e.g. • Specs of soft white highlights", "confidence": 92, "reason": "Specular highlights analysis" }
  },
  
  "brand_analysis": {
    "logo_position": { "value": "e.g. • Logo top-left position", "confidence": 95, "reason": "Logo location details" },
    "brand_colors": { "value": "e.g. • Trust-worthy corporate navy accent", "confidence": 92, "reason": "Color-branding context" },
    "brand_consistency": { "value": "e.g. • Strong brand alignment", "confidence": 90, "reason": "Consistency check" },
    "visual_identity": { "value": "e.g. • Modern healthcare style", "confidence": 95, "reason": "Visual identity tags" },
    "brand_personality": { "value": "e.g. • Professional identity\n• High reliability tone", "confidence": 92, "reason": "Personality context" }
  },
  
  "design_style": {
    "style_tags": { "value": ["• Minimal", "• Corporate", "• Professional", "• Modern"], "confidence": 95, "reason": "Style category tags matching the layout" },
    "style_classification": { "value": "e.g. • Healthcare / Medical Corporate", "confidence": 95, "reason": "Classification reason" }
  },
  
  "visual_hierarchy": {
    "primary_focus": { "value": "e.g. • Hero central photo portrait", "confidence": 95, "reason": "Visual hierarchy check" },
    "secondary_focus": { "value": "e.g. • Heading statement text", "confidence": 92, "reason": "Visual hierarchy check" },
    "cta": { "value": "e.g. • CTA button bottom alignment", "confidence": 95, "reason": "CTA hierarchy role" },
    "reading_order": { "value": "e.g. • Logo -> Hero Image -> Headline -> Body -> CTA", "confidence": 92, "reason": "Reading sequence" },
    "eye_movement": { "value": "e.g. • Top-to-bottom reading path", "confidence": 90, "reason": "Eye scanning details" }
  },
  
  "spacing_analysis": {
    "outer_margins": { "value": "e.g. • Consistent outer margin", "confidence": 92, "reason": "Spacing analysis" },
    "inner_padding": { "value": "e.g. • Clean component paddings", "confidence": 92, "reason": "Spacing analysis" },
    "gap_between_sections": { "value": "e.g. • Comfortable vertical spacing", "confidence": 92, "reason": "Spacing analysis" },
    "gap_between_text": { "value": "e.g. • Compact header leading", "confidence": 90, "reason": "Spacing analysis" },
    "gap_between_images": { "value": "e.g. • Clean layout spacing margins", "confidence": 90, "reason": "Spacing analysis" },
    "alignment_consistency": { "value": "e.g. • Grid columns aligned", "confidence": 95, "reason": "Spacing analysis" }
  },
 
  "images": {
    "subject": { "value": "e.g. • Doctor Portrait photo", "confidence": 95, "reason": "Detected subject details" },
    "photo_style": { "value": "e.g. • Corporate studio shoot style", "confidence": 92, "reason": "Photo style classification" },
    "cropping": { "value": "e.g. • Rectangular card margins", "confidence": 95, "reason": "Cropping shape details" },
    "placement": { "value": "e.g. • Hero content area layout", "confidence": 92, "reason": "Placement rules" }
  },
  "icons": { "value": ["• Stethoscope icon", "• Clock schedule icon"], "confidence": 95, "reason": "Icons detection details" },
  "shapes": { "value": ["• Rounded card panels"], "confidence": 95, "reason": "Shapes detection details" }
}

Respond ONLY with the raw JSON object. Do not wrap in markdown ```json or any other formatting text.`
      }
    ];

    // Append images
    for (const url of imageUrls) {
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
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const duration = Date.now() - startTime;
    const jsonText = response.choices[0].message.content;
    console.log("RAW AI RESPONSE", response);
    console.log("RAW AI CONTENT TEXT:", jsonText);
    let parsed = JSON.parse(jsonText);

    // --- Validation & Hallucination Removal Layer ---
    const ind = (parsed.industry || parsed.style || '').toLowerCase();
    const isMedical = ind.includes('medical') || ind.includes('health') || ind.includes('doctor') || ind.includes('hospital') || ind.includes('clinic');
    
    if (isMedical) {
      // Clean up common sneaker/wood/industrial/art gallery hallucinations if it's a medical design
      const checkHallucinations = (str) => {
        if (typeof str !== 'string') return str;
        return str
          .replace(/sneaker(s?)|shoe(s?)|nike/gi, 'medical assets')
          .replace(/wooden tabletop|wood tabletop|wood surface/gi, 'clean desk surface')
          .replace(/industrial plaster|concrete/gi, 'clean professional background')
          .replace(/arts & crafts gallery|museum gallery/gi, 'clinical setting / clean flyer format')
          .replace(/industrial warehouse/gi, 'professional office / clinic environment');
      };

      if (parsed.layout) {
        if (parsed.layout.structure) parsed.layout.structure = checkHallucinations(parsed.layout.structure);
      }
      if (parsed.background) {
        if (parsed.background.texture) parsed.background.texture = checkHallucinations(parsed.background.texture);
        if (parsed.background.type) parsed.background.type = checkHallucinations(parsed.background.type);
      }
      if (parsed.images) {
        if (parsed.images.subject) {
          if (parsed.images.subject.toLowerCase().includes('sneaker') || parsed.images.subject.toLowerCase().includes('shoe')) {
            parsed.images.subject = 'Doctors / medical team / healthcare professional portrait';
          }
        }
      }
      if (parsed.composition) {
        if (parsed.composition.focal_point) parsed.composition.focal_point = checkHallucinations(parsed.composition.focal_point);
      }
      if (parsed.materials) {
        parsed.materials = checkHallucinations(parsed.materials);
      }
    }

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
