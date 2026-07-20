import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Edit3, RefreshCw, Send, Pencil, Check, X,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Image as ImageIcon,
  FileText, Info, ChevronRight, Monitor, Layers, Calendar, Hash,
  MessageSquare, User, Clock, CheckCircle, XCircle, AlertCircle,
  RotateCcw
} from 'lucide-react';
import designService from '../services/designService';

/* ─── Status helpers ─────────────────────────────────── */
const STATUS_CONFIG = {
  'Approved':            { color: '#059669', bg: 'rgba(5,150,105,.10)',  border: 'rgba(5,150,105,.22)',  Icon: CheckCircle  },
  'Rejected':            { color: '#DC2626', bg: 'rgba(220,38,38,.10)',  border: 'rgba(220,38,38,.22)',  Icon: XCircle      },
  'Changes Requested':   { color: '#D97706', bg: 'rgba(217,119,6,.10)',  border: 'rgba(217,119,6,.22)',  Icon: AlertCircle  },
  'Pending':             { color: '#2563EB', bg: 'rgba(37,99,235,.10)',  border: 'rgba(37,99,235,.22)',  Icon: Clock        },
  'Pending Review':      { color: '#2563EB', bg: 'rgba(37,99,235,.10)',  border: 'rgba(37,99,235,.22)',  Icon: Clock        },
  'Submitted For Review':{ color: '#7C3AED', bg: 'rgba(124,58,237,.10)', border: 'rgba(124,58,237,.22)', Icon: Send         },
  'Completed':           { color: '#7C3AED', bg: 'rgba(124,58,237,.10)', border: 'rgba(124,58,237,.22)', Icon: CheckCircle  },
};
const getStatus = s => STATUS_CONFIG[s] || { color: '#64748B', bg: 'rgba(100,116,139,.10)', border: 'rgba(100,116,139,.22)', Icon: Info };

/* ─── Tiny sub-components ───────────────────────────── */
function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, letterSpacing: '.02em', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 600, textAlign: 'right', marginLeft: 12, wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );
}

function SidebarCard({ icon, title, children }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8EDF2',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.03)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '18px 20px',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(124,58,237,.09)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#7C3AED', flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 750, color: '#1E293B' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────── */
export default function DesignPreviewPage() {
  const { designId } = useParams();
  const navigate   = useNavigate();

  const [design,   setDesign]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [editName, setEditName] = useState(false);
  const [nameVal,  setNameVal]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [zoom,     setZoom]     = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const nameInputRef = useRef(null);

  /* load */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await designService.getDesigns();
        const found = all.find(d => d._id === designId);
        if (!found) throw new Error('Design not found');
        setDesign(found);
        setNameVal(found.name || '');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [designId]);

  /* derived */
  const campaign   = design?.campaignId && typeof design.campaignId === 'object'
    ? design.campaignId
    : { name: design?.campaignName || 'Unknown Campaign' };
  const brand      = design?.brandId && typeof design.brandId === 'object'
    ? design.brandId
    : (campaign?.brandId && typeof campaign.brandId === 'object'
        ? campaign.brandId
        : { name: design?.brandName || 'Unknown Brand' });
  const imageUrl   = design?.imageUrl || design?.generatedImage;
  const brandId    = brand?._id || design?.brandId;
  const campaignId = campaign?._id || design?.campaignId;
  const statusConf = getStatus(design?.status);

  /* reviewer */
  const reviewer = design?.reviewer;
  const reviewerName = reviewer && typeof reviewer === 'object' && reviewer.name
    ? reviewer.name
    : null;

  /* zoom helpers */
  const zoomIn  = useCallback(() => setZoom(z => Math.min(z + 0.25, 4)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.25)), []);
  const zoomFit = useCallback(() => setZoom(1), []);

  /* download */
  const handleDownload = async () => {
    if (!imageUrl) { alert('No image to download'); return; }
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${design.name || 'design'}.png`;
      a.click();
    } catch (e) { alert('Download failed: ' + e.message); }
  };

  /* open editor */
  const openEditor = (step = 5) => {
    navigate(`/editor/brands/${brandId}/campaigns/${campaignId}`, {
      state: { resumeDraft: design, openStep: step }
    });
  };

  /* save name */
  const saveName = async () => {
    if (!nameVal.trim() || nameVal === design.name) { setEditName(false); return; }
    setSaving(true);
    try {
      const updated = await designService.updateDesign(designId, { name: nameVal.trim() });
      setDesign(updated);
    } catch (e) { alert('Failed to save name: ' + e.message); }
    finally { setSaving(false); setEditName(false); }
  };

  /* prompt preview */
  const promptFull    = design?.prompt || '';
  const promptPreview = promptFull.length > 280
    ? promptFull.slice(0, 280).trim() + '…'
    : promptFull;
  const viewFullPrompt = () => navigate('/prompt/view', {
    state: { prompt: promptFull, brandId, selectedCampaignId: campaignId }
  });

  /* ── loading / error ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Loading design…</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !design) return (
    <div style={{ padding: 40 }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="card" style={{ padding: 48, textAlign: 'center', borderRadius: 20 }}>
        <ImageIcon size={40} style={{ color: '#CBD5E1', marginBottom: 14 }} />
        <p style={{ color: '#64748B', fontSize: 15, fontWeight: 600, margin: 0 }}>{error || 'Design not found.'}</p>
      </div>
    </div>
  );

  const isReviewed = !['Draft', 'Completed', 'Generating'].includes(design.status);
  const canResubmit = ['Rejected', 'Changes Requested'].includes(design.status);

  /* ─────────────── RENDER ─────────────── */
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '0' }}>

      {/* ── TOP HEADER ─────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8EDF2',
        padding: '0 32px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: 1600, margin: '0 auto', height: 64, gap: 16, flexWrap: 'wrap',
        }}>

          {/* Left: back + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/editor/saved-designs')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 0, flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#64748B' }}
              aria-label="Back to Saved Designs"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div style={{ width: 1, height: 24, background: '#E2E8F0', flexShrink: 0 }} />

            {/* Editable name */}
            {editName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <input
                  ref={nameInputRef}
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditName(false); }}
                  autoFocus
                  style={{
                    fontSize: 16, fontWeight: 750, color: '#1E293B',
                    border: '2px solid #7C3AED', borderRadius: 8, padding: '4px 10px',
                    background: '#FAFBFF', outline: 'none', minWidth: 180, maxWidth: 340,
                  }}
                  aria-label="Design name"
                />
                <button onClick={saveName} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', padding: 4 }} aria-label="Save name"><Check size={16} /></button>
                <button onClick={() => setEditName(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }} aria-label="Cancel"><X size={16} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <h1 style={{ fontSize: 16, fontWeight: 750, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                  {design.name || 'Untitled Design'}
                </h1>
                <button
                  onClick={() => { setEditName(true); setNameVal(design.name || ''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 3, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  aria-label="Edit design name"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}

            {/* Status badge */}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 30,
              background: statusConf.bg, color: statusConf.color,
              border: `1.5px solid ${statusConf.border}`,
              whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '.03em',
            }}>
              {design.status}
            </span>

            {/* Meta chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[
                brand?.name,
                campaign?.name,
                design.platform,
              ].filter(Boolean).map((label, i) => (
                <span key={i} style={{
                  fontSize: 11.5, fontWeight: 600, color: '#64748B',
                  padding: '2px 9px', borderRadius: 20,
                  background: '#F1F5F9', border: '1px solid #E2E8F0',
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              className="btn btn-secondary"
              onClick={handleDownload}
              disabled={!imageUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 650 }}
              aria-label="Download design"
            >
              <Download size={14} /> Download
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => openEditor(5)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 650 }}
              aria-label="Edit design"
            >
              <Edit3 size={14} /> Edit Design
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => openEditor(5)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 650 }}
              aria-label="Regenerate design"
            >
              <RefreshCw size={14} /> Regenerate
            </button>
            {canResubmit && (
              <button
                onClick={() => openEditor(5)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                  padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  color: '#FFFFFF', boxShadow: '0 4px 14px rgba(124,58,237,.3)',
                  transition: 'opacity 0.15s',
                }}
                aria-label="Resubmit design for review"
                onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <RotateCcw size={14} /> Resubmit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────── */}
      <div style={{
        maxWidth: 1600, margin: '0 auto',
        padding: '28px 32px 48px',
        display: 'grid',
        gridTemplateColumns: fullscreen ? '1fr' : '1fr 320px',
        gap: 24,
        alignItems: 'start',
      }}>

        {/* ─── LEFT: PREVIEW ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preview Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E8EDF2',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.06)',
          }}>
            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={15} color="#7C3AED" />
                <span style={{ fontSize: 13.5, fontWeight: 750, color: '#1E293B' }}>Design Preview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                  {design.canvasSize?.replace('x', ' × ') || '1080 × 1080'} px
                </span>
                <button
                  onClick={() => setFullscreen(f => !f)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, display: 'flex', alignItems: 'center' }}
                  aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>

            {/* Image area */}
            <div style={{
              background: '#F8FAFC',
              minHeight: 520,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={design.name}
                  loading="lazy"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                    maxWidth: '100%',
                    maxHeight: '72vh',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: zoom === 1 ? 0 : 4,
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 14, padding: 64, textAlign: 'center',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(109,40,217,.12))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px dashed rgba(124,58,237,.25)',
                  }}>
                    <ImageIcon size={30} color="#C4B5FD" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 750, color: '#1E293B', marginBottom: 6 }}>No Design Generated</div>
                    <div style={{ fontSize: 13, color: '#94A3B8', maxWidth: 280 }}>
                      Open the editor and generate an image to see your design preview here.
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => openEditor(5)}
                    style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                  >
                    <Edit3 size={13} /> Open in Editor
                  </button>
                </div>
              )}

              {/* Floating zoom controls */}
              {imageUrl && (
                <div style={{
                  position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 2,
                  background: 'rgba(255,255,255,.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid #E2E8F0',
                  borderRadius: 30,
                  padding: '5px 10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,.10)',
                  zIndex: 10,
                }}>
                  <button onClick={zoomOut} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#475569', display: 'flex', alignItems: 'center', borderRadius: 6 }} aria-label="Zoom out" title="Zoom out">
                    <ZoomOut size={15} />
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', minWidth: 44, textAlign: 'center', userSelect: 'none' }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button onClick={zoomIn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#475569', display: 'flex', alignItems: 'center', borderRadius: 6 }} aria-label="Zoom in" title="Zoom in">
                    <ZoomIn size={15} />
                  </button>
                  <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
                  <button onClick={zoomFit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 11.5, fontWeight: 700, color: '#7C3AED', borderRadius: 6 }} aria-label="Fit to screen" title="Fit">
                    Fit
                  </button>
                  <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
                  <button onClick={() => setFullscreen(f => !f)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#475569', display: 'flex', alignItems: 'center', borderRadius: 6 }} aria-label="Toggle fullscreen">
                    {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button onClick={handleDownload} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#475569', display: 'flex', alignItems: 'center', borderRadius: 6 }} aria-label="Download">
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─── RIGHT SIDEBAR ──────────────────── */}
        {!fullscreen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

            {/* 1. Review Summary */}
            <SidebarCard icon={<MessageSquare size={15} />} title="Review Summary">
              {(() => {
                const preReview = ['Draft', 'Completed', 'Generating'].includes(design.status);
                const pendingStates = ['Pending', 'Pending Review', 'Submitted For Review'];
                const isPending = pendingStates.includes(design.status);
                const isDecided = ['Approved', 'Rejected', 'Changes Requested'].includes(design.status);

                if (preReview) {
                  // Not submitted yet
                  return (
                    <div style={{ textAlign: 'center', padding: '18px 0' }}>
                      <Clock size={28} style={{ color: '#CBD5E1', marginBottom: 8 }} />
                      <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>Not yet submitted for review</div>
                      <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Submit this design to get reviewer feedback.</div>
                    </div>
                  );
                }

                if (isPending) {
                  // Submitted — waiting for reviewer or reviewer assigned but no decision yet
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <MetaRow label="Status" value={
                        <span style={{ color: statusConf.color, fontWeight: 750 }}>{design.status}</span>
                      } />
                      <MetaRow label="Reviewer" value={
                        reviewerName
                          ? <span style={{ fontWeight: 600, color: '#1E293B' }}>{reviewerName}</span>
                          : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Waiting for reviewer assignment</span>
                      } />
                      <MetaRow label="Review Date" value="—" />
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Comments</div>
                        <div style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
                          No review yet.
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isDecided) {
                  // Reviewer has made a decision
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <MetaRow label="Status" value={
                        <span style={{ color: statusConf.color, fontWeight: 750 }}>{design.status}</span>
                      } />
                      <MetaRow label="Reviewer" value={reviewerName || '—'} />
                      <MetaRow label="Review Date" value={new Date(design.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Comments</div>
                        {design.feedback ? (
                          <div style={{
                            background: '#F8FAFC', border: '1px solid #E8EDF2', borderRadius: 12,
                            padding: '12px 14px', fontSize: 13, color: '#334155', lineHeight: 1.65,
                            fontStyle: 'italic',
                          }}>
                            "{design.feedback}"
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
                            No additional review comments.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Archived or other
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <MetaRow label="Status" value={
                      <span style={{ color: statusConf.color, fontWeight: 750 }}>{design.status}</span>
                    } />
                  </div>
                );
              })()}
            </SidebarCard>


            {/* 2. Design Details */}
            <SidebarCard icon={<Info size={15} />} title="Design Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <MetaRow label="Brand"       value={brand?.name}      />
                <MetaRow label="Campaign"    value={campaign?.name}   />
                <MetaRow label="Platform"    value={design.platform}  />
                <MetaRow label="Canvas"      value={(design.canvasSize || '1080x1080').replace('x', ' × ') + ' px'} />
                <MetaRow label="Created"     value={new Date(design.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                <MetaRow label="Updated"     value={new Date(design.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
              </div>
            </SidebarCard>

            {/* 3. Prompt Preview */}
            {promptFull && (
              <SidebarCard icon={<FileText size={15} />} title="Prompt Preview">
                <pre style={{
                  fontFamily: '"Fira Code", "Menlo", monospace',
                  fontSize: 11.5, lineHeight: 1.75,
                  color: '#475569', margin: 0,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: '#F8FAFC', border: '1px solid #F1F5F9',
                  borderRadius: 10, padding: '12px 13px',
                  display: '-webkit-box',
                  WebkitLineClamp: 8,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {promptPreview}
                </pre>
                <button
                  onClick={viewFullPrompt}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, marginTop: 12,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 13, fontWeight: 700, color: '#7C3AED',
                  }}
                  aria-label="View full prompt"
                >
                  View Full Prompt <ChevronRight size={14} />
                </button>
              </SidebarCard>
            )}

          </div>
        )}
      </div>

      {/* Responsive + spin keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 960px) {
          .design-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
