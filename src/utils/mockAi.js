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
  if (colorMode === 'custom' && customColors) {
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
    out += `\nREFERENCE IMAGE ANALYSIS\n`;
    out += `The following uploaded references are for inspiration only — NEVER copy them directly:\n`;
    referenceImages.forEach(r => {
      out += `• "${r.name}" — extract ${r.type || 'layout, composition, and lighting'} inspiration.\n`;
    });
    out += `Analyze: layout composition, typography hierarchy, lighting mood, color distribution, photography style.\n`;
  }

  // Content
  out += `\nDESIGN CONTENT\n`;
  if (designTitle) out += `Campaign: ${designTitle}\n`;
  if (heading)     out += `Heading: "${heading}"\n`;
  if (subHeading)  out += `Sub-heading: "${subHeading}"\n`;
  if (body)        out += `Body: "${body}"\n`;
  if (cta)         out += `CTA: "${cta}"\n`;

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
  out += `Based on the brand identity, canvas specs, design content, and uploaded images defined above, write a detailed, production-ready design prompt specification for the ${bName} brand.\n`;
  out += `The prompt should tell a designer or AI image generator exactly how to style the final layout.\n`;
  out += `It must incorporate the official logo, the products specified, the backdrops requested, and color styles.\n\n`;
  out += `⚠ IMPORTANT — TEXT RESPONSE ONLY:\n`;
  out += `• DO NOT generate, render, or return any image.\n`;
  out += `• DO NOT ask the user for additional details — compile the prompt with the information provided.\n`;
  out += `• Write a detailed design prompt spec that a designer or AI generator can copy to create the final design.\n`;
  out += `• Your entire response must be the final plain-text prompt only.\n\ngenerate`;

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
