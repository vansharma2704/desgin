import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import brandService from '../services/brandService';
import campaignService from '../services/campaignService';
import promptService from '../services/promptService';
import {
  Layers, LogOut, CheckCircle, XCircle, Clock,
  Filter, Sparkles, BookMarked, MessageSquare
} from 'lucide-react';

export default function ReviewerDashboard() {
  const { user, logout } = useAuth();
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState('all');

  // Review states
  const [rejectId, setRejectId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [brandsData, campaignsData, promptsData] = await Promise.all([
        brandService.getBrands(),
        campaignService.getCampaigns(),
        promptService.getPrompts(),
      ]);
      setBrands(brandsData);
      setCampaigns(campaignsData);
      setPrompts(promptsData);
    } catch (err) {
      setError('Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    setSubmittingReview(true);
    try {
      const updated = await promptService.updatePrompt(id, { status: 'Approved' });
      setPrompts(prev => prev.map(p => p._id === id ? updated : p));
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmittingReview(true);
    try {
      const updated = await promptService.updatePrompt(rejectId, {
        status: 'Rejected',
        feedback: feedback,
      });
      setPrompts(prev => prev.map(p => p._id === rejectId ? updated : p));
      setRejectId(null);
      setFeedback('');
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesBrand = selectedBrand === 'all' || p.brand?._id === selectedBrand || p.brand === selectedBrand;
    const matchesCampaign = selectedCampaign === 'all' || p.campaign === selectedCampaign;
    return matchesBrand && matchesCampaign;
  });

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)', color: '#fff', padding: '8px',
            borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-.02em', color: 'var(--text-1)' }}>AI Brand Studio</span>
            <span className="badge badge-gray" style={{ marginLeft: '8px', fontSize: '11px' }}>Review Panel</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)',
              color: 'var(--primary)', fontWeight: 700, fontSize: '13px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-1)' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{user?.email}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={logout} title="Sign Out" style={{ color: 'var(--danger)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Design Approvals</h1>
            <p className="page-subtitle" style={{ marginTop: '4px' }}>Review prompts and generated images submitted by editors.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px 24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)', fontSize: '13.5px', fontWeight: 600 }}>
              <Filter size={14} /> Filter Submissions:
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <select
                className="select"
                style={{ maxWidth: '240px', fontSize: '13px' }}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>

              <select
                className="select"
                style={{ maxWidth: '240px', fontSize: '13px' }}
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="all">All Campaigns</option>
                {Array.from(new Set(prompts.map(p => p.campaign).filter(Boolean))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: '140px', animation: 'pulse 1.5s infinite ease-in-out', background: 'var(--surface-3)', border: 'none' }} />
            ))}
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--danger)', fontSize: '15px', fontWeight: 600 }}>{error}</div>
            <button className="btn btn-secondary mt-12" onClick={loadData}>Retry</button>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--surface-2)', borderRadius: '50%', color: 'var(--text-3)', marginBottom: '16px' }}>
              <BookMarked size={28} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>No Submissions Found</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '4px' }}>There are no designs matches for the selected filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredPrompts.map(p => (
              <div key={p._id} className="card anim-fade-up" style={{
                padding: '24px', border: '1px solid var(--border)',
                display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap'
              }}>
                {/* Design Preview Placeholder */}
                <div style={{
                  width: '180px', height: '180px', borderRadius: 'var(--r-md)',
                  background: 'var(--surface-3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="Design output" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '12px' }}>
                      <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🖼️</span>
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>Image Placeholder</span>
                    </div>
                  )}
                </div>

                {/* Prompt Info */}
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div className="flex items-center gap-8">
                        <span className="badge badge-primary">{p.brand?.name || 'Unknown Brand'}</span>
                        {p.campaign && <span className="badge badge-gray">{p.campaign}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.status === 'Approved' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
                            <CheckCircle size={14} /> Approved
                          </span>
                        )}
                        {p.status === 'Rejected' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>
                            <XCircle size={14} /> Rejected
                          </span>
                        )}
                        {p.status === 'Pending' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                            <Clock size={14} /> Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    <pre style={{
                      fontFamily: 'Menlo, Consolas, monospace', fontSize: '12px', lineHeight: 1.6,
                      background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                      padding: '12px 16px', marginTop: '12px', whiteSpace: 'pre-wrap', color: 'var(--text-2)',
                      maxHeight: '100px', overflowY: 'auto'
                    }}>
                      {p.prompt}
                    </pre>

                    {p.feedback && (
                      <div style={{
                        marginTop: '12px', padding: '10px 14px', background: 'var(--danger-light)',
                        border: '1px solid #fecaca', borderRadius: 'var(--r-sm)', display: 'flex', gap: '8px',
                        alignItems: 'flex-start', color: 'var(--danger)', fontSize: '12.5px'
                      }}>
                        <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div><strong>Feedback:</strong> {p.feedback}</div>
                      </div>
                    )}
                  </div>

                  {/* Footer metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>
                      Submitted by: <strong style={{ color: 'var(--text-2)' }}>{p.createdBy?.name || 'Editor'}</strong> ({p.createdBy?.email}) on {new Date(p.createdAt).toLocaleDateString()}
                    </div>

                    {p.status === 'Pending' && rejectId !== p._id && (
                      <div className="flex gap-10">
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => setRejectId(p._id)}
                          disabled={submittingReview}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApprove(p._id)}
                          disabled={submittingReview}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Rejection Feedback Form */}
                  {rejectId === p._id && (
                    <form onSubmit={handleRejectSubmit} style={{ marginTop: '16px', background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Reason for Rejection (Required)</label>
                      <textarea
                        className="select"
                        placeholder="Provide details on what needs to be changed..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        rows={3}
                        style={{ width: '100%', padding: '12px', marginTop: '4px', resize: 'vertical', display: 'block', height: 'auto' }}
                      />
                      <div className="flex justify-end gap-10 mt-12">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setRejectId(null); setFeedback(''); }}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} disabled={submittingReview || !feedback.trim()}>
                          Confirm Rejection
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
