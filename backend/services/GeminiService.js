import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim()) {
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } else {
      this.genAI = null;
      this.model = null;
    }
  }

  isAvailable() {
    return !!this.model;
  }

  /**
   * Analyze reference images to extract Style Memory using Gemini Vision
   * @param {Array<string>} imageUrls - Array of base64 data URLs
   */
  async extractStyleMemory(imageUrls) {
    if (!this.model) {
      throw new Error('Gemini client is not initialized. Please set your GEMINI_API_KEY in backend/.env');
    }

    const prompt = `Analyze the provided reference image(s) as an experienced Creative Director, Senior Computer Vision Engineer, and Visual Design Analyst.
Perform a strict visual analysis of what is ACTUALLY visible across multiple stages of analysis. Ground every conclusion strictly in visible evidence from the image (e.g., text content, icons, objects, products, people).
Never guess, assume, use generic templates, or classify based on layout style alone.
If an attribute is not visible or cannot be confidently detected, return "Unknown" for that value. Accuracy is more important than completeness.

Before compiling your response, perform a validation pass and self-check:
1. Ask internally: "Can every conclusion be justified by something visible in the image?" If the answer is NO, replace the value with "Unknown".
2. Ensure there are no contradictions (e.g., if the image contains doctors and medical icons, the industry cannot be Sports/Athletic).

Every description field must contain a concise, structured list of short professional bullet points separated by newlines.
- Maximum 4-5 bullet points.
- Maximum 1 line per point.
- Describe only what actually exists.

Return a structured JSON object matching this schema exactly. Every section and sub-section must contain its value (either text or structured object), an integer confidence rating (0-100), and a brief justification/reasoning:

{
  "industry": { "value": "e.g. Healthcare", "confidence": 95, "reason": "Reason for detection" },
  "design_type": { "value": "e.g. Flyer", "confidence": 95, "reason": "Reason for detection" },
  "platform": { "value": "e.g. Print", "confidence": 90, "reason": "Reason for detection" },
  
  "color_palette": {
    "hex_codes": [],
    "confidence": 100,
    "reason": "Color extraction delegated to pixel-level algorithm"
  },
  
  "typography": {
    "heading_style": { "value": "e.g. Bold Sans Serif, Large Size", "confidence": 92, "reason": "Text style analysis" },
    "subheading_style": { "value": "e.g. Medium Sans Serif, All Caps", "confidence": 92, "reason": "Text style analysis" },
    "body_style": { "value": "e.g. Regular Sans Serif, Left Aligned", "confidence": 90, "reason": "Text style analysis" },
    "font_family_guess": { "value": "Font family name if confidence >90%, else 'Not Detected'", "confidence": 90, "reason": "Font matching" },
    "font_category": { "value": "e.g. Sans-Serif", "confidence": 95, "reason": "Font category" },
    "text_alignment": { "value": "e.g. Left aligned", "confidence": 95, "reason": "Alignment analysis" },
    "text_hierarchy": { "value": "e.g. Strong header contrast", "confidence": 92, "reason": "Hierarchy evaluation" },
    "estimated_font_pairing": { "value": "e.g. Barlow + Archivo", "confidence": 90, "reason": "Font pairing" },
    "max_characters_guess": { "value": "e.g. Heading: 30 chars, Body: 150 chars", "confidence": 85, "reason": "Estimation" }
  },
  
  "layout": {
    "structure": { "value": "e.g. Center Hero Layout, Balanced White Space", "confidence": 95, "reason": "Structure analysis" },
    "alignment": { "value": "e.g. Left-aligned grid", "confidence": 95, "reason": "Alignment evaluation" },
    "grid": { "value": "e.g. Two column grid", "confidence": 92, "reason": "Grid system description" },
    "margins": { "value": "e.g. Wide uniform margins", "confidence": 90, "reason": "Margin assessment" },
    "padding": { "value": "e.g. Generous inner padding", "confidence": 90, "reason": "Padding assessment" },
    "safe_area": { "value": "e.g. Text within safe margin", "confidence": 92, "reason": "Safe area check" },
    "whitespace": { "value": "e.g. Comfortable White Space", "confidence": 95, "reason": "Whitespace assessment" },
    "sections": { "value": ["Header", "Hero Section", "Feature Grid", "CTA", "Footer"], "confidence": 95, "reason": "Functional components" },
    "component_positioning": { "value": "e.g. Logo top-left, CTA bottom-center", "confidence": 90, "reason": "Visual positioning" }
  },
  
  "composition": {
    "visual_flow": { "value": "e.g. Top-to-bottom flow", "confidence": 95, "reason": "Visual flow" },
    "focal_point": { "value": "e.g. Hero central photo", "confidence": 95, "reason": "Focal point analysis" },
    "balance": { "value": "e.g. Asymmetrical balance", "confidence": 92, "reason": "Balance analysis" },
    "rule_of_thirds": { "value": "e.g. Subject aligned left", "confidence": 88, "reason": "Rule of thirds" },
    "golden_ratio": { "value": "e.g. Standard layout scale", "confidence": 80, "reason": "Golden ratio" },
    "depth": { "value": "e.g. Layered composition", "confidence": 92, "reason": "Visual depth" },
    "perspective": { "value": "e.g. Straight-on product angle", "confidence": 90, "reason": "Perspective assessment" },
    "layers": { "value": "e.g. Foreground product, midground text, background canvas", "confidence": 92, "reason": "Layering structure" }
  },
  
  "background": {
    "type": { "value": "e.g. Solid backdrop", "confidence": 95, "reason": "Background type" },
    "texture": { "value": "e.g. Textured canvas", "confidence": 90, "reason": "Texture details" },
    "material": { "value": "e.g. Paper texture", "confidence": 90, "reason": "Material details" },
    "blur": { "value": "e.g. No blur", "confidence": 92, "reason": "Blur analysis" },
    "gradient": { "value": "e.g. Soft linear gradient", "confidence": 95, "reason": "Gradient details" },
    "lighting": { "value": "e.g. Soft ambient wash", "confidence": 90, "reason": "Lighting context" },
    "shadow": { "value": "e.g. Soft drop shadows", "confidence": 92, "reason": "Shadow details" },
    "reflection": { "value": "e.g. None", "confidence": 88, "reason": "Reflection details" },
    "noise": { "value": "e.g. Subtle grain", "confidence": 90, "reason": "Noise details" }
  },
  
  "lighting": {
    "direction": { "value": "e.g. Overhead studio light", "confidence": 90, "reason": "Direction reasoning" },
    "intensity": { "value": "e.g. Soft ambient fill", "confidence": 90, "reason": "Intensity reasoning" },
    "temperature": { "value": "e.g. Neutral white", "confidence": 92, "reason": "Temperature" },
    "softness": { "value": "e.g. Diffused soft lighting", "confidence": 92, "reason": "Softness" },
    "shadow_direction": { "value": "e.g. Drop shadow down-right", "confidence": 90, "reason": "Shadow direction" },
    "shadow_softness": { "value": "e.g. Soft edge shadows", "confidence": 92, "reason": "Shadow softness" },
    "ambient": { "value": "e.g. Studio ambient light", "confidence": 90, "reason": "Ambient light" },
    "highlights": { "value": "e.g. Soft white highlights", "confidence": 92, "reason": "Highlights" }
  },
  
  "brand_analysis": {
    "logo_position": { "value": "e.g. Logo top-left", "confidence": 95, "reason": "Logo location" },
    "brand_colors": { "value": "e.g. Corporate navy accent", "confidence": 92, "reason": "Color context" },
    "brand_consistency": { "value": "e.g. Strong brand alignment", "confidence": 90, "reason": "Consistency check" },
    "visual_identity": { "value": "e.g. Modern healthcare style", "confidence": 95, "reason": "Visual identity" },
    "brand_personality": { "value": "e.g. Professional, reliable", "confidence": 92, "reason": "Personality" }
  },
  
  "design_style": {
    "style_tags": { "value": ["Minimal", "Corporate", "Professional"], "confidence": 95, "reason": "Style tags" },
    "style_classification": { "value": "e.g. Healthcare Corporate", "confidence": 95, "reason": "Classification" }
  },
  
  "visual_hierarchy": {
    "primary_focus": { "value": "e.g. Hero photo portrait", "confidence": 95, "reason": "Hierarchy check" },
    "secondary_focus": { "value": "e.g. Heading text", "confidence": 92, "reason": "Hierarchy check" },
    "cta": { "value": "e.g. CTA button bottom", "confidence": 95, "reason": "CTA role" },
    "reading_order": { "value": "e.g. Logo -> Hero -> Headline -> Body -> CTA", "confidence": 92, "reason": "Reading sequence" },
    "eye_movement": { "value": "e.g. Top-to-bottom reading path", "confidence": 90, "reason": "Eye scanning" }
  },
  
  "spacing_analysis": {
    "outer_margins": { "value": "e.g. Consistent outer margin", "confidence": 92, "reason": "Spacing" },
    "inner_padding": { "value": "e.g. Clean component padding", "confidence": 92, "reason": "Spacing" },
    "gap_between_sections": { "value": "e.g. Comfortable vertical spacing", "confidence": 92, "reason": "Spacing" },
    "gap_between_text": { "value": "e.g. Compact header leading", "confidence": 90, "reason": "Spacing" },
    "gap_between_images": { "value": "e.g. Clean layout margins", "confidence": 90, "reason": "Spacing" },
    "alignment_consistency": { "value": "e.g. Grid columns aligned", "confidence": 95, "reason": "Spacing" }
  },
 
  "images": {
    "subject": { "value": "e.g. Doctor Portrait", "confidence": 95, "reason": "Subject details" },
    "photo_style": { "value": "e.g. Corporate studio shoot", "confidence": 92, "reason": "Photo style" },
    "cropping": { "value": "e.g. Rectangular card crop", "confidence": 95, "reason": "Cropping shape" },
    "placement": { "value": "e.g. Hero content area", "confidence": 92, "reason": "Placement" }
  },
  "icons": { "value": ["Stethoscope icon", "Clock icon"], "confidence": 95, "reason": "Icons detected" },
  "shapes": { "value": ["Rounded card panels"], "confidence": 95, "reason": "Shapes detected" }
}

Respond ONLY with the raw JSON object. Do not wrap in markdown code fences or any other formatting.`;

    // Build image parts from base64 data URLs
    const imageParts = imageUrls.map(url => {
      // Handle base64 data URLs: "data:image/png;base64,iVBOR..."
      if (url.startsWith('data:')) {
        const match = url.match(/^data:(.+?);base64,(.+)$/);
        if (match) {
          return {
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          };
        }
      }
      // If it's a regular URL, we can't directly use it with Gemini inline
      // Return as a text fallback
      return { text: `[Image URL: ${url}]` };
    });

    const startTime = Date.now();

    const result = await this.model.generateContent([
      prompt,
      ...imageParts
    ]);

    const duration = Date.now() - startTime;
    const responseText = result.response.text();

    console.log('[GeminiService] Raw response length:', responseText.length);
    console.log('[GeminiService] Raw response preview:', responseText.substring(0, 300));

    // Clean the response — strip markdown fences if present
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error('[GeminiService] JSON parse failed:', parseErr.message);
      console.error('[GeminiService] Raw text was:', cleanText.substring(0, 500));
      throw new Error('Gemini returned invalid JSON. Please try again.');
    }

    return {
      styleMemory: parsed,
      metadata: {
        model: 'gemini-2.0-flash',
        durationMs: duration,
        costEstimate: 0, // Free tier
        provider: 'google-gemini'
      }
    };
  }
}

export default new GeminiService();
