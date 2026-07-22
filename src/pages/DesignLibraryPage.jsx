import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Grid, List, MoreVertical, Edit3, Download, Copy,
  Archive, Trash2, Eye, ChevronLeft, ChevronRight, Sparkles,
  RefreshCw, ImageOff
} from 'lucide-react';
import designService from '../services/designService';
import brandService from '../services/brandService';
import campaignService from '../services/campaignService';

/* ── Brand Logo / Initials Avatar ─────────────────── */
function BrandAvatar({ brand, size = 28 }) {
  const name = brand?.name || 'B';
  const logoUrl = brand?.logoUrl
    || brand?.assets?.find(a => a.role === 'Logo')?.previewUrl;
  const initials = name.slice(0, 2).toUpperCase();
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--primary-light)', color: 'var(--primary)',
      fontWeight: 800, fontSize: size * 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: '1.5px solid var(--border)'
    }}>
      {initials}
    </div>
  );
}

/* ── Status Badge ──────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    'Approved':              { bg: 'rgba(16,185,129,.12)',  color: '#059669', border: 'rgba(16,185,129,.25)',  label: 'Approved' },
    'Submitted For Review':  { bg: 'rgba(59,130,246,.12)',  color: '#2563eb', border: 'rgba(59,130,246,.25)',  label: 'In Review' },
    'Pending':               { bg: 'rgba(59,130,246,.12)',  color: '#2563eb', border: 'rgba(59,130,246,.25)',  label: 'In Review' },
    'Completed':             { bg: 'rgba(139,92,246,.12)',  color: '#7c3aed', border: 'rgba(139,92,246,.25)',  label: 'Completed' },
    'Rejected':              { bg: 'rgba(239,68,68,.12)',   color: '#dc2626', border: 'rgba(239,68,68,.25)',   label: 'Rejected' },
    'Archived':              { bg: 'rgba(107,114,128,.12)', color: '#6b7280', border: 'rgba(107,114,128,.25)', label: 'Archived' },
  };
  const cfg = map[status] || { bg: 'var(--surface-3)', color: 'var(--text-3)', border: 'var(--border)', label: status || 'Unknown' };
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '3px 8px',
      borderRadius: 4, background: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.border}`, letterSpacing: '.02em'
    }}>
      {cfg.label}
    </span>
  );
}

/* ── Design Card ───────────────────────────────────── */
function DesignCard({ design, onPreview, onEdit, onDownload, onDelete, onDuplicate, onRename, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);
  const campaign = design.campaignId && typeof design.campaignId === 'object' ? design.campaignId : { name: design.campaignName || 'Unknown Campaign' };
  const brand = design.brandId && typeof design.brandId === 'object' ? design.brandId : (campaign?.brandId && typeof campaign.brandId === 'object' ? campaign.brandId : { name: design.brandName || 'Unknown Brand' });
  const imageUrl = design.imageUrl || design.generatedImage;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      style={{
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,.18)' : '0 1px 4px rgba(0,0,0,.06)',
        cursor: 'pointer',
      }}
    >
      {/* Image Area — ~65% of card height */}
      <div
        style={{
          position: 'relative', height: 200,
          background: 'var(--surface-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0
        }}
        onClick={() => onPreview(design)}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={design.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-3)' }}>
            <ImageOff size={26} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>No Image Generated</span>
          </div>
        )}

        {/* Status & Type badge overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <StatusBadge status={design.status} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
            background: design.submissionType === 'Uploaded Design' ? 'rgba(59,130,246,.12)' : 'rgba(108,76,241,.12)',
            color: design.submissionType === 'Uploaded Design' ? '#2563eb' : '#6C4CF1',
            border: `1.5px solid ${design.submissionType === 'Uploaded Design' ? 'rgba(59,130,246,.25)' : 'rgba(108,76,241,.25)'}`
          }}>
            {design.submissionType === 'Uploaded Design' ? 'Uploaded' : 'AI Generated'}
          </span>
        </div>

        {/* Hover quick-actions overlay */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(design); }}
              className="btn btn-secondary btn-xs"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px' }}
            >
              <Eye size={13} /> Preview
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(design); }}
              className="btn btn-secondary btn-xs"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px' }}
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Design Name */}
        <h3 style={{
          fontSize: 14.5, fontWeight: 800, margin: '0 0 10px 0',
          color: 'var(--text-1)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {design.name || 'Untitled Design'}
        </h3>

        {/* Brand Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <BrandAvatar brand={brand} size={26} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {brand?.name || design.brandName || 'Brand'}
          </span>
        </div>

        {/* Campaign */}
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 8 }}>
          Campaign: <strong style={{ color: 'var(--text-2)' }}>{campaign?.name || 'General'}</strong>
        </div>

        {/* Platform + Canvas */}
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
          <span>🖥️ {design.platform || 'Instagram'}</span>
          <span>📐 {design.canvasSize || '1080×1080'}</span>
        </div>

        {/* Dates row */}
        <div style={{
          fontSize: 10.5, color: 'var(--text-3)', paddingTop: 10,
          borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>Created {new Date(design.createdAt).toLocaleDateString()}</span>
          <span>Edited {new Date(design.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Bottom Action Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '10px 14px', borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)'
      }}>
        <button
          className="btn btn-secondary btn-xs"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
          onClick={() => onPreview(design)}
        >
          <Eye size={12} /> Preview
        </button>
        <button
          className="btn btn-secondary btn-xs"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
          onClick={() => onEdit(design)}
        >
          <Edit3 size={12} /> Edit
        </button>
        <button
          className="btn btn-secondary btn-xs"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}
          onClick={() => onDownload(design)}
          disabled={!imageUrl}
        >
          <Download size={12} /> Download
        </button>

        {/* Three-dot More menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="btn btn-secondary btn-xs"
            style={{ padding: '5px 8px' }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          >
            <MoreVertical size={13} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', bottom: '110%', right: 0,
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-md)', boxShadow: '0 8px 24px rgba(0,0,0,.18)',
              zIndex: 60, minWidth: 140, padding: '4px 0'
            }}>
              {[
                { icon: <Edit3 size={12}/>, label: 'Rename',    fn: () => { onRename(design); setMenuOpen(false); } },
                { icon: <Copy size={12}/>,  label: 'Duplicate', fn: () => { onDuplicate(design); setMenuOpen(false); } },
                { icon: <Archive size={12}/>, label: design.status === 'Archived' ? 'Unarchive' : 'Archive', fn: () => { onArchive(design); setMenuOpen(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.fn}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                    gap: 8, padding: '7px 12px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 12.5, color: 'var(--text-1)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={() => { onDelete(design); setMenuOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                  gap: 8, padding: '7px 12px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12.5, color: '#dc2626',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Preview Modal ─────────────────────────────────── */
function PreviewModal({ design, onClose, onEdit }) {
  const campaign = design.campaignId;
  const brand = campaign?.brandId || design.brandId;
  const imageUrl = design.imageUrl || design.generatedImage;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 120, padding: 24
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%', maxWidth: 860, display: 'grid',
          gridTemplateColumns: '1fr 320px', gap: 0, padding: 0,
          border: '1.5px solid var(--border)', overflow: 'hidden',
          maxHeight: '90vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Image */}
        <div style={{
          background: 'var(--surface-3)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', minHeight: 400
        }}>
          {imageUrl ? (
            <img src={imageUrl} alt={design.name} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '90vh' }} />
          ) : (
            <div style={{ color: 'var(--text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ImageOff size={32} />
              <span style={{ fontSize: 13 }}>No image generated</span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', borderLeft: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{design.name || 'Untitled Design'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 4 }}>✕</button>
          </div>

          <StatusBadge status={design.status} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrandAvatar brand={brand} size={28} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{brand?.name || 'Brand'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Campaign: {campaign?.name || 'General'}</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div>🖥️ Platform: <strong>{design.platform}</strong></div>
            <div>📐 Canvas: <strong>{design.canvasSize || '1080×1080'}</strong></div>
            <div>📅 Created: <strong>{new Date(design.createdAt).toLocaleString()}</strong></div>
            <div>✏️ Edited: <strong>{new Date(design.updatedAt).toLocaleString()}</strong></div>
          </div>

          {design.prompt && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>Prompt</div>
              <pre style={{
                fontFamily: 'Menlo, monospace', fontSize: 11, background: 'var(--surface-2)',
                padding: 10, borderRadius: 'var(--r-sm)', whiteSpace: 'pre-wrap',
                color: 'var(--text-2)', maxHeight: 180, overflow: 'auto',
                border: '1px solid var(--border)', margin: 0
              }}>{design.prompt}</pre>
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => { onEdit(design); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Edit3 size={13} /> Open in Workspace
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────── */
export default function DesignLibraryPage({ onResumeDraft }) {
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;

  /* ── Load Data ── */
  const loadData = async () => {
    try {
      setLoading(true);
      const [dl, bl, cl] = await Promise.all([
        designService.getDesigns(),
        brandService.getBrands(),
        campaignService.getCampaigns()
      ]);
      // Exclude drafts entirely
      setDesigns(dl.filter(d => d.status !== 'Draft' && !d.isDraft));
      setBrands(bl);
      setCampaigns(cl);
    } catch (err) {
      console.error('Design Library load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Silently backfill createdBy for existing designs (runs once per session)
    if (!sessionStorage.getItem('createdBy_claimed')) {
      designService.claimMyDesigns()
        .then(() => sessionStorage.setItem('createdBy_claimed', '1'))
        .catch(() => {}); // silent — non-critical
    }
    try {
      const cached = JSON.parse(localStorage.getItem('design_lib_filters') || '{}');
      if (cached.brand) setSelectedBrand(cached.brand);
      if (cached.campaign) setSelectedCampaign(cached.campaign);
      if (cached.platform) setSelectedPlatform(cached.platform);
      if (cached.status) setSelectedStatus(cached.status);
      if (cached.viewMode) setViewMode(cached.viewMode);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('design_lib_filters', JSON.stringify({
      brand: selectedBrand, campaign: selectedCampaign,
      platform: selectedPlatform, status: selectedStatus, viewMode
    }));
  }, [selectedBrand, selectedCampaign, selectedPlatform, selectedStatus, viewMode]);

  /* ── Stats ── */
  const stats = [
    { label: 'Total Designs', val: designs.length,                                                                         color: 'var(--text-1)' },
    { label: 'Completed',     val: designs.filter(d => d.status === 'Completed').length,                                   color: '#7c3aed' },
    { label: 'Approved',      val: designs.filter(d => d.status === 'Approved').length,                                    color: '#059669' },
    { label: 'In Review',     val: designs.filter(d => ['Submitted For Review','Pending'].includes(d.status)).length,      color: '#2563eb' },
    { label: 'Rejected',      val: designs.filter(d => d.status === 'Rejected').length,                                    color: '#dc2626' },
  ];

  /* ── Card Actions ── */
  const handleDownload = async (design) => {
    const url = design.imageUrl || design.generatedImage;
    if (!url) { alert('No image to download'); return; }
    try {
      const blob = await fetch(url).then(r => r.blob());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${design.name || 'design'}.png`;
      a.click();
    } catch (err) { alert('Download failed: ' + err.message); }
  };

  const handleDuplicate = async (design) => {
    try {
      const { _id, createdAt, updatedAt, id, ...data } = design;
      const dup = await designService.createDesign({ ...data, name: `${design.name || 'Untitled'} (Copy)`, isDraft: false });
      setDesigns(prev => [dup, ...prev]);
    } catch (err) { alert('Duplicate failed: ' + err.message); }
  };

  const [designToDelete, setDesignToDelete] = useState(null);

  const handleDelete = (item) => {
    setDesignToDelete(item);
  };

  const confirmDelete = async () => {
    if (!designToDelete) return;
    const targetId = typeof designToDelete === 'string' ? designToDelete : (designToDelete._id || designToDelete.id);
    if (!targetId) return;

    try {
      await designService.deleteDesign(targetId);
      setDesigns(prev => prev.filter(d => (d._id || d.id)?.toString() !== targetId.toString()));
      setDesignToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed: ' + (err.message || 'Server error'));
    }
  };

  const handleRename = async (design) => {
    const name = prompt('New design name:', design.name || '');
    if (!name?.trim()) return;
    try {
      const updated = await designService.updateDesign(design._id, { name: name.trim() });
      setDesigns(prev => prev.map(d => d._id === design._id ? updated : d));
    } catch (err) { alert('Rename failed: ' + err.message); }
  };

  const handleArchive = async (design) => {
    const next = design.status === 'Archived' ? 'Submitted For Review' : 'Archived';
    try {
      const updated = await designService.updateDesign(design._id, { status: next });
      setDesigns(prev => prev.map(d => d._id === design._id ? updated : d));
    } catch (err) { alert('Archive failed: ' + err.message); }
  };

  /* ── Filtering & Sorting ── */
  const filtered = designs.filter(d => {
    // Only show explicitly saved designs or completed/submitted designs
    if (d.isDraft === true && !d.isSaved) return false;
    const q = search.toLowerCase();
    if (q && !d.name?.toLowerCase().includes(q) && !d.prompt?.toLowerCase().includes(q)) return false;
    if (selectedBrand !== 'ALL' && d.brandId?._id !== selectedBrand && d.brandId !== selectedBrand) return false;
    if (selectedCampaign !== 'ALL' && d.campaignId?._id !== selectedCampaign && d.campaignId !== selectedCampaign) return false;
    if (selectedPlatform !== 'ALL' && d.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'ALL' && d.status !== selectedStatus) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let vA = a[sortField] || '', vB = b[sortField] || '';
    if (sortField.includes('At') || sortField.includes('ed')) {
      vA = new Date(vA).getTime();
      vB = new Date(vB).getTime();
    }
    return sortOrder === 'desc' ? (vB > vA ? 1 : -1) : (vA > vB ? 1 : -1);
  });

  const totalPages = Math.ceil(sorted.length / cardsPerPage);
  const paginated = sorted.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  return (
    <div className="page anim-fade-up" style={{ width: '100%', maxWidth: '100%', padding: '20px 28px' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="page-title" style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Saved Designs</h1>
        <p className="page-subtitle" style={{ marginTop: 4, marginBottom: 0 }}>
          Browse, manage and continue working on all your AI generated designs.
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: '13px 16px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 5 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Toolbar ── */}
      <div style={{
        background: 'var(--surface-2)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20
      }}>
        {/* Row 1: Search + View Toggle */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              className="input" type="text"
              style={{ paddingLeft: 30, fontSize: 13, height: 36 }}
              placeholder="Search designs..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')} style={{ padding: '6px 10px' }} title="Grid view">
              <Grid size={14} />
            </button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')} style={{ padding: '6px 10px' }} title="List view">
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Row 2: Filters + Sort */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'All Brands', state: selectedBrand, set: setSelectedBrand, options: brands.map(b => ({ val: b._id, label: b.name })) },
            { label: 'All Campaigns', state: selectedCampaign, set: setSelectedCampaign, options: campaigns.map(c => ({ val: c._id, label: c.name })) },
            { label: 'All Platforms', state: selectedPlatform, set: setSelectedPlatform, options: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok'].map(p => ({ val: p, label: p })) },
            { label: 'All Statuses', state: selectedStatus, set: setSelectedStatus, options: [
              { val: 'Completed', label: 'Completed' },
              { val: 'Approved', label: 'Approved' },
              { val: 'Submitted For Review', label: 'In Review' },
              { val: 'Rejected', label: 'Rejected' },
              { val: 'Archived', label: 'Archived' },
            ]},
          ].map(({ label, state, set, options }) => (
            <select key={label} className="select" value={state}
              style={{ fontSize: 12, flex: '1 1 130px', minWidth: 110, height: 36 }}
              onChange={e => { set(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">{label}</option>
              {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          ))}
          <select className="select" value={sortField} onChange={e => setSortField(e.target.value)}
            style={{ fontSize: 12, flex: '1 1 130px', minWidth: 120, height: 36 }}>
            <option value="updatedAt">Last Modified</option>
            <option value="createdAt">Date Created</option>
            <option value="name">Name A–Z</option>
            <option value="lastOpenedAt">Recently Opened</option>
          </select>
          <select className="select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
            style={{ fontSize: 12, width: 82, height: 36 }}>
            <option value="desc">↓ Desc</option>
            <option value="asc">↑ Asc</option>
          </select>
        </div>
      </div>

      {/* ── Result Count ── */}
      {!loading && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>
          Showing <strong>{paginated.length}</strong> of <strong>{sorted.length}</strong> designs
        </div>
      )}

      {/* ── Content Area ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 64, color: 'var(--text-3)' }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Loading Design Library...
        </div>
      ) : paginated.length === 0 ? (
        <div className="card" style={{ border: '1.5px solid var(--border)' }}>
          <div className="empty-state" style={{ padding: '56px 24px' }}>
            <div className="empty-icon"><Sparkles size={28} /></div>
            <div className="empty-title" style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>No Saved Designs</div>
            <div className="empty-body" style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
              Your generated designs will appear here.
            </div>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/editor/dashboard')}>
              Generate Design
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {paginated.map(design => (
            <DesignCard
              key={design._id}
              design={design}
              onPreview={d => navigate(`/editor/designs/${d._id}`)}
              onEdit={d => onResumeDraft(d)}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onRename={handleRename}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1.5px solid var(--border)' }}>
                {['Preview', 'Name', 'Brand / Campaign', 'Platform', 'Status', 'Modified', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(design => {
                 const campaign = design.campaignId && typeof design.campaignId === 'object' ? design.campaignId : { name: design.campaignName || 'Unknown Campaign' };
                 const brand = design.brandId && typeof design.brandId === 'object' ? design.brandId : (campaign?.brandId && typeof campaign.brandId === 'object' ? campaign.brandId : { name: design.brandName || 'Unknown Brand' });
                const imageUrl = design.imageUrl || design.generatedImage;
                return (
                  <tr key={design._id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ width: 52, height: 34, background: 'var(--surface-3)', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {imageUrl ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 14 }}>🎨</div>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{design.name || 'Untitled'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <BrandAvatar brand={brand} size={22} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700 }}>{brand?.name || 'Brand'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{campaign?.name || 'General'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{design.platform}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={design.status} /></td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-3)', whiteSpace: 'nowrap', fontSize: 12 }}>{new Date(design.updatedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-xs" onClick={() => navigate(`/editor/designs/${design._id}`)}><Eye size={12} /></button>
                        <button className="btn btn-secondary btn-xs" onClick={() => onResumeDraft(design)}><Edit3 size={12} /></button>
                        <button className="btn btn-secondary btn-xs" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(design)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 28 }}>
          <button className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - currentPage) <= 2).map(p => (
            <button key={p} className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentPage(p)} style={{ minWidth: 34 }}>{p}</button>
          ))}
          <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── In-App Delete Confirmation Modal ── */}
      {designToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setDesignToDelete(null)}>
          <div className="anim-fade-up" style={{
            width: '100%', maxWidth: '420px', background: 'var(--surface)',
            borderRadius: '24px', padding: '24px', border: '1.5px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: '16px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 750, color: 'var(--text-1)' }}>Delete Design</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-3)' }}>This action cannot be undone.</p>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-2)', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>"{typeof designToDelete === 'object' ? (designToDelete?.name || 'Untitled Design') : 'this design'}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDesignToDelete(null)}
                style={{ padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 650 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={confirmDelete}
                style={{
                  padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  background: '#DC2626', color: '#FFFFFF', border: 'none',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                Delete Design
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
