import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, Minus, Wand2 } from 'lucide-react';
import { extractBrandIdentity } from '../utils/mockAi';

const INDUSTRIES = [
  'Sports & Fitness','Technology & AI','Luxury & Fashion','Health & Wellness',
  'Food & Beverage','Real Estate','Education','Finance','Entertainment',
  'Automotive','Healthcare','Retail','E-Commerce','Other',
];

function ColorRow({ label, color, index, onChange, onRemove, canRemove }) {
  return (
    <div className="color-edit-row">
      <div className="swatch" style={{ backgroundColor: color, transition: 'background-color 0.15s' }}>
        <input type="color" value={color} onChange={e => onChange(index, e.target.value)} />
      </div>
      <span className="color-label">{label}</span>
      <input
        className="hex-input"
        value={color}
        onChange={e => onChange(index, e.target.value)}
        maxLength={7}
      />
      {canRemove && (
        <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => onRemove(index)}>
          <Minus size={13} />
        </button>
      )}
    </div>
  );
}

export default function Option1Form({ onSave, onBack }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry]       = useState('');
  const [logoFile, setLogoFile]       = useState(null);
  const [logoUrl, setLogoUrl]         = useState('');
  const [colors, setColors]           = useState(['#5b5bd6', '#0d0f1a', '#e0e7ff']);
  const [typographyH, setTypographyH] = useState('');
  const [typographyB, setTypographyB] = useState('');
  const [typographyA, setTypographyA] = useState('');
  const [style, setStyle]             = useState('');
  const [tone, setTone]               = useState('');
  const [dos, setDos]                 = useState(['']);
  const [donts, setDonts]             = useState(['']);
  const [errors, setErrors]           = useState({});
  const [extracting, setExtracting]   = useState(false);

  const handleLogoUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const url = URL.createObjectURL(f);
    setLogoUrl(url);
    // Simulate AI extraction
    setExtracting(true);
    setTimeout(() => {
      const identity = extractBrandIdentity(name || f.name, industry);
      setColors(identity.colors);
      if (!typographyH) setTypographyH(identity.typography.heading);
      if (!typographyB) setTypographyB(identity.typography.body);
      if (!typographyA) setTypographyA(identity.typography.accent);
      if (!style) setStyle(identity.style);
      if (!tone)  setTone(identity.tone);
      setExtracting(false);
    }, 900);
  };

  const handleColorChange = (i, v) => {
    const next = [...colors]; next[i] = v; setColors(next);
  };
  const addColor = () => setColors([...colors, '#cccccc']);
  const removeColor = (i) => setColors(colors.filter((_, idx) => idx !== i));

  const listChange = (setter, list, i, v) => {
    const next = [...list]; next[i] = v; setter(next);
  };
  const addListItem    = (setter, list) => setter([...list, '']);
  const removeListItem = (setter, list, i) => setter(list.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!name.trim())     e.name = 'Brand name is required.';
    if (!industry)        e.industry = 'Please select an industry.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const brand = {
      id: 'brand-' + Date.now(),
      name: name.trim(),
      description,
      industry,
      logoUrl,
      colors,
      typography: { heading: typographyH, body: typographyB, accent: typographyA },
      style,
      tone,
      dos: dos.filter(Boolean),
      donts: donts.filter(Boolean),
      assets: logoFile
        ? [{ id: 'asset-logo-' + Date.now(), name: logoFile.name, role: 'Logo', previewUrl: logoUrl }]
        : [],
    };
    onSave(brand);
  };

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <button className="btn btn-ghost mb-24" onClick={onBack} style={{ paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-24">
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>
          🏢 Existing Brand Import
        </div>
        <h1 className="page-title">Brand Details</h1>
        <p className="page-subtitle mt-4">Fill in your brand's identity. All fields update the AI prompt compiler.</p>
      </div>

      <div className="flex-col gap-20">

        {/* Basic info */}
        <div className="card">
          <div className="section-title mb-16">Basic Information</div>
          <div className="grid-2 gap-16">
            <div className="form-group">
              <label className="form-label">Brand Name *</label>
              <input className={`input ${errors.name ? 'error' : ''}`} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. POCO Athletics" />
              {errors.name && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Industry *</label>
              <select className="select" value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select industry…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.industry}</span>}
            </div>
          </div>
          <div className="form-group mt-16">
            <label className="form-label">Brand Description</label>
            <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this brand do? What makes it unique?" />
          </div>
        </div>

        {/* Logo */}
        <div className="card">
          <div className="section-title mb-6">Logo</div>
          <p className="section-body mb-16">Upload the official logo. AI will extract colors and typography suggestions.</p>
          <label className="upload-zone" style={{ cursor: 'pointer' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo preview" style={{ maxHeight: 80, objectFit: 'contain' }} />
            ) : (
              <>
                <Upload size={26} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>Upload Logo</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>PNG, SVG, JPG · Max 5 MB</span>
              </>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </label>
          {extracting && (
            <div className="flex items-center gap-8 mt-12" style={{ fontSize: 13, color: 'var(--primary)' }}>
              <Wand2 size={14} />
              <span style={{ animation: 'pulse 1s infinite' }}>Extracting brand identity from logo…</span>
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="section-title">Brand Colors</div>
              <p className="section-body mt-4">Auto-extracted from logo · Click to edit</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addColor}><Plus size={13} /> Add Color</button>
          </div>
          <div className="flex-col gap-8">
            {colors.map((c, i) => (
              <ColorRow
                key={i}
                label={i === 0 ? 'Primary' : i === 1 ? 'Secondary' : `Accent ${i - 1}`}
                color={c} index={i}
                onChange={handleColorChange}
                onRemove={removeColor}
                canRemove={colors.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="card">
          <div className="section-title mb-16">Typography</div>
          <div className="grid-3 gap-16">
            <div className="form-group">
              <label className="form-label">Heading Font</label>
              <input className="input" value={typographyH} onChange={e => setTypographyH(e.target.value)} placeholder="e.g. Barlow Condensed" />
            </div>
            <div className="form-group">
              <label className="form-label">Body Font</label>
              <input className="input" value={typographyB} onChange={e => setTypographyB(e.target.value)} placeholder="e.g. Inter" />
            </div>
            <div className="form-group">
              <label className="form-label">Accent Font</label>
              <input className="input" value={typographyA} onChange={e => setTypographyA(e.target.value)} placeholder="e.g. Oswald" />
            </div>
          </div>
        </div>

        {/* Style & Tone */}
        <div className="card">
          <div className="section-title mb-16">Style & Tone</div>
          <div className="grid-2 gap-16">
            <div className="form-group">
              <label className="form-label">Brand Style</label>
              <input className="input" value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g. Bold, Athletic, Premium" />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Tone</label>
              <input className="input" value={tone} onChange={e => setTone(e.target.value)} placeholder="e.g. Confident, Inspiring, Direct" />
            </div>
          </div>
        </div>

        {/* Dos & Don'ts */}
        <div className="card">
          <div className="grid-2 gap-24">
            {[
              { label: "Brand Do's", icon: '✓', color: 'var(--success)', list: dos, setter: setDos },
              { label: "Brand Don'ts", icon: '✗', color: 'var(--danger)',  list: donts, setter: setDonts },
            ].map(({ label, icon, color, list, setter }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-12">
                  <div style={{ fontWeight: 700, fontSize: 14, color }}>{icon} {label}</div>
                  <button className="btn btn-secondary btn-xs" onClick={() => addListItem(setter, list)}>
                    <Plus size={11} /> Add
                  </button>
                </div>
                <div className="flex-col gap-8">
                  {list.map((item, i) => (
                    <div key={i} className="flex items-center gap-8">
                      <input
                        className="input"
                        style={{ fontSize: 13 }}
                        value={item}
                        onChange={e => listChange(setter, list, i, e.target.value)}
                        placeholder="Add guideline…"
                      />
                      {list.length > 1 && (
                        <button className="icon-btn" onClick={() => removeListItem(setter, list, i)}>
                          <Minus size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-12" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onBack}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handleSave}>Save Brand Identity</button>
        </div>
      </div>
    </div>
  );
}
