import React, { useState, useCallback } from 'react';
import {
  ArrowLeft, Upload, Trash2, Edit3, Check, Image, Layers,
  Plus, X, GripVertical
} from 'lucide-react';
import { predictAssetRole } from '../utils/mockAi';

const ASSET_ROLES = ['Logo','Product Images','Environment Images','Packaging','Icons','Style References'];

const ROLE_META = {
  'Logo':               { emoji: '🏷️', color: 'var(--primary)',   desc: 'Official brand logo — used on all designs' },
  'Product Images':     { emoji: '📦', color: '#0ea5e9',           desc: 'Hero products, key items to feature' },
  'Environment Images': { emoji: '🌄', color: '#059669',           desc: 'Backgrounds, scenes, locations' },
  'Packaging':          { emoji: '🎁', color: '#d97706',           desc: 'Box, bottle, bag, or wrapper shots' },
  'Icons':              { emoji: '⭐', color: '#7c3aed',           desc: 'Symbols, badges, UI icons' },
  'Style References':   { emoji: '🎨', color: '#ec4899',           desc: 'Mood boards, layout inspirations' },
};

/* ── Asset Card ──────────────────────────────────────── */
function AssetCard({ asset, onRoleChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const meta = ROLE_META[asset.role] || ROLE_META['Product Images'];

  return (
    <div
      className="anim-scale-in"
      style={{
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        transition: 'box-shadow .2s, transform .2s',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: 'var(--surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {asset.previewUrl ? (
          <img src={asset.previewUrl} alt={asset.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: 36, opacity: .5 }}>{meta.emoji}</div>
        )}
        {/* Delete overlay */}
        <button
          onClick={() => onDelete(asset.id)}
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,.6)', border: 'none',
            borderRadius: '50%', width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{
          fontSize: 12.5, fontWeight: 500, color: 'var(--text-1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 8,
        }}>
          {asset.name}
        </div>

        {editing ? (
          <select
            className="select"
            style={{ fontSize: 11.5, padding: '5px 8px' }}
            value={asset.role}
            onChange={e => { onRoleChange(asset.id, e.target.value); setEditing(false); }}
            autoFocus
            onBlur={() => setEditing(false)}
          >
            {ASSET_ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 9px',
              border: `1.5px solid ${meta.color}22`,
              borderRadius: 'var(--r-full)',
              background: `${meta.color}12`,
              color: meta.color,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '.01em',
            }}
          >
            {meta.emoji} {asset.role}
            <Edit3 size={10} style={{ opacity: .6 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Upload Zone (per role) ──────────────────────────── */
function RoleUploadZone({ role, onFiles }) {
  const [drag, setDrag] = useState(false);
  const meta = ROLE_META[role];

  const handleFiles = (files) => {
    const arr = Array.from(files).map(f => ({
      id: 'a-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: f.name,
      role,
      previewUrl: URL.createObjectURL(f),
    }));
    onFiles(arr);
  };

  return (
    <label
      className={`upload-zone ${drag ? 'dragover' : ''}`}
      style={{ padding: '14px 12px', cursor: 'pointer', minHeight: 80 }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      <Plus size={18} style={{ opacity: .5 }} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)' }}>
        Upload {role}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
        PNG, JPG, WEBP · Multiple OK
      </span>
      <input
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </label>
  );
}

/* ── Main Component ──────────────────────────────────── */
export default function BrandDetails({ brand, onBack, onUpdateBrand, onDeleteBrand }) {
  const [tab, setTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Use state initialized from props
  const [localBrand, setLocalBrand] = useState(() => ({ ...brand }));

  // Keep local state in sync when parent brand changes, inside useEffect to prevent render-phase updates
  React.useEffect(() => {
    setLocalBrand({ ...brand });
  }, [brand]);

  const updateField = useCallback((field, value) => {
    setLocalBrand(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
    // Trigger parent update outside of the state reducer path
    onUpdateBrand({ ...brand, [field]: value });
  }, [brand, onUpdateBrand]);

  /* Color helpers — functional updater avoids stale closure */
  const updateColor = useCallback((index, value) => {
    const nextColors = [...(brand.colors || [])];
    nextColors[index] = value;
    setLocalBrand(prev => ({ ...prev, colors: nextColors }));
    onUpdateBrand({ ...brand, colors: nextColors });
  }, [brand, onUpdateBrand]);

  const addColor = () => {
    const nextColors = [...(brand.colors || []), '#cccccc'];
    setLocalBrand(prev => ({ ...prev, colors: nextColors }));
    onUpdateBrand({ ...brand, colors: nextColors });
  };

  const removeColor = (index) => {
    const nextColors = (brand.colors || []).filter((_, i) => i !== index);
    setLocalBrand(prev => ({ ...prev, colors: nextColors }));
    onUpdateBrand({ ...brand, colors: nextColors });
  };

  /* Asset helpers */
  const addAssets = useCallback((newAssets) => {
    const nextAssets = [...(brand.assets || []), ...newAssets];
    setLocalBrand(prev => ({ ...prev, assets: nextAssets }));
    onUpdateBrand({ ...brand, assets: nextAssets });
  }, [brand, onUpdateBrand]);

  const handleRoleChange = useCallback((id, role) => {
    const nextAssets = (brand.assets || []).map(a => a.id === id ? { ...a, role } : a);
    setLocalBrand(prev => ({ ...prev, assets: nextAssets }));
    onUpdateBrand({ ...brand, assets: nextAssets });
  }, [brand, onUpdateBrand]);

  const handleDeleteAsset = useCallback((id) => {
    const nextAssets = (brand.assets || []).filter(a => a.id !== id);
    setLocalBrand(prev => ({ ...prev, assets: nextAssets }));
    onUpdateBrand({ ...brand, assets: nextAssets });
  }, [brand, onUpdateBrand]);

  /* Bulk upload */
  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newAssets = files.map(f => ({
      id: 'a-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: f.name,
      role: predictAssetRole(f.name),
      previewUrl: URL.createObjectURL(f),
    }));
    addAssets(newAssets);
  };

  const logo       = localBrand.assets?.find(a => a.role === 'Logo');
  const assetCount = (localBrand.assets || []).length;

  const byRole = ASSET_ROLES.reduce((acc, r) => {
    acc[r] = (localBrand.assets || []).filter(a => a.role === r);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-24">
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        {confirmDelete ? (
          <div className="flex gap-8 items-center anim-fade-in">
            <span style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 600 }}>Are you sure?</span>
            <button className="btn btn-danger btn-xs" onClick={() => onDeleteBrand(localBrand.id)}>Yes, Delete</button>
            <button className="btn btn-secondary btn-xs" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-xs text-danger" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>
            🗑️ Delete Brand
          </button>
        )}
      </div>

      {/* Brand header */}
      <div className="flex items-start gap-20 mb-24">
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-xl)', flexShrink: 0,
          background: localBrand.colors?.[0] || 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 22, color: '#fff', overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          {logo?.previewUrl
            ? <img src={logo.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : localBrand.name?.substring(0, 2).toUpperCase()
          }
        </div>
        <div>
          <h1 className="page-title">{localBrand.name}</h1>
          <div className="flex items-center gap-10 mt-6">
            <span className="badge badge-gray">{localBrand.industry}</span>
            <span className="badge badge-primary"><Layers size={11} /> {assetCount} assets</span>
          </div>
          {localBrand.description && (
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 8, maxWidth: 520, lineHeight: 1.6 }}>
              {localBrand.description}
            </p>
          )}
        </div>
        <div className="flex gap-8" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {(localBrand.colors || []).map((c, i) => (
            <div key={i} title={c} style={{
              width: 20, height: 20, borderRadius: '50%', background: c,
              border: '2px solid rgba(0,0,0,.1)', transition: 'transform .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'identity', 'assets'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'assets' && ` (${assetCount})`}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid-2 anim-fade-up" style={{ gap: 24, alignItems: 'start' }}>
          <div className="flex-col gap-16">
            <div className="card">
              <div className="section-title mb-16">Color Palette</div>
              <div className="flex-col gap-10">
                {(localBrand.colors || []).map((c, i) => (
                  <div key={i} className="flex items-center gap-14">
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)', background: c,
                      boxShadow: 'var(--shadow-sm)', border: '2px solid rgba(0,0,0,.07)', flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        {i === 0 ? 'Primary' : i === 1 ? 'Secondary' : `Accent ${i - 1}`}
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{c}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title mb-12">Typography</div>
              <div className="flex-col gap-10">
                {Object.entries(localBrand.typography || {}).map(([k, v]) => v ? (
                  <div key={k} className="flex items-center justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize', fontWeight: 600, letterSpacing: '.03em' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: v, color: 'var(--text-1)' }}>{v}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>

          <div className="flex-col gap-16">
            <div className="card">
              <div className="section-title mb-12">Style & Tone</div>
              <div className="flex-col gap-12">
                {localBrand.style && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>VISUAL STYLE</div>
                    <div style={{ fontSize: 14, color: 'var(--text-1)' }}>{localBrand.style}</div>
                  </div>
                )}
                {localBrand.tone && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>BRAND TONE</div>
                    <div style={{ fontSize: 14, color: 'var(--text-1)' }}>{localBrand.tone}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="section-title mb-12">Brand Guidelines</div>
              <div className="flex-col gap-16">
                {[['dos', "Do's", 'var(--success)'], ['donts', "Don'ts", 'var(--danger)']].map(([key, label, color]) => (
                  <div key={key}>
                    <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>{label}</div>
                    <div className="flex-col gap-6">
                      {(localBrand[key] || []).map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                          <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{key === 'dos' ? '✓' : '✗'}</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── IDENTITY TAB ─────────────────────────────── */}
      {tab === 'identity' && (
        <div className="flex-col gap-20 anim-fade-up">

          {/* Color Palette — FIXED with functional updater */}
          <div className="card">
            <div className="flex items-center justify-between mb-16">
              <div>
                <div className="section-title">Brand Colors</div>
                <div className="section-body mt-4">Click the swatch or type a hex value to edit</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={addColor}>
                <Plus size={13} /> Add Color
              </button>
            </div>
            <div className="flex-col gap-10">
              {(localBrand.colors || []).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--surface-2)',
                  transition: 'border-color .15s',
                }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {/* Color picker swatch */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-md)',
                    background: c, border: '2px solid rgba(0,0,0,.1)',
                    flexShrink: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer',
                  }}>
                    <input
                      type="color"
                      value={c}
                      onChange={e => updateColor(i, e.target.value)}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '200%', height: '200%',
                        opacity: 0, cursor: 'pointer',
                        transform: 'translate(-25%, -25%)',
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
                    textTransform: 'uppercase', letterSpacing: '.04em',
                    minWidth: 80, flexShrink: 0,
                  }}>
                    {i === 0 ? 'Primary' : i === 1 ? 'Secondary' : `Accent ${i - 1}`}
                  </span>

                  {/* Hex input */}
                  <input
                    value={c}
                    onChange={e => updateColor(i, e.target.value)}
                    maxLength={7}
                    placeholder="#000000"
                    style={{
                      flex: 1,
                      fontFamily: 'Menlo, Consolas, monospace',
                      fontSize: 13.5,
                      border: 'none', background: 'transparent',
                      outline: 'none', color: 'var(--text-1)', fontWeight: 600,
                      letterSpacing: '.05em',
                    }}
                  />

                  {/* Live preview */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'var(--text-3)',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1.5px solid rgba(0,0,0,.1)' }} />
                  </div>

                  {localBrand.colors.length > 1 && (
                    <button
                      onClick={() => removeColor(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Palette preview strip */}
            <div style={{ display: 'flex', marginTop: 16, borderRadius: 'var(--r-lg)', overflow: 'hidden', height: 32, border: '1px solid var(--border)' }}>
              {(localBrand.colors || []).map((c, i) => (
                <div key={i} title={c} style={{ flex: 1, background: c }} />
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="card">
            <div className="section-title mb-16">Typography</div>
            <div className="grid-3 gap-14">
              {['heading', 'body', 'accent'].map(k => (
                <div className="form-group" key={k}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{k} Font</label>
                  <input
                    className="input"
                    value={localBrand.typography?.[k] || ''}
                    onChange={e => updateField('typography', { ...localBrand.typography, [k]: e.target.value })}
                    placeholder={k === 'heading' ? 'e.g. Barlow Condensed' : k === 'body' ? 'e.g. Inter' : 'e.g. Oswald'}
                  />
                  {localBrand.typography?.[k] && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, fontStyle: 'italic' }}>
                      Preview: <span style={{ fontFamily: localBrand.typography[k] }}>{localBrand.typography[k]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Style & Tone */}
          <div className="card">
            <div className="section-title mb-16">Style & Tone</div>
            <div className="grid-2 gap-14">
              <div className="form-group">
                <label className="form-label">Brand Style</label>
                <input
                  className="input"
                  value={localBrand.style || ''}
                  onChange={e => updateField('style', e.target.value)}
                  placeholder="e.g. Bold, Athletic, Premium"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand Tone</label>
                <input
                  className="input"
                  value={localBrand.tone || ''}
                  onChange={e => updateField('tone', e.target.value)}
                  placeholder="e.g. Confident, Inspiring, Direct"
                />
              </div>
            </div>
          </div>

          {/* Dos & Donts */}
          <div className="card">
            <div className="grid-2 gap-24">
              {[['dos', "Brand Do's", 'var(--success)'], ['donts', "Brand Don'ts", 'var(--danger)']].map(([key, label, color]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-12">
                    <div style={{ fontWeight: 700, fontSize: 14, color }}>{label}</div>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => updateField(key, [...(localBrand[key] || []), ''])}
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  <div className="flex-col gap-8">
                    {(localBrand[key] || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-8">
                        <span style={{ color, fontWeight: 700, fontSize: 14 }}>{key === 'dos' ? '✓' : '✗'}</span>
                        <input
                          className="input"
                          style={{ fontSize: 13 }}
                          value={item}
                          onChange={e => {
                            const next = [...(localBrand[key] || [])];
                            next[i] = e.target.value;
                            updateField(key, next);
                          }}
                          placeholder="Add guideline…"
                        />
                        <button
                          onClick={() => updateField(key, (localBrand[key] || []).filter((_, idx) => idx !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSETS TAB ───────────────────────────────── */}
      {tab === 'assets' && (
        <div className="anim-fade-up">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-24">
            <div>
              <div className="section-title">Brand Asset Library</div>
              <p className="section-body mt-4">
                Upload and organise reusable assets. AI auto-assigns roles. Drag any section to upload multiple images at once.
              </p>
            </div>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Upload Any Assets
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleBulkUpload} />
            </label>
          </div>

          {/* Role sections */}
          <div className="flex-col gap-28">
            {ASSET_ROLES.map(role => {
              const meta = ROLE_META[role];
              const roleAssets = byRole[role] || [];

              return (
                <div key={role}>
                  {/* Section header */}
                  <div className="flex items-center gap-10 mb-14" style={{ paddingBottom: 10, borderBottom: '1.5px solid var(--border)' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--r-md)',
                      background: `${meta.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {meta.emoji}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{role}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{meta.desc}</div>
                    </div>
                    {roleAssets.length > 0 && (
                      <span className="badge badge-gray" style={{ marginLeft: 4 }}>{roleAssets.length}</span>
                    )}
                    {role === 'Logo' && roleAssets.length > 0 && (
                      <span className="badge badge-success" style={{ marginLeft: 4 }}>
                        <Check size={10} /> Saved
                      </span>
                    )}
                    {/* Quick add for this role */}
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ marginLeft: 'auto', cursor: 'pointer' }}
                    >
                      <Plus size={13} /> Add
                      <input
                        type="file"
                        multiple={role !== 'Logo'}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const files = Array.from(e.target.files || []);
                          const assets = files.map(f => ({
                            id: 'a-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                            name: f.name,
                            role,
                            previewUrl: URL.createObjectURL(f),
                          }));
                          addAssets(assets);
                        }}
                      />
                    </label>
                  </div>

                  {/* Asset grid + upload zone */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 12,
                  }}>
                    {roleAssets.map(a => (
                      <AssetCard
                        key={a.id}
                        asset={a}
                        onRoleChange={handleRoleChange}
                        onDelete={handleDeleteAsset}
                      />
                    ))}
                    {/* Inline upload slot */}
                    <RoleUploadZone role={role} onFiles={addAssets} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
