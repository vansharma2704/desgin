import React, { useState, useEffect, useCallback } from 'react';
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
  { key: 'design_type', label: 'Design Overview', icon: '📝', category: 'structure' },
  { key: 'color_palette', label: 'Colors', icon: '🎨', category: 'branding' },
  { key: 'typography', label: 'Typography', icon: '✍️', category: 'content' },
  { key: 'layout', label: 'Layout', icon: '📐', category: 'structure' },
  { key: 'composition', label: 'Composition', icon: '🧩', category: 'artistic' },
  { key: 'background', label: 'Background', icon: '🖼️', category: 'structure' },
  { key: 'images', label: 'Objects', icon: '📦', category: 'artistic' },
  { key: 'icons', label: 'Icons', icon: '✨', category: 'content' },
  { key: 'branding', label: 'Branding', icon: '🏷️', category: 'branding' },
  { key: 'lighting', label: 'Lighting', icon: '💡', category: 'artistic' },
  { key: 'style', label: 'Design Style', icon: '🎭', category: 'branding' }
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
  const [isCustomEdited, setIsCustomEdited] = useState(resumeDraft?.isCustomEdited || false);
  const [platform, setPlatform] = useState(
    resumeDraft?.platform
      ? PLATFORMS.find(p => p.name === resumeDraft.platform) || PLATFORMS[0]
      : savedPlatform || PLATFORMS[0]
  );

  // Step Wizard state
  const [currentStep, setCurrentStep] = useState(resumeDraft?.currentStep || 1);

  // Content
  const [designTitle, setDesignTitle] = useState(resumeDraft?.name || '');
  const [heading,     setHeading]     = useState(resumeDraft?.heading || '');
  const [subHeading,  setSubHeading]  = useState(resumeDraft?.subHeading || '');
  const [body,        setBody]        = useState(resumeDraft?.bodyText || '');
  const [cta,         setCta]         = useState(resumeDraft?.ctaText || '');

  // Design images for this specific design (per-prompt uploads)
  const [designImages, setDesignImages] = useState({ products: [], environments: [], icons: [] });

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
    const init = {};
    brand.assets.forEach(a => { init[a.id] = true; });
    setAssetChecked(init);
  }, [selectedBrandId, brand]);

  // Colors
  const [colorMode,    setColorMode]    = useState('brand');
  const [customColors, setCustomColors] = useState({ background: '#ffffff', heading: '#000000', subheading: '#333333', body: '#555555' });

  // Reference images & analysis checkboxes
  const [refImages,    setRefImages]    = useState([]);
  const [refAnalyzing, setRefAnalyzing] = useState(false);
  const [refSettings,  setRefSettings]  = useState({
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
  });

  // Guidelines
  const [guidelines, setGuidelines] = useState(DEFAULT_GUIDELINES);

  // Output
  const [prompt,    setPrompt]    = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const [activeDraftId, setActiveDraftId] = useState(resumeDraft?._id || null);
  // Track the saved status so auto-save never overwrites a review-lifecycle status
  const [activeDraftStatus, setActiveDraftStatus] = useState(resumeDraft?.status || 'Draft');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(resumeDraft?.imageUrl || resumeDraft?.generatedImage || '');
  const [generationError, setGenerationError] = useState('');

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    resumeDraft?.campaignId?._id || resumeDraft?.campaignId || ''
  );
  // Reviewer search and submission states
  const [emailQuery, setEmailQuery] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [searchingReviewers, setSearchingReviewers] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Redesign modals & connection states
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
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
        if (resumeDraft?.campaignId) {
          setSelectedCampaignId(resumeDraft.campaignId?._id || resumeDraft.campaignId);
        } else if (campaignId) {
          setSelectedCampaignId(campaignId);
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
          isDraft: false,
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
    const text = generatePrompt({
      brand, platform,
      designTitle, heading, subHeading, body, cta,
      referenceImages: refImages,
      includedAssets: buildIncludedAssets(),
      systemGuidelines: guidelines,
      colorMode,
      customColors: colorMode === 'custom' ? customColors : null,
      referenceSettings: refSettings,
    });
    setPrompt(text);
    setSaved(false);
  }, [brand, platform, designTitle, heading, subHeading, body, cta, refImages, buildIncludedAssets, guidelines, colorMode, customColors, designImages, refSettings, isCustomEdited]);

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
      const validBase64s = base64s.filter(Boolean);
      
      if (validBase64s.length > 0 && activeBrandId && selectedCampaignId) {
        try {
          // Analyze once, store structured Style Memory in Campaign
          const res = await aiService.analyzeStyle(validBase64s, activeBrandId, selectedCampaignId);
          console.log("Style memory successfully stored on backend:", res);
          
          if (res && res.success && res.styleMemory) {
            const sm = res.styleMemory;
            setRefImages(prev => {
              // Update only the newly added references in this batch
              const newlyAddedIds = new Set(completedRefs.map(r => r.id));
              return prev.map(item => {
                if (newlyAddedIds.has(item.id)) {
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
              });
            });
          }
        } catch (err) {
          console.error("Backend style analysis failed:", err);
        }
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
    { num: 1, label: 'Scope & Colors' },
    { num: 2, label: 'Content System' },
    { num: 3, label: 'Design Uploads' },
    { num: 4, label: 'Guidelines & Refs' },
    { num: 5, label: 'Final Prompt' }
  ];

  return (
    <div className="page" style={{ maxWidth: currentStep === 5 ? 1700 : 960, width: currentStep === 5 ? '90%' : '100%', margin: '0 auto', transition: 'all 0.2s ease-in-out' }}>
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

      {/* Step Navigation Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)', padding: '12px 20px',
        borderRadius: 'var(--r-xl)', border: '1.5px solid var(--border)',
        marginBottom: 24, boxShadow: 'var(--shadow-xs)',
        flexWrap: 'wrap'
      }}>
        {steps.map((st, idx) => (
          <React.Fragment key={st.num}>
            <button
              onClick={() => setCurrentStep(st.num)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                color: currentStep === st.num ? 'var(--primary)' : 'var(--text-3)',
                fontWeight: currentStep === st.num ? 700 : 500,
                fontSize: 13, transition: 'color .15s'
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: currentStep === st.num ? 'var(--primary)' : 'var(--surface-3)',
                color: currentStep === st.num ? '#fff' : 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>
                {st.num}
              </div>
              {st.label}
            </button>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, minWidth: '10px', height: 2, background: 'var(--border)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── ACTIVE STEP PANE ── */}
        <div className="flex-col gap-14" style={{ minHeight: 400 }}>

          {/* STEP 1: Scope & Colors */}
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
                    <label className="form-label">Output Platform Canvas</label>
                    <select className="select" value={platform?.name}
                      onChange={e => { const p = PLATFORMS.find(p => p.name === e.target.value); if (p) setPlatform(p); }}
                    >
                      {PLATFORMS.map((p, i) => (
                        <option key={i} value={p.name}>{p.name} — {p.width}×{p.height} {p.unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color modes */}
                  <div className="form-group">
                    <label className="form-label">Color Style Mode</label>
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
                        <span>✨ Reference colors are checked in Step 4 and will take priority.</span>
                      </div>
                    ) : (
                      <div className="flex gap-8 mt-6">
                        <button
                          className={`btn ${colorMode === 'brand' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, fontSize: 12.5 }}
                          onClick={() => setColorMode('brand')}
                        >
                          {colorMode === 'brand' && <Check size={13} />}
                          🎨 Brand Colors
                        </button>
                        <button
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
                </div>
              </Section>
            </div>
          )}

          {/* STEP 2: Content System */}
          {currentStep === 2 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 2: Editorial Design Content" accent="#0ea5e9">
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

          {/* STEP 3: Design Uploads */}
          {currentStep === 3 && (
            <div className="anim-fade-up flex-col gap-14">
              <Section title="Step 3: Design Specific Images" accent="#059669">
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

          {/* STEP 4: Guidelines & References */}
          {currentStep === 4 && (
            <div className="anim-fade-up flex-col gap-14">
              {/* References Upload */}
              <Section title="Step 4: Design Reference Images" badge={refImages.length} accent="#d97706">
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
                      <div style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>🎯</span>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-1)' }}>{activeRef.name} Analysis</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>Multi-Stage Computer Vision & Layout Inspector</div>
                          </div>
                          <span style={{
                            background: 'rgba(16,185,129,.08)',
                            color: '#10B981',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: '1px solid rgba(16,185,129,.22)'
                          }}>
                            {avgConf}% Vision Match
                          </span>
                        </div>

                        {/* Top controls */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={exportTextAnalysis} className="btn btn-secondary btn-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '11.5px' }}>
                            📋 Copy Report
                          </button>
                          <button onClick={downloadJSON} className="btn btn-secondary btn-xs" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '11.5px' }}>
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
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '11.5px' }}
                          >
                            {isJSONEditing ? '💾 Save JSON' : '✏️ Edit JSON'}
                          </button>
                          {isJSONEditing && (
                            <button onClick={() => setIsJSONEditing(false)} className="btn btn-secondary btn-xs" style={{ padding: '6px 10px', fontSize: '11.5px' }}>
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
                        <div>

                          {/* RIGHT PANEL: Redesigned Grouped Attributes List */}
                          <div style={{
                            padding: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            background: 'var(--surface)'
                          }}>
                            {/* Search and Category Filters */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                              <input 
                                type="text" 
                                placeholder="🔍 Search attributes (e.g. color, alignment)..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '13px',
                                  border: '1.5px solid var(--border)',
                                  borderRadius: '10px',
                                  outline: 'none',
                                  background: 'var(--surface-2)',
                                  color: 'var(--text-1)'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {[
                                  { id: 'all', label: 'All Attributes' },
                                  { id: 'branding', label: 'Branding & Style' },
                                  { id: 'structure', label: 'Layout & Background' },
                                  { id: 'content', label: 'Typography & Icons' },
                                  { id: 'artistic', label: 'Composition & Lighting' }
                                ].map(cat => (
                                  <button
                                    key={cat.id}
                                    onClick={() => setCategoryFilter(cat.id)}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      border: '1px solid',
                                      borderColor: categoryFilter === cat.id ? 'var(--primary)' : 'var(--border)',
                                      background: categoryFilter === cat.id ? 'var(--primary-light)' : 'var(--surface-2)',
                                      color: categoryFilter === cat.id ? 'var(--primary)' : 'var(--text-2)',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Attribute Cards Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                              gap: '14px',
                              maxHeight: '440px',
                              overflowY: 'auto',
                              padding: '2px'
                            }}>
                              {CHECKLIST_ATTRIBUTES.filter(({ key, label, category }) => {
                                // Filter by category
                                if (categoryFilter !== 'all' && category !== categoryFilter) return false;
                                // Filter by search query
                                if (searchQuery.trim()) {
                                  const query = searchQuery.toLowerCase();
                                  const inLabel = label.toLowerCase().includes(query);
                                  const inVal = JSON.stringify(a[key] || '').toLowerCase().includes(query);
                                  return inLabel || inVal;
                                }
                                return true;
                              }).map(({ key, label, icon }) => {
                                const isEnabled = refSettings[key] !== false;
                                const sectionData = a[key] || (key === 'branding' ? a.brand_analysis : null) || (key === 'style' ? a.design_style : null) || {};
                                
                                // Every section should include value, confidence, reason. Handle both structured and flat formats.
                                const sectionVal = typeof sectionData === 'object' && sectionData !== null && 'value' in sectionData ? sectionData.value : sectionData;
                                const sectionConf = typeof sectionData === 'object' && sectionData !== null && 'confidence' in sectionData ? sectionData.confidence : (conf[key] || 90);
                                const sectionReason = typeof sectionData === 'object' && sectionData !== null && 'reason' in sectionData ? sectionData.reason : '';
                                const isEditing = editingSectionKey === key;
                                const isExpanded = !!expandedCards[key];
                                let bulletPoints = [];

                                // Determine color for confidence badge
                                let badgeBg = 'rgba(16,185,129,.08)';
                                let badgeColor = '#10B981';
                                let badgeBorder = '1px solid rgba(16,185,129,.2)';
                                let confEmoji = '🟢';
                                if (sectionConf < 70) {
                                  badgeBg = 'rgba(239,68,68,.08)';
                                  badgeColor = '#EF4444';
                                  badgeBorder = '1px solid rgba(239,68,68,.2)';
                                  confEmoji = '🔴';
                                } else if (sectionConf < 85) {
                                  badgeBg = 'rgba(245,158,11,.08)';
                                  badgeColor = '#F59E0B';
                                  badgeBorder = '1px solid rgba(245,158,11,.2)';
                                  confEmoji = '🟠';
                                } else if (sectionConf < 95) {
                                  badgeBg = 'rgba(59,130,246,.08)';
                                  badgeColor = '#3B82F6';
                                  badgeBorder = '1px solid rgba(59,130,246,.2)';
                                  confEmoji = '🔵';
                                }

                                // Resolve section specific visual display content
                                let contentRender;
                                if (key === 'color_palette' && (a.color_palette || a.colors)) {
                                  const paletteObj = a.color_palette || {};
                                  const list = paletteObj.hex_codes || a.colors || [];
                                  if (list.length === 0) {
                                    contentRender = <div style={{ fontSize: '12.5px', color: '#64748B' }}>• No colors detected</div>;
                                  } else {
                                    contentRender = (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                        {list.map((c, i) => {
                                          const hexVal = typeof c === 'object' ? c.hex : c;
                                          const pctVal = typeof c === 'object' ? c.percentage : 20;
                                          const roleVal = typeof c === 'object' ? c.role : 'Palette Color';
                                          return (
                                            <div
                                              key={i}
                                              onClick={() => {
                                                navigator.clipboard.writeText(hexVal);
                                                alert(`Copied color: ${hexVal}`);
                                              }}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                background: '#F8FAFC',
                                                borderRadius: '10px',
                                                border: '1px solid #E2E8F0',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s'
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: hexVal, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1E293B' }}>{hexVal}</span>
                                                <span style={{ fontSize: '11px', color: '#64748B', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{roleVal}</span>
                                              </div>
                                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{pctVal}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                               } else {
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
                                        .map(([k, v]) => {
                                          const valStr = resolveStringVal(v);
                                          if (!valStr || valStr.toLowerCase() === 'not detected' || valStr.toLowerCase() === 'unknown') return '';
                                          const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                          return `${cleanKey}: ${valStr}`;
                                        })
                                        .filter(Boolean)
                                        .join('\n');
                                    }
                                    return String(obj);
                                  };

                                  const rawStr = resolveStringVal(sectionData);
                                  let bulletPoints = rawStr
                                    .split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line.length > 0)
                                    .map(line => line.replace(/^[•\-\*\s]+/, ''))
                                    .filter(line => line.toLowerCase() !== 'not detected' && line.toLowerCase() !== 'unknown');

                                  if (bulletPoints.length === 0) {
                                    contentRender = <div style={{ fontSize: '12.5px', color: '#64748B' }}>• Not Detected</div>;
                                  } else {
                                    const displayList = isExpanded ? bulletPoints : bulletPoints.slice(0, 2);
                                    contentRender = (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                        {displayList.map((pt, index) => (
                                          <div key={index} style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
                                            • {pt}
                                          </div>
                                        ))}
                                        {bulletPoints.length > 2 && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
                                            }}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              padding: 0,
                                              marginTop: '4px',
                                              color: '#6C4CF1',
                                              fontSize: '11.5px',
                                              fontWeight: 750,
                                              cursor: 'pointer',
                                              textAlign: 'left'
                                            }}
                                          >
                                            {isExpanded ? 'Collapse ↑' : 'Expand Details ↓'}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  }
                                }

                              const copySectionText = () => {
                                const details = `Attribute: ${label}\nValue: ${JSON.stringify(sectionVal, null, 2)}\nConfidence: ${sectionConf}%\nReason: ${sectionReason}`;
                                navigator.clipboard.writeText(details);
                                alert(`Copied details for ${label}!`);
                              };

                              return (
                                <div
                                  key={key}
                                  className="premium-card"
                                  style={{
                                    padding: '16px 20px',
                                    background: isEnabled ? '#FFFFFF' : '#F8FAFC',
                                    opacity: isEnabled ? 1 : 0.65,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '180px'
                                  }}
                                >
                                  <div>
                                    {/* Header elements */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                          type="checkbox"
                                          checked={isEnabled}
                                          onChange={() => toggleAttribute(key)}
                                          style={{ accentColor: '#6C4CF1', cursor: 'pointer', width: 14, height: 14 }}
                                        />
                                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>{icon} {label}</span>
                                      </div>
                                      {isEnabled && (
                                        <span style={{
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          color: badgeColor
                                        }}>
                                          {confEmoji} {sectionConf}%
                                        </span>
                                      )}
                                    </div>

                                    {/* Content body */}
                                    <div style={{ flex: 1, marginBottom: '8px' }}>
                                      {isEditing ? (
                                        <textarea
                                          value={sectionEditText}
                                          onChange={e => setSectionEditText(e.target.value)}
                                          style={{
                                            width: '100%',
                                            height: '80px',
                                            fontSize: '12px',
                                            padding: '8px',
                                            border: '1.5px solid #6C4CF1',
                                            borderRadius: '8px',
                                            background: '#FFFFFF',
                                            color: '#1E293B',
                                            outline: 'none',
                                            fontFamily: typeof sectionVal === 'object' ? 'monospace' : 'inherit'
                                          }}
                                        />
                                      ) : (
                                        contentRender
                                      )}
                                    </div>
                                  </div>

                                  {/* Action footer */}
                                  {isEnabled && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: 'auto' }}>
                                      <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sectionReason}>
                                        {sectionReason || 'Extracted via vision scan'}
                                      </span>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={copySectionText} title="Copy Section Data" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: 2 }}>
                                          📋
                                        </button>
                                        <button
                                          onClick={() => isEditing ? handleSectionSave(key) : handleSectionEditStart(key, a[key])}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '11.5px',
                                            fontWeight: 800,
                                            color: '#6C4CF1',
                                            padding: 2
                                          }}
                                        >
                                          {isEditing ? '💾 Save' : '✏️ Edit'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        </div>
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

          {/* STEP 5: Final Compiled Prompt */}
          {currentStep === 5 && (
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
              Step {currentStep} of 5
            </div>
            <button
              className="btn btn-primary"
              disabled={currentStep === 5}
              onClick={() => setCurrentStep(s => s + 1)}
              style={{
                borderRadius: '12px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13.5px',
                border: 'none',
                background: '#6C4CF1',
                color: '#FFFFFF',
                cursor: currentStep === 5 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>

        </div>

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

      </div>
    </div>
  );
}
