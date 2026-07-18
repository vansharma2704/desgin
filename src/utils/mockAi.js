// ─── AI Engine — Mock Intelligence for AI Brand Studio ───────────────────────

/** Predict role from filename */
export function predictAssetRole(fileName) {
  const n = fileName.toLowerCase();
  if (/logo|brand[_-]?mark|wordmark/.test(n))                        return 'Logo';
  if (/stadium|arena|field|court|street|park|room|bg|backdrop|env|outdoor|indoor/.test(n))
                                                                      return 'Environment Images';
  if (/box|can|bottle|jar|bag|pack|wrapper|pouch|container/.test(n)) return 'Packaging';
  if (/icon|arrow|star|badge|symbol/.test(n))                        return 'Icons';
  if (/poster|reference|mood|style|inspo|layout|sample|ad|campaign|ref/.test(n))
                                                                      return 'Style References';
  return 'Product Images';
}

/** Extract brand identity from name + industry (simulated) */
export function extractBrandIdentity(brandName, industry = '') {
  const ind = industry.toLowerCase();
  const h = [...brandName].reduce((a,c) => a + c.charCodeAt(0), 0);

  const presets = [
    { colors: ['#FF3B30','#1C1C1E','#FFCC00'], typography: { heading:'Barlow Condensed', body:'Archivo', accent:'Oswald' }, style:'Bold, Athletic, High-Energy', tone:'Confident, Powerful, Premium' },
    { colors: ['#5b5bd6','#0d0f1a','#e0e7ff'], typography: { heading:'Plus Jakarta Sans', body:'Inter', accent:'Space Grotesk' }, style:'Sleek, Futuristic, Clean', tone:'Innovative, Visionary, Direct' },
    { colors: ['#b45309','#1c1917','#fafaf9'], typography: { heading:'Playfair Display', body:'Lora', accent:'Cormorant' }, style:'Luxurious, Editorial, Refined', tone:'Sophisticated, Exclusive, Timeless' },
    { colors: ['#059669','#064e3b','#ecfdf5'], typography: { heading:'Outfit', body:'DM Sans', accent:'Nunito' }, style:'Organic, Calm, Trustworthy', tone:'Friendly, Nurturing, Transparent' },
    { colors: ['#ec4899','#3b0764','#fdf4ff'], typography: { heading:'Cabinet Grotesk', body:'Satoshi', accent:'Clash Display' }, style:'Creative, Bold, Vibrant', tone:'Fun, Engaging, Youthful' },
  ];

  let p = presets[h % presets.length];
  if (/sport|fit|cricket|football|tennis|gym/.test(ind)) p = presets[0];
  else if (/tech|ai|software|saas/.test(ind)) p = presets[1];
  else if (/luxury|fashion|jewel|gold/.test(ind)) p = presets[2];
  else if (/eco|organic|health|wellness|food/.test(ind)) p = presets[3];

  return {
    colors: p.colors,
    typography: p.typography,
    style: p.style,
    tone: p.tone,
    dos: [
      `Lead visual layouts with primary brand color ${p.colors[0]}.`,
      'Maintain consistent whitespace and alignment.',
      'Use strong typographic hierarchy across all designs.',
    ],
    donts: [
      'Never distort or alter the official brand logo.',
      'Avoid mixing conflicting type families in one layout.',
      'Do not use colors outside the defined brand palette.',
    ],
  };
}

/** Generate a logo brief from brand info */
export function generateLogoBrief({ name, industry, description, personality }) {
  const traits = (personality || []).join(', ');
  return `Create a scalable, modern brandmark for "${name}" in the ${industry} sector.
The brand is described as: "${description}".
Visual personality traits: ${traits || 'professional, modern'}.
Requirements:
• Works at all sizes from 16px favicon to billboard.
• Renders cleanly in full black and full white.
• Avoid literal/cliché iconography.
• Prefer geometric precision or editorial elegance.
• Deliver as SVG with safe clear-space guide.

generate logo`;
}

/** mock analyze uploaded reference and return simulated feature extraction */
export function analyzeReferenceImage(fileName) {
  const seed = fileName.toLowerCase();
  
  let colors = ['#F5F5F5', '#111111', '#E2E8F0']; // Clean minimalist gallery theme by default
  
  if (seed.includes('gold') || seed.includes('warm') || seed.includes('luxury')) {
    colors = ['#1E1B4B', '#F59E0B', '#FDF2F8']; // Indigo & Gold
  } else if (seed.includes('retro') || seed.includes('sunset')) {
    colors = ['#7C2D12', '#F97316', '#FEF3C7']; // Warm orange
  } else if (seed.includes('green') || seed.includes('forest')) {
    colors = ['#064E3B', '#10B981', '#ECFDF5']; // Emerald
  } else if (seed.includes('neon') || seed.includes('cyber') || seed.includes('dark')) {
    colors = ['#09090B', '#EC4899', '#3B82F6']; // Cyber dark
  } else if (seed.includes('red') || seed.includes('sport') || seed.includes('poco')) {
    colors = ['#18181B', '#DC2626', '#F4F4F5']; // Crimson
  }

  const isGreen = seed.includes('green') || seed.includes('nike') || seed.includes('dunk') || seed.includes('jordan');
  const isPuma = seed.includes('puma') || seed.includes('ferrari') || seed.includes('pumeee');
  const isStadium = seed.includes('stadium') || seed.includes('field') || seed.includes('sport') || seed.includes('poco');
  const isMinimal = seed.includes('minimal') || seed.includes('clean') || seed.includes('white');

  // Exact Layout mapping
  let layout = 'Centered geometric showcase placing a heavy double-ruled shadow frame around the focal object';
  if (isGreen) {
    layout = 'Minimalist poster layout featuring a prominent dark green central frame housing the sneakers with stylized brand text overlays';
  } else if (isPuma) {
    layout = 'Clean asymmetrical split-frame composition with absolute borders dividing text from layout visuals';
  } else if (isStadium) {
    layout = 'Dynamic athletic action alignment with angled graphic panels and high-energy borders';
  } else if (isMinimal) {
    layout = 'Ultra-clean gallery display showcasing a thin black photo frame border on an off-white background';
  }

  // Exact Typography mapping
  let typography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
  if (isGreen) {
    typography = 'Heavy geometric block sans-serif letterings layered behind the product frame, with clean classic details';
  } else if (isPuma) {
    typography = 'Classy editorial serif (headings) paired with clean geometric sans-serif for secondary details';
  }

  // Exact Style mapping
  let style = 'Refined Artistic Gallery / Premium Editorial Minimal';
  if (isGreen) {
    style = 'Bold Retro Sports Editorial / High Contrast Grid Poster';
  } else if (isPuma) {
    style = 'Modern Luxury Lifestyle / Editorial Fashion Spread';
  } else if (isStadium) {
    style = 'High-Energy Cinematic / Athletic Advertising Poster';
  }

  // Exact Background mapping
  let background = 'Clean, soft-lit museum gallery wall or plaster studio background with subtle ambient drop shadows';
  if (isGreen) {
    background = 'Off-white textured paper mock wall background with minor pins/tapes, casting light natural shadows';
  } else if (isPuma) {
    background = 'Deep charcoal industrial plaster wall casting strong geometric diagonal light beam shadows';
  } else if (isStadium) {
    background = 'Atmospheric wet stadium ground with moody stadium floodlights and fog';
  }

  // Exact Asset Placement mapping
  let assetPlacement = 'The hero product (shoe/item) is placed exactly inside the central photo frame, with logo and caption placed clean outside or overlapping the frame border';
  if (isGreen) {
    assetPlacement = 'The shoes are placed diagonally overlapping a large stylized text logo frame, with smaller captions offset in the corners';
  } else if (isPuma) {
    assetPlacement = 'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned';
  }

  // Extracted Objects
  const objects = seed.includes('green') || seed.includes('nike') || seed.includes('dunk')
    ? 'Sneaker products, Black wooden photo frame border, Green plant pot backdrop decoration, Orange/brown baseball cap accessories'
    : 'Hero product, central photo frame border, floating shadow blocks';

  // 10 Visual design profile fields
  const composition = seed.includes('green') || seed.includes('nike') || seed.includes('dunk')
    ? 'Layered poster setup with sneakers placed in midground, overlapping background typography'
    : 'Centered frame layout with strong visual depth and layering of elements';
    
  const lighting = seed.includes('green') || seed.includes('nike') || seed.includes('dunk')
    ? 'Soft directional window light with natural contrast shadows'
    : 'Soft studio diffusion lighting casting gentle shadows';

  const materials = seed.includes('green') || seed.includes('nike') || seed.includes('dunk')
    ? 'Off-white textured card stock, smooth leather, and matte painted frames'
    : 'Premium matte paper, glass panels, and painted clean wood tabletop';

  const mood = seed.includes('green') || seed.includes('nike') || seed.includes('dunk')
    ? 'Energetic, vintage retro, and highly creative'
    : 'Sophisticated, clean, editorial, and timeless';

  return {
    colors,
    layout,
    composition,
    typography,
    background,
    lighting,
    objects,
    style,
    materials,
    mood
  };
}

/** Master prompt compiler */
export function generatePrompt({
  brand,
  platform,
  designTitle,
  heading,
  subHeading,
  body,
  cta,
  referenceImages = [],
  includedAssets = [],
  systemGuidelines = '',
  colorMode = 'brand',
  customColors = null,
  referenceSettings = {},
}) {
  const bName     = brand?.name || 'the brand';
  const platName  = platform?.name || 'Instagram Post';
  const platSize  = platform?.width && platform?.height
    ? `${platform.width} × ${platform.height} ${platform.unit || 'px'}`
    : '1080 × 1080 px';
  const shape     = platform?.shape || 'Square';

  const logo      = includedAssets.find(a => a.role === 'Logo');
  const products  = includedAssets.filter(a => a.role === 'Product Images');
  const envs      = includedAssets.filter(a => a.role === 'Environment Images');
  const packaging = includedAssets.filter(a => a.role === 'Packaging');
  const styleRefs = includedAssets.filter(a => a.role === 'Style References');

  let out = '';

  // System guidelines block
  if (systemGuidelines?.trim()) {
    out += systemGuidelines.trim() + '\n\n';
    out += '──────────────────────────────────────\n\n';
  }

  // Canvas
  out += `CANVAS\n`;
  out += `Platform: ${platName}\n`;
  out += `Canvas Size: ${platSize}\n`;
  out += `Shape: ${shape}\n\n`;

  // Brand info
  out += `BRAND\n`;
  out += `Name: ${bName}\n`;
  if (brand?.industry) out += `Industry: ${brand.industry}\n`;
  if (brand?.style)    out += `Style: ${brand.style}\n`;
  if (brand?.tone)     out += `Tone: ${brand.tone}\n\n`;

  // Colors
  out += `COLORS\n`;
  const referenceColorsChecked = referenceSettings.colors !== false && referenceImages.some(r => r.analysis?.colors?.length > 0);
  if (referenceColorsChecked) {
    // Gather and union all unique color hex codes from references
    const refColorList = Array.from(new Set(
      referenceImages
        .map(r => r.analysis?.colors)
        .filter(Boolean)
        .flat()
    ));
    out += `Palette (Extracted from uploaded References): ${refColorList.join(', ')}\n`;
    out += `Use color palette inspired by the analyzed reference styles exclusively.\n`;
  } else if (colorMode === 'custom' && customColors) {
    out += `Background: ${customColors.background}\n`;
    out += `Heading: ${customColors.heading}\n`;
    out += `Sub-heading: ${customColors.subheading}\n`;
    out += `Body Text: ${customColors.body}\n`;
  } else {
    out += `Palette: ${(brand?.colors || []).join(', ')}\n`;
    out += `Use official brand color palette exclusively.\n`;
  }

  // Typography
  if (brand?.typography) {
    out += `\nTYPOGRAPHY\n`;
    const t = brand.typography;
    if (t.heading) out += `Heading: ${t.heading}\n`;
    if (t.body)    out += `Body: ${t.body}\n`;
    if (t.accent)  out += `Accent: ${t.accent}\n`;
  }

  // Assets
  out += `\nBRAND ASSETS\n`;
  // Logo — always included from brand guidelines
  if (logo) {
    out += `Logo: Use the official brand logo "${logo.name}" from the brand guidelines — place prominently, do not distort, stretch, or modify.\n`;
  } else {
    out += `Logo: Use the official brand logo as defined in the brand guidelines — place prominently, do not distort, stretch, or modify.\n`;
  }
  if (products.length)   out += `Hero Product(s): ${products.map(a => `"${a.name}"`).join(', ')} — primary visual focal point of the design.\n`;
  if (envs.length)       out += `Environment: ${envs.map(a => `"${a.name}"`).join(', ')} — use as atmospheric backdrop or scene.\n`;
  if (packaging.length)  out += `Packaging: ${packaging.map(a => `"${a.name}"`).join(', ')} — show physical brand mockups.\n`;
  if (styleRefs.length)  out += `Style Reference(s): ${styleRefs.map(a => `"${a.name}"`).join(', ')} — use for visual tone only, never copy directly.\n`;

  // Reference images
  if (referenceImages.length) {
    out += `\nREFERENCE IMAGE ANALYSIS & INSPIRATION ATTRIBUTES\n`;
    out += `The following uploaded references are for inspiration only — NEVER copy them directly:\n`;
    referenceImages.forEach(r => {
      out += `• Reference "${r.name}" Analysis:\n`;
      if (r.analysis) {
        // Output only checked attributes
        Object.entries(r.analysis).forEach(([attr, val]) => {
          const isChecked = referenceSettings[attr] !== false; // default to true
          if (isChecked) {
            // Capitalize attribute name for cleaner display
            const capitalizedAttr = attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1');
            if (attr === 'colors' && Array.isArray(val)) {
              out += `  - ${capitalizedAttr}: Use color palette ${val.join(', ')}\n`;
            } else {
              out += `  - ${capitalizedAttr}: ${val}\n`;
            }
          }
        });
      } else {
        out += `  - General composition and layout style.\n`;
      }
    });
  }

  // Content
  out += `\nDESIGN CONTENT\n`;
  if (designTitle && designTitle.trim()) out += `Campaign: ${designTitle.trim()}\n`;
  if (heading && heading.trim())         out += `Heading: "${heading.trim()}"\n`;
  if (subHeading && subHeading.trim())   out += `Sub-heading: "${subHeading.trim()}"\n`;
  if (body && body.trim())               out += `Body: "${body.trim()}"\n`;
  if (cta && cta.trim())                 out += `CTA: "${cta.trim()}"\n`;

  // Brand rules
  if (brand?.dos?.length || brand?.donts?.length) {
    out += `\nBRAND RULES\n`;
    if (brand?.dos?.length)   out += `DO:\n` + brand.dos.map(d => `• ${d}`).join('\n') + '\n';
    if (brand?.donts?.length) out += `DON'T:\n` + brand.donts.map(d => `• ${d}`).join('\n') + '\n';
  }

  // Output instruction
  out += `\n──────────────────────────────────────\n`;
  out += `OUTPUT INSTRUCTIONS\n`;
  out += `──────────────────────────────────────\n\n`;
  out += `You are an AI Image Prompt Compiler. Based on the rules, assets, campaign content, and reference image analyses described above, write a detailed, high-fidelity image generation prompt (e.g. for Midjourney, DALL-E 3, or Stable Diffusion).\n`;
  out += `This prompt must instruct the generator to build a composite graphic matching the reference layout structure, but substituting the products:\n`;
  out += `• Primary Focal Object: You MUST use the uploaded brand hero products (${products.length ? products.map(a => `"${a.name}"`).join(', ') : '"the primary product asset"'}) as the absolute central focal item. Do NOT generate or describe the reference sneakers/shoes or reference products inside the final layout; instead, drop in the user's uploaded product asset.\n`;
  out += `• Structure: Place the uploaded brand product asset inside the analyzed reference "Layout" structure (e.g. placing the uploaded product inside the central frame border) and "Asset Placement".\n`;
  out += `• Colors & Style: Apply the extracted color palette and editorial style directly to the canvas elements.\n`;
  out += `• Text overlays: Specify placing the typography, headings ("${heading || ''}"), and brand logo cleanly relative to the frame.\n\n`;
  out += `⚠ IMPORTANT — TEXT RESPONSE ONLY:\n`;
  out += `• DO NOT generate or return any actual image.\n`;
  out += `• DO NOT write a conversational response. Write ONLY the final compiled image-generation prompt description ready to copy.\n`;
  out += `• Start your response directly with the prompt description.\n\ngenerate`;

  return out;
}

/** Platforms list */
export const PLATFORMS = [
  // Social Media
  { name:'Instagram Post',   width:1080, height:1080, unit:'px', shape:'Square',    category:'Social Media' },
  { name:'Instagram Story',  width:1080, height:1920, unit:'px', shape:'Portrait',  category:'Social Media' },
  { name:'Facebook Post',    width:1200, height:630,  unit:'px', shape:'Landscape', category:'Social Media' },
  { name:'LinkedIn Post',    width:1200, height:627,  unit:'px', shape:'Landscape', category:'Social Media' },
  { name:'Twitter / X',      width:1600, height:900,  unit:'px', shape:'Landscape', category:'Social Media' },
  { name:'Pinterest Pin',    width:1000, height:1500, unit:'px', shape:'Portrait',  category:'Social Media' },
  { name:'WhatsApp Status',  width:1080, height:1920, unit:'px', shape:'Portrait',  category:'Social Media' },
  // Presentation
  { name:'16:9 Slide',       width:1920, height:1080, unit:'px', shape:'Landscape', category:'Presentation' },
  { name:'4:3 Slide',        width:1024, height:768,  unit:'px', shape:'Landscape', category:'Presentation' },
  { name:'Pitch Deck',       width:1920, height:1080, unit:'px', shape:'Landscape', category:'Presentation' },
  // Printables
  { name:'Poster',           width:18,   height:24,   unit:'in', shape:'Portrait',  category:'Printables' },
  { name:'Flyer',            width:210,  height:297,  unit:'mm', shape:'Portrait',  category:'Printables' },
  { name:'Brochure',         width:210,  height:99,   unit:'mm', shape:'Landscape', category:'Printables' },
  { name:'Business Card',    width:90,   height:55,   unit:'mm', shape:'Landscape', category:'Printables' },
  { name:'Standee',          width:24,   height:60,   unit:'in', shape:'Portrait',  category:'Printables' },
  { name:'Certificate',      width:297,  height:210,  unit:'mm', shape:'Landscape', category:'Printables' },
  { name:'Menu',             width:210,  height:297,  unit:'mm', shape:'Portrait',  category:'Printables' },
  // Marketing
  { name:'Campaign Poster',  width:1080, height:1350, unit:'px', shape:'Portrait',  category:'Marketing' },
  { name:'Web Banner',       width:1920, height:600,  unit:'px', shape:'Landscape', category:'Marketing' },
  { name:'Magazine Cover',   width:2480, height:3508, unit:'px', shape:'Portrait',  category:'Marketing' },
  { name:'Billboard',        width:14,   height:48,   unit:'ft', shape:'Landscape', category:'Marketing' },
  { name:'Product Banner',   width:800,  height:400,  unit:'px', shape:'Landscape', category:'Marketing' },
  // Proposal
  { name:'Business Proposal',width:1920, height:1080, unit:'px', shape:'Landscape', category:'Proposal' },
  { name:'Project Proposal', width:1920, height:1080, unit:'px', shape:'Landscape', category:'Proposal' },
  { name:'Sales Proposal',   width:1920, height:1080, unit:'px', shape:'Landscape', category:'Proposal' },
];
