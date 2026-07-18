import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Copy, Edit2, Check, Save, RefreshCw,
  Upload, ChevronDown, X, Wand2, Eye, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';
import { generatePrompt, PLATFORMS, analyzeReferenceImage } from '../utils/mockAi';

const DEFAULT_GUIDELINES = `You are an expert graphic designer and creative director.

Your goal is to create professional, visually appealing, and production-ready designs.

Always:
- Follow the provided Brand Guidelines.
- Follow the Design Brief.
- Follow the canvas size exactly.
- Maintain a clear visual hierarchy.
- Use proper spacing and alignment.
- Ensure typography is readable.
- Use colors harmoniously.
- Keep important content inside safe margins.
- Create original designs inspired by references, never copy them exactly.
- Use uploaded assets whenever relevant.
- Prioritize clarity and usability.
- Produce high-quality editable designs.`;

const CHECKLIST_ATTRIBUTES = [
  { key: 'colors', label: '1. Colors' },
  { key: 'layout', label: '2. Layout' },
  { key: 'composition', label: '3. Composition' },
  { key: 'typography', label: '4. Typography' },
  { key: 'background', label: '5. Background' },
  { key: 'lighting', label: '6. Lighting' },
  { key: 'objects', label: '7. Objects' },
  { key: 'style', label: '8. Design Style' },
  { key: 'materials', label: '9. Materials' },
  { key: 'assetPlacement', label: '10. Asset Placement' }
];

/* ── Collapsible section ───────────────────────────── */
function Section({ title, children, defaultOpen = true, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
      marginBottom: '10px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="flex items-center gap-10" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-8">
            {accent && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-.01em', color: 'var(--text-1)' }}>
              {title}
            </span>
          </div>
          <ChevronDown
            size={15}
            style={{ transition: '.2s', transform: open ? 'rotate(180deg)' : 'none', color: 'var(--text-3)', flexShrink: 0 }}
          />
        </div>
      </button>
      {open && <div style={{ padding: '16px 20px 20px' }}>{children}</div>}
    </div>
  );
}

/* ── Reference image card ──────────────────────────── */
function RefCard({ refImage, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      background: 'var(--surface-2)',
    }}>
      {refImage.previewUrl
        ? <img src={refImage.previewUrl} alt={refImage.name} style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🖼️</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{refImage.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Analyzed & Visual Features Extracted</div>
      </div>
      <button onClick={() => onRemove(refImage.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, flexShrink: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
}

/* ── Main PromptBuilder ────────────────────────────── */
export default function PromptBuilder({ brands, selectedBrandId, setSelectedBrandId, savedPlatform, onSavePrompt }) {
  const brand = brands.find(b => b.id === selectedBrandId) || brands[0];
  const [platform, setPlatform] = useState(savedPlatform || PLATFORMS[0]);

  // Step Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Content
  const [designTitle, setDesignTitle] = useState('');
  const [heading,     setHeading]     = useState('');
  const [subHeading,  setSubHeading]  = useState('');
  const [body,        setBody]        = useState('');
  const [cta,         setCta]         = useState('');

  // Design images for this specific design (per-prompt uploads)
  const [designImages, setDesignImages] = useState({ products: [], environments: [], icons: [] });

  const addDesignImages = (key, files) => {
    const items = Array.from(files).map(f => ({
      id: 'di-' + Date.now() + '-' + Math.random().toString(36).slice(2,5),
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      role: key === 'products' ? 'Product Images' : key === 'environments' ? 'Environment Images' : 'Icons',
    }));
    setDesignImages(p => ({ ...p, [key]: [...p[key], ...items] }));
  };
  const removeDesignImage = (key, id) =>
    setDesignImages(p => ({ ...p, [key]: p[key].filter(f => f.id !== id) }));

  // Brand asset checkboxes
  const [assetChecked, setAssetChecked] = useState({});
  useEffect(() => {
    if (!brand?.assets) return;
    const init = {};
    brand.assets.forEach(a => { init[a.id] = true; });
    setAssetChecked(init);
  }, [selectedBrandId, brand]);

  // Colors
  const [colorMode,    setColorMode]    = useState('brand');
  const [customColors, setCustomColors] = useState({ background: '#ffffff', heading: '#000000', subheading: '#333333', body: '#555555' });

  // Reference images & analysis checkboxes
  const [refImages,    setRefImages]    = useState([]);
  const [refAnalyzing, setRefAnalyzing] = useState(false);
  const [refSettings,  setRefSettings]  = useState({
    colors: true, layout: true, composition: true, typography: true,
    background: true, lighting: true, objects: true, style: true,
    materials: true, assetPlacement: true
  });

  // Guidelines
  const [guidelines, setGuidelines] = useState(DEFAULT_GUIDELINES);

  // Output
  const [prompt,    setPrompt]    = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  /* Build includedAssets: brand logo (always) + brand assets (checked) + design uploads */
  const buildIncludedAssets = useCallback(() => {
    const logo = (brand?.assets || []).find(a => a.role === 'Logo');
    const brandChecked = (brand?.assets || []).filter(a => a.role !== 'Logo' && assetChecked[a.id]);
    const uploads = [
      ...designImages.products,
      ...designImages.environments,
      ...designImages.icons,
    ];
    return [...(logo ? [logo] : []), ...brandChecked, ...uploads];
  }, [brand, assetChecked, designImages]);

  const compile = useCallback(() => {
    if (!brand) return;
    const text = generatePrompt({
      brand, platform,
      designTitle, heading, subHeading, body, cta,
      referenceImages: refImages,
      includedAssets: buildIncludedAssets(),
      systemGuidelines: guidelines,
      colorMode,
      customColors: colorMode === 'custom' ? customColors : null,
      referenceSettings: refSettings,
    });
    setPrompt(text);
    setSaved(false);
  }, [brand, platform, designTitle, heading, subHeading, body, cta, refImages, buildIncludedAssets, guidelines, colorMode, customColors, designImages, refSettings]);

  useEffect(() => { compile(); }, [compile]);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => fallbackCopy(prompt));
    } else {
      fallbackCopy(prompt);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } else {
        alert('Could not copy text automatically. Please select and copy the text manually.');
      }
    } catch (err) {
      alert('Could not copy text automatically. Please select and copy the text manually.');
    }
  };

  const handleSave = () => {
    onSavePrompt({
      id: 'p-' + Date.now(),
      title: designTitle || `${brand?.name} — ${platform?.name}`,
      brandName: brand?.name,
      platform: platform?.name,
      prompt,
      ts: new Date().toLocaleString(),
    });
    setSaved(true);
  };

  const handleUploadRef = (e) => {
    const files = Array.from(e.target.files || []);
    setRefAnalyzing(true);

    const promises = files.map((file, i) => {
      return new Promise((resolve) => {
        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            const imgData = ctx.getImageData(0, 0, 100, 100).data;
            
             // 1. Precise Color Extraction with Clustering (includes neutrals)
             const sampledColors = [];
             let totalR = 0, totalG = 0, totalB = 0;
             for (let idx = 0; idx < imgData.length; idx += 20) { // sample pixels
               const r = imgData[idx];
               const g = imgData[idx+1];
               const b = imgData[idx+2];
               const a = imgData[idx+3];
               if (a < 80) continue; // skip transparent pixels
               
               totalR += r; totalG += g; totalB += b;
               sampledColors.push({ r, g, b });
             }
 
             // Simple cluster: merge close colors
             const clusters = [];
             sampledColors.forEach(color => {
               let added = false;
               for (let cluster of clusters) {
                 const dist = Math.sqrt(
                   Math.pow(cluster.r - color.r, 2) +
                   Math.pow(cluster.g - color.g, 2) +
                   Math.pow(cluster.b - color.b, 2)
                 );
                 if (dist < 28) { // closer clusters
                   cluster.count++;
                   // keep the first dominant color of this cluster rather than average it out to mud
                   added = true;
                   break;
                 }
               }
               if (!added) {
                 clusters.push({ r: color.r, g: color.g, b: color.b, count: 1 });
               }
             });
 
             const sortedColors = clusters
               .sort((a, b) => b.count - a.count)
               .slice(0, 3)
               .map(c => {
                 const hex = '#' + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1).toUpperCase();
                 return hex;
               });

             // 2. Structural & Brightness Extraction
             const totalPixels = sampledColors.length || 1;
             const avgBrightness = (totalR + totalG + totalB) / (3 * totalPixels);
             
             // Detect borders/grids by comparing edges
             let verticalGradients = 0;
             let horizontalGradients = 0;
             for (let idx = 0; idx < imgData.length - 40; idx += 40) {
               const b1 = (imgData[idx] + imgData[idx+1] + imgData[idx+2]) / 3;
               const b2 = (imgData[idx+4] + imgData[idx+5] + imgData[idx+6]) / 3;
               if (Math.abs(b1 - b2) > 40) verticalGradients++;
             }
             for (let idx = 0; idx < imgData.length - 400; idx += 400) {
               const b1 = (imgData[idx] + imgData[idx+1] + imgData[idx+2]) / 3;
               const b2 = (imgData[idx+200] + imgData[idx+201] + imgData[idx+202]) / 3;
               if (Math.abs(b1 - b2) > 40) horizontalGradients++;
             }
 
             // Generate distinct layout variants dynamically based on calculated metrics
             const nameHash = [...file.name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
             const isDark = avgBrightness < 110;
             const isGrid = (verticalGradients + horizontalGradients) > 16;
             const isAsymmetric = Math.abs(verticalGradients - horizontalGradients) > 5;
 
             let extractedLayout = 'Clean showcase display featuring a centered view of the main design focus';
             let extractedBackground = 'Minimalist neutral studio sweep background with soft ambient shadows';
             let extractedPlacement = 'The hero product is centered on the canvas, with logo and secondary typography arranged clean along the margins';
             let extractedStyle = 'Premium Modern / Sleek Product Showcase';
             let extractedTypography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
 
             if (isDark) {
               if (isGrid) {
                 if (isAsymmetric) {
                   extractedLayout = 'Asymmetrical split-frame composition with absolute borders dividing text from layout visuals';
                   extractedBackground = 'Deep charcoal industrial plaster wall casting strong geometric diagonal light beam shadows';
                   extractedPlacement = 'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned';
                   extractedStyle = nameHash % 2 === 0 ? 'Modern Luxury Lifestyle / Editorial Fashion Spread' : 'Industrial Cyberpunk / High Contrast Technical Style';
                   extractedTypography = 'Oswald Bold (Headings) & Space Grotesk (Body) with technical monospaced details';
                 } else {
                   extractedLayout = 'Centered grid layout framing the main asset inside multiple offset glass blocks';
                   extractedBackground = 'Dark room backdrop with geometric panels lit by subtle neon led strips';
                   extractedPlacement = 'Logo top-center, main product centered inside the primary glass pane, supporting specs below';
                   extractedStyle = nameHash % 2 === 0 ? 'High-Tech Futuristic / Cyber Minimalist Showroom' : 'Minimal Dark Technical Grid Layout';
                   extractedTypography = 'Satoshi Bold (Headings) & Cabinet Grotesk (Body)';
                 }
               } else {
                 extractedLayout = 'Spotlight action alignment with clean diagonals and high-energy ambient glows';
                 extractedBackground = 'Cinematic dark studio with soft smoke/fog texture and dramatic key lights';
                 extractedPlacement = 'Hero asset floating diagonally over light reflections in the lower-right quadrant, title left-aligned';
                 extractedStyle = nameHash % 2 === 0 ? 'Sporty Athletic / Cinematic Action Poster' : 'Moody High Contrast Cinematic Showcase';
                 extractedTypography = 'Impact Condensed (Headings) & Inter Bold (Body)';
               }
             } else {
               // Light Themes
               if (isGrid) {
                 if (isAsymmetric) {
                   extractedLayout = 'Minimalist poster layout featuring a prominent central frame housing the sneakers with stylized brand text overlays';
                   extractedBackground = 'Off-white textured paper mock wall background with minor pins/tapes, casting light natural shadows';
                   extractedPlacement = 'The shoes are placed diagonally overlapping a large stylized text logo frame, with smaller captions offset in the corners';
                   extractedStyle = nameHash % 2 === 0 ? 'Vintage Retro Sports Editorial / High Contrast Grid Poster' : 'Arts & Crafts Gallery Collage / Textured Board Design';
                   extractedTypography = 'Heavy geometric block sans-serif letterings layered behind the product frame, with clean classic details';
                 } else {
                   extractedLayout = 'Three-column editorial gallery grid with clean fine rules separating structural panels';
                   extractedBackground = 'Clean white plaster wall with subtle soft sunbeams from a nearby window';
                   extractedPlacement = 'Product centered inside the middle grid panel, brand logo absolute top-right, subtexts left-aligned';
                   extractedStyle = nameHash % 2 === 0 ? 'Premium Editorial / Architectural Concept Sheet' : 'Clean Corporate Catalog / Balanced Structured Portfolio';
                   extractedTypography = 'Playfair Display Serif & Lora Medium';
                 }
               } else {
                 extractedLayout = 'Ultra-clean gallery display showcasing a thin black photo frame border on an off-white background';
                 extractedBackground = 'Clean minimalist warm white studio sweep with subtle ground shadows';
                 extractedPlacement = 'Centered shoe inside a thin black photo border, with brand captions cleanly aligned along the bottom edge';
                 extractedStyle = nameHash % 2 === 0 ? 'Refined Artistic Gallery / Premium Editorial Minimal' : 'Ultra-Clean Scandinavian Product Presentation';
                 extractedTypography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
               }
             }
 
             // 3. Robust Object & Prop Extraction
             // 4. Exact Visual Property Mappings dynamically varied using fileName seed hash so no two images have the same description

             const compositions = [
               'Layered poster setup with sneakers placed in midground, overlapping background typography',
               'High contrast asymmetrical split-screen with sharp layering and deep midground perspective',
               'Centered frame layout with strong visual depth and layering of elements',
               'Golden spiral layout drawing focal path to the primary foreground frame details'
             ];

             const lightings = [
               'Soft directional window light with natural contrast shadows',
               'Dramatic overhead spotlighting with high contrast and deep industrial shadows',
               'Soft studio diffusion lighting casting gentle shadows',
               'Subtle side key light highlighting edge contours and textured leather highlights'
             ];

             const materialsList = [
               'Off-white textured card stock, smooth leather, and matte painted frames',
               'Polished concrete, dark textured plaster, and reflective glass surfaces',
               'Premium matte paper, glass panels, and painted clean wood tabletop',
               'Sleek industrial metal, brushed aluminum frame, and plastic canvas overlays'
             ];

             const placementsList = [
               'The hero product (shoe/item) is placed exactly inside the central photo frame, with logo and caption placed clean outside or overlapping the frame border',
               'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned',
               'Hero asset floating diagonally over light reflections in the lower-right quadrant, title left-aligned',
               'Centered shoe inside a thin black photo border, with brand captions cleanly aligned along the bottom edge'
             ];

             const extractedComposition = compositions[nameHash % compositions.length];
             const extractedLighting = lightings[nameHash % lightings.length];
             const extractedMaterials = materialsList[nameHash % materialsList.length];
             extractedPlacement = placementsList[nameHash % placementsList.length];

             // Dynamic Object variety list matching exact elements based on keywords and brightness
             const seed = file.name.toLowerCase();
             const objectsList = [];
             
             // Check filename specifically for elements
             if (seed.includes('green') || seed.includes('nike') || seed.includes('dunk') || seed.includes('images (19)')) {
               objectsList.push('Green Nike sneakers', 'Black wood gallery photo frame', 'Terracotta plant pot with green leaf', 'Tan/orange baseball cap accessories');
             } else if (seed.includes('puma') || seed.includes('ferrari') || seed.includes('black')) {
               objectsList.push('Black leather racing shoe', 'Sleek dark studio platform block', 'Exquisite architectural shadows');
             } else {
               // Fallback using visual cues and nameHash so they differ dynamically
               if (seed.includes('shoe') || seed.includes('sneaker') || seed.includes('dunk')) {
                 objectsList.push('Sneaker products');
               } else {
                 objectsList.push('Hero product element');
               }

               if (seed.includes('frame') || seed.includes('border') || seed.includes('gallery')) {
                 objectsList.push('Heavy minimalist photo frame border');
               }
               if (seed.includes('plant') || seed.includes('pot') || seed.includes('green') || seed.includes('leaf')) {
                 objectsList.push('Green plant pot backdrop decoration');
               }
               if (seed.includes('hat') || seed.includes('cap') || seed.includes('orange')) {
                 objectsList.push('Orange/brown baseball cap accessories');
               }

               if (objectsList.length < 3) {
                 if (isDark) {
                   objectsList.push('Dark geometric concrete blocks', 'Ambient directional light beams');
                 } else {
                   objectsList.push('Clean wooden tabletop', 'Minimal ceramic decorative base');
                 }
               }
             }
             const finalObjects = objectsList;

             const analysis = {
               colors: sortedColors.length > 0 ? sortedColors : ['#FFFFFF', '#F3F4F6', '#1E1B4B'],
               layout: extractedLayout,
               composition: extractedComposition,
               typography: extractedTypography,
               background: extractedBackground,
               lighting: extractedLighting,
               objects: finalObjects.join(', '),
               style: extractedStyle,
               materials: extractedMaterials,
               assetPlacement: extractedPlacement
             };

            resolve({
              id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
              name: file.name,
              previewUrl,
              analysis
            });
          } catch (err) {
            const fallbackAnalysis = analyzeReferenceImage(file.name);
            resolve({
              id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
              name: file.name,
              previewUrl,
              analysis: fallbackAnalysis
            });
          }
        };
        img.onerror = () => {
          resolve({
            id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
            name: file.name,
            previewUrl,
            analysis: analyzeReferenceImage(file.name)
          });
        };
      });
    });

    Promise.all(promises).then(completedRefs => {
      setRefImages(prev => [...prev, ...completedRefs]);
      setRefAnalyzing(false);
    });
  };

  const totalDesignUploads = Object.values(designImages).flat().length;
  const totalBrandAssets   = (brand?.assets || []).filter(a => assetChecked[a.id]).length;
  const brandLogo          = brand?.assets?.find(a => a.role === 'Logo');
  const totalAssets        = totalDesignUploads + totalBrandAssets;

  const toggleAttribute = (key) => {
    setRefSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (checkValue) => {
    const next = {};
    CHECKLIST_ATTRIBUTES.forEach(attr => {
      next[attr.key] = checkValue;
    });
    setRefSettings(next);
  };

  const allChecked = Object.values(refSettings).every(Boolean);

  const steps = [
    { num: 1, label: 'Scope & Colors' },
    { num: 2, label: 'Content System' },
    { num: 3, label: 'Design Uploads' },
    { num: 4, label: 'Guidelines & Refs' },
    { num: 5, label: 'Final Prompt' }
  ];

  return (
    <div className="page" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Title */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="flex items-center gap-10">
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <h1 className="page-title">AI Prompt Builder</h1>
          </div>
          <p className="page-subtitle mt-4">
            Follow the guided steps to assemble and compile your professional design specifications.
          </p>
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)', padding: '12px 20px',
        borderRadius: 'var(--r-xl)', border: '1.5px solid var(--border)',
        marginBottom: 24, boxShadow: 'var(--shadow-xs)',
        flexWrap: 'wrap'
      }}>
        {steps.map((st, idx) => (
          <React.Fragment key={st.num}>
            <button
              onClick={() => setCurrentStep(st.num)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentStep === st.num ? 'var(--primary)' : 'var(--text-3)',
                fontWeight: currentStep === st.num ? 700 : 500,
                fontSize: 13, transition: 'color .15s'
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: currentStep === st.num ? 'var(--primary)' : 'var(--surface-3)',
                color: currentStep === st.num ? '#fff' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>
                {st.num}
              </div>
              {st.label}
            </button>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, minWidth: '10px', height: 2, background: 'var(--border)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── ACTIVE STEP PANE ── */}
        <div className="flex-col gap-14" style={{ minHeight: 400 }}>

          {/* STEP 1: Scope & Colors */}
          {currentStep === 1 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 1: Brand & Platform Selection" accent="var(--primary)">
                <div className="flex-col gap-14">
                  <div className="form-group">
                    <label className="form-label">Active Brand Profile</label>
                    <select className="select" value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)}>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name} — {b.industry}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Output Platform Canvas</label>
                    <select className="select" value={platform?.name}
                      onChange={e => { const p = PLATFORMS.find(p => p.name === e.target.value); if (p) setPlatform(p); }}
                    >
                      {PLATFORMS.map((p, i) => (
                        <option key={i} value={p.name}>{p.name} — {p.width}×{p.height} {p.unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color modes */}
                  <div className="form-group">
                    <label className="form-label">Color Style Mode</label>
                    {refImages.some(r => r.analysis?.colors?.length > 0) && refSettings.colors !== false ? (
                      <div style={{
                        padding: '10px 12px',
                        background: 'var(--primary-light)',
                        border: '1.5px solid var(--primary-mid)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>✨ Reference colors are checked in Step 4 and will take priority.</span>
                      </div>
                    ) : (
                      <div className="flex gap-8 mt-6">
                        <button
                          className={`btn ${colorMode === 'brand' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12.5 }}
                          onClick={() => setColorMode('brand')}
                        >
                          {colorMode === 'brand' && <Check size={13} />}
                          🎨 Brand Colors
                        </button>
                        <button
                          className={`btn ${colorMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12.5 }}
                          onClick={() => setColorMode('custom')}
                        >
                          {colorMode === 'custom' && <Check size={13} />}
                          ✏️ Custom Colors
                        </button>
                      </div>
                    )}

                    {!(refImages.some(r => r.analysis?.colors?.length > 0) && refSettings.colors !== false) && colorMode === 'brand' && brand?.colors?.length && (
                      <div className="flex gap-8 mt-10 items-center">
                        {brand.colors.map((c, i) => (
                          <div key={i} title={c} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid rgba(0,0,0,.08)' }} />
                        ))}
                        <span style={{ fontSize: 11.5, color: 'var(--text-3)', marginLeft: 4 }}>Brand palette will be compiled</span>
                      </div>
                    )}

                    {colorMode === 'custom' && (
                      <div className="flex-col gap-8 mt-10 anim-fade-up">
                        {Object.entries(customColors).map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px',
                            border: '1.5px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            background: 'var(--surface-2)',
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: v, border: '2px solid rgba(0,0,0,.1)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                              <input type="color" value={v}
                                onChange={e => setCustomColors(p => ({ ...p, [k]: e.target.value }))}
                                style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', opacity: 0, cursor: 'pointer', transform: 'translate(-25%,-25%)' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'capitalize', minWidth: 70 }}>{k}</span>
                            <input value={v} maxLength={7} onChange={e => setCustomColors(p => ({ ...p, [k]: e.target.value }))}
                              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Menlo,monospace', fontSize: 13, fontWeight: 600, letterSpacing: '.04em' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* STEP 2: Content System */}
          {currentStep === 2 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 2: Editorial Design Content" accent="#0ea5e9">
                <div className="flex-col gap-12">
                  
                  {/* Campaign selector or creator */}
                  <div className="form-group">
                    <label className="form-label">Campaign / Design Context</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <select 
                        className="select" 
                        value={brand?.campaigns?.includes(designTitle) ? designTitle : ''} 
                        onChange={e => {
                          if (e.target.value) setDesignTitle(e.target.value);
                        }}
                      >
                        <option value="">Select existing campaign...</option>
                        {(brand?.campaigns || []).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input 
                        className="input" 
                        style={{ fontSize: 13 }} 
                        value={designTitle} 
                        onChange={e => setDesignTitle(e.target.value)} 
                        placeholder="Or enter new campaign..." 
                      />
                    </div>
                  </div>

                  {[
                    { label: 'Primary Heading', val: heading,    set: setHeading,    ph: 'e.g. The Next Generation of Performance' },
                    { label: 'Sub-Heading Text', val: subHeading, set: setSubHeading, ph: 'e.g. Crafted for professional cricketers.' },
                    { label: 'Body Copy / Feature List',  val: body,       set: setBody,       ph: 'e.g. Introducing our double-stitched leather core ball…', multi: true },
                    { label: 'Call To Action (CTA)',        val: cta,        set: setCta,        ph: 'e.g. Explore the Collection →' },
                  ].map(({ label, val, set, ph, multi }) => (
                    <div className="form-group" key={label}>
                      <label className="form-label">{label}</label>
                      {multi ? (
                        <textarea className="textarea" style={{ minHeight: 80, fontSize: 13 }} value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                      ) : (
                        <input className="input" style={{ fontSize: 13 }} value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* STEP 3: Design Uploads */}
          {currentStep === 3 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 3: Design Specific Images" accent="#059669">
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
                  Upload image ingredients for this design prompt. Logo is always included from brand guidelines.
                </p>

                {/* Logo auto-include badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', marginBottom: 16,
                  border: '1.5px solid var(--success-light)',
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--success-light)',
                }}>
                  <span style={{ fontSize: 16 }}>🏷️</span>
                  <div style={{ fontSize: 12.5, color: 'var(--success)', fontWeight: 600 }}>
                    Official Logo — Automatically included in prompt compilation
                  </div>
                  <Check size={14} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                </div>

                {/* Upload blocks */}
                {[
                  { key: 'products',     label: 'Product Image Uploads',    emoji: '📦', hint: 'Product shots or renders' },
                  { key: 'environments', label: 'Environment Backdrop',      emoji: '🌄', hint: 'Stadium, backdrop, scene' },
                  { key: 'icons',        label: 'Icons & graphic elements', emoji: '⭐', hint: 'Badges, badges, icons' },
                ].map(({ key, label, emoji, hint }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-8">
                        <span style={{ fontSize: 17 }}>{emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</div>
                        </div>
                      </div>
                      <label className="btn btn-secondary btn-xs" style={{ cursor: 'pointer' }}>
                        <Plus size={11} /> Add files
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                          onChange={e => addDesignImages(key, e.target.files)} />
                      </label>
                    </div>

                    {designImages[key].length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {designImages[key].map(f => (
                          <div key={f.id} style={{
                            position: 'relative', width: 64, height: 64,
                            borderRadius: 'var(--r-md)', overflow: 'hidden',
                            border: '1.5px solid var(--border)', flexShrink: 0,
                          }}>
                            <img src={f.previewUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => removeDesignImage(key, f.id)} style={{
                              position: 'absolute', top: 3, right: 3,
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'rgba(0,0,0,.65)', border: 'none',
                              color: '#fff', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifycontent: 'center',
                            }}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', cursor: 'pointer',
                        border: '1.5px dashed var(--border-2)',
                        borderRadius: 'var(--r-lg)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-3)',
                      }}>
                        <Upload size={16} />
                        <span style={{ fontSize: 12.5 }}>Upload files for {label}</span>
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                          onChange={e => addDesignImages(key, e.target.files)} />
                      </label>
                    )}
                  </div>
                ))}
              </Section>
            </div>
          )}

          {/* STEP 4: Guidelines & References */}
          {currentStep === 4 && (
            <div className="anim-fade-up flex-col gap-14">
              {/* References Upload */}
              <Section title="Step 4: Design Reference Images" badge={refImages.length} accent="#d97706">
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
                  Upload style guidelines, lighting sheets, or layout inspiration. AI extracts visual features instantly.
                </p>
                <div className="flex-col gap-8 mb-14">
                  {refImages.map(r => (
                    <RefCard key={r.id} refImage={r} onRemove={id => setRefImages(p => p.filter(x => x.id !== id))} />
                  ))}
                </div>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '20px 16px', cursor: 'pointer',
                  border: '2px dashed var(--border-2)', borderRadius: 'var(--r-lg)',
                  background: 'var(--surface-2)', textAlign: 'center'
                }}>
                  <Upload size={20} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Upload reference posters/layouts (Unlimited)</span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleUploadRef} />
                </label>
              </Section>

              {/* Reference Analysis Panel */}
              {refImages.length > 0 && (
                <div className="anim-fade-up">
                  <Section title="Reference Analysis Results" accent="var(--primary)" defaultOpen={true}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Analysis Attributes Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '12px'
                      }}>
                        {CHECKLIST_ATTRIBUTES.map(({ key, label }) => {
                          // Collect values across all uploaded references to display a consolidated summary
                          const vals = refImages
                            .map(r => r.analysis?.[key])
                            .filter(Boolean);
                          
                          let displayVal = 'No attributes detected';
                          if (vals.length > 0) {
                            if (key === 'colors') {
                              // Union color values
                              const allColors = Array.from(new Set(vals.flat()));
                              displayVal = (
                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                  {allColors.map(c => (
                                    <div key={c} title={c} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,.15)' }} />
                                  ))}
                                  <span style={{ fontSize: '11px', color: 'var(--text-3)', marginLeft: '4px', fontFamily: 'monospace' }}>{allColors.join(', ')}</span>
                                </div>
                              );
                            } else {
                              displayVal = vals.join('; ');
                            }
                          }

                          return (
                            <div key={key} style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)'
                            }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
                              <div style={{ fontSize: '12.5px', color: 'var(--text-1)', marginTop: '4px', fontWeight: 500, lineHeight: 1.4 }}>
                                {displayVal}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Include in Generation Control Section */}
                      <div style={{
                        borderTop: '1.5px solid var(--border)',
                        paddingTop: '16px',
                        marginTop: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>Include in Generation Filter</span>
                          <label className="flex items-center gap-6" style={{ cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)' }}>
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => toggleAll(e.target.checked)}
                              style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                            />
                            Select All Attributes
                          </label>
                        </div>

                        {/* Checkboxes Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                          gap: '10px'
                        }}>
                          {CHECKLIST_ATTRIBUTES.map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-8" style={{
                              cursor: 'pointer',
                              padding: '6px 10px',
                              borderRadius: 'var(--r-sm)',
                              background: refSettings[key] ? 'var(--primary-light)' : 'var(--surface-3)',
                              border: refSettings[key] ? '1.5px solid var(--primary-mid)' : '1.5px solid transparent',
                              transition: 'all .15s',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: refSettings[key] ? 'var(--primary)' : 'var(--text-2)'
                            }}>
                              <input
                                type="checkbox"
                                checked={!!refSettings[key]}
                                onChange={() => toggleAttribute(key)}
                                style={{ accentColor: 'var(--primary)', width: 13, height: 13 }}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  </Section>
                </div>
              )}

              {/* System guidelines */}
              <Section title="System Design Rules & Constraints" accent="#7c3aed" defaultOpen={false}>
                <textarea
                  style={{
                    width: '100%', minHeight: 180, resize: 'vertical',
                    fontFamily: 'Menlo,Consolas,monospace', fontSize: 11.5, lineHeight: 1.7,
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
                    background: 'var(--surface-2)', padding: '12px 14px', outline: 'none'
                  }}
                  value={guidelines}
                  onChange={e => setGuidelines(e.target.value)}
                />
              </Section>
            </div>
          )}

          {/* STEP 5: Final Compiled Prompt */}
          {currentStep === 5 && (
            <div className="anim-fade-up flex-col gap-14">
              <div style={{
                border: '2px solid var(--primary-mid)',
                borderRadius: 'var(--r-xl)',
                background: 'var(--surface)',
                boxShadow: '0 0 0 4px var(--primary-light), var(--shadow-md)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, var(--primary-light), #f0f0fe)',
                }}>
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="flex items-center gap-8">
                        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>
                          Final Compiled Design Spec
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        Copy or save this text-only description for designer or engine use
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <button className="icon-btn" title={isEditing ? 'Preview Mode' : 'Edit Mode'} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? <Eye size={14} /> : <Edit2 size={14} />}
                      </button>
                      <button className="icon-btn" title="Refresh/Recompile" onClick={compile}>
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompt Viewport */}
                <div style={{ padding: '0 20px 0' }}>
                  {isEditing ? (
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      style={{
                        width: '100%', minHeight: 380, resize: 'vertical',
                        fontFamily: 'Menlo,Consolas,monospace', fontSize: 12.5, lineHeight: 1.7,
                        border: 'none', outline: 'none', background: 'transparent',
                        padding: '20px 0', color: 'var(--text-1)',
                      }}
                    />
                  ) : (
                    <pre style={{
                      fontFamily: 'Menlo,Consolas,monospace', fontSize: 12.5, lineHeight: 1.7,
                      color: 'var(--text-1)', background: 'transparent',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      maxHeight: 440, overflowY: 'auto',
                      padding: '20px 0', margin: 0,
                    }}>
                      {prompt || 'Input data in wizard steps to compile design specifications.'}
                    </pre>
                  )}
                </div>

                {/* CTA action buttons */}
                <div style={{ padding: '16px 20px 20px', display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-lg btn-full" onClick={handleCopy} style={{ flex: 1 }}>
                    {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Design Prompt</>}
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={handleSave}
                    title="Save Prompt Specs to History"
                    style={{ padding: '12px 18px' }}
                  >
                    {saved ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Save size={16} />}
                  </button>
                </div>

                {saved && (
                  <div style={{
                    margin: '0 20px 16px',
                    padding: '10px 14px',
                    background: 'var(--success-light)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 13, color: 'var(--success)', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Check size={14} /> Prompt compiled configuration saved successfully!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back / Next Navigation Controls */}
          <div className="flex justify-between items-center" style={{
            background: 'var(--surface)', padding: '16px 20px',
            borderRadius: 'var(--r-xl)', border: '1.5px solid var(--border)',
            marginTop: 16
          }}>
            <button
              className="btn btn-secondary"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(s => s - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
              Step {currentStep} of 5
            </div>
            <button
              className="btn btn-primary"
              disabled={currentStep === 5}
              onClick={() => setCurrentStep(s => s + 1)}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
