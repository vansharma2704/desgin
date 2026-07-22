import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, RefreshCw, Check, Sparkles, User, Image as ImageIcon, Send, Save, ArrowLeft, CheckCircle, Search } from 'lucide-react';
import brandService from '../services/brandService';
import campaignService from '../services/campaignService';
import designService from '../services/designService';
import authService from '../services/authService';
import PlatformPickerModal from '../components/PlatformPickerModal';
import { PLATFORMS } from '../utils/mockAi';

export default function UploadDesignPage({ addNotification }) {
  const navigate = useNavigate();

  // File Upload States
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Form Fields
  const [designName, setDesignName] = useState('');
  const [description, setDescription] = useState('');

  // Brand & Campaign
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  // Platform Picker Modal
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [isPlatformPickerOpen, setIsPlatformPickerOpen] = useState(false);

  // Reviewer Search States (Same Concept as Step 6 Review & Generate)
  const [emailQuery, setEmailQuery] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [searchingReviewers, setSearchingReviewers] = useState(false);

  // Submission & Success Modal States
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedDesign, setLastSubmittedDesign] = useState(null);
  const fileInputRef = useRef(null);

  // Load Initial Brands
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const brandList = await brandService.getBrands();
        setBrands(brandList || []);
        if (brandList?.length > 0) {
          setSelectedBrandId(brandList[0]._id || brandList[0].id);
        }
      } catch (err) {
        console.error('Error initializing Upload Design data:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Debounced Reviewer Search (Only shows accounts when user types)
  useEffect(() => {
    if (!emailQuery.trim()) {
      setReviewers([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchingReviewers(true);
      try {
        const list = await authService.searchReviewers(emailQuery);
        setReviewers(list || []);
      } catch (err) {
        console.error('Reviewer search error:', err);
      } finally {
        setSearchingReviewers(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [emailQuery]);

  // Load Campaigns when Selected Brand Changes
  useEffect(() => {
    if (!selectedBrandId) {
      setCampaigns([]);
      setSelectedCampaignId('');
      return;
    }
    const fetchCampaigns = async () => {
      try {
        const list = await campaignService.getCampaigns(selectedBrandId);
        setCampaigns(list || []);
        if (list?.length > 0) {
          setSelectedCampaignId(list[0]._id);
        } else {
          setSelectedCampaignId('');
        }
      } catch (err) {
        console.error('Failed to load campaigns:', err);
      }
    };
    fetchCampaigns();
  }, [selectedBrandId]);

  // File Handling
  const processFile = (uploadedFile) => {
    if (!uploadedFile) return;

    // Validate size (50MB max)
    if (uploadedFile.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 50 MB limit.');
      return;
    }

    // Validate extension
    const ext = uploadedFile.name.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'pdf'].includes(ext)) {
      setErrorMsg('Unsupported format. Please upload PNG, JPG, JPEG, or PDF.');
      return;
    }

    setErrorMsg('');
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setFileType(ext);

    // Format file size
    const mb = (uploadedFile.size / (1024 * 1024)).toFixed(2);
    setFileSizeStr(`${mb} MB`);

    // Generate preview URL / Base64 Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileName('');
    setFileType('');
    setFileSizeStr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    handleRemoveFile();
    setDesignName('');
    setDescription('');
    setSelectedReviewer(null);
    setEmailQuery('');
    setShowSuccessModal(false);
    setLastSubmittedDesign(null);
  };

  // Submit Handler (Send to Reviewer or Save Draft)
  const handleSubmit = async (isDraftMode = false) => {
    if (!filePreview) {
      setErrorMsg('Please upload a design file first.');
      return;
    }
    if (!designName.trim()) {
      setErrorMsg('Please enter a design name.');
      return;
    }
    if (!selectedBrandId) {
      setErrorMsg('Please select a brand.');
      return;
    }
    if (!isDraftMode && !selectedReviewer) {
      setErrorMsg('Please search and select a reviewer account to submit.');
      return;
    }

    setErrorMsg('');
    if (isDraftMode) setSavingDraft(true);
    else setSubmittingReview(true);

    try {
      const payload = {
        brandId: selectedBrandId,
        campaignId: selectedCampaignId || undefined,
        name: designName.trim(),
        platform: platform?.name || 'Instagram',
        canvasSize: `${platform?.width || 1080}x${platform?.height || 1080}`,
        description: description.trim(),
        submissionType: 'Uploaded Design',
        fileName,
        fileType,
        imageUrl: filePreview,
        generatedImage: filePreview,
        isDraft: isDraftMode,
        isSaved: true,
        status: isDraftMode ? 'Draft' : 'Submitted For Review',
        reviewer: selectedReviewer?._id || null,
        assignedReviewerId: selectedReviewer?._id || null,
        submittedAt: isDraftMode ? null : new Date()
      };

      const createdDesign = await designService.createDesign(payload);

      if (!isDraftMode) {
        if (addNotification && selectedReviewer) {
          addNotification(
            'reviewer',
            `New uploaded design "${designName.trim()}" submitted for review.`,
            `/reviewer/design/${createdDesign._id}`
          );
        }
        setLastSubmittedDesign({
          ...createdDesign,
          reviewerName: selectedReviewer?.name,
          reviewerEmail: selectedReviewer?.email
        });
        setShowSuccessModal(true);
      } else {
        navigate('/editor/saved-designs');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save uploaded design.');
    } finally {
      setSavingDraft(false);
      setSubmittingReview(false);
    }
  };

  return (
    <div className="page anim-fade-up" style={{ width: '100%', maxWidth: '960px', margin: '0 auto', padding: '20px 24px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <UploadCloud size={20} />
          </div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>Upload Design</h1>
        </div>
        <p className="page-subtitle" style={{ marginTop: '6px', marginBottom: 0, fontSize: '13.5px', color: 'var(--text-3)' }}>
          Upload an existing design created in Photoshop, Canva, Figma, Illustrator, or any other design tool and send it for review.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)',
          border: '1.5px solid rgba(239, 68, 68, 0.25)', color: '#DC2626',
          fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Upload Section Card ── */}
        <div className="card" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontSize: '15px', fontWeight: 750, color: 'var(--text-1)', marginBottom: '16px' }}>
            Design File Upload
          </div>

          {!filePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-2)'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                background: isDragging ? 'rgba(108, 76, 241, 0.04)' : 'var(--surface-2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'rgba(108, 76, 241, 0.08)', color: '#6C4CF1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(108, 76, 241, 0.1)'
              }}>
                <UploadCloud size={28} />
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                  Drag & Drop your design here
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
                  or <span style={{ color: '#6C4CF1', fontWeight: 700, textDecoration: 'underline' }}>Browse Files</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>
                <span>Supported formats: <strong>PNG, JPG, JPEG, PDF</strong></span>
                <span>•</span>
                <span>Max size: <strong>50 MB</strong></span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                border: '1.5px solid var(--border)', borderRadius: '16px',
                padding: '16px', background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}>
                {fileType === 'pdf' ? (
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <FileText size={32} />
                  </div>
                ) : (
                  <img
                    src={filePreview}
                    alt="Uploaded Design Preview"
                    style={{
                      width: '80px', height: '80px', borderRadius: '12px',
                      objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0
                    }}
                  />
                )}

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 750, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fileName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px', display: 'flex', gap: '10px' }}>
                    <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{fileType}</span>
                    <span>•</span>
                    <span>{fileSizeStr}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '7px 12px', fontSize: '12.5px', fontWeight: 650 }}
                  >
                    Replace Design
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-danger"
                    onClick={handleRemoveFile}
                    style={{ padding: '7px 10px', color: '#DC2626' }}
                    title="Remove Design"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        {/* ── Design Information Section Card ── */}
        <div className="card" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontSize: '15px', fontWeight: 750, color: 'var(--text-1)', marginBottom: '16px' }}>
            Design Information
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Design Name */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 650 }}>
                Design Name <span style={{ color: '#6C4CF1' }}>*</span>
              </label>
              <input
                type="text"
                className="input"
                style={{ fontSize: '13.5px' }}
                value={designName}
                onChange={e => setDesignName(e.target.value)}
                placeholder="e.g. Summer Promo Poster - Photoshop Draft"
              />
            </div>

            {/* Brand & Campaign Row */}
            <div className="grid-2 gap-14">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 650 }}>
                  Brand <span style={{ color: '#6C4CF1' }}>*</span>
                </label>
                <select
                  className="select"
                  value={selectedBrandId}
                  onChange={e => setSelectedBrandId(e.target.value)}
                >
                  {brands.map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.name} — {b.industry}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 650 }}>Campaign</label>
                <select
                  className="select"
                  value={selectedCampaignId}
                  onChange={e => setSelectedCampaignId(e.target.value)}
                >
                  {campaigns.length > 0 ? (
                    campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                  ) : (
                    <option value="">No campaigns available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Platform Selection Modal Trigger */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 650 }}>Platform</label>
              <div
                onClick={() => setIsPlatformPickerOpen(true)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface-2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(108, 76, 241, 0.08)', color: '#6C4CF1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '13px', flexShrink: 0
                  }}>
                    {platform?.shape === 'Square' ? '1:1' : platform?.shape === 'Portrait' ? '9:16' : '16:9'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 750, color: 'var(--text-1)' }}>
                      {platform?.name || 'Instagram Post'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                      {platform?.width || 1080} × {platform?.height || 1080} {platform?.unit || 'px'} • {platform?.category || 'Social Media'}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm">Choose Platform</button>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 650 }}>Description (Optional)</label>
              <textarea
                className="input"
                rows={3}
                style={{ fontSize: '13px', padding: '10px 12px', resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add optional notes, specifications, or details for the reviewer..."
              />
            </div>

          </div>
        </div>

        {/* ── Reviewer Search & Assignment Card (Same Concept as Step 6 Review & Generate) ── */}
        <div className="card" style={{ padding: '24px', borderRadius: '20px', border: '1.5px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontWeight: 750, fontSize: '15px', color: 'var(--text-1)', marginBottom: '4px' }}>Reviewer Assignment</div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-3)', margin: '0 0 16px 0' }}>
            Search and select a reviewer account to submit this design for review.
          </p>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" style={{ fontWeight: 650 }}>
              Search & Select Reviewer <span style={{ color: '#6C4CF1' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="input"
                placeholder="Type reviewer email or name..."
                value={emailQuery}
                onChange={e => setEmailQuery(e.target.value)}
                style={{ fontSize: '13.5px', padding: '12px 14px 12px 36px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {searchingReviewers && (
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 6 }}>Searching reviewer accounts...</div>
            )}

            {!searchingReviewers && reviewers.length > 0 && (
              <div style={{
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: '12px', overflow: 'hidden', maxHeight: '160px', overflowY: 'auto', marginTop: 8,
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
              }}>
                {reviewers.map(r => (
                  <div
                    key={r._id}
                    onClick={() => {
                      setSelectedReviewer(r);
                      setEmailQuery(r.email);
                    }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: '13px',
                      borderBottom: '1px solid var(--border)',
                      background: selectedReviewer?._id === r._id ? 'rgba(108, 76, 241, 0.08)' : 'transparent',
                      color: selectedReviewer?._id === r._id ? '#6C4CF1' : 'var(--text-1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong>{r.name}</strong> <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>({r.email})</span>
                    </div>
                    {selectedReviewer?._id === r._id && <Check size={14} style={{ color: '#6C4CF1' }} />}
                  </div>
                ))}
              </div>
            )}

            {selectedReviewer && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '14px', background: 'rgba(108, 76, 241, 0.08)',
                border: '1.5px solid rgba(108, 76, 241, 0.25)', color: '#6C4CF1',
                fontSize: '13px', fontWeight: 650, marginTop: '12px'
              }}>
                <CheckCircle size={18} />
                <span>Selected Reviewer: <strong>{selectedReviewer.name}</strong> ({selectedReviewer.email})</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Actions Bar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '12px', borderTop: '1px solid var(--border)', marginTop: '8px'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/editor/dashboard')}
            style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 650 }}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={savingDraft || submittingReview}
              onClick={() => handleSubmit(true)}
              style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} /> {savingDraft ? 'Saving Draft...' : 'Save Draft'}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={savingDraft || submittingReview || !selectedReviewer}
              onClick={() => handleSubmit(false)}
              style={{
                padding: '10px 22px', borderRadius: '12px', fontWeight: 700,
                background: !selectedReviewer ? 'var(--surface-3)' : '#6C4CF1',
                color: !selectedReviewer ? 'var(--text-3)' : '#FFFFFF',
                border: 'none',
                cursor: !selectedReviewer ? 'not-allowed' : 'pointer',
                boxShadow: !selectedReviewer ? 'none' : '0 4px 14px rgba(108, 76, 241, 0.25)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Send size={16} /> {submittingReview ? 'Submitting...' : 'Send to Reviewer'}
            </button>
          </div>
        </div>

      </div>

      {/* Platform Picker Modal */}
      {isPlatformPickerOpen && (
        <PlatformPickerModal
          platform={platform}
          setPlatform={setPlatform}
          isOpen={isPlatformPickerOpen}
          onClose={() => setIsPlatformPickerOpen(false)}
        />
      )}

      {/* ── Submission Success Confirmation Modal Popup ── */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="anim-scale-in" style={{
            width: '100%', maxWidth: '440px', background: 'var(--surface)',
            borderRadius: '24px', padding: '32px 24px', border: '1.5px solid var(--border)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', gap: '16px'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
              color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle size={36} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-1)' }}>
                Sent for Review Successfully!
              </h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '13.5px', color: 'var(--text-3)', lineHeight: '1.5' }}>
                Your uploaded design <strong>"{lastSubmittedDesign?.name || 'Design'}"</strong> has been assigned to{' '}
                <strong>{lastSubmittedDesign?.reviewerName || 'the reviewer'}</strong> ({lastSubmittedDesign?.reviewerEmail}) and sent for approval.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={resetForm}
                style={{ flex: 1, padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 700 }}
              >
                Upload Another
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/editor/saved-designs')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 700,
                  background: '#6C4CF1', color: '#FFFFFF', border: 'none',
                  boxShadow: '0 4px 14px rgba(108, 76, 241, 0.25)'
                }}
              >
                View Saved Designs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
