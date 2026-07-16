import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Copy, Edit2, Check, Save, RefreshCw,
  Upload, ChevronDown, X, Wand2, Eye, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';
import { generatePrompt, PLATFORMS } from '../utils/mockAi';

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

const REF_EXTRACT_TYPES = [
  'Layout & Composition','Lighting & Mood','Typography Style',
  'Color Distribution','Photography Style','Visual Hierarchy',
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
function RefCard({ ref: r, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      background: 'var(--surface-2)',
    }}>
      {r.previewUrl
        ? <img src={r.previewUrl} alt={r.name} style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🖼️</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Analyzed for: <strong style={{ color: 'var(--primary)' }}>{r.type}</strong></div>
      </div>
      <button onClick={() => onRemove(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, flexShrink: 0 }}>
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

  // Reference images
  const [refImages,    setRefImages]    = useState([]);
  const [refAnalyzing, setRefAnalyzing] = useState(false);

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
    });
    setPrompt(text);
    setSaved(false);
  }, [brand, platform, designTitle, heading, subHeading, body, cta, refImages, buildIncludedAssets, guidelines, colorMode, customColors, designImages]);

  useEffect(() => { compile(); }, [compile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
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
    setTimeout(() => {
      const refs = files.map((f, i) => ({
        id: 'r-' + Date.now() + i,
        name: f.name,
        previewUrl: URL.createObjectURL(f),
        type: REF_EXTRACT_TYPES[i % REF_EXTRACT_TYPES.length],
      }));
      setRefImages(prev => [...prev, ...refs]);
      setRefAnalyzing(false);
    }, 900);
  };

  const totalDesignUploads = Object.values(designImages).flat().length;
  const totalBrandAssets   = (brand?.assets || []).filter(a => assetChecked[a.id]).length;
  const brandLogo          = brand?.assets?.find(a => a.role === 'Logo');
  const totalAssets        = totalDesignUploads + totalBrandAssets;

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

                    {colorMode === 'brand' && brand?.colors?.length && (
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
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              {/* References */}
              <Section title="Step 4: Design Reference Images" badge={refImages.length} accent="#d97706">
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
                  Upload style guidelines, lighting sheets, or layout inspiration. AI extracts style patterns.
                </p>
                <div className="flex-col gap-8 mb-14">
                  {refImages.map(r => (
                    <RefCard key={r.id} ref={r} onRemove={id => setRefImages(p => p.filter(x => x.id !== id))} />
                  ))}
                </div>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '20px 16px', cursor: 'pointer',
                  border: '2px dashed var(--border-2)', borderRadius: 'var(--r-lg)',
                  background: 'var(--surface-2)', textAlign: 'center'
                }}>
                  <Upload size={20} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Upload reference posters/layouts</span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleUploadRef} />
                </label>
              </Section>

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
