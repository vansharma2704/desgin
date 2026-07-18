import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit3, Calendar, Monitor, Layout, ImageOff } from 'lucide-react';
import designService from '../services/designService';

export default function DesignPreviewPage() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        const all = await designService.getDesigns();
        const found = all.find(d => d._id === designId);
        if (!found) throw new Error('Design not found');
        setDesign(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [designId]);

  const handleDownload = async () => {
    const url = design?.imageUrl || design?.generatedImage;
    if (!url) { alert('No image to download'); return; }
    try {
      const blob = await fetch(url).then(r => r.blob());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${design.name || 'design'}.png`;
      a.click();
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const campaign = design?.campaignId;
  const brand = campaign?.brandId || design?.brandId;
  const imageUrl = design?.imageUrl || design?.generatedImage;

  const getStatusStyle = (status) => {
    const map = {
      'Approved':             { bg: 'rgba(16,185,129,.12)', color: '#059669', border: 'rgba(16,185,129,.25)' },
      'Submitted For Review': { bg: 'rgba(59,130,246,.12)', color: '#2563eb', border: 'rgba(59,130,246,.25)' },
      'Completed':            { bg: 'rgba(139,92,246,.12)', color: '#7c3aed', border: 'rgba(139,92,246,.25)' },
      'Rejected':             { bg: 'rgba(239,68,68,.12)',  color: '#dc2626', border: 'rgba(239,68,68,.25)' },
    };
    return map[status] || { bg: 'var(--surface-3)', color: 'var(--text-3)', border: 'var(--border)' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-3)' }}>
        Loading design…
      </div>
    );
  }

  if (error || !design) {
    return (
      <div style={{ padding: 40 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)' }}>{error || 'Design not found.'}</p>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(design.status);

  return (
    <div className="page anim-fade-up" style={{ maxWidth: '100%', padding: '20px 28px' }}>

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/editor/saved-designs')} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 0 }}>
          <ArrowLeft size={15} /> Back to Saved Designs
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleDownload} disabled={!imageUrl}>
            <Download size={14} /> Download
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate(`/editor/brands/${brand?._id || design.brandId}/campaigns/${campaign?._id || design.campaignId}`, { state: { resumeDraft: design } })}>
            <Edit3 size={14} /> Open in Editor
          </button>
        </div>
      </div>

      {/* Title row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>{design.name || 'Untitled Design'}</h1>
          <span style={{
            fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
            background: statusStyle.bg, color: statusStyle.color, border: `1.5px solid ${statusStyle.border}`
          }}>{design.status}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
          {brand?.name} · {campaign?.name || 'General Campaign'}
        </p>
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

        {/* Left — Image */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
          <div style={{
            background: 'var(--surface-3)', minHeight: 480,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={design.name}
                style={{ width: '100%', height: 'auto', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--text-3)', padding: 48 }}>
                <ImageOff size={36} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>No image generated</span>
                <span style={{ fontSize: 12, textAlign: 'center' }}>Generate an image in the Prompt Builder to see a preview here.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right — Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Meta card */}
          <div className="card" style={{ padding: 18, border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 14 }}>Design Details</div>
            {[
              { icon: <Monitor size={13} />, label: 'Platform', val: design.platform || 'Instagram' },
              { icon: <Layout size={13} />, label: 'Canvas Size', val: design.canvasSize || '1080×1080' },
              { icon: <Calendar size={13} />, label: 'Created', val: new Date(design.createdAt).toLocaleString() },
              { icon: <Calendar size={13} />, label: 'Last Modified', val: new Date(design.updatedAt).toLocaleString() },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <span style={{ color: 'var(--text-3)', marginTop: 1, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 1 }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt card */}
          {design.prompt && (
            <div className="card" style={{ padding: 18, border: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 12 }}>
                Prompt
              </div>
              <pre style={{
                fontFamily: 'Menlo, Monaco, monospace',
                fontSize: 11.5,
                lineHeight: 1.7,
                color: 'var(--text-2)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: 14,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                maxHeight: 320,
                overflowY: 'auto'
              }}>
                {design.prompt}
              </pre>
            </div>
          )}

          {/* Editorial content card */}
          {(design.heading || design.subHeading || design.ctaText) && (
            <div className="card" style={{ padding: 18, border: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 12 }}>
                Editorial Content
              </div>
              {design.heading && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Heading</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{design.heading}</div>
                </div>
              )}
              {design.subHeading && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Sub-Heading</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{design.subHeading}</div>
                </div>
              )}
              {design.ctaText && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>CTA</div>
                  <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>{design.ctaText}</div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
