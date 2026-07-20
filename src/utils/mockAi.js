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
  
  // 1. Color Palette Selection
  let colors = ['#F8FAFC', '#0F172A', '#64748B']; // slate cool tech default
  if (seed.includes('gold') || seed.includes('warm') || seed.includes('luxury') || seed.includes('yellow')) {
    colors = ['#1E1B4B', '#F59E0B', '#FEF3C7'];
  } else if (seed.includes('retro') || seed.includes('sunset') || seed.includes('orange')) {
    colors = ['#7C2D12', '#F97316', '#FEF3C7'];
  } else if (seed.includes('green') || seed.includes('forest') || seed.includes('nature') || seed.includes('organic')) {
    colors = ['#064E3B', '#10B981', '#ECFDF5'];
  } else if (seed.includes('neon') || seed.includes('cyber') || seed.includes('dark')) {
    colors = ['#09090B', '#EC4899', '#3B82F6'];
  } else if (seed.includes('red') || seed.includes('sport') || seed.includes('poco') || seed.includes('crimson')) {
    colors = ['#18181B', '#DC2626', '#F4F4F5'];
  } else if (seed.includes('blue') || seed.includes('ocean') || seed.includes('water') || seed.includes('sky')) {
    colors = ['#0F172A', '#0284C7', '#E0F2FE'];
  } else if (seed.includes('purple') || seed.includes('pink') || seed.includes('lavender') || seed.includes('cosmetic')) {
    colors = ['#2E1065', '#D946EF', '#FDF4FF'];
  } else if (seed.includes('pastel') || seed.includes('soft') || seed.includes('light')) {
    colors = ['#FFFBEB', '#F472B6', '#E0F2FE'];
  }

  // 2. Layout construction
  let layout = 'Centered geometric showcase placing a heavy double-ruled shadow frame around the focal object';
  if (seed.includes('minimal') || seed.includes('clean') || seed.includes('white')) {
    layout = 'Ultra-clean gallery display showcasing a thin black photo frame border on an off-white background';
  } else if (seed.includes('sport') || seed.includes('stadium') || seed.includes('run') || seed.includes('action')) {
    layout = 'Dynamic athletic action alignment with angled graphic panels and high-energy borders';
  } else if (seed.includes('fashion') || seed.includes('magazine') || seed.includes('editorial') || seed.includes('puma')) {
    layout = 'Clean asymmetrical split-frame composition with absolute borders dividing text from layout visuals';
  } else if (seed.includes('green') || seed.includes('nike') || seed.includes('dunk') || seed.includes('jordan')) {
    layout = 'Minimalist poster layout featuring a prominent dark green central frame housing the sneakers with stylized brand text overlays';
  } else if (seed.includes('grid') || seed.includes('collage') || seed.includes('split')) {
    layout = 'Structured multi-panel grid system with hairline dividers separating hero product and copy blocks';
  }

  // 3. Typography construction
  let typography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
  if (seed.includes('luxury') || seed.includes('elegant') || seed.includes('editorial') || seed.includes('fashion') || seed.includes('cosmetic')) {
    typography = 'Classy editorial serif (headings) paired with clean geometric sans-serif for secondary details';
  } else if (seed.includes('sport') || seed.includes('bold') || seed.includes('action') || seed.includes('nike')) {
    typography = 'Heavy geometric block sans-serif letterings layered behind the product frame, with clean classic details';
  } else if (seed.includes('cyber') || seed.includes('neon') || seed.includes('tech')) {
    typography = 'Technical monospaced font family (Share Tech Mono) paired with Space Grotesk';
  }

  // 4. Style construction
  let style = 'Refined Artistic Gallery / Premium Editorial Minimal';
  if (seed.includes('retro') || seed.includes('vintage') || seed.includes('classic')) {
    style = 'Bold Retro Sports Editorial / High Contrast Grid Poster';
  } else if (seed.includes('luxury') || seed.includes('premium') || seed.includes('cosmetic') || seed.includes('perfume')) {
    style = 'Modern Luxury Lifestyle / Editorial Fashion Spread';
  } else if (seed.includes('sport') || seed.includes('athletic') || seed.includes('stadium')) {
    style = 'High-Energy Cinematic / Athletic Advertising Poster';
  } else if (seed.includes('cyber') || seed.includes('neon') || seed.includes('dark')) {
    style = 'Industrial Cyberpunk / High Contrast Technical Style';
  }

  // 5. Background construction
  let background = 'Clean, soft-lit museum gallery wall or plaster studio background with subtle ambient drop shadows';
  if (seed.includes('green') || seed.includes('nike') || seed.includes('dunk')) {
    background = 'Off-white textured paper mock wall background with minor pins/tapes, casting light natural shadows';
  } else if (seed.includes('dark') || seed.includes('cyber') || seed.includes('neon')) {
    background = 'Deep charcoal industrial plaster wall casting strong geometric diagonal light beam shadows';
  } else if (seed.includes('stadium') || seed.includes('field') || seed.includes('sport')) {
    background = 'Atmospheric wet stadium ground with moody stadium floodlights and fog';
  } else if (seed.includes('nature') || seed.includes('forest') || seed.includes('outdoor')) {
    background = 'Dappled sunlight passing through forest canopy onto a natural earth or stone pedestal';
  }

  // 6. Asset Placement construction
  let assetPlacement = 'The hero product is placed exactly inside the central photo frame, with logo and caption placed clean outside or overlapping the frame border';
  if (seed.includes('diagonal') || seed.includes('dynamic') || seed.includes('sport')) {
    assetPlacement = 'The product is placed diagonally overlapping a large stylized text logo frame, with smaller captions offset in the corners';
  } else if (seed.includes('asymmetric') || seed.includes('split') || seed.includes('editorial')) {
    assetPlacement = 'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned';
  }

  // 7. Extract objects/elements from file name
  const detectedObjects = [];
  if (seed.includes('shoe') || seed.includes('sneaker') || seed.includes('nike') || seed.includes('dunk') || seed.includes('puma') || seed.includes('jordan')) {
    detectedObjects.push('premium athletic sneaker product');
  } else if (seed.includes('bottle') || seed.includes('drink') || seed.includes('beverage') || seed.includes('can')) {
    detectedObjects.push('beverage container mockups');
  } else if (seed.includes('watch') || seed.includes('perfume') || seed.includes('cosmetic') || seed.includes('makeup')) {
    detectedObjects.push('luxury fashion accessory items');
  } else {
    detectedObjects.push('central hero product focus');
  }

  if (seed.includes('plant') || seed.includes('flower') || seed.includes('leaf') || seed.includes('green')) {
    detectedObjects.push('foliage elements / plant pot decoration');
  }
  if (seed.includes('shadow') || seed.includes('light') || seed.includes('sun')) {
    detectedObjects.push('ambient window frame light shadows');
  } else {
    detectedObjects.push('floating geometric block shadows');
  }
  
  if (detectedObjects.length < 3) {
    detectedObjects.push('minimal decorative pedestal base');
  }

  const objects = detectedObjects.join(', ');

  // 8. Other properties
  const compositions = [
    'Layered poster setup with sneakers/products placed in midground, overlapping background typography',
    'High contrast asymmetrical split-screen with sharp layering and deep midground perspective',
    'Centered frame layout with strong visual depth and layering of elements',
    'Golden spiral layout drawing focal path to the primary foreground frame details'
  ];
  const composition = compositions[nameHash % compositions.length];

  const lightings = [
    'Soft directional window light with natural contrast shadows',
    'Dramatic overhead spotlighting with high contrast and deep industrial shadows',
    'Soft studio diffusion lighting casting gentle shadows',
    'Subtle side key light highlighting edge contours and textured leather highlights'
  ];
  const lighting = lightings[nameHash % lightings.length];

  const materialsList = [
    'Off-white textured card stock, smooth leather, and matte painted frames',
    'Polished concrete, dark textured plaster, and reflective glass surfaces',
    'Premium matte paper, glass panels, and painted clean wood tabletop',
    'Sleek industrial metal, brushed aluminum frame, and plastic canvas overlays'
  ];
  const materials = materialsList[nameHash % materialsList.length];

  const mood = seed.includes('sport') || seed.includes('action')
    ? 'Energetic, vintage retro, and highly creative'
    : 'Sophisticated, clean, editorial, and timeless';

  // Build top 8 color hex codes with percentages based on colors list
  const hex_codes = colors.map((c, idx) => {
    return {
      hex: c,
      percentage: idx === 0 ? 55 : idx === 1 ? 30 : 15
    };
  });
  // Add some fallback neutrals to fill top 8
  const extraNeutrals = ['#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'];
  while (hex_codes.length < 8) {
    const nextNeutral = extraNeutrals[hex_codes.length - colors.length] || '#000000';
    hex_codes.push({
      hex: nextNeutral,
      percentage: Math.max(2, Math.round((100 - hex_codes.reduce((acc, x) => acc + x.percentage, 0)) / 2))
    });
  }

  const detectedIndustry = seed.includes('green') || seed.includes('nike') || seed.includes('dunk') || seed.includes('jordan') || seed.includes('sport')
    ? 'Sports/Athletic'
    : seed.includes('medical') || seed.includes('healthcare') || seed.includes('doctor') || seed.includes('clinic') || seed.includes('hospital')
      ? 'Healthcare/Medical'
      : 'Corporate/General';

  const shapes = [];
  if (seed.includes('wave') || seed.includes('curve')) shapes.push('Wave', 'Curved overlays');
  if (seed.includes('circle') || seed.includes('badge')) shapes.push('Circle', 'Circular discount badge');
  if (seed.includes('square') || seed.includes('card')) shapes.push('Rounded Rectangle');

  const icons = [];
  if (detectedIndustry === 'Healthcare/Medical') {
    icons.push('Medical stethoscope', 'Heartbeat pulse line', 'Cross badge');
  } else if (detectedIndustry === 'Sports/Athletic') {
    icons.push('Running athlete silhouette', 'Shoe icon', 'Thunder bolt');
  } else {
    icons.push('Design grid indicator', 'Social handles');
  }

  const result = {
    industry: { value: detectedIndustry, confidence: 95, reason: "Inferred from template content and style rules" },
    design_type: { value: seed.includes('flyer') ? 'Flyer' : 'Social Post', confidence: 92, reason: "Identified visual format size and proportions" },
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
    console.log("REFERENCE ANALYSIS OBJECT", JSON.stringify(referenceImages.map(r => r.analysis), null, 2));

    referenceImages.forEach(r => {
      out += `• Reference "${r.name}" Visual Analysis:\n`;
      if (r.analysis) {
        const a = r.analysis;
        
        // 1. Industry & Style Category
        if (referenceSettings.industry !== false && a.industry) {
          out += `  - Detected Industry:\n${formatPromptField(a.industry)}\n`;
        }
        if (referenceSettings.design_type !== false && a.design_type) {
          out += `  - Design Format:\n${formatPromptField(a.design_type)}\n`;
        }
        if (referenceSettings.style !== false && (a.style || a.design_style)) {
          out += `  - Stylistic Mood:\n${formatPromptField(a.style || a.design_style)}\n`;
        }

        // 2. Colors Palette
        if (referenceSettings.color_palette !== false && a.color_palette) {
          const hexes = (a.color_palette.hex_codes || []).map(h => `${h.hex} (${h.percentage}%)`).join(', ');
          out += `  - Color Palette & Dominance: ${hexes}\n`;
          if (a.color_palette.background) {
            out += `  - Background Color Context: ${formatPromptField(a.color_palette.background)}\n`;
          }
        }

        // 3. Layout Details
        if (referenceSettings.layout !== false && a.layout) {
          out += `  - Layout:\n${formatPromptField(a.layout)}\n`;
        }

        // 4. Typography Rules
        if (referenceSettings.typography !== false && a.typography) {
          out += `  - Typography:\n${formatPromptField(a.typography)}\n`;
        }

        // 5. Composition Metrics
        if (referenceSettings.composition !== false && a.composition) {
          out += `  - Composition:\n${formatPromptField(a.composition)}\n`;
        }

        // 6. Background Details
        if (referenceSettings.background !== false && a.background) {
          out += `  - Background:\n${formatPromptField(a.background)}\n`;
        }

        // 7. Images / Photography
        if (referenceSettings.images !== false && a.images) {
          out += `  - Objects / Subject:\n${formatPromptField(a.images)}\n`;
        }

        // 8. Design details (shapes, icons, branding, CTA, lighting, depth)
        if (referenceSettings.shapes !== false && a.shapes) {
          out += `  - Shapes:\n${formatPromptField(a.shapes)}\n`;
        }
        if (referenceSettings.icons !== false && a.icons) {
          out += `  - Icons:\n${formatPromptField(a.icons)}\n`;
        }
        if (referenceSettings.branding !== false && (a.branding || a.brand_analysis)) {
          out += `  - Branding:\n${formatPromptField(a.branding || a.brand_analysis)}\n`;
        }
        if (referenceSettings.cta !== false && a.cta) {
          out += `  - CTA Button:\n${formatPromptField(a.cta)}\n`;
        }
        if (referenceSettings.lighting !== false && a.lighting) {
          out += `  - Lighting:\n${formatPromptField(a.lighting)}\n`;
        }
        if (referenceSettings.depth !== false && a.depth) {
          out += `  - Depth / Layering:\n${formatPromptField(a.depth)}\n`;
        }
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
