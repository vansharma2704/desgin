import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PLATFORMS } from '../utils/mockAi';

const CATEGORIES = ['Social Media','Presentation','Printables','Marketing','Proposal','Custom'];

const SHAPES = ['Rectangle','Square','Circle','Triangle','Oval'];
const UNITS  = ['px','mm','cm','in'];

const SHAPE_ICONS = {
  Rectangle: <div style={{ width: 36, height: 24, border: '2px solid currentColor', borderRadius: 2 }} />,
  Square:    <div style={{ width: 28, height: 28, border: '2px solid currentColor', borderRadius: 2 }} />,
  Circle:    <div style={{ width: 28, height: 28, border: '2px solid currentColor', borderRadius: '50%' }} />,
  Triangle:  (
    <svg width="30" height="26" viewBox="0 0 30 26"><polygon points="15,1 29,25 1,25" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  ),
  Oval:      <div style={{ width: 36, height: 24, border: '2px solid currentColor', borderRadius: '50%' }} />,
};

function PlatformPreview({ p }) {
  const ratio = p.width / p.height;
  const w = Math.min(40, ratio * 30);
  const h = Math.min(40, 30 / ratio);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height: 44 }}>
      <div style={{
        width: w, height: h,
        border: '2px solid currentColor',
        borderRadius: 2,
        opacity: .7,
      }} />
    </div>
  );
}

export default function Platforms({ selectedPlatform, onSelect }) {
  const [activeCategory, setActiveCategory] = useState('Social Media');
  const [customW, setCustomW] = useState('1080');
  const [customH, setCustomH] = useState('1080');
  const [customUnit, setCustomUnit] = useState('px');
  const [customName, setCustomName] = useState('');
  const [customShape, setCustomShape] = useState('Rectangle');

  const filtered = PLATFORMS.filter(p => p.category === activeCategory);

  const applyCustom = () => {
    const w = parseFloat(customW) || 1080;
    const h = parseFloat(customH) || 1080;
    onSelect({
      name: customName || `Custom ${w}×${h}`,
      width: w, height: h,
      unit: customUnit,
      shape: customShape,
      category: 'Custom',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Specs</h1>
          <p className="page-subtitle mt-4">Choose the canvas size and shape for your design. Used in AI Prompt Builder.</p>
        </div>
        {selectedPlatform && (
          <div className="card" style={{ padding: '10px 16px', display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:12, color:'var(--text-3)' }}>Selected:</span>
            <span style={{ fontWeight:700, fontSize:13 }}>{selectedPlatform.name}</span>
            <span className="badge badge-primary">{selectedPlatform.width}×{selectedPlatform.height} {selectedPlatform.unit}</span>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="tabs">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`tab-btn ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Platform grid */}
      {activeCategory !== 'Custom' ? (
        <div className="grid-4 anim-fade-up stagger">
          {filtered.map((p, i) => {
            const isSelected = selectedPlatform?.name === p.name && selectedPlatform?.width === p.width;
            return (
              <div
                key={i}
                className={`platform-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(p)}
              >
                <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-3)' }}>
                  <PlatformPreview p={p} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)', letterSpacing:'-.01em' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11.5, color:'var(--text-3)', marginTop: 2 }}>
                    {p.width} × {p.height} {p.unit}
                  </div>
                  <div style={{ fontSize: 11, color:'var(--text-3)' }}>{p.shape}</div>
                </div>
                {isSelected && (
                  <div className="badge badge-primary" style={{ alignSelf:'flex-start', marginTop:'auto' }}>
                    <Check size={11} /> Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="anim-fade-up" style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="section-title mb-20">Custom Canvas Size</div>
            <div className="flex-col gap-16">
              <div className="form-group">
                <label className="form-label">Canvas Name (optional)</label>
                <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Website Hero Banner" />
              </div>

              <div className="grid-3 gap-12">
                <div className="form-group">
                  <label className="form-label">Width</label>
                  <input className="input" type="number" value={customW} onChange={e => setCustomW(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <input className="input" type="number" value={customH} onChange={e => setCustomH(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="select" value={customUnit} onChange={e => setCustomUnit(e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shape</label>
                <div className="flex gap-10 flex-wrap">
                  {SHAPES.map(s => (
                    <button
                      key={s}
                      className={`chip ${customShape === s ? 'selected' : ''}`}
                      onClick={() => setCustomShape(s)}
                    >
                      <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:18, height:18, marginRight:2 }}>
                        {customShape === s && <Check size={12} />}
                      </span>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:'var(--text-2)' }}>Preview</div>
                  <div style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', width:80, height:80, background:'var(--surface-3)', borderRadius:'var(--r-md)' }}>
                    {SHAPE_ICONS[customShape] || SHAPE_ICONS.Rectangle}
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ flex:1 }} onClick={applyCustom}>
                  Apply Custom Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
