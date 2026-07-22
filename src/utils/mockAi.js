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
  const ind = (industry || '').toLowerCase();
  const nameStr = brandName || 'Brand';
  const h = [...nameStr].reduce((a,c) => a + c.charCodeAt(0), 0);

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
  const nameHash = [...fileName].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const archetypes = [
    {
      industry: 'Healthcare/Medical',
      design_type: 'Flyer',
      style: 'Professional, Trustworthy, Healthcare Minimal',
      layout: 'Centered Hero Layout, Clean Section Grid, Balanced White Space',
      typography: 'Bold Sans Serif Headings, Left Aligned Body, Strong Text Hierarchy',
      background: 'Soft Clean Backdrop, Matte Texture, Professional Studio Wash',
      lighting: 'Diffused Overhead Light, Soft Drop Shadows',
      images: 'Doctor Portrait, Clinical Medical Equipment',
      branding: 'Logo Top Left, Corporate Color Accent',
      composition: 'Central Focal Point, Clear Visual Reading Order',
      shapes: ['Rounded Rectangle', 'Circular discount badge'],
      icons: ['Medical stethoscope', 'Heartbeat pulse line', 'Cross badge'],
      materials: 'Off-white textured card stock, smooth leather, and matte painted frames',
      visual_flow: 'Path from top logo down through the diagonal hero into benefits',
      focal_point: 'Doctor Portrait'
    },
    {
      industry: 'Sports/Athletic',
      design_type: 'Social Post',
      style: 'Bold, High-Energy, Dynamic Athletic',
      layout: 'Asymmetric Split Layout, Angled Graphic Panels, High Contrast Spacing',
      typography: 'Heavy Block Sans Serif, High Contrast Text, Center Aligned Title',
      background: 'Dark Textured Canvas, Gritty Charcoal Material',
      lighting: 'Strong Side Key Light, High Contrast Casting Shadows',
      images: 'Athlete Portrait, Action Sports Gear',
      branding: 'Logo Center Top, Dynamic Energy Accents',
      composition: 'High Action Focus, Diagonal Eye Flow',
      shapes: ['Wave', 'Curved overlays'],
      icons: ['Running athlete silhouette', 'Shoe icon', 'Thunder bolt'],
      materials: 'Polished concrete, dark textured plaster, and reflective glass surfaces',
      visual_flow: 'Path from high contrast logo down along the diagonal action grid',
      focal_point: 'Athlete Portrait'
    },
    {
      industry: 'Luxury/Cosmetics',
      design_type: 'Editorial Poster',
      style: 'Luxury, Refined Elegant, Premium Minimal',
      layout: 'Minimalist Grid Layout, Wide Uniform Margins, Airy Spacing',
      typography: 'Sophisticated Serif Heading, Light Sans Serif Body, Generous Letter Spacing',
      background: 'Soft Pastel Backdrop, Smooth Satin Finish, Gentle Glow Wash',
      lighting: 'Soft Studio Ring Light, Specs of White Highlights',
      images: 'Cosmetic Product Shot, Elegant Floral Element',
      branding: 'Logo Bottom Center, Gold Foil Texture Accent',
      composition: 'Balanced Asymmetry, Minimal Visual Noise',
      shapes: ['Rounded card panels'],
      icons: ['Luxury crest', 'Premium gold stars'],
      materials: 'Premium matte paper, glass panels, and painted clean wood tabletop',
      visual_flow: 'Path from central delicate logo down into product features',
      focal_point: 'Cosmetic Product Shot'
    },
    {
      industry: 'Food/Restaurant',
      design_type: 'Social Post',
      style: 'Warm, Friendly, Appetizing Dining',
      layout: 'Two-Column Layout, Hero Food Placement, Clean Coupon Sections',
      typography: 'Friendly Rounded Headings, High Legibility Body',
      background: 'Warm Textured Paper, Natural Wood Backdrop',
      lighting: 'Warm Sunset Lighting, Soft Ambient Glow',
      images: 'Delicious Prepared Dish, Fresh Organic Ingredients',
      branding: 'Logo Top Right, Bold Call-to-Action Chip',
      composition: 'Culinary Focal Point, Top-to-Bottom Flow',
      shapes: ['Circle', 'Circular discount badge'],
      icons: ['Fork and knife icon', 'Special offer star'],
      materials: 'Sleek industrial metal, brushed aluminum frame, and plastic canvas overlays',
      visual_flow: 'Path from appetizing food picture down to price badge',
      focal_point: 'Delicious Prepared Dish'
    },
    {
      industry: 'Technology/Software',
      design_type: 'Web Banner',
      style: 'Futuristic, Sleek Cyber, Modern Corporate',
      layout: 'Diagonal Tech Split, Structured Columns, Hairline Border Dividers',
      typography: 'Technical Monospaced Details, Modern Sans Serif Headings',
      background: 'Dark Carbon Texture, Deep Ambient Glow Backdrop',
      lighting: 'Cyan/Purple Neon Accent Lights, Soft Specular Sheen',
      images: 'App Interface Mockup, Abstract Digital Shapes',
      branding: 'Logo Top Left, Cyber Color Border Highlights',
      composition: 'Interface Focus, Multi-Level Hierarchy',
      shapes: ['Rounded card panels', 'Grid line patterns'],
      icons: ['Design grid indicator', 'Social handles'],
      materials: 'Carbon fiber, dark plastic panels, and emissive LED screens',
      visual_flow: 'Path from software interface down to modern typography',
      focal_point: 'App Interface Mockup'
    },
    {
      industry: 'Travel & Tourism',
      design_type: 'Banner',
      style: 'Adventurous, Scenic, Sunny Mood',
      layout: 'Full Bleed Image Grid, Cozy Split Sections',
      typography: 'Bold Script Accents, High Contrast Sans Serif Headings',
      background: 'Clean Nature Backdrop, Scenic Vista Canvas',
      lighting: 'Natural Sunlight, Warm Atmospheric Highlights',
      images: 'Traveler Portrait, Scenic Mountain View',
      branding: 'Logo Top Left, Travel Seal Accent',
      composition: 'Scenic Focal Point, Left-to-Right Reading Path',
      shapes: ['Circle badge', 'Wavy landscape overlays'],
      icons: ['Compass icon', 'Airplane travel icon'],
      materials: 'Glossy photo paper finish, natural wood paneling',
      visual_flow: 'Path from mountain scene down to contact number',
      focal_point: 'Traveler Portrait'
    },
    {
      industry: 'Real Estate/Architecture',
      design_type: 'Brochure',
      style: 'Elegant, High-End, Structured Modern',
      layout: 'Clean Split Columns, Asymmetric House Showcase',
      typography: 'Geometric Sans Serif, Clean Labels',
      background: 'Smooth Concrete Backdrop, Subtle Plaster Texture',
      lighting: 'Soft Daylight, Sharp Architectural Shadows',
      images: 'Modern Villa Exterior, Clean Kitchen Interior',
      branding: 'Logo Bottom Right, Gold Accent Divider Line',
      composition: 'Geometric Structural Balance, Modern Line Flow',
      shapes: ['Rectangle borders', 'Thin divider lines'],
      icons: ['Home location pin', 'Phone call button'],
      materials: 'Stone tile, polished marble, and matte concrete',
      visual_flow: 'Path from main property photo down into agency badge',
      focal_point: 'Modern Villa Exterior'
    },
    {
      industry: 'Education/Academy',
      design_type: 'Flyer',
      style: 'Friendly, Bright, Informational Corporate',
      layout: 'Centered Section Grid, Cozy Left Column Margin',
      typography: 'Friendly Rounded Sans Serif, Clear Bullet Text',
      background: 'Bright Solid Backdrop, Subtle Classroom Wall Pattern',
      lighting: 'Uniform Diffused Ambient Lighting',
      images: 'Student Portrait, Classroom Graphic',
      branding: 'Logo Top Left, Bright Colorful Accents',
      composition: 'Academic Focus, Top-to-Bottom Read Path',
      shapes: ['Round badges', 'Star graphics'],
      icons: ['Graduation cap icon', 'Open book symbol'],
      materials: 'Recycled paper stock, glossy cover finish',
      visual_flow: 'Path from academy logo down to classroom photo',
      focal_point: 'Student Portrait'
    }
  ];

  // Pick archetype based on filename hash
  const arch = archetypes[nameHash % archetypes.length];

  const colors = arch.industry === 'Healthcare/Medical' ? ['#0284C7', '#0F172A', '#E0F2FE'] :
                 arch.industry === 'Sports/Athletic' ? ['#DC2626', '#18181B', '#F4F4F5'] :
                 arch.industry === 'Luxury/Cosmetics' ? ['#2E1065', '#D946EF', '#FDF4FF'] :
                 arch.industry === 'Food/Restaurant' ? ['#7C2D12', '#F97316', '#FEF3C7'] :
                 arch.industry === 'Technology/Software' ? ['#09090B', '#EC4899', '#3B82F6'] :
                 arch.industry === 'Travel & Tourism' ? ['#D97706', '#1E3A8A', '#FEF3C7'] :
                 arch.industry === 'Real Estate/Architecture' ? ['#1E293B', '#10B981', '#F8FAFC'] :
                 ['#4F46E5', '#1E1B4B', '#EEF2FF'];

  const hex_codes = colors.map((c, idx) => {
    return {
      hex: c,
      percentage: idx === 0 ? 55 : idx === 1 ? 30 : 15
    };
  });
  const extraNeutrals = ['#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'];
  while (hex_codes.length < 8) {
    const nextNeutral = extraNeutrals[hex_codes.length - colors.length] || '#000000';
    hex_codes.push({
      hex: nextNeutral,
      percentage: Math.max(2, Math.round((100 - hex_codes.reduce((acc, x) => acc + x.percentage, 0)) / 2))
    });
  }

  const detectedIndustry = arch.industry;
  const layout = arch.layout;
  const typography = arch.typography;
  const style = arch.style;
  const background = arch.background;
  const lighting = arch.lighting;
  const objects = arch.images;
  const shapes = arch.shapes;
  const icons = arch.icons;
  const composition = arch.composition;
  const materials = arch.materials;
  const visual_flow = arch.visual_flow;
  const assetPlacement = arch.branding || 'unknown';

  const result = {
    industry: { value: detectedIndustry, confidence: 95, reason: "Inferred from template content and style rules" },
    design_type: { 
      value: "Hero Product → Center\nLogo → Top Left\nHeading → Upper Left\nBody Copy → Left Column\nCTA → Bottom Right\nDecorative Shapes → Around Hero Product\nBackground Elements → Behind Hero Product\nLayer Order → Background → Product → Text → CTA\nSafe Margins Maintained", 
      confidence: 95, 
      reason: "Identified asset placement and layout composition order" 
    },
    platform: { value: seed.includes('instagram') ? 'Instagram' : 'unknown', confidence: 85, reason: "Canvas dimensions match platform specs" },
    
    color_palette: {
      hex_codes: hex_codes.map((hc, idx) => ({
        hex: hc.hex,
        rgb: idx === 0 ? "rgb(248, 250, 252)" : idx === 1 ? "rgb(15, 23, 42)" : "rgb(100, 116, 139)",
        percentage: hc.percentage,
        role: idx === 0 ? "Background Color" : idx === 1 ? "Text Color" : "Accent Color",
        brightness: idx === 0 ? "light" : "dark",
        saturation: "muted"
      })),
      confidence: 96,
      reason: "Extracted dominant hex color codes with percentages"
    },

    typography: {
      heading_style: { value: typography.includes('heavy') ? 'Bold, uppercase, heavy letterings' : 'Clean, medium-weight, centered', confidence: 94, reason: "Heading text features detected" },
      subheading_style: { value: 'Medium contrast uppercase subheaders', confidence: 90, reason: "Text style analysis" },
      body_style: { value: 'Regular sans-serif, medium height, left-aligned', confidence: 94, reason: "Body copy details" },
      font_family_guess: { value: seed.includes('serif') ? 'Playfair Display' : 'unknown', confidence: 88, reason: "Serif/sans font properties matching" },
      font_category: { value: seed.includes('serif') ? 'Serif' : 'Sans-Serif', confidence: 94, reason: "Font glyph characteristics" },
      text_alignment: { value: seed.includes('center') ? 'center' : 'left', confidence: 96, reason: "Horizontal text alignments" },
      text_hierarchy: { value: 'High contrast between large headings and compact captions', confidence: 92, reason: "Font size relationships" },
      estimated_font_pairing: { value: seed.includes('serif') ? 'Playfair Display (Headings) / Lora (Body)' : 'Barlow Condensed (Headings) / Archivo (Body)', confidence: 90, reason: "Recommended pairing based on style classification" },
      max_characters_guess: { value: 'Headings ~35 chars, Body ~120 chars', confidence: 85, reason: "Character density calculation" }
    },

    layout: {
      structure: { value: layout, confidence: 95, reason: "Visual grid and boundaries match layout templates" },
      alignment: { value: seed.includes('center') ? 'center' : 'left', confidence: 95, reason: "Visual component distribution check" },
      grid: { value: seed.includes('grid') ? 'three-column' : 'none', confidence: 92, reason: "Grid detection checks" },
      margins: { value: 'Wide uniform spacing margins around edges', confidence: 90, reason: "Margins safety check" },
      padding: { value: 'Comfortable padding inside components', confidence: 90, reason: "Card padding spaces" },
      safe_area: { value: 'Text fully fits inside safe zone boundary lines', confidence: 95, reason: "Safe boundaries check" },
      whitespace: { value: 'Moderate comfortable whitespace and margins', confidence: 94, reason: "Whitespace density check" },
      sections: { value: ['Header', 'Hero Creative Section', 'Service Cards / Feature Grid', 'Footer branding', 'CTA Section'], confidence: 95, reason: "Detected elements based on functional layout blocks" },
      component_positioning: { value: "Relative stacking of elements", confidence: 90, reason: "Relative coordinates check" }
    },

    composition: {
      visual_flow: { value: 'Path from top logo down through the diagonal hero into benefits', confidence: 92, reason: "Linear eye flow path" },
      focal_point: { value: objects.split(', ')[0] || 'Hero product asset', confidence: 95, reason: "Primary contrast visual weight element" },
      balance: { value: 'asymmetric balanced layout', confidence: 92, reason: "Visual weight balance check" },
      rule_of_thirds: { value: 'Focal object sits at intersection lines', confidence: 85, reason: "Composition rules verification" },
      golden_ratio: { value: 'unknown', confidence: 60, reason: "No golden ratio match found" },
      depth: { value: 'layered overlapping cards and shadow depth', confidence: 94, reason: "Visual layering analysis" },
      perspective: { value: 'Eye-level straight-on view', confidence: 90, reason: "Perspective check" },
      layers: { value: 'Foreground product overlay, midground texts, background textured canvas', confidence: 94, reason: "Visual layering description" }
    },

    background: {
      type: { value: background.includes('gradient') ? 'gradient' : 'solid textured', confidence: 95, reason: "Background visual properties check" },
      texture: { value: background.includes('paper') ? 'textured paper' : 'smooth sweep', confidence: 90, reason: "Surface texture analysis" },
      material: { value: background.includes('paper') ? 'paper' : 'plaster', confidence: 90, reason: "Material texture guess" },
      blur: { value: 'none', confidence: 95, reason: "Sharp background details" },
      gradient: { value: background.includes('gradient') ? 'linear vertical' : 'none', confidence: 95, reason: "Gradient check" },
      lighting: { value: 'soft ambient glow', confidence: 90, reason: "Lighting context check" },
      shadow: { value: 'soft drop shadows', confidence: 92, reason: "Shadow properties check" },
      reflection: { value: 'none', confidence: 95, reason: "Reflection properties check" },
      noise: { value: 'fine paper grain', confidence: 90, reason: "Noise check" }
    },

    lighting: {
      direction: { value: lighting.includes('spotlight') ? 'overhead spotlight' : 'soft top-left', confidence: 90, reason: "Lighting direction analysis" },
      intensity: { value: 'high key diffuse', confidence: 90, reason: "Lighting intensity" },
      temperature: { value: 'neutral white', confidence: 92, reason: "Color temperature analysis" },
      softness: { value: 'soft diffuse', confidence: 92, reason: "Ambient soft lighting" },
      shadow_direction: { value: 'cast down and to the right', confidence: 90, reason: "Shadow casting angles" },
      shadow_softness: { value: 'blurry soft edges', confidence: 92, reason: "Shadow hardness review" },
      ambient: { value: 'soft uniform ambient light', confidence: 90, reason: "Ambient light review" },
      highlights: { value: 'soft specular gloss', confidence: 90, reason: "Highlights check" }
    },

    brand_analysis: {
      logo_position: { value: 'top-left corner', confidence: 95, reason: "Branding placeholder placement" },
      brand_colors: { value: 'Navy trust tones representing medical corporate values', confidence: 92, reason: "Color meaning check" },
      brand_consistency: { value: 'high', confidence: 90, reason: "Branding consistency check" },
      visual_identity: { value: detectedIndustry === 'Healthcare/Medical' ? 'professional corporate' : 'playful athletic', confidence: 95, reason: "Branding elements consistency" },
      brand_personality: { value: detectedIndustry === 'Healthcare/Medical' ? 'trustworthy, clinic-focused' : 'active, dynamic', confidence: 92, reason: "Personality tags check" }
    },

    design_style: {
      style_tags: { value: detectedIndustry === 'Healthcare/Medical' ? ['Corporate', 'Medical', 'Clean'] : ['Sports', 'Modern', 'Bold'], confidence: 95, reason: "Design style categories matched" },
      style_classification: { value: detectedIndustry === 'Healthcare/Medical' ? 'Healthcare' : 'Sports', confidence: 95, reason: "Classification tag" }
    },

    visual_hierarchy: {
      primary_focus: { value: 'Large bold headings and central product asset', confidence: 95, reason: "Primary focus analysis" },
      secondary_focus: { value: 'Subheadings and service cards details', confidence: 92, reason: "Secondary focus analysis" },
      cta: { value: 'Pill button in contrast color', confidence: 95, reason: "CTA attention weight" },
      reading_order: { value: 'Top-down reading order flow', confidence: 92, reason: "Visual reading pattern" },
      eye_movement: { value: 'Z-scanning reading pattern from top logo to footer CTA', confidence: 90, reason: "Eye flow check" }
    },

    spacing_analysis: {
      outer_margins: { value: 'Safe 48px borders around elements', confidence: 92, reason: "Spacing review" },
      inner_padding: { value: 'Comfortable 24px padding inside layout components', confidence: 92, reason: "Spacing review" },
      gap_between_sections: { value: 'Sufficient vertical spaces between blocks', confidence: 92, reason: "Spacing review" },
      gap_between_text: { value: 'Compact 8px spacing between header and description', confidence: 90, reason: "Spacing review" },
      gap_between_images: { value: 'none', confidence: 90, reason: "Spacing review" },
      alignment_consistency: { value: 'high consistency', confidence: 95, reason: "Spacing review" }
    },

    images: {
      subject: { value: detectedIndustry === 'Healthcare/Medical' ? 'Doctors / medical team' : 'Brand sneakers / product items', confidence: 95, reason: "Images subject analysis" },
      photo_style: { value: 'Professional studio portrait', confidence: 92, reason: "Images photo style" },
      cropping: { value: 'circular frame', confidence: 95, reason: "Images cropping shapes" },
      placement: { value: assetPlacement, confidence: 92, reason: "Images placement" }
    },
    icons: { value: icons, confidence: 95, reason: "Icons detection details" },
    shapes: { value: shapes, confidence: 95, reason: "Shapes detection details" }
  };

  return result;
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

  const formatPromptField = (val) => {
    if (val === null || val === undefined) return 'Not Detected';
    
    if (typeof val === 'string') {
      const cleanStr = val.trim();
      if (!cleanStr || cleanStr.toLowerCase() === 'not detected' || cleanStr.toLowerCase() === 'unknown') {
        return 'Not Detected';
      }
      return cleanStr.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
        return line.startsWith('•') ? `  ${line}` : `  • ${line}`;
      }).join('\n');
    }
    
    if (typeof val === 'number') {
      return `  • ${val}`;
    }
    
    if (typeof val === 'boolean') {
      return `  • ${val ? 'Yes' : 'No'}`;
    }
    
    if (Array.isArray(val)) {
      if (val.length === 0) return 'Not Detected';
      return val.map(item => {
        const itemStr = typeof item === 'object' ? formatPromptField(item) : String(item).trim();
        return itemStr.startsWith('  •') ? itemStr : `  • ${itemStr}`;
      }).filter(line => line && !line.includes('[object Object]')).join('\n');
    }
    
    if (typeof val === 'object') {
      if ('value' in val) {
        return formatPromptField(val.value);
      }
      if (Object.keys(val).length === 0) return 'Not Detected';
      
      const points = [];
      Object.entries(val).forEach(([k, v]) => {
        if (k === 'confidence' || k === 'reason' || k === 'hex_codes') return;
        const formattedSub = formatPromptField(v);
        if (formattedSub && formattedSub !== 'Not Detected' && !formattedSub.includes('[object Object]')) {
          const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const indentedLines = formattedSub.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
            return line.startsWith('•') ? `    ${line}` : `    • ${line}`;
          }).join('\n');
          points.push(`  • ${cleanKey}:\n${indentedLines}`);
        }
      });
      
      if (points.length === 0) return 'Not Detected';
      return points.join('\n');
    }
    
    return 'Not Detected';
  };

  // Helper to extract clean attributes list for a key
  const getRefAttributes = (key) => {
    if (referenceSettings[key] === false) return [];
    const items = [];
    referenceImages.forEach(r => {
      if (!r.analysis) return;
      const a = r.analysis;
      const sectionData = a[key] || (key === 'branding' ? a.brand_analysis : null) || (key === 'style' ? a.design_style : null);
      if (!sectionData) return;

      const resolveStringVal = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (Array.isArray(obj)) {
          return obj.map(item => resolveStringVal(item)).join('\n');
        }
        if (typeof obj === 'object') {
          if ('value' in obj) {
            return resolveStringVal(obj.value);
          }
          return Object.entries(obj)
            .map(([k2, v2]) => {
              const valStr = resolveStringVal(v2);
              if (!valStr || valStr.toLowerCase() === 'not detected' || valStr.toLowerCase() === 'unknown') return '';
              return valStr;
            })
            .filter(Boolean)
            .join('\n');
        }
        return String(obj);
      };

      const rawStr = resolveStringVal(sectionData);
      const lines = rawStr.split('\n');
      lines.forEach(line => {
        const cleanLine = line.trim().replace(/^[•\-\*\s]+/, '');
        if (cleanLine && cleanLine.toLowerCase() !== 'not detected' && cleanLine.toLowerCase() !== 'unknown') {
          items.push(cleanLine);
        }
      });
    });
    return Array.from(new Set(items));
  };

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

  // Colors Section
  out += `COLORS\n\n`;
  out += `Official Brand Palette\n\n`;
  const brandColors = brand?.colors || [];
  out += (brandColors.length ? brandColors.map(c => `${c}`).join('\n') : 'Not Defined') + '\n\n';

  const refColors = [];
  if (referenceSettings.color_palette !== false) {
    referenceImages.forEach(r => {
      const hexCodes = r.analysis?.color_palette?.hex_codes || r.analysis?.colors || [];
      hexCodes.forEach(c => {
        const hex = typeof c === 'object' ? c.hex : c;
        const role = typeof c === 'object' ? c.role : 'Palette Color';
        if (hex) refColors.push(`${hex} (${role})`);
      });
    });
  }
  const uniqueRefColors = Array.from(new Set(refColors));

  if (uniqueRefColors.length > 0) {
    out += `Reference Color Inspiration\n\n`;
    out += uniqueRefColors.map(c => `${c}`).join('\n') + '\n\n';
    out += `Instructions\n\n`;
    out += `• Use the official brand palette as the PRIMARY visual identity.\n`;
    out += `• Use the selected reference colors ONLY as inspiration.\n`;
    out += `• Reference colors may influence:\n`;
    out += `  - backgrounds\n  - gradients\n  - accent colors\n  - decorative graphics\n  - highlights\n  - supporting elements\n`;
    out += `• Never replace the official brand colors.\n`;
    out += `• Brand colors always have higher priority than reference colors.\n\n`;
  } else {
    out += `Use the official brand color palette exclusively.\n\n`;
  }

  // Typography Section
  out += `TYPOGRAPHY\n\n`;
  if (brand?.typography) {
    const t = brand.typography;
    if (t.heading)                    out += `Primary Font\n\n${t.heading}\n\n`;
    if (t.body)                       out += `Body Font\n\n${t.body}\n\n`;
  }
  const refTypoItems = getRefAttributes('typography');
  if (refTypoItems.length > 0) {
    out += `Reference Typography Inspiration\n\n`;
    out += refTypoItems.map(item => `• ${item}`).join('\n') + '\n\n';
    out += `Instructions\n\n`;
    out += `Keep the official brand fonts.\n\n`;
    out += `Use the reference typography only for:\n`;
    out += `• hierarchy\n• alignment\n• sizing\n• spacing\n• weight\n\n`;
    out += `Never replace the brand fonts.\n\n`;
  }

  // Layout Section
  const refLayoutItems = getRefAttributes('layout');
  if (refLayoutItems.length > 0) {
    out += `LAYOUT\n\n`;
    out += refLayoutItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Composition Section
  const refCompItems = getRefAttributes('composition');
  if (refCompItems.length > 0) {
    out += `COMPOSITION\n\n`;
    out += refCompItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Branding Section
  const refBrandingItems = getRefAttributes('branding');
  if (refBrandingItems.length > 0) {
    out += `BRANDING\n\n`;
    out += refBrandingItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Background Section
  const refBgItems = getRefAttributes('background');
  if (refBgItems.length > 0) {
    out += `BACKGROUND\n\n`;
    out += `Reference Background Inspiration\n\n`;
    out += refBgItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Objects Section
  const refObjectItems = getRefAttributes('images');
  const hasRefObjects = refObjectItems.length > 0;
  if (products.length || hasRefObjects) {
    out += `OBJECTS\n\n`;
    if (products.length) {
      out += `Uploaded Brand Assets\n\n`;
      out += products.map(p => `• ${p.name}`).join('\n') + '\n\n';
    }
    if (hasRefObjects) {
      out += `Reference Object Inspiration\n\n`;
      out += refObjectItems.map(item => `• ${item}`).join('\n') + '\n\n';
      out += `Instructions\n\n`;
      out += `Replace every reference product with the uploaded brand hero product.\n\n`;
      out += `Never recreate reference products.\n\n`;
    }
  }

  // Icons Section
  const refIconItems = getRefAttributes('icons');
  if (refIconItems.length > 0) {
    out += `ICONS\n\n`;
    out += refIconItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Lighting Section
  const refLightingItems = getRefAttributes('lighting');
  if (refLightingItems.length > 0) {
    out += `LIGHTING\n\n`;
    out += `Reference Lighting Inspiration\n\n`;
    out += refLightingItems.map(item => `• ${item}`).join('\n') + '\n\n';
  }

  // Asset Placement Section
  const refPlacementItems = getRefAttributes('design_type');
  if (refPlacementItems.length > 0) {
    out += `ASSET PLACEMENT\n\n`;
    out += refPlacementItems.map(item => `• ${item}`).join('\n') + '\n\n';
    out += `Instructions\n\n`;
    out += `• Place the uploaded hero product at the center as the primary focal object.\n`;
    out += `• Position the uploaded logo in the top-left corner.\n`;
    out += `• Position the heading in the upper-left.\n`;
    out += `• Position the CTA in the bottom-right.\n`;
    out += `• Keep decorative graphics surrounding the hero product.\n`;
    out += `• Maintain the detected spatial relationships while adapting them to the uploaded assets.\n\n`;
    out += `Never reference or recreate the original reference product.\n`;
    out += `Always replace detected products with the uploaded brand hero product.\n\n`;
  }

  // Brand Assets & Rest of Uploads
  out += `BRAND ASSETS\n\n`;
  if (logo) {
    out += `Logo: Use the official brand logo "${logo.name}" from the brand guidelines — place prominently, do not distort, stretch, or modify.\n`;
  } else {
    out += `Logo: Use the official brand logo as defined in the brand guidelines — place prominently, do not distort, stretch, or modify.\n`;
  }
  if (envs.length)       out += `Environment: ${envs.map(a => `"${a.name}"`).join(', ')} — use as atmospheric backdrop or scene.\n`;
  if (packaging.length)  out += `Packaging: ${packaging.map(a => `"${a.name}"`).join(', ')} — show physical brand mockups.\n`;
  if (styleRefs.length)  out += `Style Reference(s): ${styleRefs.map(a => `"${a.name}"`).join(', ')} — use for visual tone only, never copy directly.\n\n`;

  // Remaining general Reference Image Analysis (Industry and Design Style)
  const remainingKeys = ['industry', 'style'];
  const activeRemaining = remainingKeys.filter(k => referenceSettings[k] !== false);

  if (referenceImages.length && activeRemaining.length > 0) {
    out += `REFERENCE IMAGE ANALYSIS & INSPIRATION ATTRIBUTES\n\n`;
    out += `The following uploaded references are for inspiration only — NEVER copy them directly:\n\n`;

    referenceImages.forEach(r => {
      if (!r.analysis) return;
      out += `• Reference "${r.name}" Visual Analysis:\n`;
      const a = r.analysis;

      if (referenceSettings.industry !== false && a.industry) {
        out += `  - Detected Industry:\n${formatPromptField(a.industry)}\n`;
      }
      if (referenceSettings.style !== false && (a.style || a.design_style)) {
        out += `  - Stylistic Mood:\n${formatPromptField(a.style || a.design_style)}\n`;
      }
      if (referenceSettings.layout !== false && a.layout) {
        out += `  - Layout:\n${formatPromptField(a.layout)}\n`;
      }
      if (referenceSettings.composition !== false && a.composition) {
        out += `  - Composition:\n${formatPromptField(a.composition)}\n`;
      }
      if (referenceSettings.branding !== false && (a.branding || a.brand_analysis)) {
        out += `  - Branding:\n${formatPromptField(a.branding || a.brand_analysis)}\n`;
      }
      if (referenceSettings.icons !== false && a.icons) {
        out += `  - Icons:\n${formatPromptField(a.icons)}\n`;
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
  out += `Generate a single, high-quality, production-ready image that strictly follows all of the information provided above, including:\n\n`;
  out += `• Canvas Settings\n• Brand Guidelines\n• Brand Identity\n• Color Palette\n• Typography\n• Brand Assets\n• Campaign Content\n• Brand Rules\n• Design Brief\n• Reference Image Analysis (if provided)\n\n`;
  out += `IMAGE GENERATION REQUIREMENTS\n\n`;
  out += `• Create a premium, original, commercially usable advertisement.\n`;
  out += `• Use the uploaded brand hero product as the primary and most visually dominant focal object.\n`;
  out += `• Use the uploaded official brand logo exactly as provided without distortion, recoloring, stretching, cropping, or modification.\n`;
  out += `• If a Reference Image Analysis is provided, use it only as inspiration for the overall layout, composition, spacing, visual hierarchy, asset placement, typography positioning, background treatment, lighting style, and design aesthetics while creating a new original design.\n`;
  out += `• Never recreate, trace, or copy the reference design exactly.\n`;
  out += `• Preserve the brand identity throughout the entire composition.\n`;
  out += `• Use only the provided brand color palette.\n`;
  out += `• Follow the specified typography and font hierarchy.\n`;
  out += `• Maintain excellent visual hierarchy, spacing, alignment, balance, and consistency.\n`;
  out += `• Keep all important content inside safe margins.\n`;
  out += `• Ensure all text is readable, properly aligned, and visually balanced.\n`;
  out += `• Position the logo, headline, sub-heading, body copy, CTA, and supporting elements professionally.\n`;
  out += `• Use uploaded assets whenever applicable instead of generating replacements.\n`;
  out += `• Ensure the hero product remains the primary focus and is never visually overpowered by decorative elements.\n`;
  out += `• Produce a polished, premium-quality marketing creative suitable for commercial use.\n`;
  out += `• Ensure the final composition perfectly matches the specified canvas size and platform.\n\n`;
  out += `STRICT CONSTRAINTS\n\n`;
  out += `• Do not generate additional products.\n`;
  out += `• Do not replace the uploaded hero product.\n`;
  out += `• Do not replace or recreate the uploaded logo.\n`;
  out += `• Do not distort, stretch, crop, rotate, or modify uploaded assets unless explicitly instructed.\n`;
  out += `• Do not use colors outside the defined brand palette.\n`;
  out += `• Do not introduce unrelated objects, decorations, branding elements, or logos.\n`;
  out += `• Do not generate watermarks, signatures, placeholders, or stock branding.\n`;
  out += `• Do not generate unreadable, overlapping, duplicated, or malformed text.\n`;
  out += `• Do not exceed safe margins.\n`;
  out += `• Do not create low-quality, blurry, pixelated, cluttered, or poorly aligned layouts.\n`;
  out += `• Do not copy existing advertisements, reference images, or copyrighted layouts exactly.\n\n`;
  out += `FINAL OBJECTIVE\n\n`;
  out += `Generate a clean, premium, visually striking, production-ready commercial design that faithfully follows the provided Brand Guidelines, Campaign Content, Brand Rules, Uploaded Assets, and (if available) Reference Image Analysis while remaining completely original and suitable for immediate marketing use.\n`;

  if (out.includes('[object Object]')) {
    console.error("WARNING: Detected [object Object] serialization error in generated prompt!");
    out = out.replace(/\[object Object\]/g, 'Not Detected');
  }

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
