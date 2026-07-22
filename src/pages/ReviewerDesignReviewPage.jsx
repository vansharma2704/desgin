import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import designService from '../services/designService';
import brandService from '../services/brandService';
import campaignService from '../services/campaignService';
import userService from '../services/authService'; // to get reviewer details if needed
import {
  ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Download,
  CheckCircle, XCircle, RefreshCcw, Info, MessageSquare, Clock
} from 'lucide-react';
import { addNotification } from '../utils/notifications';
import NotificationBell from '../components/NotificationBell';

export default function ReviewerDesignReviewPage() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load data states
  const [design, setDesign] = useState(null);
  const [brand, setBrand] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // UI Interactive States
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active review choice: 'Approve' | 'Reject' | 'RequestChanges'
  const [reviewAction, setReviewAction] = useState('Approve');

  const loadDesignDetails = async () => {
    try {
      setLoading(true);
      setError('');
      let currentDesign = null;
      try {
        currentDesign = await designService.getDesignById(designId);
      } catch (e) {
        const designs = await designService.getDesigns();
        currentDesign = designs.find(d => d._id === designId);
      }
      
      if (!currentDesign) {
        throw new Error('Design submission not found.');
      }

      setDesign(currentDesign);

      // Load associated Brand & Campaign
      const [brands, campaigns] = await Promise.all([
        brandService.getBrands().catch(() => []),
        campaignService.getCampaigns().catch(() => [])
      ]);

      const brandIdStr = currentDesign.brandId?._id || currentDesign.brandId;
      const campaignIdStr = currentDesign.campaignId?._id || currentDesign.campaignId;
      
      const assocBrand = brands.find(b => (b._id === brandIdStr || b.id === brandIdStr)) || currentDesign.brandId;
      const assocCampaign = campaigns.find(c => (c._id === campaignIdStr || c.id === campaignIdStr)) || currentDesign.campaignId;

      setBrand(assocBrand && assocBrand.name ? assocBrand : { name: currentDesign.brandName || 'Unknown Brand' });
      setCampaign(assocCampaign && assocCampaign.name ? assocCampaign : { name: currentDesign.campaignName || 'Unknown Campaign' });
      
      // If already reviewed, prefill feedback
      if (currentDesign.feedback) {
        setFeedback(currentDesign.feedback);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load design specification details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignDetails();
  }, [designId]);

  // Auto-assign ONLY if the design currently has no reviewer assigned
  useEffect(() => {
    if (!design || !user) return;
    const isPending = ['Pending', 'Pending Review'].includes(design.status);
    const existingReviewerId = design.reviewer?._id || design.reviewer;
    
    // Only assign if design is pending AND completely unassigned
    if (isPending && !existingReviewerId) {
      designService.updateDesign(designId, { reviewer: user._id || user.id })
        .then(updated => setDesign(updated))
        .catch(err => console.error('Auto-assign reviewer failed:', err));
    }
  }, [design?.status, user?._id, designId]);


  // Handle Zoom Controls
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomFit = () => setZoomScale(1);

  // Toggle Fullscreen on design preview
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Helper: check if design is pending review
  const isPendingReview = (status) => {
    return ['Pending', 'Pending Review', 'Submitted For Review'].includes(status);
  };

  // Check if page should render as read-only
  const isReadOnly = design ? !isPendingReview(design.status) : true;

  // Review submission handlers
  const handleReviewSubmit = async (actionType) => {
    setValidationError('');
    
    // Validations
    if (actionType === 'Reject' && !feedback.trim()) {
      setValidationError('Please provide a reason for rejection.');
      return;
    }
    if (actionType === 'RequestChanges' && !feedback.trim()) {
      setValidationError('Please describe the requested changes.');
      return;
    }

    setSubmitting(true);
    try {
      let resolvedStatus = 'Approved';
      if (actionType === 'Reject') resolvedStatus = 'Rejected';
      if (actionType === 'RequestChanges') resolvedStatus = 'Changes Requested';

      const updatePayload = {
        status: resolvedStatus,
        feedback: feedback.trim(),
        reviewer: user?._id || null
      };

      await designService.updateDesign(designId, updatePayload);

      // Trigger notification for the Editor
      addNotification(
        'editor',
        `Design "${design?.name || 'Untitled'}" has been ${resolvedStatus === 'Approved' ? 'Approved' : resolvedStatus === 'Rejected' ? 'Rejected' : 'sent back with Changes Requested'}.`,
        `/editor/designs/${designId}`
      );

      // Trigger success toast
      setSuccessToast(`Design review submitted: ${resolvedStatus}`);
      setTimeout(() => {
        setSuccessToast('');
        navigate('/reviewer/dashboard');
      }, 2000);

    } catch (err) {
      console.error(err);
      setValidationError(err.message || 'Failed to update review status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!design?.imageUrl) return;
    try {
      const response = await fetch(design.imageUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${design.name || 'design'}.png`;
      link.click();
    } catch (err) {
      alert('Failed to download image preview: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div style={{ height: '32px', background: '#E2E8F0', borderRadius: '8px', width: '200px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '30px', flex: 1 }}>
            <div style={{ background: '#E2E8F0', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ height: '240px', background: '#E2E8F0', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              <div style={{ height: '280px', background: '#E2E8F0', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px', maxWidth: '480px', borderRadius: '24px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ color: '#EF4444', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>⚠️ Error Loading Submission</div>
          <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/reviewer/dashboard')}>Back to Dashboard</button>
            <button className="btn btn-primary" onClick={loadDesignDetails}>Retry Loading</button>
          </div>
        </div>
      </div>
    );
  }

  // Get dynamic placeholder and label for comment field
  const getCommentPlaceholder = () => {
    if (reviewAction === 'Approve') return 'Optional feedback for the editor...';
    if (reviewAction === 'Reject') return 'Explain why the design is rejected... (Required)';
    return 'Describe the required changes... (Required)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC', position: 'relative' }}>
      
      {/* SUCCESS TOAST */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10B981',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '30px',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeUp 0.3s ease-in-out'
        }}>
          <CheckCircle size={16} /> {successToast}
        </div>
      )}

      {/* TOP HEADER */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 40px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={() => navigate('/reviewer/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748B'
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationBell role="reviewer" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 850, color: '#1E293B', margin: 0 }}>Review Console</h2>
            <span style={{
              background: isReadOnly ? 'rgba(100, 116, 139, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              color: isReadOnly ? '#64748B' : '#F59E0B',
              padding: '3px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {isReadOnly ? 'Read Only' : 'Active Session'}
            </span>
          </div>
        </div>
      </header>

      {/* SCREEN GRID WORKSPACE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isFullscreen ? '1fr' : '7.2fr 2.8fr',
        gap: '30px',
        padding: '30px 40px',
        flex: 1,
        boxSizing: 'border-box',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: Large Image Preview */}
        <div className="card" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Creative Canvas Output</h3>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
              Resolution: {design?.canvasSize || '1080x1080'}
            </span>
          </div>

          {/* Canvas Box */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '560px',
            background: '#F1F5F9',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              transform: `scale(${zoomScale})`,
              transition: 'transform 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {design?.imageUrl ? (
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                  <span style={{ fontSize: '64px', display: 'block', marginBottom: '12px' }}>🎨</span>
                  <span>No image generated</span>
                </div>
              )}
            </div>

            {/* Float Canvas Zoom Overlay Controls */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              <button onClick={handleZoomOut} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }} title="Zoom Out"><ZoomOut size={16} /></button>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoomScale * 100)}%</span>
              <button onClick={handleZoomIn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }} title="Zoom In"><ZoomIn size={16} /></button>
              <span style={{ width: '1px', height: '14px', background: '#E2E8F0' }} />
              <button onClick={handleZoomFit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#6C4CF1' }}>Fit</button>
              <span style={{ width: '1px', height: '14px', background: '#E2E8F0' }} />
              <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }} title="Toggle Info Panel">
                <Maximize2 size={15} />
              </button>
              <button onClick={handleDownload} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }} title="Download Output">
                <Download size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Info & Actions Panel */}
        {!isFullscreen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* CARD 1: Design Information */}
            <div className="card" style={{
              padding: '24px',
              borderRadius: '24px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                <Info size={16} color="#6C4CF1" />
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Design Information</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Design Name</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{design?.name || 'Untitled Design'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Brand</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{brand?.name || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Campaign</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{campaign?.name || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Platform</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{design?.platform || 'Instagram'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Submitted On</span>
                  <span style={{ fontWeight: 600, color: '#1E293B' }}>{new Date(design?.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Status</span>
                  <span style={{
                    fontWeight: 700,
                    color: isPendingReview(design?.status) ? '#F59E0B' :
                           design?.status === 'Approved' ? '#10B981' : '#EF4444'
                  }}>{design?.status}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: Review Actions & Comments */}
            <div className="card" style={{
              padding: '24px',
              borderRadius: '24px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                <MessageSquare size={16} color="#6C4CF1" />
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  {isReadOnly ? 'Review Summary' : 'Submit Review'}
                </h3>
              </div>

              {/* READ-ONLY SUMMARY PANEL */}
              {isReadOnly ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    lineHeight: 1.5
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Review Remarks</span>
                      <span style={{ color: '#1E293B', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                        {design?.feedback || 'No review comment provided.'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>Reviewed By: <strong style={{ color: '#1E293B' }}>{user?.name || 'Reviewer'}</strong></div>
                    <div>Reviewed On: <strong style={{ color: '#1E293B' }}>{new Date(design?.updatedAt).toLocaleString()}</strong></div>
                  </div>
                </div>
              ) : (
                /* ACTIVE REVIEW SUBMISSION FORM */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Action Segment Selector */}
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setReviewAction('Approve')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: reviewAction === 'Approve' ? '#FFFFFF' : 'transparent',
                        color: reviewAction === 'Approve' ? '#10B981' : '#64748B',
                        boxShadow: reviewAction === 'Approve' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('RequestChanges')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: reviewAction === 'RequestChanges' ? '#FFFFFF' : 'transparent',
                        color: reviewAction === 'RequestChanges' ? '#8B5CF6' : '#64748B',
                        boxShadow: reviewAction === 'RequestChanges' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('Reject')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: reviewAction === 'Reject' ? '#FFFFFF' : 'transparent',
                        color: reviewAction === 'Reject' ? '#EF4444' : '#64748B',
                        boxShadow: reviewAction === 'Reject' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      Reject
                    </button>
                  </div>

                  {/* Feedback Comments Textarea */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                      {reviewAction === 'Approve' ? 'Comments (Optional)' : 'Review Reason (Required)'}
                    </label>
                    <textarea
                      placeholder={getCommentPlaceholder()}
                      value={feedback}
                      onChange={e => {
                        setFeedback(e.target.value.slice(0, 1000));
                        setValidationError('');
                      }}
                      style={{
                        width: '100%',
                        height: '110px',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
                      <span style={{ color: '#EF4444' }}>{validationError}</span>
                      <span>{feedback.length}/1000 characters</span>
                    </div>
                  </div>

                  {/* Action Trigger Buttons */}
                  <div style={{ marginTop: '12px' }}>
                    {reviewAction === 'Approve' && (
                      <button
                        onClick={() => handleReviewSubmit('Approve')}
                        disabled={submitting}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          background: '#10B981',
                          color: '#FFFFFF',
                          fontWeight: 750,
                          fontSize: '13.5px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                        }}
                      >
                        {submitting ? 'Approving...' : '✓ Approve Design'}
                      </button>
                    )}

                    {reviewAction === 'RequestChanges' && (
                      <button
                        onClick={() => handleReviewSubmit('RequestChanges')}
                        disabled={submitting}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          background: '#6C4CF1',
                          color: '#FFFFFF',
                          fontWeight: 750,
                          fontSize: '13.5px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(108, 76, 241, 0.15)'
                        }}
                      >
                        {submitting ? 'Submitting...' : '✉ Request Changes'}
                      </button>
                    )}

                    {reviewAction === 'Reject' && (
                      <button
                        onClick={() => handleReviewSubmit('Reject')}
                        disabled={submitting}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'transparent',
                          color: '#EF4444',
                          border: '1.5px solid #EF4444',
                          fontWeight: 750,
                          fontSize: '13.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {submitting ? 'Rejecting...' : '✕ Reject Design'}
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
