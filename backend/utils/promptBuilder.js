/**
 * Backend Prompt Builder Module
 * Merges brand identity, guidelines, campaign specs, style memory, template, and user prompt to form a optimized AI generation prompt.
 */
export function buildOptimizedPrompt({
  brand,
  campaign,
  styleMemory,
  userPrompt,
  platform = 'Instagram Post',
  canvasSize = '1080x1080',
  brandGuidelines = '',
  logoUrl = '',
  productImages = [],
  environmentImages = []
}) {
  const brandName = brand?.name || 'the brand';
  const industry = brand?.industry || '';
  const tone = brand?.tone || '';
  const brandStyle = brand?.style || '';

  // Core Guidelines Template
  const defaultGuidelines = brandGuidelines || brand?.description || 'Maintain high visual quality, readable typography, and correct scaling.';

  let promptParts = [];

  promptParts.push(`SYSTEM GUIDELINES:
You are an expert creative director. Synthesize the visual requirements, style memory, brand identity, and user directives below to compose a high-fidelity output scene prompt.

BRAND INFORMATION:
- Brand Name: ${brandName}
- Industry: ${industry}
- Visual Style Tone: ${brandStyle} / ${tone}
- Core Guidelines: ${defaultGuidelines}`);

  // Add Brand Assets details
  if (logoUrl) {
    promptParts.push(`BRAND ASSET - LOGO:
- Official Logo: Available at ${logoUrl}. Place the logo clearly in accordance with branding guidelines.`);
  }

  if (productImages.length > 0) {
    const productsDesc = productImages.map(p => `"${p.fileName || p.name || 'product'}"`).join(', ');
    promptParts.push(`BRAND ASSET - HERO PRODUCTS:
- Hero Products: ${productsDesc}. Place these central to the composition as primary focal points.`);
  }

  if (environmentImages.length > 0) {
    const envDesc = environmentImages.map(e => `"${e.fileName || e.name || 'environment'}"`).join(', ');
    promptParts.push(`BRAND ASSET - ENVIRONMENT / BACKDROP:
- Ambient Environment: ${envDesc}. Set this as the background context for the layout.`);
  }

  // Inject Style Memory
  if (styleMemory) {
    const colorsStr = (styleMemory.colors || []).join(', ');
    const typographyStr = styleMemory.typography 
      ? `Heading: ${styleMemory.typography.heading || 'N/A'}, Body: ${styleMemory.typography.body || 'N/A'}, Accent: ${styleMemory.typography.accent || 'N/A'}`
      : 'N/A';

    promptParts.push(`STYLE MEMORY ATTRIBUTES (Extracted from historical campaign references):
- Extracted Color Palette: ${colorsStr || 'N/A'}
- Extracted Typography Style: ${typographyStr}
- Extracted Composition: ${styleMemory.composition || 'N/A'}
- Extracted Spacing / Density: ${styleMemory.spacing || 'N/A'}
- Extracted Lighting Profile: ${styleMemory.lighting || 'N/A'}
- Extracted Branding Rules: ${styleMemory.branding || 'N/A'}
- Extracted Illustration/Image Style: ${styleMemory.illustrationStyle || 'N/A'}
- Extracted Visual Hierarchy: ${styleMemory.visualHierarchy || 'N/A'}
- Extracted Mood / Vibe: ${styleMemory.mood || 'N/A'}
- Extracted CTA Style: ${styleMemory.ctaStyle || 'N/A'}`);
  }

  promptParts.push(`CAMPAIGN DIRECTIVES & SPECIFICATIONS:
- Campaign Name: ${campaign?.name || 'General Campaign'}
- Platform Target: ${platform}
- Target Aspect / Canvas Size: ${canvasSize}
- User Focus Intent: ${userPrompt || 'Create a clean, appealing product advertisement layout.'}`);

  promptParts.push(`FINAL OUTPUT INSTRUCTIONS:
Describe a fully realized graphic advertisement design layout matching the visual style memory guidelines. Specifically focus on mapping the extracted style parameters (colors, lighting, framing, composition) onto the hero products. Include typography and call-to-actions aligned with the style guidelines.
Provide ONLY the descriptive text prompt for an image generator (like DALL-E 3) without conversational preface.`);

  return promptParts.join('\n\n');
}
