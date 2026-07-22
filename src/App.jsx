import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Sparkles, MonitorPlay, BookMarked, LogOut, ArrowLeft, Copy, Trash2, Check, Save, UploadCloud
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CreateBrand from './components/CreateBrand';
import Option1Form from './components/Option1Form';
import Option2Wizard from './components/Option2Wizard';
import BrandDetails from './components/BrandDetails';
import Platforms from './components/Platforms';
import PromptBuilder from './components/PromptBuilder';
import NotificationBell from './components/NotificationBell';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ReviewerDesignReviewPage from './pages/ReviewerDesignReviewPage';
import CampaignWorkspacePage from './pages/CampaignWorkspacePage';
import DesignLibraryPage from './pages/DesignLibraryPage';
import DesignPreviewPage from './pages/DesignPreviewPage';
import PromptViewPage from './pages/PromptViewPage';
import PromptEditPage from './pages/PromptEditPage';
import UploadDesignPage from './pages/UploadDesignPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import brandService from './services/brandService';
import promptService from './services/promptService';
import designService from './services/designService';
import authService from './services/authService';
import { addNotification } from './utils/notifications';

function Sidebar({ view, setView, brands, selectedBrandId, setSelectedBrandId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={16} /> },
    { key: 'builder', label: 'Prompt Builder', icon: <Sparkles size={16} /> },
    { key: 'upload', label: 'Upload Design', icon: <UploadCloud size={16} /> },
    { key: 'history', label: 'Saved Designs', icon: <BookMarked size={16} /> },
  ];

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="sidebar-logo-icon">
            <Sparkles size={16} color="#fff" />
          </div>
          <div className="sidebar-logo-text">AI Brand<br /><span>Studio</span></div>
        </div>
        <NotificationBell role="editor" />
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Workspace</div>
      {navItems.map(item => (
        <button
          key={item.key}
          className={`nav-item ${view === item.key || (item.key === 'history' && view === 'design-details') ? 'active' : ''}`}
          onClick={() => {
            setView(item.key);
            if (item.key === 'history') {
              navigate('/editor/saved-designs');
            } else if (item.key === 'upload') {
              navigate('/editor/upload-design');
            } else {
              navigate('/editor/dashboard');
            }
          }}
        >
          {item.icon} {item.label}
        </button>
      ))}

      {/* Active Brand Switcher */}
      {brands.length > 0 && (
        <div className="sidebar-brand-switcher">
          <label>Active Brand</label>
          <select
            className="select"
            style={{ fontSize: 12, padding: '6px 10px' }}
            value={selectedBrandId || ''}
            onChange={e => setSelectedBrandId(e.target.value)}
          >
            {brands.map(b => <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {/* User Session Info */}
      <div style={{ marginTop: 'auto', padding: '20px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
            color: 'var(--primary)', fontWeight: 700, fontSize: 13, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'E'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-1)' }}>{user?.name}</div>
            <span className="badge badge-primary" style={{ fontSize: 9.5, padding: '2px 6px', marginTop: 2, display: 'inline-block' }}>{user?.role}</span>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </nav>
  );
}

function DesignCard({ p, onOpen }) {
  const campaign = p.campaignId && typeof p.campaignId === 'object' ? p.campaignId : { name: p.campaignName || 'Unknown Campaign' };
  const brand = p.brandId && typeof p.brandId === 'object' ? p.brandId : (campaign?.brandId && typeof campaign.brandId === 'object' ? campaign.brandId : { name: p.brandName || 'Unknown Brand' });
  const imageUrl = p.imageUrl || p.generatedImage;

  return (
    <div
      onClick={onOpen}
      className="card card-hover anim-scale-in"
      style={{ cursor: 'pointer', padding: '16px', display: 'flex', gap: '16px', flexDirection: 'row', alignItems: 'center', border: '1.5px solid var(--border)' }}
    >
      <div style={{
        width: '60px', height: '60px', borderRadius: 'var(--r-md)',
        background: 'var(--surface-3)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '20px' }}>🖼️</span>
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-1)' }}>
          {p.name || campaign?.name || 'Draft Design'}
        </h3>
        <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '2px' }}>
          {brand?.name || 'Unknown Brand'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span className={`badge ${p.status === 'Approved' ? 'badge-primary' :
              p.status === 'Rejected' ? 'badge-danger' :
                p.status === 'Pending' ? 'badge-warning' : 'badge-gray'
            }`} style={{ fontSize: '9px', padding: '2px 6px' }}>
            {p.status === 'Draft' ? 'Draft' : p.status}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
            {new Date(p.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SavedDesigns({ prompts, onOpenDesign }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Designs</h1>
          <p className="page-subtitle mt-4">Browse and review all compiled design layouts.</p>
        </div>
      </div>
      {prompts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><BookMarked size={22} /></div>
            <div className="empty-title">No Saved Designs</div>
            <div className="empty-body">Use the AI Prompt Builder and save configured prompts to see them here.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {prompts.map(p => (
            <DesignCard
              key={p._id || p.id}
              p={p}
              onOpen={() => onOpenDesign(p._id || p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DesignDetails({ p, onBack, onDelete, onSendForReview }) {
  const [copied, setCopied] = useState(false);
  const [emailQuery, setEmailQuery] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!emailQuery.trim()) {
      setReviewers([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await authService.searchReviewers(emailQuery);
        setReviewers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [emailQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(p.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    let targetReviewer = selectedReviewer;
    if (!targetReviewer && emailQuery.trim()) {
      try {
        const matches = await authService.searchReviewers(emailQuery.trim());
        if (matches && matches.length > 0) {
          targetReviewer = matches[0];
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (!targetReviewer) {
      alert('Please select a valid reviewer account email.');
      return;
    }
    setSubmitting(true);
    try {
      const reviewerId = targetReviewer._id || targetReviewer.id;
      await onSendForReview(p._id || p.id, reviewerId);
      setSelectedReviewer(null);
      setEmailQuery('');
      alert(`Design sent for review to ${targetReviewer.name} (${targetReviewer.email}) successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to submit review request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!p) {
    return (
      <div className="page" style={{ padding: 40 }}>
        <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <div style={{ marginTop: 20 }}>Design not found.</div>
      </div>
    );
  }

  return (
    <div className="page anim-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ paddingLeft: 0 }}>
          <ArrowLeft size={16} /> Back to Designs
        </button>
        <button
          className="btn btn-secondary text-danger"
          style={{ color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.2)', padding: '8px 16px' }}
          onClick={() => {
            onDelete(p._id || p.id);
          }}
        >
          <Trash2 size={14} /> Delete Design
        </button>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>{p.campaign || p.title || 'Untitled Design'}</h1>
          <span className={`badge ${p.status === 'Approved' ? 'badge-primary' :
              p.status === 'Rejected' ? 'badge-danger' :
                p.status === 'Pending' ? 'badge-warning' : 'badge-gray'
            }`}>
            {p.status === 'Draft' ? 'Draft (Private)' : p.status}
          </span>
        </div>
        <p className="page-subtitle mt-4">Brand: <strong>{p.brand?.name || p.brandName}</strong> · Saved on {new Date(p.createdAt).toLocaleString()}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Side: Image Preview */}
        <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '16px' }}>Design Output</div>
          <div style={{
            aspectRatio: '1', borderRadius: 'var(--r-lg)', background: 'var(--surface-3)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🖼️</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>No image generated yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Prompt details & Submit reviews */}
        <div className="flex-col gap-20">
          <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>Compiled Prompt</div>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <pre style={{
              fontFamily: 'Menlo,Consolas,monospace', fontSize: '12px', lineHeight: '1.7',
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              padding: '16px', maxHeight: '240px', overflow: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-2)',
            }}>
              {p.prompt}
            </pre>

            {p.feedback && (
              <div style={{
                marginTop: '16px', padding: '12px 16px', background: 'var(--danger-light)',
                border: '1px solid #fecaca', borderRadius: 'var(--r-md)', color: 'var(--danger)', fontSize: '13px'
              }}>
                <strong>Reviewer Feedback:</strong> {p.feedback}
              </div>
            )}
          </div>

          {/* Send for Review Box */}
          {!['Pending', 'Pending Review', 'Submitted For Review', 'Approved'].includes(p.status) && (
            <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Send Design to Reviewer</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px' }}>Submit this compiled design configuration to a reviewer for feedback and approval.</p>

              <form onSubmit={handleSend} className="flex-col gap-12">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Reviewer Email</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Type reviewer email..."
                    value={emailQuery}
                    onChange={e => setEmailQuery(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                {searching && <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>Searching reviewers...</div>}

                {!searching && reviewers.length > 0 && (
                  <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', overflow: 'hidden', maxH: '120px', overflowY: 'auto'
                  }}>
                    {reviewers.map(r => (
                      <div
                        key={r._id}
                        onClick={() => { setSelectedReviewer(r); setEmailQuery(r.email); setReviewers([]); }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', fontSize: '13px',
                          borderBottom: '1px solid var(--border)',
                          background: selectedReviewer?._id === r._id ? 'var(--primary-light)' : 'transparent',
                          color: selectedReviewer?._id === r._id ? 'var(--primary)' : 'var(--text-1)'
                        }}
                      >
                        <strong>{r.name}</strong> ({r.email})
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px', padding: '10px', fontWeight: 600 }}
                  disabled={submitting || !selectedReviewer}
                >
                  {submitting ? 'Submitting request...' : 'Send to Reviewer'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditorWorkspace() {
  const { brandId, campaignId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setView] = useState(
    location.pathname === '/editor/saved-designs' ? 'history' :
      location.pathname === '/editor/upload-design' ? 'upload' : 'dashboard'
  );
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [activeDesignId, setActiveDesignId] = useState(null); // for DesignDetails
  const [createMode, setCreateMode] = useState(null); // null | 'option1' | 'option2' | 'selector'
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingDraftRecovery, setPendingDraftRecovery] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getBrands();
      setBrands(data);
      if (data.length > 0) {
        setSelectedBrandId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const data = await designService.getDesigns();
      setSavedPrompts(data);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await brandService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchPrompts();
    fetchStats();
  }, []);

  const handleSaveBrand = async (brand) => {
    try {
      let saved;
      if (brand.id && !brand.id.startsWith('brand-')) {
        // Update
        saved = await brandService.updateBrand(brand.id, brand);
        setBrands(prev => prev.map(b => b._id === brand.id ? saved : b));
      } else {
        // Create new
        const { id, ...rest } = brand;
        saved = await brandService.createBrand(rest);
        setBrands(prev => [...prev, saved]);
        setSelectedBrandId(saved._id);
        navigate(`/editor/brands/${saved._id}`);
      }
      setCreateMode(null);
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to save brand');
    }
  };

  const handleUpdateBrand = async (updated) => {
    try {
      const saved = await brandService.updateBrand(updated._id, updated);
      setBrands(prev => prev.map(b => b._id === updated._id ? saved : b));
      fetchStats();
    } catch (err) {
      alert(err.message || 'Failed to update brand');
    }
  };

  // Routing inside workspace
  const render = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-2)' }}>
          <div style={{ fontWeight: 600 }}>Loading workspace...</div>
        </div>
      );
    }

    if (createMode === 'selector') return <CreateBrand onSelect={setCreateMode} onBack={() => setCreateMode(null)} />;
    if (createMode === 'existing') return <Option1Form onSave={handleSaveBrand} onBack={() => setCreateMode('selector')} />;
    if (createMode === 'scratch') return <Option2Wizard onSave={handleSaveBrand} onBack={() => setCreateMode('selector')} />;

    // Dynamic Route hierarchy
    if (campaignId) {
      return <CampaignWorkspacePage />;
    }

    if (brandId) {
      const activeBrand = brands.find(b => b._id === brandId || b.id === brandId);
      if (activeBrand) {
        return (
          <BrandDetails
            brand={activeBrand}
            onBack={() => navigate('/editor/dashboard')}
            onUpdateBrand={handleUpdateBrand}
            onDeleteBrand={async (id) => {
              if (confirm('Delete this brand? This will permanently delete all associated campaigns, prompts, and assets.')) {
                try {
                  await brandService.deleteBrand(id + '?cascade=true');
                  setBrands(prev => prev.filter(b => b._id !== id && b.id !== id));
                  navigate('/editor/dashboard');
                  fetchStats();
                } catch (err) {
                  alert(err.message || 'Failed to delete brand');
                }
              }
            }}
            onOpenCampaign={(campId) => {
              navigate(`/editor/brands/${brandId}/campaigns/${campId}`);
            }}
          />
        );
      }
    }

    if (view === 'design-details') {
      const selectedDesign = savedPrompts.find(p => p._id === activeDesignId);
      return (
        <div className="anim-fade-up" style={{ padding: '0px' }}>
          <div style={{ padding: '24px 48px', maxWidth: 1700, margin: '0 auto' }}>
            <button className="btn btn-ghost" onClick={() => setView('history')} style={{ paddingLeft: 0, marginBottom: 0 }}>
              <ArrowLeft size={16} /> Back to Saved Designs
            </button>
          </div>
          <PromptBuilder
            brands={brands}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            resumeDraft={selectedDesign}
            onSavePrompt={async (p) => {
              await fetchPrompts();
              fetchStats();
            }}
          />
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            brands={brands}
            onCreateBrand={() => setCreateMode('selector')}
            onOpenBrand={(id) => {
              navigate(`/editor/brands/${id}`);
            }}
            stats={stats}
          />
        );
      case 'platforms':
        return (
          <Platforms
            selectedPlatform={selectedPlatform}
            onSelect={setSelectedPlatform}
            onContinue={() => setView('builder')}
          />
        );
      case 'builder':
        return (
          <PromptBuilder
            brands={brands}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            savedPlatform={selectedPlatform}
            onSavePrompt={async p => {
              try {
                const saved = await promptService.createPrompt({
                  prompt: p.prompt,
                  campaignId: p.campaignId,
                });
                await designService.createDesign({
                  campaignId: p.campaignId,
                  imageUrl: p.imageUrl || '',
                  prompt: p.prompt,
                  platform: p.platform || 'General',
                  isDraft: false,
                  status: 'Completed'
                });
                // Redirect directly to the campaign page where the design was saved!
                navigate(`/editor/brands/${p.brandId || selectedBrandId}/campaigns/${p.campaignId}`);
                fetchStats();
              } catch (err) {
                alert(err.message || 'Failed to save prompt');
              }
            }}
          />
        );
      case 'history':
        return (
          <DesignLibraryPage
            onResumeDraft={(draft) => {
              navigate(`/editor/brands/${draft.brandId?._id || draft.brandId}/campaigns/${draft.campaignId?._id || draft.campaignId}`, {
                state: { resumeDraft: draft }
              });
            }}
          />
        );
      case 'upload':
        return <UploadDesignPage addNotification={addNotification} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar
        view={createMode ? 'dashboard' : view}
        setView={(v) => { setCreateMode(null); setView(v); }}
        brands={brands}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
      />
      <main className="main">
        {render()}
      </main>
    </div>
  );
}

function DefaultRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'Reviewer' ? (
    <Navigate to="/reviewer/dashboard" replace />
  ) : (
    <Navigate to="/editor/dashboard" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/editor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <EditorWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor/brands/:brandId"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <EditorWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor/brands/:brandId/campaigns/:campaignId"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <EditorWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor/saved-designs"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <EditorWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor/upload-design"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <EditorWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviewer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Reviewer']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviewer/design/:designId"
            element={
              <ProtectedRoute allowedRoles={['Reviewer']}>
                <ReviewerDesignReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editor/designs/:designId"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <DesignPreviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prompt/view"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <PromptViewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prompt/edit"
            element={
              <ProtectedRoute allowedRoles={['Editor']}>
                <PromptEditPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
