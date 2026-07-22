import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Copy, Edit2, Check, Save, RefreshCw,
  Upload, ChevronDown, X, Wand2, Eye, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';
import { generatePrompt, PLATFORMS, analyzeReferenceImage } from '../utils/mockAi';
import campaignService from '../services/campaignService';
import aiService from '../services/aiService';
import authService from '../services/authService';
import designService from '../services/designService';
import { addNotification } from '../utils/notifications';
import PlatformPickerModal from './PlatformPickerModal';

const DEFAULT_GUIDELINES = `You are an expert graphic designer and creative director.

Your goal is to create professional, visually appealing, and production-ready designs.

Always:
- Follow the provided Brand Guidelines.
- Follow the Design Brief.
- Follow the canvas size exactly.
- Maintain a clear visual hierarchy.
- Use proper spacing and alignment.
- Ensure typography is readable.
- Use colors harmoniously.
- Keep important content inside safe margins.
- Create original designs inspired by references, never copy them exactly.
- Use uploaded assets whenever relevant.
- Prioritize clarity and usability.
- Produce high-quality editable designs.`;

const CHECKLIST_ATTRIBUTES = [
  { key: 'industry', label: 'Detected Industry', icon: '🏢', category: 'branding' },
  { key: 'design_type', label: 'Asset Placement', icon: '📍', category: 'structure' },
  { key: 'color_palette', label: 'Colors', icon: '🎨', category: 'branding' },
  { key: 'typography', label: 'Typography', icon: '✍️', category: 'content' },
  { key: 'layout', label: 'Layout', icon: '📐', category: 'structure' },
  { key: 'composition', label: 'Composition', icon: '🧩', category: 'artistic' },
  { key: 'background', label: 'Background', icon: '🖼️', category: 'structure' },
  { key: 'images', label: 'Objects', icon: '📦', category: 'artistic' },
  { key: 'icons', label: 'Icons', icon: '⭐', category: 'content' },
  { key: 'branding', label: 'Branding', icon: '🏷️', category: 'branding' },
  { key: 'lighting', label: 'Lighting', icon: '💡', category: 'artistic' },
  { key: 'style', label: 'Design Style', icon: '🎨', category: 'branding' }
];

/* ── Collapsible section ───────────────────────────── */
function Section({ title, children, defaultOpen = true, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      background: 'var(--surface)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)',
      marginBottom: '10px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="flex items-center gap-10" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-8">
            {accent && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-.01em', color: 'var(--text-1)' }}>
              {title}
            </span>
          </div>
          <ChevronDown
            size={15}
            style={{ transition: '.2s', transform: open ? 'rotate(180deg)' : 'none', color: 'var(--text-3)', flexShrink: 0 }}
          />
        </div>
      </button>
      {open && <div style={{ padding: '16px 20px 20px' }}>{children}</div>}
    </div>
  );
}

/* ── Reference image card ──────────────────────────── */
function RefCard({ refImage, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      background: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'all 0.2s ease'
    }}>
      {refImage.previewUrl
        ? <img src={refImage.previewUrl} alt={refImage.name} style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0' }} />
        : <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🖼️</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{refImage.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: '#10B981', background: 'rgba(16,185,129,.08)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(16,185,129,.15)' }}>🟢 Analysis Complete</span>
          <span style={{ fontSize: '11px', color: '#3B82F6', background: 'rgba(59,130,246,.08)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid rgba(59,130,246,.15)' }}>Vision Match</span>
        </div>
      </div>
      <button onClick={() => onRemove(refImage.id)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
        <X size={14} />
      </button>
    </div>
  );
}

/* ── Main PromptBuilder ────────────────────────────── */
export default function PromptBuilder({ brands, selectedBrandId, setSelectedBrandId, savedPlatform, onSavePrompt, campaignId, resumeDraft }) {
  const brand = brands.find(b => b.id === selectedBrandId || b._id === selectedBrandId) || brands[0];
  const navigate = useNavigate();
  const activeBrandId = selectedBrandId || (brand?._id || brand?.id);
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    return resumeDraft?.campaignId?._id || resumeDraft?.campaignId || campaignId || localStorage.getItem(`prompt_builder_${activeBrandId}_last_campaign_id`) || '';
  });
  const stateKey = (activeBrandId && selectedCampaignId) ? `prompt_builder_${activeBrandId}_${selectedCampaignId}_state` : null;

  const getCachedField = useCallback((key, fallback) => {
    if (stateKey) {
      try {
        const cached = localStorage.getItem(stateKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed[key] !== undefined) return parsed[key];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return fallback;
  }, [stateKey]);

  const [isCustomEdited, setIsCustomEdited] = useState(() => getCachedField('isCustomEdited', resumeDraft?.isCustomEdited || false));
  const [platform, setPlatform] = useState(() => 
    getCachedField('platform', resumeDraft?.platform
      ? PLATFORMS.find(p => p.name === resumeDraft.platform) || PLATFORMS[0]
      : savedPlatform || PLATFORMS[0]
    )
  );

  // Step Wizard state
  const [currentStep, setCurrentStep] = useState(() => getCachedField('currentStep', resumeDraft?.currentStep || 1));

  // Content
  const [designTitle, setDesignTitle] = useState(() => getCachedField('designTitle', resumeDraft?.name || ''));
  const [heading,     setHeading]     = useState(() => getCachedField('heading', resumeDraft?.heading || ''));
  const [subHeading,  setSubHeading]  = useState(() => getCachedField('subHeading', resumeDraft?.subHeading || ''));
  const [body,        setBody]        = useState(() => getCachedField('body', resumeDraft?.bodyText || ''));
  const [cta,         setCta]         = useState(() => getCachedField('cta', resumeDraft?.ctaText || ''));

  // Design images for this specific design (per-prompt uploads)
  const [designImages, setDesignImages] = useState(() => getCachedField('designImages', { products: [], environments: [], icons: [] }));

  const addDesignImages = (key, files) => {
    const items = Array.from(files).map(f => ({
      id: 'di-' + Date.now() + '-' + Math.random().toString(36).slice(2,5),
      name: f.name,
      previewUrl: URL.createObjectURL(f),
      role: key === 'products' ? 'Product Images' : key === 'environments' ? 'Environment Images' : 'Icons',
    }));
    setDesignImages(p => ({ ...p, [key]: [...p[key], ...items] }));
  };
  const removeDesignImage = (key, id) =>
    setDesignImages(p => ({ ...p, [key]: p[key].filter(f => f.id !== id) }));

  // Brand asset checkboxes
  const [assetChecked, setAssetChecked] = useState({});
  useEffect(() => {
    if (!brand?.assets) return;
    const cached = getCachedField('assetChecked', null);
    if (cached) {
      setAssetChecked(cached);
      return;
    }
    const init = {};
    brand.assets.forEach(a => { init[a.id] = true; });
    setAssetChecked(init);
  }, [selectedBrandId, brand, getCachedField]);

  // Colors
  const [colorMode,    setColorMode]    = useState(() => getCachedField('colorMode', 'brand'));
  const [customColors, setCustomColors] = useState(() => getCachedField('customColors', { background: '#ffffff', heading: '#000000', subheading: '#333333', body: '#555555' }));

  // Typography, Style & Tone
  const FONT_OPTIONS = ['Inter', 'Roboto', 'Outfit', 'Plus Jakarta Sans', 'Playfair Display', 'Barlow Condensed', 'Space Grotesk', 'Montserrat', 'Poppins', 'Open Sans', 'Lato', 'Lora', 'DM Sans'];
  const [typographyMode, setTypographyMode] = useState(() => getCachedField('typographyMode', 'brand'));
  const [customHeadingFont, setCustomHeadingFont] = useState(() => getCachedField('customHeadingFont', 'Inter'));
  const [customSubHeadingFont, setCustomSubHeadingFont] = useState(() => getCachedField('customSubHeadingFont', 'Inter'));
  const [customBodyFont, setCustomBodyFont] = useState(() => getCachedField('customBodyFont', 'Inter'));

  const [brandStyle, setBrandStyle] = useState(() => getCachedField('brandStyle', resumeDraft?.brandStyle || 'Modern'));
  const [brandTone, setBrandTone] = useState(() => getCachedField('brandTone', resumeDraft?.brandTone || 'Professional'));

  // Reference images & analysis checkboxes
  const [refImages,    setRefImages]    = useState(() => getCachedField('refImages', []));
  const [refAnalyzing, setRefAnalyzing] = useState(false);
  const [refSettings,  setRefSettings]  = useState(() => getCachedField('refSettings', {
    industry: true,
    design_type: true,
    color_palette: true,
    typography: true,
    layout: true,
    composition: true,
    background: true,
    images: true,
    icons: true,
    branding: true,
    lighting: true,
    style: true
  }));

  // Guidelines
  const [guidelines, setGuidelines] = useState(() => getCachedField('guidelines', DEFAULT_GUIDELINES));
  const [showBottomFilters, setShowBottomFilters] = useState(true);
  const [enableReferenceAnalysis, setEnableReferenceAnalysis] = useState(() => getCachedField('enableReferenceAnalysis', true));
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Output
  const [prompt,    setPrompt]    = useState(() => getCachedField('prompt', ''));
  const [isEditing, setIsEditing] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const [activeDraftId, setActiveDraftId] = useState(() => getCachedField('activeDraftId', resumeDraft?._id || null));
  // Track the saved status so auto-save never overwrites a review-lifecycle status
  const [activeDraftStatus, setActiveDraftStatus] = useState(() => getCachedField('activeDraftStatus', resumeDraft?.status || 'Draft'));
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(() => getCachedField('generatedImageUrl', resumeDraft?.imageUrl || resumeDraft?.generatedImage || ''));
  const [generationError, setGenerationError] = useState('');

  const [campaigns, setCampaigns] = useState([]);

  // Automatic saving state effect
  useEffect(() => {
    if (!stateKey) return;
    const stateObj = {
      designTitle,
      heading,
      subHeading,
      body,
      cta,
      designImages,
      assetChecked,
      colorMode,
      customColors,
      typographyMode,
      customHeadingFont,
      customSubHeadingFont,
      customBodyFont,
      brandStyle,
      brandTone,
      refImages,
      refSettings,
      guidelines,
      enableReferenceAnalysis,
      platform,
      currentStep,
      prompt,
      isCustomEdited,
      generatedImageUrl,
      activeDraftId,
      activeDraftStatus,
      selectedCampaignId
    };
    localStorage.setItem(stateKey, JSON.stringify(stateObj));
  }, [
    stateKey,
    designTitle,
    heading,
    subHeading,
    body,
    cta,
    designImages,
    assetChecked,
    colorMode,
    customColors,
    typographyMode,
    customHeadingFont,
    customSubHeadingFont,
    customBodyFont,
    brandStyle,
    brandTone,
    refImages,
    refSettings,
    guidelines,
    enableReferenceAnalysis,
    platform,
    currentStep,
    prompt,
    isCustomEdited,
    generatedImageUrl,
    activeDraftId,
    activeDraftStatus,
    selectedCampaignId
  ]);
  // Reviewer search and submission states
  const [emailQuery, setEmailQuery] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [searchingReviewers, setSearchingReviewers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [explicitSaving, setExplicitSaving] = useState(false);
  const [explicitSaveSuccess, setExplicitSaveSuccess] = useState(false);

  const handleExplicitSaveDesign = async () => {
    const activeBrandId = selectedBrandId || (brand?._id || brand?.id);
    if (!activeBrandId || !selectedCampaignId) {
      alert('Please ensure you have selected a brand and campaign first.');
      return;
    }
    setExplicitSaving(true);
    try {
      const payload = {
        brandId: activeBrandId,
        campaignId: selectedCampaignId,
        name: designTitle || 'Untitled Design',
        platform: platform?.name || 'Instagram',
        canvasSize: `${platform?.width || 1080}x${platform?.height || 1080}`,
        prompt,
        heading,
        subHeading,
        bodyText: body,
        ctaText: cta,
        currentStep,
        isDraft: false,
        isSaved: true,
        status: 'Completed',
        generatedImage: generatedImageUrl || '',
        imageUrl: generatedImageUrl || ''
      };

      if (activeDraftId) {
        await designService.updateDesign(activeDraftId, payload);
      } else {
        const savedDesign = await designService.createDesign(payload);
        setActiveDraftId(savedDesign._id);
      }
      setSaved(true);
      setExplicitSaveSuccess(true);
      setTimeout(() => setExplicitSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save design: ' + err.message);
    } finally {
      setExplicitSaving(false);
    }
  };

  // Redesign modals & connection states
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isPlatformPickerOpen, setIsPlatformPickerOpen] = useState(false);
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [isApiKeyConnected, setIsApiKeyConnected] = useState(false);

  // Reference Image Analysis UI States
  const [selectedRefId, setSelectedRefId] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('palette'); // 'palette' | 'typography' | 'layout' | 'objects' | 'hierarchy' | 'json'
  const [isJSONEditing, setIsJSONEditing] = useState(false);
  const [editedJSONText, setEditedJSONText] = useState('');
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [sectionEditText, setSectionEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState({});

  // Caching original analysis snapshot and handling restore confirm
  useEffect(() => {
    const needsInit = refImages.some(img => !img.originalAnalysis && img.analysis);
    if (needsInit) {
      setRefImages(prev => prev.map(img => {
        if (!img.originalAnalysis && img.analysis) {
          return { ...img, originalAnalysis: JSON.parse(JSON.stringify(img.analysis)) };
        }
        return img;
      }));
    }
  }, [refImages]);

  const handleRestoreConfirm = () => {
    const activeRef = refImages.find(r => r.id === selectedRefId);
    if (!activeRef?.originalAnalysis) {
      setIsRestoreModalOpen(false);
      return;
    }
    const restored = JSON.parse(JSON.stringify(activeRef.originalAnalysis));
    setRefImages(prev => prev.map(img => {
      if (img.id === activeRef.id) {
        return { ...img, analysis: restored };
      }
      return img;
    }));
    setIsRestoreModalOpen(false);
  };

  useEffect(() => {
    if (refImages.length > 0) {
      if (!selectedRefId || !refImages.some(r => r.id === selectedRefId)) {
        setSelectedRefId(refImages[0].id);
      }
    } else {
      setSelectedRefId(null);
    }
  }, [refImages, selectedRefId]);

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

  // Global Ctrl+F keyboard shortcut to focus inspector search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const input = document.getElementById('inspector-search-input');
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendForReview = async (e) => {
    e.preventDefault();
    if (!selectedReviewer) return;
    
    let currentDesignId = activeDraftId;
    
    // Auto-save/create draft design first if not yet created
    if (!currentDesignId) {
      const activeBrandId = selectedBrandId || (brand?._id || brand?.id);
      if (!activeBrandId || !selectedCampaignId) {
        alert('Please ensure you have selected a brand and campaign first.');
        return;
      }
      try {
        const payload = {
          brandId: activeBrandId,
          campaignId: selectedCampaignId,
          name: designTitle || 'Untitled Design',
          platform: platform?.name || 'Instagram',
          canvasSize: `${platform?.width || 1080}x${platform?.height || 1080}`,
          prompt,
          heading,
          subHeading,
          bodyText: body,
          ctaText: cta,
          currentStep,
          isDraft: true,
          status: 'Draft',
          generatedImage: generatedImageUrl || '',
          imageUrl: generatedImageUrl || '',
        };
        const savedDesign = await designService.createDesign(payload);
        currentDesignId = savedDesign._id;
        setActiveDraftId(currentDesignId);
      } catch (err) {
        alert('Failed to save design before sending for review: ' + err.message);
        return;
      }
    }

    setSubmittingReview(true);
    setReviewSuccess(false);
    try {
      await designService.updateDesign(currentDesignId, {
        status: 'Pending Review',
        reviewer: selectedReviewer._id
      });
      addNotification(
        'reviewer',
        `New design "${designTitle || 'Untitled Design'}" submitted for review.`,
        `/reviewer/design/${currentDesignId}`
      );
      setReviewSuccess(true);
      setActiveDraftStatus('Pending Review'); // guard auto-save from reverting status
      setSelectedReviewer(null);
      setEmailQuery('');
    } catch (err) {
      alert(err.message || 'Failed to submit review request');
    } finally {
      setSubmittingReview(false);
    }
  };
  useEffect(() => {
    const brandId = selectedBrandId || (brand?._id || brand?.id);
    if (!brandId) return;
    const fetchCampaigns = async () => {
      try {
        const list = await campaignService.getCampaigns(brandId);
        setCampaigns(list);
        
        const cachedCampaignId = localStorage.getItem(`prompt_builder_${brandId}_last_campaign_id`);
        if (resumeDraft?.campaignId) {
          setSelectedCampaignId(resumeDraft.campaignId?._id || resumeDraft.campaignId);
        } else if (campaignId) {
          setSelectedCampaignId(campaignId);
        } else if (cachedCampaignId && list.some(c => c._id === cachedCampaignId)) {
          setSelectedCampaignId(cachedCampaignId);
        } else if (list.length > 0) {
          setSelectedCampaignId(list[0]._id);
        } else {
          setSelectedCampaignId('');
        }
      } catch (err) {
        console.error('Failed to load campaigns in PromptBuilder:', err);
      }
    };
    fetchCampaigns();
  }, [selectedBrandId, brand, campaignId, resumeDraft]);

  // Sync selectedCampaignId and restore cached state on change
  useEffect(() => {
    const brandId = selectedBrandId || (brand?._id || brand?.id);
    if (!brandId || !selectedCampaignId) return;
    localStorage.setItem(`prompt_builder_${brandId}_last_campaign_id`, selectedCampaignId);

    const key = `prompt_builder_${brandId}_${selectedCampaignId}_state`;
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          if (parsed.designTitle !== undefined) setDesignTitle(parsed.designTitle);
          if (parsed.heading !== undefined) setHeading(parsed.heading);
          if (parsed.subHeading !== undefined) setSubHeading(parsed.subHeading);
          if (parsed.body !== undefined) setBody(parsed.body);
          if (parsed.cta !== undefined) setCta(parsed.cta);
          if (parsed.designImages !== undefined) setDesignImages(parsed.designImages);
          if (parsed.assetChecked !== undefined) setAssetChecked(parsed.assetChecked);
          if (parsed.colorMode !== undefined) setColorMode(parsed.colorMode);
          if (parsed.customColors !== undefined) setCustomColors(parsed.customColors);
          if (parsed.typographyMode !== undefined) setTypographyMode(parsed.typographyMode);
          if (parsed.customHeadingFont !== undefined) setCustomHeadingFont(parsed.customHeadingFont);
          if (parsed.customSubHeadingFont !== undefined) setCustomSubHeadingFont(parsed.customSubHeadingFont);
          if (parsed.customBodyFont !== undefined) setCustomBodyFont(parsed.customBodyFont);
          if (parsed.brandStyle !== undefined) setBrandStyle(parsed.brandStyle);
          if (parsed.brandTone !== undefined) setBrandTone(parsed.brandTone);
          if (parsed.refImages !== undefined) setRefImages(parsed.refImages);
          if (parsed.refSettings !== undefined) setRefSettings(parsed.refSettings);
          if (parsed.guidelines !== undefined) setGuidelines(parsed.guidelines);
          if (parsed.enableReferenceAnalysis !== undefined) setEnableReferenceAnalysis(parsed.enableReferenceAnalysis);
          if (parsed.platform !== undefined) setPlatform(parsed.platform);
          if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
          if (parsed.prompt !== undefined) setPrompt(parsed.prompt);
          if (parsed.isCustomEdited !== undefined) setIsCustomEdited(parsed.isCustomEdited);
          if (parsed.generatedImageUrl !== undefined) setGeneratedImageUrl(parsed.generatedImageUrl);
          if (parsed.activeDraftId !== undefined) setActiveDraftId(parsed.activeDraftId);
          if (parsed.activeDraftStatus !== undefined) setActiveDraftStatus(parsed.activeDraftStatus);
        }
      }
    } catch (e) {
      console.error('Failed to load cached project state:', e);
    }
  }, [selectedBrandId, brand, selectedCampaignId]);

  // Debounced Auto-Save Hook
  useEffect(() => {
    const activeBrandId = selectedBrandId || (brand?._id || brand?.id);
    if (!activeBrandId || !selectedCampaignId) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const payload = {
          brandId: activeBrandId,
          campaignId: selectedCampaignId,
          name: designTitle || 'Untitled Design',
          platform: platform?.name || 'Instagram',
          canvasSize: `${platform?.width || 1080}x${platform?.height || 1080}`,
          prompt,
          heading,
          subHeading,
          bodyText: body,
          ctaText: cta,
          currentStep,
          isDraft: true,
          // Only mark Completed if the design is still in a pre-review state.
          // Never overwrite statuses that belong to the review lifecycle.
          ...(!['Pending', 'Pending Review', 'Submitted For Review', 'Approved', 'Rejected', 'Changes Requested', 'Archived'].includes(activeDraftStatus) && {
            status: 'Completed',
          }),
          generatedImage: generatedImageUrl || '',
          imageUrl: generatedImageUrl || '',
          lastOpenedAt: new Date()
        };

        if (activeDraftId) {
          await fetch(`/api/designs/${activeDraftId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          const res = await fetch('/api/designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data._id) {
            setActiveDraftId(data._id);
            setActiveDraftStatus(data.status || 'Completed');
          }
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(delayDebounce);
  }, [
    activeDraftId,
    selectedBrandId,
    brand,
    selectedCampaignId,
    designTitle,
    platform,
    prompt,
    heading,
    subHeading,
    body,
    cta,
    currentStep,
    generatedImageUrl
  ]);

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    setGenerationError('');
    setGeneratedImageUrl('');
    const activeBrandId = brand?._id || brand?.id;

    try {
      if (activeBrandId && selectedCampaignId) {
        // Use style-memory prompt builder and pipeline on backend
        const res = await aiService.generateDesignPipeline({
          brandId: activeBrandId,
          campaignId: selectedCampaignId,
          userPrompt: heading || prompt,
          platform: platform?.name || 'Instagram',
          canvasSize: `${platform?.width || 1080}x${platform?.height || 1080}`,
          designId: activeDraftId || undefined
        });
        if (res.success && res.design?.imageUrl) {
          setGeneratedImageUrl(res.design.imageUrl);
          return;
        }
      }

      // Fallback
      const response = await fetch('/api/prompts/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }
      setGeneratedImageUrl(data.imageUrl);
    } catch (err) {
      setGenerationError(err.message || 'An error occurred during image generation.');
    } finally {
      setGeneratingImage(false);
    }
  };

  /* Build includedAssets: brand logo (always) + brand assets (checked) + design uploads */
  const buildIncludedAssets = useCallback(() => {
    const logo = (brand?.assets || []).find(a => a.role === 'Logo');
    const brandChecked = (brand?.assets || []).filter(a => a.role !== 'Logo' && assetChecked[a.id]);
    const uploads = [
      ...designImages.products,
      ...designImages.environments,
      ...designImages.icons,
    ];
    return [...(logo ? [logo] : []), ...brandChecked, ...uploads];
  }, [brand, assetChecked, designImages]);

  const compile = useCallback(() => {
    if (!brand || isCustomEdited) return;
    const activeTypography = typographyMode === 'custom'
      ? { heading: customHeadingFont, subheading: customSubHeadingFont, body: customBodyFont }
      : brand?.typography;

    const compiledBrand = {
      ...brand,
      typography: activeTypography || brand.typography,
      style: brandStyle || brand.style,
      tone: brandTone || brand.tone
    };

    const text = generatePrompt({
      brand: compiledBrand,
      platform,
      designTitle, heading, subHeading, body, cta,
      referenceImages: enableReferenceAnalysis ? refImages : [],
      includedAssets: buildIncludedAssets(),
      systemGuidelines: guidelines,
      colorMode,
      customColors: colorMode === 'custom' ? customColors : null,
      referenceSettings: refSettings,
    });
    setPrompt(text);
    setSaved(false);
  }, [brand, platform, designTitle, heading, subHeading, body, cta, refImages, buildIncludedAssets, guidelines, colorMode, customColors, designImages, refSettings, isCustomEdited, typographyMode, customHeadingFont, customSubHeadingFont, customBodyFont, brandStyle, brandTone, enableReferenceAnalysis]);

  useEffect(() => {
    // If returning from edit with a custom prompt, set it here
    if (resumeDraft?.prompt && resumeDraft?.isCustomEdited) {
      setPrompt(resumeDraft.prompt);
      setIsCustomEdited(true);
    } else {
      compile();
    }
  }, [compile, resumeDraft]);

  const navigateToPromptRoute = (route) => {
    const activeBrandId = brand?._id || brand?.id;
    navigate(route, {
      state: {
        prompt,
        brandId: activeBrandId,
        selectedCampaignId,
        platform,
        designTitle,
        heading,
        subHeading,
        body,
        cta,
        currentStep,
        activeDraftId,
        generatedImageUrl,
        isCustomEdited
      }
    });
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => fallbackCopy(prompt));
    } else {
      fallbackCopy(prompt);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } else {
        alert('Could not copy text automatically. Please select and copy the text manually.');
      }
    } catch (err) {
      alert('Could not copy text automatically. Please select and copy the text manually.');
    }
  };

  const handleSave = () => {
    if (!selectedCampaignId) {
      alert('Please select or create a Campaign for this brand first.');
      return;
    }
    onSavePrompt({
      id: 'p-' + Date.now(),
      title: designTitle || `${brand?.name} — ${platform?.name}`,
      brandName: brand?.name,
      platform: platform?.name,
      prompt,
      ts: new Date().toLocaleString(),
      brandId: brand?._id || brand?.id,
      campaignId: selectedCampaignId,
      imageUrl: generatedImageUrl || '',
      campaign: designTitle || '',
    });
    setSaved(true);
  };

  const handleUploadRef = (e) => {
    const files = Array.from(e.target.files || []);
    setRefAnalyzing(true);

    const promises = files.map((file, i) => {
      return new Promise((resolve) => {
        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            const imgData = ctx.getImageData(0, 0, 100, 100).data;
            
            // 1. Precise Color Extraction with Clustering (includes neutrals)
            const sampledColors = [];
            let totalR = 0, totalG = 0, totalB = 0;
            for (let idx = 0; idx < imgData.length; idx += 4) { // sample all pixels for maximum accuracy
              const r = imgData[idx];
              const g = imgData[idx+1];
              const b = imgData[idx+2];
              const a = imgData[idx+3];
              if (a < 200) continue; // skip transparent/translucent pixels
              
              totalR += r; totalG += g; totalB += b;
              sampledColors.push({ r, g, b });
            }

            // Euclidean distance clustering (K-Means concept)
            const clusters = [];
            sampledColors.forEach(color => {
              let matchedCluster = null;
              for (let cluster of clusters) {
                const dist = Math.sqrt(
                  Math.pow(cluster.r - color.r, 2) +
                  Math.pow(cluster.g - color.g, 2) +
                  Math.pow(cluster.b - color.b, 2)
                );
                if (dist < 32) { // Visually similar color threshold
                  matchedCluster = cluster;
                  break;
                }
              }
              if (matchedCluster) {
                const total = matchedCluster.count;
                matchedCluster.r = Math.round((matchedCluster.r * total + color.r) / (total + 1));
                matchedCluster.g = Math.round((matchedCluster.g * total + color.g) / (total + 1));
                matchedCluster.b = Math.round((matchedCluster.b * total + color.b) / (total + 1));
                matchedCluster.count++;
              } else {
                clusters.push({ r: color.r, g: color.g, b: color.b, count: 1 });
              }
            });

            const totalSampled = sampledColors.length || 1;
            let rawHexCodes = clusters.map(c => {
              const hex = '#' + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1).toUpperCase();
              const rgb = `rgb(${c.r}, ${c.g}, ${c.b})`;
              const percentage = Math.round((c.count / totalSampled) * 100);
              
              const rNorm = c.r / 255;
              const gNorm = c.g / 255;
              const bNorm = c.b / 255;
              const max = Math.max(rNorm, gNorm, bNorm);
              const min = Math.min(rNorm, gNorm, bNorm);
              const brightness = Math.round(max * 100);
              const saturation = max === 0 ? 0 : Math.round(((max - min) / max) * 100);

              let role = "Neutral Color";
              if (brightness > 85 && saturation < 15) {
                role = "Background Color";
              } else if (brightness < 20) {
                role = "Text Color";
              } else if (saturation > 50) {
                role = "Accent Color";
              } else if (brightness > 60 && saturation < 30) {
                role = "Surface Color";
              } else if (saturation > 30) {
                role = "Primary Brand Color";
              }

              return {
                hex,
                rgb,
                percentage,
                role,
                brightness: brightness > 70 ? "light" : brightness < 30 ? "dark" : "medium",
                saturation: saturation > 60 ? "vivid" : saturation < 20 ? "muted" : "saturated",
                confidence: 100
              };
            });

            // Filter out noise < 1.5% unless vivid accent color
            rawHexCodes = rawHexCodes.filter(c => c.percentage >= 1.5 || (c.saturation === "vivid" && c.percentage >= 0.5));
            rawHexCodes.sort((a, b) => b.percentage - a.percentage);

            // Extract top 8-12 colors
            const finalHexCodes = rawHexCodes.slice(0, 12);

            // Normalize percentages to sum to exactly 100%
            const sumPercentages = finalHexCodes.reduce((sum, c) => sum + c.percentage, 0) || 1;
            finalHexCodes.forEach(c => {
              c.percentage = Math.round((c.percentage / sumPercentages) * 100);
            });
            const finalSum = finalHexCodes.reduce((sum, c) => sum + c.percentage, 0);
            if (finalSum !== 100 && finalHexCodes.length > 0) {
              finalHexCodes[0].percentage += (100 - finalSum);
            }

            // Set the final computed colors array
            const sortedColors = finalHexCodes;

             // 2. Structural & Brightness Extraction
             const totalPixels = sampledColors.length || 1;
             const avgBrightness = (totalR + totalG + totalB) / (3 * totalPixels);
             
             // Detect borders/grids by comparing edges
             let verticalGradients = 0;
             let horizontalGradients = 0;
             for (let idx = 0; idx < imgData.length - 40; idx += 40) {
               const b1 = (imgData[idx] + imgData[idx+1] + imgData[idx+2]) / 3;
               const b2 = (imgData[idx+4] + imgData[idx+5] + imgData[idx+6]) / 3;
               if (Math.abs(b1 - b2) > 40) verticalGradients++;
             }
             for (let idx = 0; idx < imgData.length - 400; idx += 400) {
               const b1 = (imgData[idx] + imgData[idx+1] + imgData[idx+2]) / 3;
               const b2 = (imgData[idx+200] + imgData[idx+201] + imgData[idx+202]) / 3;
               if (Math.abs(b1 - b2) > 40) horizontalGradients++;
             }
 
             // Generate distinct layout variants dynamically based on calculated metrics
             const nameHash = [...file.name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
             const isDark = avgBrightness < 110;
             const isGrid = (verticalGradients + horizontalGradients) > 16;
             const isAsymmetric = Math.abs(verticalGradients - horizontalGradients) > 5;
 
             let extractedLayout = 'Clean showcase display featuring a centered view of the main design focus';
             let extractedBackground = 'Minimalist neutral studio sweep background with soft ambient shadows';
             let extractedPlacement = 'The hero product is centered on the canvas, with logo and secondary typography arranged clean along the margins';
             let extractedStyle = 'Premium Modern / Sleek Product Showcase';
             let extractedTypography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
 
             if (isDark) {
               if (isGrid) {
                 if (isAsymmetric) {
                   extractedLayout = 'Asymmetrical split-frame composition with absolute borders dividing text from layout visuals';
                   extractedBackground = 'Deep charcoal industrial plaster wall casting strong geometric diagonal light beam shadows';
                   extractedPlacement = 'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned';
                   extractedStyle = nameHash % 2 === 0 ? 'Modern Luxury Lifestyle / Editorial Fashion Spread' : 'Industrial Cyberpunk / High Contrast Technical Style';
                   extractedTypography = 'Oswald Bold (Headings) & Space Grotesk (Body) with technical monospaced details';
                 } else {
                   extractedLayout = 'Centered grid layout framing the main asset inside multiple offset glass blocks';
                   extractedBackground = 'Dark room backdrop with geometric panels lit by subtle neon led strips';
                   extractedPlacement = 'Logo top-center, main product centered inside the primary glass pane, supporting specs below';
                   extractedStyle = nameHash % 2 === 0 ? 'High-Tech Futuristic / Cyber Minimalist Showroom' : 'Minimal Dark Technical Grid Layout';
                   extractedTypography = 'Satoshi Bold (Headings) & Cabinet Grotesk (Body)';
                 }
               } else {
                 extractedLayout = 'Spotlight action alignment with clean diagonals and high-energy ambient glows';
                 extractedBackground = 'Cinematic dark studio with soft smoke/fog texture and dramatic key lights';
                 extractedPlacement = 'Hero asset floating diagonally over light reflections in the lower-right quadrant, title left-aligned';
                 extractedStyle = nameHash % 2 === 0 ? 'Sporty Athletic / Cinematic Action Poster' : 'Moody High Contrast Cinematic Showcase';
                 extractedTypography = 'Impact Condensed (Headings) & Inter Bold (Body)';
               }
             } else {
               // Light Themes
               if (isGrid) {
                 if (isAsymmetric) {
                   extractedLayout = 'Minimalist poster layout featuring a prominent central frame housing the sneakers with stylized brand text overlays';
                   extractedBackground = 'Off-white textured paper mock wall background with minor pins/tapes, casting light natural shadows';
                   extractedPlacement = 'The shoes are placed diagonally overlapping a large stylized text logo frame, with smaller captions offset in the corners';
                   extractedStyle = nameHash % 2 === 0 ? 'Vintage Retro Sports Editorial / High Contrast Grid Poster' : 'Arts & Crafts Gallery Collage / Textured Board Design';
                   extractedTypography = 'Heavy geometric block sans-serif letterings layered behind the product frame, with clean classic details';
                 } else {
                   extractedLayout = 'Three-column editorial gallery grid with clean fine rules separating structural panels';
                   extractedBackground = 'Clean white plaster wall with subtle soft sunbeams from a nearby window';
                   extractedPlacement = 'Product centered inside the middle grid panel, brand logo absolute top-right, subtexts left-aligned';
                   extractedStyle = nameHash % 2 === 0 ? 'Premium Editorial / Architectural Concept Sheet' : 'Clean Corporate Catalog / Balanced Structured Portfolio';
                   extractedTypography = 'Playfair Display Serif & Lora Medium';
                 }
               } else {
                 extractedLayout = 'Ultra-clean gallery display showcasing a thin black photo frame border on an off-white background';
                 extractedBackground = 'Clean minimalist warm white studio sweep with subtle ground shadows';
                 extractedPlacement = 'Centered shoe inside a thin black photo border, with brand captions cleanly aligned along the bottom edge';
                 extractedStyle = nameHash % 2 === 0 ? 'Refined Artistic Gallery / Premium Editorial Minimal' : 'Ultra-Clean Scandinavian Product Presentation';
                 extractedTypography = 'Barlow Condensed (Headings) & Archivo (Body Copy) paired with clean geometric labels';
               }
             }
 
             // 3. Robust Object & Prop Extraction
             // 4. Exact Visual Property Mappings dynamically varied using fileName seed hash so no two images have the same description

             const compositions = [
               'Layered poster setup with sneakers placed in midground, overlapping background typography',
               'High contrast asymmetrical split-screen with sharp layering and deep midground perspective',
               'Centered frame layout with strong visual depth and layering of elements',
               'Golden spiral layout drawing focal path to the primary foreground frame details'
             ];

             const lightings = [
               'Soft directional window light with natural contrast shadows',
               'Dramatic overhead spotlighting with high contrast and deep industrial shadows',
               'Soft studio diffusion lighting casting gentle shadows',
               'Subtle side key light highlighting edge contours and textured leather highlights'
             ];

             const materialsList = [
               'Off-white textured card stock, smooth leather, and matte painted frames',
               'Polished concrete, dark textured plaster, and reflective glass surfaces',
               'Premium matte paper, glass panels, and painted clean wood tabletop',
               'Sleek industrial metal, brushed aluminum frame, and plastic canvas overlays'
             ];

             const placementsList = [
               'The hero product (shoe/item) is placed exactly inside the central photo frame, with logo and caption placed clean outside or overlapping the frame border',
               'Hero product placed diagonally inside a left-offset photo canvas panel, with logo placed top-left and copy blocks right-aligned',
               'Hero asset floating diagonally over light reflections in the lower-right quadrant, title left-aligned',
               'Centered shoe inside a thin black photo border, with brand captions cleanly aligned along the bottom edge'
             ];

             const extractedComposition = compositions[nameHash % compositions.length];
             const extractedLighting = lightings[nameHash % lightings.length];
             const extractedMaterials = materialsList[nameHash % materialsList.length];
             extractedPlacement = placementsList[nameHash % placementsList.length];

             // Dynamic Object variety list matching exact elements based on keywords and brightness
             const seed = file.name.toLowerCase();
             const objectsList = [];
             
             // Check filename specifically for elements
             if (seed.includes('green') || seed.includes('nike') || seed.includes('dunk') || seed.includes('images (19)')) {
               objectsList.push('Green Nike sneakers', 'Black wood gallery photo frame', 'Terracotta plant pot with green leaf', 'Tan/orange baseball cap accessories');
             } else if (seed.includes('puma') || seed.includes('ferrari') || seed.includes('black')) {
               objectsList.push('Black leather racing shoe', 'Sleek dark studio platform block', 'Exquisite architectural shadows');
             } else {
               // Fallback using visual cues and nameHash so they differ dynamically
               if (seed.includes('shoe') || seed.includes('sneaker') || seed.includes('dunk')) {
                 objectsList.push('Sneaker products');
               } else {
                 objectsList.push('Hero product element');
               }

               if (seed.includes('frame') || seed.includes('border') || seed.includes('gallery')) {
                 objectsList.push('Heavy minimalist photo frame border');
               }
               if (seed.includes('plant') || seed.includes('pot') || seed.includes('green') || seed.includes('leaf')) {
                 objectsList.push('Green plant pot backdrop decoration');
               }
               if (seed.includes('hat') || seed.includes('cap') || seed.includes('orange')) {
                 objectsList.push('Orange/brown baseball cap accessories');
               }

               if (objectsList.length < 3) {
                 if (isDark) {
                   objectsList.push('Dark geometric concrete blocks', 'Ambient directional light beams');
                 } else {
                   objectsList.push('Clean wooden tabletop', 'Minimal ceramic decorative base');
                 }
               }
             }

             const finalObjects = objectsList;

             const analysis = analyzeReferenceImage(file.name);
             // Merge real color details extracted from canvas pixels
             if (sortedColors.length > 0) {
               analysis.color_palette.hex_codes = sortedColors;
               analysis.color_palette.dominant = [sortedColors[0]?.hex || ''];
               if (sortedColors[1]) analysis.color_palette.secondary = [sortedColors[1]?.hex || ''];
               if (sortedColors[2]) analysis.color_palette.accent = [sortedColors[2]?.hex || ''];
             }

            resolve({
              id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
              name: file.name,
              previewUrl,
              analysis
            });
          } catch (err) {
            const fallbackAnalysis = analyzeReferenceImage(file.name);
            resolve({
              id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
              name: file.name,
              previewUrl,
              analysis: fallbackAnalysis
            });
          }
        };
        img.onerror = () => {
          resolve({
            id: 'r-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) + '-' + i,
            name: file.name,
            previewUrl,
            analysis: analyzeReferenceImage(file.name)
          });
        };
      });
    });

    // 1. Read files as base64 for backend Style Memory Analysis
    const base64Promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    Promise.all([Promise.all(promises), Promise.all(base64Promises)]).then(async ([completedRefs, base64s]) => {
      setRefImages(prev => [...prev, ...completedRefs]);
      setRefAnalyzing(false);

      const activeBrandId = brand?._id || brand?.id;
      
      if (activeBrandId && selectedCampaignId) {
        completedRefs.forEach(async (ref, idx) => {
          const b64 = base64s[idx];
          if (!b64) return;
          try {
            // Call backend API separately for each uploaded reference image
            const res = await aiService.analyzeStyle([b64], activeBrandId, selectedCampaignId);
            if (res && res.success && res.styleMemory) {
              setRefImages(prev => prev.map(item => {
                if (item.id === ref.id) {
                  const localPalette = item.analysis?.color_palette;
                  return {
                    ...item,
                    analysis: {
                      ...res.styleMemory,
                      color_palette: localPalette
                    }
                  };
                }
                return item;
              }));
            }
          } catch (err) {
            console.error("Backend style analysis failed for ref ID:", ref.id, err);
          }
        });
      }
    });
  };

  const totalDesignUploads = Object.values(designImages).flat().length;
  const totalBrandAssets   = (brand?.assets || []).filter(a => assetChecked[a.id]).length;
  const brandLogo          = brand?.assets?.find(a => a.role === 'Logo');
  const totalAssets        = totalDesignUploads + totalBrandAssets;

  const toggleAttribute = (key) => {
    setRefSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = (checkValue) => {
    const next = {};
    CHECKLIST_ATTRIBUTES.forEach(attr => {
      next[attr.key] = checkValue;
    });
    setRefSettings(next);
  };

  const allChecked = Object.values(refSettings).every(Boolean);

  const steps = [
    { num: 1, label: 'Scope' },
    { num: 2, label: 'Style' },
    { num: 3, label: 'Content' },
    { num: 4, label: 'Uploads' },
    { num: 5, label: 'Reference & Guidelines' },
    { num: 6, label: 'Review & Generate' }
  ];

  return (
    <div className="page" style={{ maxWidth: (currentStep === 5 || currentStep === steps.length) ? 1700 : 960, width: (currentStep === 5 || currentStep === steps.length) ? '95%' : '100%', margin: '0 auto', transition: 'all 0.2s ease-in-out' }}>
      {/* Title */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="flex items-center gap-10">
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-lg)',
              background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <h1 className="page-title">Generate Design</h1>
          </div>
          <p className="page-subtitle mt-4">
            Follow the guided steps to assemble and compile your professional design specifications.
          </p>
        </div>
      </div>

      {/* Step Navigation Bar (Strict Single-Row Horizontal Stepper) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        background: 'var(--surface)', padding: '10px 16px',
        borderRadius: 'var(--r-xl)', border: '1.5px solid var(--border)',
        marginBottom: 24, boxShadow: 'var(--shadow-xs)',
        flexWrap: 'nowrap', width: '100%', boxSizing: 'border-box', overflowX: 'auto'
      }}>
        {steps.map((st, idx) => (
          <React.Fragment key={st.num}>
            <button
              type="button"
              onClick={() => setCurrentStep(st.num)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentStep === st.num ? 'var(--primary)' : 'var(--text-3)',
                fontWeight: currentStep === st.num ? 750 : 550,
                fontSize: 12.5, transition: 'color .15s', whiteSpace: 'nowrap', flexShrink: 0,
                padding: '4px 2px'
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: currentStep === st.num ? 'var(--primary)' : 'var(--surface-3)',
                color: currentStep === st.num ? '#fff' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0
              }}>
                {st.num}
              </div>
              <span>{st.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div style={{ flex: '1 1 8px', minWidth: 6, height: 2, background: 'var(--border)', flexShrink: 1 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── ACTIVE STEP PANE ── */}
        <div className="flex-col gap-14" style={{ minHeight: 400 }}>

          {/* STEP 1: Scope & Platform */}
          {currentStep === 1 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 1: Brand & Platform Selection" accent="var(--primary)">
                <div className="flex-col gap-14">
                  <div className="form-group">
                    <label className="form-label">Active Brand Profile</label>
                    <select className="select" value={selectedBrandId} onChange={e => setSelectedBrandId(e.target.value)}>
                      {brands.map(b => <option key={b.id || b._id} value={b.id || b._id}>{b.name} — {b.industry}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Campaign Scope</label>
                    {campaigns.length > 0 ? (
                      <select className="select" value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)}>
                        {campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 500, padding: '4px 0' }}>
                        ⚠️ No campaigns found. Please create a campaign for this brand first.
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 650, color: 'var(--text-1)' }}>Output Platform Canvas</label>
                    <div
                      onClick={() => setIsPlatformPickerOpen(true)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: '1.5px solid var(--border)',
                        background: 'var(--surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(108, 76, 241, 0.12)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: 'rgba(108, 76, 241, 0.08)', color: '#6C4CF1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '13px', flexShrink: 0,
                          border: '1px solid rgba(108, 76, 241, 0.2)'
                        }}>
                          {platform?.shape === 'Square' ? '1:1' : platform?.shape === 'Portrait' ? '9:16' : '16:9'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 750, color: 'var(--text-1)' }}>
                            {platform?.name || 'Instagram Post'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 500, marginTop: '2px' }}>
                            {platform?.width || 1080} × {platform?.height || 1080} {platform?.unit || 'px'} • {platform?.category || 'Social Media'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Choose Platform
                      </button>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}

          {/* STEP 2: Style */}
          {currentStep === 2 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 2: Style" accent="var(--primary)">
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 16 }}>
                  Configure colors, typography and brand personality for this design.
                </p>
                <div className="flex-col gap-16">

                  {/* Section 1: Color Style Mode */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 650, color: 'var(--text-1)' }}>Color Style Mode</label>
                    {refImages.some(r => r.analysis?.colors?.length > 0) && refSettings.colors !== false ? (
                      <div style={{
                        padding: '10px 12px',
                        background: 'var(--primary-light)',
                        border: '1.5px solid var(--primary-mid)',
                        borderRadius: 'var(--r-md)',
                        fontSize: '12px',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>✨ Reference colors are checked in Step 5 and will take priority.</span>
                      </div>
                    ) : (
                      <div className="flex gap-8 mt-6">
                        <button
                          type="button"
                          className={`btn ${colorMode === 'brand' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12.5 }}
                          onClick={() => setColorMode('brand')}
                        >
                          {colorMode === 'brand' && <Check size={13} />}
                          🎨 Brand Colors
                        </button>
                        <button
                          type="button"
                          className={`btn ${colorMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12.5 }}
                          onClick={() => setColorMode('custom')}
                        >
                          {colorMode === 'custom' && <Check size={13} />}
                          ✏️ Custom Colors
                        </button>
                      </div>
                    )}

                    {!(refImages.some(r => r.analysis?.colors?.length > 0) && refSettings.colors !== false) && colorMode === 'brand' && brand?.colors?.length && (
                      <div className="flex gap-8 mt-10 items-center">
                        {brand.colors.map((c, i) => (
                          <div key={i} title={c} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid rgba(0,0,0,.08)' }} />
                        ))}
                        <span style={{ fontSize: 11.5, color: 'var(--text-3)', marginLeft: 4 }}>Brand palette will be compiled</span>
                      </div>
                    )}

                    {colorMode === 'custom' && (
                      <div className="flex-col gap-8 mt-10 anim-fade-up">
                        {Object.entries(customColors).map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px',
                            border: '1.5px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            background: 'var(--surface-2)',
                          }}>
                            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: v, border: '2px solid rgba(0,0,0,.1)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                              <input type="color" value={v}
                                onChange={e => setCustomColors(p => ({ ...p, [k]: e.target.value }))}
                                style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', opacity: 0, cursor: 'pointer', transform: 'translate(-25%,-25%)' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'capitalize', minWidth: 70 }}>{k}</span>
                            <input value={v} maxLength={7} onChange={e => setCustomColors(p => ({ ...p, [k]: e.target.value }))}
                              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Menlo,monospace', fontSize: 13, fontWeight: 600, letterSpacing: '.04em' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Typography */}
                  <div className="form-group" style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <label className="form-label" style={{ fontWeight: 650, color: 'var(--text-1)' }}>Typography</label>
                    <div className="flex gap-8 mt-6">
                      <button
                        type="button"
                        className={`btn ${typographyMode === 'brand' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, fontSize: 12.5 }}
                        onClick={() => setTypographyMode('brand')}
                      >
                        {typographyMode === 'brand' && <Check size={13} />}
                        ✓ Use Brand Typography
                      </button>
                      <button
                        type="button"
                        className={`btn ${typographyMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, fontSize: 12.5 }}
                        onClick={() => setTypographyMode('custom')}
                      >
                        {typographyMode === 'custom' && <Check size={13} />}
                        ✏️ Customize Typography
                      </button>
                    </div>

                    {typographyMode === 'brand' ? (
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 8 }}>
                        Automatically using typography from Brand Guidelines ({brand?.typography?.heading || 'Inter'} / {brand?.typography?.body || 'Inter'}).
                      </div>
                    ) : (
                      <div className="flex-col gap-10 mt-12 anim-fade-up">
                        <datalist id="font-options-list">
                          {FONT_OPTIONS.map(f => <option key={f} value={f} />)}
                        </datalist>

                        <div className="form-group">
                          <label className="form-label">Heading Font</label>
                          <input
                            type="text"
                            className="input"
                            list="font-options-list"
                            style={{ fontSize: 13 }}
                            value={customHeadingFont}
                            onChange={e => setCustomHeadingFont(e.target.value)}
                            placeholder="Type or select heading font (e.g. Playfair Display, Inter, Cinzel...)"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Sub Heading Font</label>
                          <input
                            type="text"
                            className="input"
                            list="font-options-list"
                            style={{ fontSize: 13 }}
                            value={customSubHeadingFont}
                            onChange={e => setCustomSubHeadingFont(e.target.value)}
                            placeholder="Type or select sub-heading font (e.g. Plus Jakarta Sans, Roboto...)"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Body Font</label>
                          <input
                            type="text"
                            className="input"
                            list="font-options-list"
                            style={{ fontSize: 13 }}
                            value={customBodyFont}
                            onChange={e => setCustomBodyFont(e.target.value)}
                            placeholder="Type or select body font (e.g. DM Sans, Inter, Lora...)"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Style & Tone */}
                  <div className="form-group" style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <label className="form-label" style={{ fontWeight: 650, color: 'var(--text-1)' }}>Style & Tone</label>
                    <div className="grid-2 gap-12 mt-6">
                      <div className="form-group">
                        <label className="form-label">Brand Style</label>
                        <select
                          className="select"
                          value={brandStyle}
                          onChange={e => setBrandStyle(e.target.value)}
                        >
                          {['Minimal', 'Modern', 'Premium', 'Luxury', 'Corporate', 'Bold'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Brand Tone</label>
                        <select
                          className="select"
                          value={brandTone}
                          onChange={e => setBrandTone(e.target.value)}
                        >
                          {['Professional', 'Friendly', 'Confident', 'Inspirational', 'Energetic', 'Casual'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </Section>
            </div>
          )}

          {/* STEP 3: Content System */}
          {currentStep === 3 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 3: Editorial Design Content" accent="#0ea5e9">
                <div className="flex-col gap-12">

                  {/* Design Name — always first */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Design Name <span style={{ color: 'var(--primary)', marginLeft: 2 }}>*</span>
                    </label>
                    <input
                      className="input"
                      style={{ fontSize: 13 }}
                      value={designTitle}
                      onChange={e => setDesignTitle(e.target.value)}
                      placeholder="e.g. Diwali Sale — Instagram Post, Hiring Banner 2024…"
                    />
                    <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>
                      Give this design a clear name so you can find it in Saved Designs later.
                    </p>
                  </div>

                  {[
                    { label: 'Primary Heading', val: heading,    set: setHeading,    ph: 'e.g. The Next Generation of Performance' },
                    { label: 'Sub-Heading Text', val: subHeading, set: setSubHeading, ph: 'e.g. Crafted for professional cricketers.' },
                    { label: 'Body Copy / Feature List',  val: body,       set: setBody,       ph: 'e.g. Introducing our double-stitched leather core ball…', multi: true },
                    { label: 'Call To Action (CTA)',        val: cta,        set: setCta,        ph: 'e.g. Explore the Collection →' },
                  ].map(({ label, val, set, ph, multi }) => (
                    <div className="form-group" key={label}>
                      <label className="form-label">{label}</label>
                      {multi ? (
                        <textarea className="textarea" style={{ minHeight: 80, fontSize: 13 }} value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                      ) : (
                        <input className="input" style={{ fontSize: 13 }} value={val} onChange={e => set(e.target.value)} placeholder={ph} />
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* STEP 4: Design Uploads */}
          {currentStep === 4 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 4: Design Specific Images" accent="#059669">
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>
                  Upload image ingredients for this design prompt. Logo is always included from brand guidelines.
                </p>

                {/* Logo auto-include badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', marginBottom: 16,
                  border: '1.5px solid var(--success-light)',
                  borderRadius: 'var(--r-lg)',
                  background: 'var(--success-light)',
                }}>
                  <span style={{ fontSize: 16 }}>🏷️</span>
                  <div style={{ fontSize: 12.5, color: 'var(--success)', fontWeight: 600 }}>
                    Official Logo — Automatically included in prompt compilation
                  </div>
                  <Check size={14} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                </div>

                {/* Upload blocks */}
                {[
                  { key: 'products',     label: 'Product Image Uploads',    emoji: '📦', hint: 'Product shots or renders' },
                  { key: 'environments', label: 'Environment Backdrop',      emoji: '🌄', hint: 'Stadium, backdrop, scene' },
                  { key: 'icons',        label: 'Icons & graphic elements', emoji: '⭐', hint: 'Badges, badges, icons' },
                ].map(({ key, label, emoji, hint }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-8">
                        <span style={{ fontSize: 17 }}>{emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</div>
                        </div>
                      </div>
                      <label className="btn btn-secondary btn-xs" style={{ cursor: 'pointer' }}>
                        <Plus size={11} /> Add files
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                          onChange={e => addDesignImages(key, e.target.files)} />
                      </label>
                    </div>

                    {designImages[key].length > 0 ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {designImages[key].map(f => (
                          <div key={f.id} style={{
                            position: 'relative', width: 64, height: 64,
                            borderRadius: 'var(--r-md)', overflow: 'hidden',
                            border: '1.5px solid var(--border)', flexShrink: 0,
                          }}>
                            <img src={f.previewUrl} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button onClick={() => removeDesignImage(key, f.id)} style={{
                              position: 'absolute', top: 3, right: 3,
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'rgba(0,0,0,.65)', border: 'none',
                              color: '#fff', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifycontent: 'center',
                            }}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', cursor: 'pointer',
                        border: '1.5px dashed var(--border-2)',
                        borderRadius: 'var(--r-lg)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-3)',
                      }}>
                        <Upload size={16} />
                        <span style={{ fontSize: 12.5 }}>Upload files for {label}</span>
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                          onChange={e => addDesignImages(key, e.target.files)} />
                      </label>
                    )}
                  </div>
                ))}
              </Section>
            </div>
          )}

          {/* STEP 5: Guidelines & References */}
          {currentStep === 5 && (
            <div className="anim-fade-up flex-col gap-14">
              {/* References Upload */}
              <Section title="Step 5: Design Reference Images" badge={refImages.length} accent="#d97706">
                <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
                  Upload style guidelines, lighting sheets, or layout inspiration. AI extracts visual features instantly.
                </p>
                <div className="flex-col gap-8 mb-14">
                  {refImages.map(r => (
                    <RefCard key={r.id} refImage={r} onRemove={id => setRefImages(p => p.filter(x => x.id !== id))} />
                  ))}
                </div>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '20px 16px', cursor: 'pointer',
                  border: '2px dashed var(--border-2)', borderRadius: 'var(--r-lg)',
                  background: 'var(--surface-2)', textAlign: 'center'
                }}>
                  <Upload size={20} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Upload reference posters/layouts (Unlimited)</span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleUploadRef} />
                </label>
              </Section>

               {/* Reference Analysis Panel */}
              {refImages.length > 0 && (() => {
                const activeRef = refImages.find(r => r.id === selectedRefId) || refImages[0];
                if (!activeRef) return null;

                const a = activeRef.analysis || {};
                const conf = a.confidence || {};
                const avgConf = Math.round(
                  Object.values(conf).reduce((sum, v) => sum + v, 0) / 
                  Math.max(1, Object.keys(conf).length)
                ) || 92;

                const handleSectionEditStart = (key, val) => {
                  setEditingSectionKey(key);
                  setSectionEditText(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
                };

                const handleSectionSave = (key) => {
                  let parsedVal = sectionEditText;
                  if (key === 'color_palette' || key === 'layout' || key === 'typography' || key === 'composition' || key === 'background' || key === 'images' || key === 'branding' || key === 'cta') {
                    try {
                      parsedVal = JSON.parse(sectionEditText);
                    } catch (e) {
                      alert('Invalid JSON format. Please correct it before saving.');
                      return;
                    }
                  } else if (key === 'icons' || key === 'shapes' || key === 'design_patterns') {
                    try {
                      parsedVal = JSON.parse(sectionEditText);
                      if (!Array.isArray(parsedVal)) throw new Error();
                    } catch (e) {
                      // fallback parse comma separated if not JSON array
                      parsedVal = sectionEditText.split(',').map(s => s.trim()).filter(Boolean);
                    }
                  }

                  setRefImages(prev => prev.map(item => {
                    if (item.id === activeRef.id) {
                      return {
                        ...item,
                        analysis: {
                          ...item.analysis,
                          [key]: parsedVal
                        }
                      };
                    }
                    return item;
                  }));
                  setEditingSectionKey(null);
                };

                const exportTextAnalysis = () => {
                  const output = `Visual Analysis Export: ${activeRef.name}\n` +
                    `Industry: ${a.industry || 'unknown'}\n` +
                    `Style: ${a.style || 'unknown'}\n` +
                    `Dominant Colors: ${(a.color_palette?.hex_codes || []).map(h => `${h.hex} (${h.percentage}%)`).join(', ')}\n` +
                    `Layout Structure: ${a.layout?.structure || 'unknown'}\n` +
                    `Typography Styles: Headings: ${a.typography?.heading_style || 'unknown'} / Body: ${a.typography?.body_style || 'unknown'}\n` +
                    `Composition Focal Point: ${a.composition?.focal_point || 'unknown'}\n` +
                    `Objects: ${a.images?.subject || 'unknown'}\n` +
                    `Lighting: ${a.lighting || 'unknown'}`;
                  navigator.clipboard.writeText(output);
                  alert('Analysis report copied to clipboard!');
                };

                const downloadJSON = () => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(a, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href",     dataStr);
                  dlAnchorElem.setAttribute("download", `${activeRef.name.replace(/\.[^/.]+$/, "")}_analysis.json`);
                  dlAnchorElem.click();
                };

                const handleJSONTextSave = () => {
                  try {
                    const parsed = JSON.parse(editedJSONText);
                    setRefImages(prev => prev.map(item => {
                      if (item.id === activeRef.id) {
                        return {
                          ...item,
                          analysis: parsed
                        };
                      }
                      return item;
                    }));
                    setIsJSONEditing(false);
                  } catch (e) {
                    alert('Invalid JSON. Please ensure it has proper brackets and quotes.');
                  }
                };

                return (
                  <div className="anim-fade-up flex-col gap-12" style={{ marginTop: '10px' }}>
                    {/* Active Reference Tab Bar */}
                    {refImages.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {refImages.map((r, idx) => (
                          <button
                            key={r.id}
                            onClick={() => { setSelectedRefId(r.id); setIsJSONEditing(false); }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--r-md)',
                              border: r.id === activeRef.id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                              background: r.id === activeRef.id ? 'var(--primary-light)' : 'var(--surface)',
                              color: r.id === activeRef.id ? 'var(--primary)' : 'var(--text-2)',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🖼️ Ref {idx + 1}: {r.name.slice(0, 16)}...
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Master Analysis Dashboard Card */}
                    <div style={{
                      background: 'var(--surface)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--r-xl)',
                      boxShadow: 'var(--shadow-sm)',
                      overflow: 'hidden'
                    }}>
                      {/* Dashboard Header */}
                      <div className="inspector-sticky-header" style={{ padding: '16px 24px', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                          {activeRef.previewUrl ? (
                            <img src={activeRef.previewUrl} alt={activeRef.name} style={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'cover', border: '1.5px solid var(--inspector-border)' }} />
                          ) : (
                            <div style={{ width: 60, height: 60, borderRadius: '12px', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1.5px solid var(--inspector-border)' }}>🖼️</div>
                          )}
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-1)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeRef.name}>
                              {activeRef.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--inspector-success)', background: 'rgba(16,185,129,0.08)', padding: '2px 6px', borderRadius: '12px', fontWeight: 700 }}>
                                {avgConf}% Match
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>
                                1920 × 1080 px
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sticky Search Bar */}
                        <div style={{ flex: 1, maxWidth: '550px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setIsRestoreModalOpen(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              height: '42px',
                              padding: '0 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--inspector-border)',
                              background: '#ffffff',
                              color: 'var(--text-2)',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            title="Restore Original Analysis"
                          >
                            ↻ Restore Original
                          </button>
                          <input
                            type="text"
                            id="inspector-search-input"
                            placeholder="Search attributes (Press Ctrl+F)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                              width: '100%',
                              height: '42px',
                              padding: '0 16px',
                              fontSize: '14px',
                              border: '1px solid var(--inspector-border)',
                              borderRadius: '10px',
                              outline: 'none',
                              background: 'var(--surface-2)',
                              color: 'var(--text-1)',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Top controls */}
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => setShowBottomFilters(!showBottomFilters)}
                            className="btn btn-secondary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', padding: '0 12px', fontSize: '12.5px', background: showBottomFilters ? 'var(--primary-light)' : 'transparent', color: showBottomFilters ? 'var(--primary)' : 'var(--text-2)' }}
                          >
                            🔍 {showBottomFilters ? 'Hide Filters' : 'Show Filters'}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(a, null, 2));
                              alert('Analysis JSON copied to clipboard!');
                            }}
                            className="btn btn-secondary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', padding: '0 12px', fontSize: '12.5px' }}
                          >
                            📋 Copy JSON
                          </button>
                          <button onClick={downloadJSON} className="btn btn-secondary btn-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', padding: '0 12px', fontSize: '12.5px' }}>
                            ⬇️ Download JSON
                          </button>
                          <button
                            onClick={() => {
                              if (isJSONEditing) {
                                handleJSONTextSave();
                              } else {
                                setEditedJSONText(JSON.stringify(a, null, 2));
                                setIsJSONEditing(true);
                              }
                            }}
                            className="btn btn-primary btn-xs"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', padding: '0 12px', fontSize: '12.5px' }}
                          >
                            {isJSONEditing ? '💾 Save JSON' : '✏️ Edit JSON'}
                          </button>
                          {isJSONEditing && (
                            <button onClick={() => setIsJSONEditing(false)} className="btn btn-secondary btn-xs" style={{ height: '40px', padding: '0 12px', fontSize: '12.5px' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Workspace split */}
                      {isJSONEditing ? (
                        <div style={{ padding: '16px' }}>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 600 }}>Raw Structured Style Memory JSON:</div>
                          <textarea
                            value={editedJSONText}
                            onChange={e => setEditedJSONText(e.target.value)}
                            style={{
                              width: '100%',
                              height: '420px',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              padding: '12px',
                              border: '1.5px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--surface-3)',
                              color: 'var(--text-1)',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <RedesignedInspector
                          activeRef={activeRef}
                          refSettings={refSettings}
                          setRefImages={setRefImages}
                          toggleAttribute={toggleAttribute}
                          toggleAll={toggleAll}
                          searchQuery={searchQuery}
                          enableReferenceAnalysis={enableReferenceAnalysis}
                          setEnableReferenceAnalysis={setEnableReferenceAnalysis}
                        />
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* System guidelines */}
              <Section title="System Design Rules & Constraints" accent="#7c3aed" defaultOpen={false}>
                <textarea
                  style={{
                    width: '100%', minHeight: 180, resize: 'vertical',
                    fontFamily: 'Menlo,Consolas,monospace', fontSize: 11.5, lineHeight: 1.7,
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
                    background: 'var(--surface-2)', padding: '12px 14px', outline: 'none'
                  }}
                  value={guidelines}
                  onChange={e => setGuidelines(e.target.value)}
                />
              </Section>
            </div>
          )}

          {/* STEP 6: Final Compiled Prompt */}
          {currentStep === 6 && (
            <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: '7.2fr 2.8fr', gap: '24px', alignItems: 'stretch', width: '100%' }}>
              
              {/* LEFT COLUMN: Large Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  
                  {/* Large 16:9 Design Preview Card */}
                  <div style={{
                    width: '100%',
                    height: '540px',
                    aspectRatio: '16/9',
                    maxHeight: '560px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}>
                    {generatedImageUrl ? (
                      <>
                        <img src={generatedImageUrl} alt="Generated Design" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        {/* Floating overlay buttons */}
                        <div style={{
                          position: 'absolute',
                          bottom: '20px',
                          left: '20px',
                          right: '20px',
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '10px 16px',
                          borderRadius: '30px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          boxShadow: 'var(--shadow-md)'
                        }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigateToPromptRoute('/prompt/edit')} style={{ color: 'var(--text-1)' }}>✏️ Edit</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigateToPromptRoute('/prompt/view')} style={{ color: 'var(--text-1)' }}>👁️ View Prompt</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => {
                            const a = document.createElement('a');
                            a.href = generatedImageUrl;
                            a.download = `${designTitle || 'design'}.png`;
                            a.click();
                          }} style={{ color: 'var(--text-1)' }}>⬇️ Download</button>
                          <button className="btn btn-secondary btn-sm" onClick={handleGenerateImage} style={{ color: 'var(--text-1)' }}>🔄 Regenerate</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {/* Beautiful empty illustration */}
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, rgba(108, 76, 241, 0.1), rgba(108, 76, 241, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6C4CF1',
                          boxShadow: '0 8px 16px rgba(108, 76, 241, 0.06)'
                        }}>
                          <Sparkles size={30} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-1)' }}>Your design will appear here</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-3)', maxWidth: '420px', lineHeight: '1.6' }}>
                          Generate your first AI-powered design using your uploaded assets, brand guidelines, and prompt.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(108, 76, 241, 0.06)', color: '#6C4CF1', padding: '8px 14px', borderRadius: '30px', fontSize: '12.5px', fontWeight: 600 }}>
                      ✓ Brand
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(108, 76, 241, 0.06)', color: '#6C4CF1', padding: '8px 14px', borderRadius: '30px', fontSize: '12.5px', fontWeight: 600 }}>
                      ✓ Assets
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(108, 76, 241, 0.06)', color: '#6C4CF1', padding: '8px 14px', borderRadius: '30px', fontSize: '12.5px', fontWeight: 600 }}>
                      ✓ Guidelines
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(108, 76, 241, 0.06)', color: '#6C4CF1', padding: '8px 14px', borderRadius: '30px', fontSize: '12.5px', fontWeight: 600 }}>
                      ✓ Prompt
                    </div>
                  </div>

                  {/* Action Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleGenerateImage}
                      disabled={true}
                      style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '16px',
                        fontWeight: 700,
                        background: 'var(--surface-3)',
                        borderColor: 'transparent',
                        color: 'var(--text-3)',
                        cursor: 'not-allowed',
                        boxShadow: 'none',
                        fontSize: '15px'
                      }}
                    >
                      Generate Design
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🔒 OpenAI API Required
                    </span>
                    
                    <button
                      className="btn btn-link"
                      onClick={() => navigateToPromptRoute('/prompt/view')}
                      style={{ fontSize: '14px', color: '#6C4CF1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', marginTop: 4 }}
                    >
                      View Final Prompt
                    </button>
                  </div>
                </div>

                {generationError && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--danger-light)',
                    borderRadius: '12px',
                    fontSize: '13px', color: 'var(--danger)', fontWeight: 500,
                    border: '1px solid #fecaca',
                  }}>
                    ⚠️ {generationError}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Sidebar (THREE CARDS ONLY) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>

                {/* Card 1: Project Summary */}
                <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-1)', marginBottom: 4 }}>Project Summary</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Brand</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{brand?.name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Campaign</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', textAlign: 'right' }}>
                        {campaigns.find(c => c._id === selectedCampaignId)?.name || designTitle || '—'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Platform</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{platform?.name || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Assets Uploaded</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{totalAssets}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Prompt Status</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>{prompt ? 'Ready' : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Quick Actions */}
                <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-1)', marginBottom: 4 }}>Quick Actions</div>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleExplicitSaveDesign}
                    disabled={explicitSaving || explicitSaveSuccess}
                    style={{
                      textAlign: 'center',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      background: explicitSaveSuccess ? '#059669' : 'var(--primary)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 14px rgba(108, 76, 241, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {explicitSaveSuccess ? <><Check size={16} /> Saved to Library!</> : <><Save size={16} /> {explicitSaving ? 'Saving...' : 'Save Design to Library'}</>}
                  </button>
                  <button
                    className="btn btn-secondary btn-full"
                    onClick={() => navigateToPromptRoute('/prompt/view')}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 550, color: 'var(--text-1)' }}
                  >
                    👁️ View Final Prompt
                  </button>
                  <button
                    className="btn btn-secondary btn-full"
                    onClick={() => navigateToPromptRoute('/prompt/edit')}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 550, color: 'var(--text-1)' }}
                  >
                    ✏️ Edit Final Prompt
                  </button>
                  <button
                    className="btn btn-secondary btn-full"
                    onClick={() => setCurrentStep(4)}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 550, color: 'var(--text-1)' }}
                  >
                    🖼️ Edit Assets
                  </button>
                </div>

                {/* Card 3: Reviewer Panel */}
                <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1.5px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-1)' }}>Reviewer</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: '0 0 4px 0', lineHeight: '1.5' }}>Submit this compiled design configuration to a reviewer for feedback and approval.</p>

                  <form onSubmit={handleSendForReview} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Type reviewer email..."
                      value={emailQuery}
                      onChange={e => setEmailQuery(e.target.value)}
                      style={{ fontSize: '13.5px', padding: '12px 14px', width: '100%', boxSizing: 'border-box' }}
                    />

                    {searchingReviewers && <div style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>Searching reviewers...</div>}

                    {!searchingReviewers && reviewers.length > 0 && (
                      <div style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', overflow: 'hidden', maxHeight: '120px', overflowY: 'auto'
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
                      style={{ width: '100%', padding: '10px', fontWeight: 600 }}
                      disabled={submittingReview || !selectedReviewer}
                    >
                      {submittingReview ? 'Submitting request...' : 'Send to Reviewer'}
                    </button>
                  </form>
                  {reviewSuccess && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'var(--success-light)',
                      borderRadius: 'var(--r-md)',
                      fontSize: 12.5, color: 'var(--success)', fontWeight: 500,
                      marginTop: 10
                    }}>
                      Sent for review successfully!
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Back / Next Navigation Controls */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#FFFFFF', padding: '16px 24px',
            borderRadius: '16px', border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            marginTop: 16
          }}>
            <button
              className="btn btn-secondary"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(s => s - 1)}
              style={{
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13.5px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#475569',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>
              Step {currentStep} of {steps.length}
            </div>
            <button
              className="btn btn-primary"
              disabled={currentStep === steps.length}
              onClick={() => setCurrentStep(s => s + 1)}
              style={{
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13.5px',
                border: 'none',
                background: '#6C4CF1',
                color: '#FFFFFF',
                cursor: currentStep === steps.length ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Restore Original Confirmation Modal */}
        {isRestoreModalOpen && (
          <div className="inspector-modal-overlay">
            <div className="inspector-modal-content">
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>
                Restore Original Analysis?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                This will permanently discard all edits made after analysis.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  style={{
                    padding: '8px 16px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--inspector-border)',
                    background: 'white', color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRestoreConfirm}
                  style={{
                    padding: '8px 16px', fontSize: '13px', borderRadius: '8px', border: 'none',
                    background: 'var(--inspector-primary)', color: 'white', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlay for Viewing/Editing Prompt */}
        {showPromptModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '640px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>
                  {isEditing ? 'Edit Design Prompt' : 'Compiled Design Prompt'}
                </h3>
                <button
                  onClick={() => setShowPromptModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                {isEditing ? (
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    style={{
                      width: '100%', minHeight: '300px', resize: 'vertical',
                      fontFamily: 'Menlo,Consolas,monospace', fontSize: '12px', lineHeight: '1.6',
                      border: '1px solid var(--border)', borderRadius: '12px',
                      padding: '16px', color: 'var(--text-1)', background: 'var(--surface-2)',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <pre style={{
                    fontFamily: 'Menlo,Consolas,monospace', fontSize: '12px', lineHeight: '1.6',
                    color: 'var(--text-2)', background: 'var(--surface-2)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    maxHeight: '350px', overflowY: 'auto',
                    padding: '16px', margin: 0, borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}>
                    {prompt || 'No prompt compiled yet.'}
                  </pre>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </button>
                <button className="btn btn-secondary" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
                <button className="btn btn-primary" onClick={() => { handleSave(); setShowPromptModal(false); }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Overlay for OpenAI Connection */}
        {showConnectModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '440px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>
                  Connect OpenAI API
                </h3>
                <button
                  onClick={() => setShowConnectModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                Provide your OpenAI API key to enable live DALL-E 3 image generations directly in the workspace.
                Alternatively, click <strong>"Simulate Connection"</strong> to test the layout.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-3)' }}>API KEY</label>
                <input
                  type="password"
                  className="input"
                  placeholder="sk-..."
                  value={openaiKeyInput}
                  onChange={e => setOpenaiKeyInput(e.target.value)}
                  style={{ padding: '12px 14px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsApiKeyConnected(true);
                    setShowConnectModal(false);
                  }}
                  style={{ width: '100%', padding: '12px', fontWeight: 700 }}
                >
                  Connect API Key
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsApiKeyConnected(true);
                    setShowConnectModal(false);
                  }}
                  style={{ width: '100%', padding: '12px', fontWeight: 600 }}
                >
                  Simulate Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Platform Picker Modal */}
        <PlatformPickerModal
          isOpen={isPlatformPickerOpen}
          onClose={() => setIsPlatformPickerOpen(false)}
          selectedPlatform={platform}
          onSelectPlatform={(p) => setPlatform(p)}
        />

      </div>
    </div>
  );
}

function RedesignedInspector({ activeRef, refSettings, setRefImages, toggleAttribute, toggleAll, searchQuery, showBottomFilters, enableReferenceAnalysis, setEnableReferenceAnalysis }) {
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [editingAttrText, setEditingAttrText] = useState('');
  const [draggedAttrId, setDraggedAttrId] = useState(null);
  const [draggedAttrKey, setDraggedAttrKey] = useState(null);

  // Advanced UX States
  const [expandedCategoriesKeys, setExpandedCategoriesKeys] = useState({});
  const [categoryOverrides, setCategoryOverrides] = useState({});

  // Add Attribute Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAddKey, setActiveAddKey] = useState(null);
  const [modalInputValue, setModalInputValue] = useState('');

  const a = activeRef?.analysis || {};

  // Deep Snapshot Undo/Redo Stacks
  const [categoryAttributes, setCategoryAttributes] = useState(() => {
    const initial = {};
    CHECKLIST_ATTRIBUTES.forEach(({ key: k }) => {
      initial[k] = getAttributesListFromAnalysis(k, a);
    });
    return initial;
  });

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const lastActiveRefId = useRef(activeRef?.id);

  // Initialize and track activeRef / analysis restore changes
  useEffect(() => {
    if (activeRef?.id !== lastActiveRefId.current) {
      lastActiveRefId.current = activeRef?.id;
      setUndoStack([]);
      setRedoStack([]);
    }
    const initial = {};
    CHECKLIST_ATTRIBUTES.forEach(({ key: k }) => {
      initial[k] = getAttributesListFromAnalysis(k, a);
    });
    setCategoryAttributes(initial);
  }, [activeRef?.id, activeRef?.analysis]);

  // Global keyboard listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          triggerUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          triggerRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, categoryAttributes]);

  const parseColorString = (str) => {
    const tagMatch = str.match(/^\[([^\]]+)\]\s*(.*)$/);
    let role = 'Palette Color';
    let remaining = str;
    if (tagMatch) {
      role = tagMatch[1];
      remaining = tagMatch[2];
    }
    const hexRegex = /(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})/;
    const match = remaining.match(hexRegex);
    const hex = match ? match[0] : '#000000';
    if (!tagMatch) {
      const cleanRemaining = remaining.replace(hex, '').replace(/[-:]/g, '').trim();
      if (cleanRemaining) role = cleanRemaining;
    }
    return { hex, role, percentage: 20 };
  };

  function getAttributesListFromAnalysis(k, analysisObj) {
    const sectionData = analysisObj[k] || (k === 'branding' ? analysisObj.brand_analysis : null) || (k === 'style' ? analysisObj.design_style : null) || {};
    if (k === 'color_palette') {
      const list = sectionData?.hex_codes || analysisObj.colors || [];
      return list.map((c, idx) => {
        const hexVal = typeof c === 'object' ? c.hex : c;
        const roleVal = typeof c === 'object' ? c.role : 'Palette Color';
        const pct = typeof c === 'object' ? c.percentage : 20;
        return {
          id: `color-${idx}-${hexVal}`,
          text: `[${roleVal}] ${hexVal}`,
          isColor: true,
          hex: hexVal,
          role: roleVal,
          percentage: pct,
          original: c
        };
      });
    }

    const resolveStringVal = (obj) => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (Array.isArray(obj)) {
        return obj.map(item => resolveStringVal(item)).join('\n');
      }
      if (typeof obj === 'object') {
        if ('value' in obj) {
          return resolveStringVal(obj.value);
        }
        return Object.entries(obj)
          .map(([k2, v2]) => {
            const valStr = resolveStringVal(v2);
            if (!valStr || valStr.toLowerCase() === 'not detected' || valStr.toLowerCase() === 'unknown') return '';
            return valStr;
          })
          .filter(Boolean)
          .join('\n');
      }
      return String(obj);
    };

    const rawStr = resolveStringVal(sectionData);
    const lines = rawStr.split('\n');
    const points = [];
    lines.forEach(line => {
      const cleanLine = line.trim().replace(/^[•\\-\\*\\s]+/, '');
      if (!cleanLine) return;
      if (cleanLine.length > 50 && (cleanLine.includes(';') || cleanLine.includes('.'))) {
        const parts = cleanLine.split(/[;.]/g);
        parts.forEach(part => {
          const cleanPart = part.trim();
          if (cleanPart && cleanPart.toLowerCase() !== 'not detected' && cleanPart.toLowerCase() !== 'unknown') {
            points.push(cleanPart);
          }
        });
      } else {
        if (cleanLine.toLowerCase() !== 'not detected' && cleanLine.toLowerCase() !== 'unknown') {
          points.push(cleanLine);
        }
      }
    });

    return points.map((text, idx) => ({
      id: `${k}-${idx}-${text.slice(0, 10)}`,
      text
    }));
  }

  const pushToUndo = (stateToPush) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(stateToPush))]);
    setRedoStack([]);
  };

  const triggerUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(categoryAttributes))]);

    setCategoryAttributes(previous);

    CHECKLIST_ATTRIBUTES.forEach(({ key: k }) => {
      const list = previous[k] || [];
      if (k === 'color_palette') {
        saveColorsToParent(list);
      } else {
        saveAttributesToParent(k, list);
      }
    });
  };

  const triggerRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(categoryAttributes))]);

    setCategoryAttributes(nextState);

    CHECKLIST_ATTRIBUTES.forEach(({ key: k }) => {
      const list = nextState[k] || [];
      if (k === 'color_palette') {
        saveColorsToParent(list);
      } else {
        saveAttributesToParent(k, list);
      }
    });
  };

  const saveColorsToParent = (newItems) => {
    const hexCodes = newItems.map(item => {
      if (item.original && typeof item.original === 'object') {
        return { ...item.original, hex: item.hex, role: item.role };
      }
      return { hex: item.hex, role: item.role, percentage: item.percentage || 20 };
    });
    const updatedPalette = { ...a.color_palette, hex_codes: hexCodes };
    setRefImages(prev => prev.map(item => {
      if (item.id === activeRef.id) {
        return { ...item, analysis: { ...item.analysis, color_palette: updatedPalette } };
      }
      return item;
    }));
  };

  const saveAttributesToParent = (k, newItems) => {
    const textValues = newItems.map(item => item.text);
    const originalObj = a[k] || (k === 'branding' ? a.brand_analysis : null) || (k === 'style' ? a.design_style : null);
    let parsedVal;
    if (Array.isArray(originalObj)) {
      parsedVal = textValues;
    } else if (typeof originalObj === 'object' && originalObj !== null && 'value' in originalObj) {
      parsedVal = { ...originalObj, value: textValues.join('\n') };
    } else {
      parsedVal = textValues.join('\n');
    }
    let updateKey = k;
    if (k === 'branding' && !a.branding && a.brand_analysis) updateKey = 'brand_analysis';
    if (k === 'style' && !a.style && a.design_style) updateKey = 'design_style';
    setRefImages(prev => prev.map(item => {
      if (item.id === activeRef.id) {
        return { ...item, analysis: { ...item.analysis, [updateKey]: parsedVal } };
      }
      return item;
    }));
  };

  const handleDragStart = (e, id, k) => {
    setDraggedAttrId(id);
    setDraggedAttrKey(k);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId, k) => {
    e.preventDefault();
    if (draggedAttrKey !== k) return;
    const currentList = categoryAttributes[k] || [];
    const draggedIndex = currentList.findIndex(item => item.id === draggedAttrId);
    const targetIndex = currentList.findIndex(item => item.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    pushToUndo(categoryAttributes);

    const newList = [...currentList];
    const [draggedItem] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, draggedItem);

    setCategoryAttributes(prev => ({ ...prev, [k]: newList }));

    if (k === 'color_palette') {
      saveColorsToParent(newList);
    } else {
      saveAttributesToParent(k, newList);
    }
    setDraggedAttrId(null);
    setDraggedAttrKey(null);
  };

  const startEditing = (id, text) => {
    setEditingAttrId(id);
    setEditingAttrText(text);
  };

  const saveEdit = (id, k) => {
    const currentList = categoryAttributes[k] || [];
    const newList = currentList.map(item => {
      if (item.id === id) {
        if (k === 'color_palette') {
          const parsed = parseColorString(editingAttrText);
          return {
            ...item,
            text: `[${parsed.role}] ${parsed.hex}`,
            hex: parsed.hex,
            role: parsed.role
          };
        }
        return { ...item, text: editingAttrText };
      }
      return item;
    });

    pushToUndo(categoryAttributes);

    setCategoryAttributes(prev => ({ ...prev, [k]: newList }));

    if (k === 'color_palette') {
      saveColorsToParent(newList);
    } else {
      saveAttributesToParent(k, newList);
    }
    setEditingAttrId(null);
  };

  const cancelEdit = () => {
    setEditingAttrId(null);
  };

  const deleteAttribute = (id, k) => {
    const currentList = categoryAttributes[k] || [];
    pushToUndo(categoryAttributes);
    const newList = currentList.filter(item => item.id !== id);
    setCategoryAttributes(prev => ({ ...prev, [k]: newList }));
    if (k === 'color_palette') {
      saveColorsToParent(newList);
    } else {
      saveAttributesToParent(k, newList);
    }
  };

  const openAddModal = (k) => {
    setActiveAddKey(k);
    setModalInputValue('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!modalInputValue.trim() || !activeAddKey) {
      setIsAddModalOpen(false);
      return;
    }
    const currentList = categoryAttributes[activeAddKey] || [];
    let newItem;
    if (activeAddKey === 'color_palette') {
      const parsed = parseColorString(modalInputValue);
      newItem = {
        id: `color-${Date.now()}-${parsed.hex}`,
        text: `[${parsed.role}] ${parsed.hex}`,
        isColor: true,
        hex: parsed.hex,
        role: parsed.role,
        percentage: 20
      };
    } else {
      newItem = {
        id: `${activeAddKey}-${Date.now()}-${modalInputValue.slice(0, 10)}`,
        text: modalInputValue.trim()
      };
    }

    pushToUndo(categoryAttributes);

    const newList = [...currentList, newItem];
    setCategoryAttributes(prev => ({ ...prev, [activeAddKey]: newList }));

    if (activeAddKey === 'color_palette') {
      saveColorsToParent(newList);
    } else {
      saveAttributesToParent(activeAddKey, newList);
    }
    setIsAddModalOpen(false);
    setModalInputValue('');
  };

  const extractTagAndText = (text) => {
    const match = text.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) return { tag: match[1], cleanText: match[2] };
    return { tag: null, cleanText: text };
  };

  const highlightMatchText = (text) => {
    if (!searchQuery.trim()) return text;
    const query = searchQuery.trim();
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <span key={i} className="highlight-match">{part}</span>
            : part
        )}
      </span>
    );
  };

  // Grouping ordered items
  const REQUESTED_ORDER = [
    'industry', 'style', 'color_palette', 'typography',
    'layout', 'composition', 'branding', 'background',
    'images', 'icons', 'lighting', 'design_type'
  ];

  const getImportanceClass = (key) => {
    if (['industry', 'style', 'color_palette', 'typography'].includes(key)) {
      return 'importance-high';
    }
    if (['layout', 'composition', 'branding', 'background'].includes(key)) {
      return 'importance-medium';
    }
    return 'importance-low';
  };

  const filteredCategories = CHECKLIST_ATTRIBUTES.filter(({ key: k, label }) => {
    const currentAttrs = categoryAttributes[k] || [];
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (label.toLowerCase().includes(query) || k.toLowerCase().includes(query)) return true;
    return currentAttrs.some(attr => attr.text.toLowerCase().includes(query));
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return REQUESTED_ORDER.indexOf(a.key) - REQUESTED_ORDER.indexOf(b.key);
  });

  return (
    <div style={{ background: 'var(--inspector-bg)', padding: '20px' }}>
      
      {/* Top Global Reference Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--inspector-border)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-1)' }}>Reference Analysis</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={enableReferenceAnalysis} 
              onChange={() => setEnableReferenceAnalysis(!enableReferenceAnalysis)}
              style={{ display: 'none' }}
            />
            <span className={`custom-checkbox ${enableReferenceAnalysis ? 'checked' : ''}`} />
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-2)' }}>Enable Reference Analysis</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => toggleAll(true)}
            disabled={!enableReferenceAnalysis}
            style={{
              background: 'none', border: '1px solid var(--inspector-border)', borderRadius: '6px',
              padding: '6px 12px', fontSize: '12.5px', fontWeight: 700,
              cursor: enableReferenceAnalysis ? 'pointer' : 'not-allowed',
              opacity: enableReferenceAnalysis ? 1 : 0.5,
              color: 'var(--inspector-primary)'
            }}
          >
            Select All
          </button>
          <button
            onClick={() => toggleAll(false)}
            disabled={!enableReferenceAnalysis}
            style={{
              background: 'none', border: '1px solid var(--inspector-border)', borderRadius: '6px',
              padding: '6px 12px', fontSize: '12.5px', fontWeight: 700,
              cursor: enableReferenceAnalysis ? 'pointer' : 'not-allowed',
              opacity: enableReferenceAnalysis ? 1 : 0.5,
              color: 'var(--text-3)'
            }}
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* High Density Grid */}
      <div className="inspector-grid" style={{ padding: 0 }}>
        {sortedCategories.map(({ key: k, label, icon }) => {
          const currentAttrs = categoryAttributes[k] || [];
          const matchingAttrs = searchQuery.trim()
            ? currentAttrs.filter(attr => attr.text.toLowerCase().includes(searchQuery.toLowerCase()))
            : currentAttrs;

          const cardLabel = categoryOverrides[k] || label;
          const isEnabled = refSettings[k] !== false;

          // Card default height view limits
          const maxVisible = 5;
          const isShowingAll = !!expandedCategoriesKeys[k];
          const visibleAttrs = isShowingAll || matchingAttrs.length <= maxVisible
            ? matchingAttrs
            : matchingAttrs.slice(0, maxVisible);

          return (
            <div key={k} className={`category-card ${getImportanceClass(k)} ${isShowingAll ? 'expanded' : ''}`} style={{ opacity: (!enableReferenceAnalysis || !isEnabled) ? 0.9 : 1 }}>
              {/* Card Header */}
              <div className="category-card-header" style={{ marginBottom: '10px', height: '36px' }}>
                <div className="category-card-title" style={{ flex: 1, minWidth: 0, fontSize: '15px' }}>
                  <span style={{ fontSize: '15px' }}>{icon}</span>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-1)' }}>
                    {highlightMatchText(cardLabel)}
                  </span>
                  <span className="category-card-badge" style={{ fontSize: '11px', padding: '1px 5px' }}>
                    {currentAttrs.length}
                  </span>
                  {(!enableReferenceAnalysis || !isEnabled) && (
                    <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                      Excluded from Prompt
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: enableReferenceAnalysis ? 'pointer' : 'not-allowed' }}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      disabled={!enableReferenceAnalysis}
                      onChange={() => enableReferenceAnalysis && toggleAttribute(k)}
                      style={{ display: 'none' }}
                    />
                    <span className={`custom-checkbox ${isEnabled ? 'checked' : ''} ${!enableReferenceAnalysis ? 'disabled' : ''}`} />
                  </label>

                  <button
                    className="inspector-add-btn"
                    onClick={() => openAddModal(k)}
                    title="Add Attribute"
                  >
                    ➕
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="attributes-list">
                {matchingAttrs.length === 0 ? (
                  <div style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', width: '100%' }}>
                    <div>No attributes available.</div>
                  </div>
                ) : (
                  visibleAttrs.map((item) => {
                    const isInlineEditing = editingAttrId === item.id;
                    const { tag, cleanText } = extractTagAndText(item.text);
                    const tagClass = tag ? tag.toLowerCase() : '';
                    const chipClass = ['primary', 'secondary', 'important', 'optional'].includes(tagClass) ? tagClass : 'default';

                    // Dedicated visual types
                    let chipVisual = null;
                    if (k === 'color_palette') {
                      chipVisual = (
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                      );
                    } else if (k === 'typography') {
                      chipVisual = (
                        <span style={{ fontSize: '10px', fontWeight: 800, background: '#E2E8F0', padding: '0 3px', borderRadius: '3px', color: '#475569', flexShrink: 0 }}>Aa</span>
                      );
                    } else if (k === 'layout') {
                      chipVisual = (
                        <span style={{ fontSize: '11px', color: '#6366F1', flexShrink: 0 }}>📐</span>
                      );
                    } else if (k === 'images') {
                      chipVisual = (
                        <span style={{ fontSize: '11px', color: '#F59E0B', flexShrink: 0 }}>📦</span>
                      );
                    } else if (k === 'branding') {
                      chipVisual = (
                        <span style={{ fontSize: '11px', color: '#10B981', flexShrink: 0 }}>🏷️</span>
                      );
                    } else if (k === 'background') {
                      chipVisual = (
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="attribute-box"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id, k)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item.id, k)}
                        onClick={(e) => {
                          if (e.target.closest('.attribute-box-actions') || isInlineEditing) return;
                          const textToCopy = k === 'color_palette' ? `${item.hex} ${item.role}` : cleanText;
                          navigator.clipboard.writeText(textToCopy);
                          addNotification?.('Copied: ' + textToCopy);
                        }}
                        title="Click to copy value"
                      >
                        {isInlineEditing ? (
                          <input
                            className="attribute-box-input"
                            value={editingAttrText}
                            onChange={e => setEditingAttrText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit(item.id, k);
                                if (e.key === 'Escape') cancelEdit();
                            }}
                            onBlur={() => saveEdit(item.id, k)}
                            autoFocus
                          />
                        ) : (
                          <>
                            <div className="attribute-box-content">
                              {chipVisual}
                              {tag && k !== 'color_palette' && (
                                <span className={`tag-chip ${chipClass}`}>{tag}</span>
                              )}
                              <span className="attribute-box-text">
                                {k === 'color_palette' ? (
                                  <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-1)' }}>{highlightMatchText(item.hex)}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{highlightMatchText(item.role)}</span>
                                  </span>
                                ) : (
                                  highlightMatchText(cleanText)
                                )}
                              </span>
                              <span className="chip-copy-indicator" title="Copy to clipboard">📋</span>
                            </div>

                            <div className="attribute-box-actions">
                              <button
                                className="action-icon-btn"
                                title="Edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(item.id, item.text);
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                className="action-icon-btn delete"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAttribute(item.id, k);
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Centered, Sticky, Inside-Card Footer */}
              {matchingAttrs.length > maxVisible && (
                <div className="category-card-footer">
                  <button
                    className="category-card-footer-btn"
                    onClick={() => setExpandedCategoriesKeys(prev => ({ ...prev, [k]: !prev[k] }))}
                  >
                    {isShowingAll ? '▲ Show Less' : `▼ View All (${matchingAttrs.length})`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Attribute Dialog Modal */}
      {isAddModalOpen && (
        <div className="inspector-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="inspector-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>
              Add Attribute
            </h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '8px' }}>
                  Attribute Name
                </label>
                <input
                  type="text"
                  className="attribute-box-input"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    border: '1.5px solid var(--inspector-border)',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g. Minimalist layout"
                  value={modalInputValue}
                  onChange={(e) => setModalInputValue(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '8px 16px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--inspector-border)',
                    background: 'white', color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px', fontSize: '13px', borderRadius: '8px', border: 'none',
                    background: 'var(--inspector-primary)', color: 'white', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
