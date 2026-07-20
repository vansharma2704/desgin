import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Copy, Trash2, Check, Sparkles, Download, RefreshCw, Search, Layers, Image, Eye
} from 'lucide-react';
import campaignService from '../services/campaignService';
import designService from '../services/designService';
import promptService from '../services/promptService';
import brandService from '../services/brandService';
import authService from '../services/authService';
import PromptBuilder from '../components/PromptBuilder';
import { addNotification } from '../utils/notifications';

export default function CampaignWorkspacePage() {
  const { brandId, campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [brands, setBrands] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state managers: 'list' | 'builder' | 'design-details' | 'prompt-details'
  const [workspaceView, setWorkspaceView] = useState('list');
  const [activeDesignId, setActiveDesignId] = useState(null);
  const [activePromptId, setActivePromptId] = useState(null);

  // Search & Filter state for lists
  const [promptSearch, setPromptSearch] = useState('');

  // Sharing states
  const [emailQuery, setEmailQuery] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [searchingReviewers, setSearchingReviewers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedPromptText, setCopiedPromptText] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState(brandId);

  const location = useLocation();

  useEffect(() => {
    setActiveBrandId(brandId);
  }, [brandId]);

  useEffect(() => {
    if (location.state?.resumeDraft) {
      setWorkspaceView('builder');
    }
  }, [location.state]);

  // Fetch campaign info and related designs/prompts
  const loadWorkspaceData = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const [campData, brandList, designsList, promptsList] = await Promise.all([
        campaignService.getCampaigns(brandId).then(list => list.find(c => c._id === campaignId)),
        brandService.getBrands(),
        designService.getDesigns(campaignId),
        promptService.getPrompts(campaignId)
      ]);
      setCampaign(campData);
      setBrands(brandList);
      setDesigns(designsList);
      setPrompts(promptsList);
    } catch (err) {
      console.error('Failed to load campaign workspace:', err);
    } finally {
      setLoading(false);
    }
  }, [brandId, campaignId]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Reviewer dropdown lookup
  useEffect(() => {
    if (!emailQuery.trim()) {
      setReviewers([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchingReviewers(true);
      try {
        const list = await authService.searchReviewers(emailQuery);
        setReviewers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingReviewers(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [emailQuery]);

  const handleAutoSaveGenerated = async (compiledPrompt, imageUrl) => {
    try {
      const savedPrompt = await promptService.createPrompt({
        campaignId,
        prompt: compiledPrompt,
        variables: { platform: campaign?.platform || 'General' }
      });

      await designService.createDesign({
        campaignId,
        imageUrl: imageUrl || '',
        prompt: compiledPrompt,
        platform: 'Instagram',
        model: 'DALL-E 3',
        isDraft: false,
        status: 'Completed'
      });

      // Reload
      const [updatedDesigns, updatedPrompts] = await Promise.all([
        designService.getDesigns(campaignId),
        promptService.getPrompts(campaignId)
      ]);
      setDesigns(updatedDesigns);
      setPrompts(updatedPrompts);
      setWorkspaceView('list');
    } catch (err) {
      console.error('Failed to auto-save generated prompt/design:', err);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptText(true);
    setTimeout(() => setCopiedPromptText(false), 2000);
  };

  const handleDeleteDesign = async (id) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    try {
      await designService.deleteDesign(id);
      setDesigns(prev => prev.filter(d => d._id !== id));
      setWorkspaceView('list');
    } catch (err) {
      alert(err.message || 'Failed to delete design');
    }
  };

  const handleSendForReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewer || !activeDesignId) return;
    setSubmittingReview(true);
    try {
      const updated = await designService.updateDesign(activeDesignId, {
        status: 'Pending Review',
        reviewer: selectedReviewer._id
      });
      addNotification(
        'reviewer',
        `New design "${updated.name || 'Untitled Design'}" submitted for review.`,
        `/reviewer/design/${activeDesignId}`
      );
      setDesigns(prev => prev.map(d => d._id === activeDesignId ? updated : d));
      setSelectedReviewer(null);
      setEmailQuery('');
      alert('Design sent for review successfully!');
    } catch (err) {
      alert(err.message || 'Failed to send for review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDownloadImage = async (url, name) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name || 'design'}.png`;
      link.click();
    } catch (err) {
      alert('Failed to download image: ' + err.message);
    }
  };

  const selectedDesign = designs.find(d => d._id === activeDesignId);
  const selectedPrompt = prompts.find(p => p._id === activePromptId);
  const matchingDesign = selectedPrompt ? designs.find(d => d.prompt === selectedPrompt.prompt) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-2)' }}>Loading Campaign Workspace...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="page" style={{ padding: 40 }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/editor/brands/${brandId}`)}><ArrowLeft size={16} /> Back</button>
        <div style={{ marginTop: 20 }}>Campaign not found.</div>
      </div>
    );
  }

  if (workspaceView === 'builder') {
    return (
      <div className="anim-fade-up" style={{ padding: '0px' }}>
        <div style={{ padding: '24px 48px', maxWidth: 1700, margin: '0 auto' }}>
          <button className="btn btn-ghost" onClick={() => { setWorkspaceView('list'); navigate(location.pathname, { replace: true, state: {} }); }} style={{ paddingLeft: 0, marginBottom: 0 }}>
            <ArrowLeft size={16} /> Back to Campaign
          </button>
        </div>
        <PromptBuilder
          brands={brands}
          selectedBrandId={activeBrandId}
          setSelectedBrandId={setActiveBrandId}
          campaignId={campaignId}
          resumeDraft={location.state?.resumeDraft}
          savedPlatform={{ name: 'Instagram', width: 1080, height: 1080, unit: 'px' }}
          onSavePrompt={async (p) => {
            await handleAutoSaveGenerated(p.prompt, p.imageUrl);
          }}
        />
      </div>
    );
  }

  return (
    <div className="page anim-fade-up">
      {/* Dynamic Navigation and Views */}
      {workspaceView === 'list' && (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <button className="btn btn-ghost" onClick={() => navigate(`/editor/brands/${brandId}`)} style={{ paddingLeft: 0, marginBottom: 8 }}>
                <ArrowLeft size={16} /> Back to Campaigns
              </button>
              <h1 className="page-title" style={{ margin: 0 }}>📁 {campaign.name}</h1>
              {campaign.description && (
                <p className="page-subtitle mt-4">{campaign.description}</p>
              )}
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setWorkspaceView('builder')}>
              <Sparkles size={16} /> + Generate AI Design
            </button>
          </div>

          {/* Generated Designs Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 14 }}>
              Generated Designs ({designs.length})
            </div>

            {designs.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>No Designs Generated Yet</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>Use the AI generator tool to start rendering assets.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {designs.map(d => (
                  <div
                    key={d._id}
                    className="card card-hover anim-scale-in"
                    onClick={() => {
                      setActiveDesignId(d._id);
                      setWorkspaceView('design-details');
                    }}
                    style={{ cursor: 'pointer', padding: 14, display: 'flex', gap: 12, alignItems: 'center', border: '1.5px solid var(--border)' }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--r-md)',
                      background: 'var(--surface-3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                    }}>
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>🎨</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-1)' }}>
                        {d.prompt}
                      </h4>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <span className="badge badge-gray" style={{ fontSize: 9, padding: '1px 5px' }}>
                          {d.platform || 'General'}
                        </span>
                        <span className={`badge ${
                          d.status === 'Approved' ? 'badge-primary' :
                          d.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: 9, padding: '1px 5px' }}>
                          {d.status === 'Draft' ? 'Draft' : d.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          
        </div>
      )}

      {/* AI Prompt Builder Workspace View is now rendered as a top-level wrapper above the main return */}

      {/* Detailed Card View Page */}
      {workspaceView === 'design-details' && selectedDesign && (
        <div className="anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <button className="btn btn-ghost" onClick={() => setWorkspaceView('list')} style={{ paddingLeft: 0 }}>
              <ArrowLeft size={16} /> Back to Campaign
            </button>
            <button
              className="btn btn-secondary text-danger"
              style={{ color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.2)', padding: '8px 16px' }}
              onClick={() => handleDeleteDesign(selectedDesign._id)}
            >
              <Trash2 size={14} /> Delete Design
            </button>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>Design Specifications</h1>
              <span className={`badge ${
                selectedDesign.status === 'Approved' ? 'badge-primary' : 
                selectedDesign.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
              }`}>
                {selectedDesign.status === 'Draft' ? 'Draft (Private)' : selectedDesign.status}
              </span>
            </div>
            <p className="page-subtitle mt-4">Saved on {new Date(selectedDesign.createdAt).toLocaleString()}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
            {/* Image Preview */}
            <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '16px' }}>Design Output</div>
              <div style={{
                aspectRatio: '1', borderRadius: 'var(--r-lg)', background: 'var(--surface-3)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {selectedDesign.imageUrl ? (
                  <img src={selectedDesign.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🖼️</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>No image generated</span>
                  </div>
                )}
              </div>
              {selectedDesign.imageUrl && (
                <button className="btn btn-secondary mt-16" style={{ width: '100%' }} onClick={() => handleDownloadImage(selectedDesign.imageUrl, campaign.name)}>
                  <Download size={14} /> Download Design Image
                </button>
              )}
            </div>

            {/* Prompt details */}
            <div className="flex-col gap-20">
              <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>Compiled Prompt</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyText(selectedDesign.prompt)}>
                    {copiedPromptText ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <pre style={{
                  fontFamily: 'Menlo,Consolas,monospace', fontSize: '12px', lineHeight: '1.7',
                  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                  padding: '16px', maxHeight: '240px', overflow: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-2)',
                }}>
                  {selectedDesign.prompt}
                </pre>
              </div>

              {/* Share review panel */}
              {selectedDesign.status === 'Draft' && (
                <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '8px' }}>Send Design to Reviewer</div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '16px' }}>Submit this generated creative to a reviewer for feedback and approval.</p>

                  <form onSubmit={handleSendForReview} className="flex-col gap-12">
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

                    {searchingReviewers && <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>Searching reviewers...</div>}

                    {!searchingReviewers && reviewers.length > 0 && (
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
                      disabled={submittingReview || !selectedReviewer}
                    >
                      {submittingReview ? 'Submitting request...' : 'Send to Reviewer'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Prompt specification page */}
      {workspaceView === 'prompt-details' && selectedPrompt && (
        <div className="anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <button className="btn btn-ghost" onClick={() => setWorkspaceView('list')} style={{ paddingLeft: 0 }}>
              <ArrowLeft size={16} /> Back to Campaign
            </button>
            <button
              className="btn btn-secondary text-danger"
              style={{ color: 'var(--danger)', borderColor: 'rgba(220,38,38,0.2)', padding: '8px 16px' }}
              onClick={async () => {
                if (confirm('Delete this prompt?')) {
                  try {
                    await promptService.deletePrompt(selectedPrompt._id);
                    setPrompts(prev => prev.filter(x => x._id !== selectedPrompt._id));
                    setWorkspaceView('list');
                  } catch (err) {
                    alert(err.message || 'Failed to delete prompt');
                  }
                }
              }}
            >
              <Trash2 size={14} /> Delete Prompt
            </button>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Prompt Specifications</h1>
            <p className="page-subtitle mt-4">Saved on {new Date(selectedPrompt.createdAt).toLocaleString()}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
            {/* Design Preview */}
            <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '16px' }}>Associated Generated Design</div>
              <div style={{
                aspectRatio: '1', borderRadius: 'var(--r-lg)', background: 'var(--surface-3)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {matchingDesign?.imageUrl ? (
                  <img src={matchingDesign.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🖼️</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>No matching design image found</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt details */}
            <div className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>Compiled Prompt</div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleCopyText(selectedPrompt.prompt)}>
                  {copiedPromptText ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <pre style={{
                fontFamily: 'Menlo,Consolas,monospace', fontSize: '12px', lineHeight: '1.7',
                background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                padding: '16px', maxHeight: '240px', overflow: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-2)',
              }}>
                {selectedPrompt.prompt}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
