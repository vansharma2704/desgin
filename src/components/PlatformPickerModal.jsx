import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, X, Check, Sparkles, Monitor, FileText, Printer, File, BookOpen,
  CreditCard, Award, Layout, Globe, Book, Mail, FileCheck, Building,
  Layers, Sliders, ChevronRight, ShieldCheck, Download
} from 'lucide-react';

/* ─── OFFICIAL PLATFORM SVG LOGOS ────────────────────────────────────────── */

function InstagramLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
      <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" fill="white" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

function FacebookLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path d="M15.5 12.5H13V20H10V12.5H8.5V10H10V8C10 6.34 11.12 5 13 5H15.5V7.5H14C13.45 7.5 13 7.95 13 8.5V10H15.5L15.5 12.5Z" fill="white" />
    </svg>
  );
}

function LinkedinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#0A66C2" />
      <path d="M6 9.5H8.5V18H6V9.5ZM7.25 6C6.42 6 5.75 6.67 5.75 7.5C5.75 8.33 6.42 9 7.25 9C8.08 9 8.75 8.33 8.75 7.5C8.75 6.67 8.08 6 7.25 6ZM10.5 9.5H12.8V10.7H12.83C13.15 10.1 13.93 9.4 15.2 9.4C17.8 9.4 18.3 11.1 18.3 13.3V18H15.8V14.1C15.8 13.15 15.78 11.95 14.48 11.95C13.15 11.95 12.95 12.98 12.95 14V18H10.5V9.5Z" fill="white" />
    </svg>
  );
}

function TwitterXLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#0F1419" />
      <path d="M14.25 10.15L19.2 4.4H18.03L13.73 9.4L10.3 4.4H6.35L11.54 11.95L6.35 18H7.52L12.06 12.7L15.7 18H19.65L14.25 10.15ZM12.66 12.01L12.13 11.25L7.94 5.26H9.74L13.13 10.11L13.66 10.87L18.03 17.13H16.23L12.66 12.01Z" fill="white" />
    </svg>
  );
}

function PinterestLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#E60023" />
      <path d="M12 4C7.58 4 4 7.58 4 12C4 15.4 6.13 18.3 9.15 19.46C9.09 18.82 9.03 17.84 9.18 17.2C9.31 16.63 10.02 13.62 10.02 13.62C10.02 13.62 9.8 13.18 9.8 12.53C9.8 11.5 10.4 10.73 11.14 10.73C11.77 10.73 12.07 11.2 12.07 11.77C12.07 12.4 11.67 13.35 11.47 14.2C11.3 14.93 11.84 15.53 12.56 15.53C13.86 15.53 14.86 14.16 14.86 12.18C14.86 10.42 13.6 9.18 11.78 9.18C9.69 9.18 8.46 10.74 8.46 12.39C8.46 13.02 8.7 13.69 8.99 14.04C9.05 14.11 9.06 14.17 9.04 14.25L8.83 15.11C8.8 15.24 8.71 15.28 8.58 15.22C7.72 14.82 7.18 13.56 7.18 12.35C7.18 9.84 9.01 7.55 12.32 7.55C14.98 7.55 17.04 9.45 17.04 12.12C17.04 14.76 15.38 16.89 13.08 16.89C12.31 16.89 11.59 16.49 11.34 16.01L10.87 17.8C10.7 18.46 10.23 19.28 9.9 19.82C10.58 20.03 11.28 20.14 12 20.14C16.42 20.14 20 16.56 20 12.14C20 7.58 16.42 4 12 4Z" fill="white" />
    </svg>
  );
}

function WhatsappLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M17.47 14.38C17.17 14.23 15.7 13.5 15.42 13.4C15.15 13.3 14.95 13.3 14.75 13.6C14.55 13.9 13.98 14.57 13.8 14.77C13.62 14.97 13.45 15 13.15 14.85C12.85 14.7 11.89 14.39 10.75 13.37C9.86 12.58 9.26 11.6 9.09 11.3C8.91 11 9.07 10.86 9.22 10.71C9.35 10.58 9.51 10.37 9.66 10.2C9.81 10.03 9.86 9.9 9.96 9.7C10.06 9.5 10.01 9.33 9.94 9.18C9.86 9.03 9.3 7.65 9.06 7.08C8.83 6.53 8.6 6.6 8.43 6.6C8.27 6.6 8.07 6.6 7.87 6.6C7.67 6.6 7.35 6.67 7.08 6.97C6.8 7.27 6.03 8 6.03 9.47C6.03 10.94 7.1 12.36 7.25 12.56C7.4 12.76 9.35 15.77 12.35 17.07C13.06 17.38 13.62 17.57 14.05 17.7C14.77 17.93 15.42 17.9 15.94 17.82C16.52 17.73 17.73 17.08 17.98 16.38C18.23 15.68 18.23 15.08 18.15 14.96C18.07 14.84 17.87 14.77 17.57 14.62" fill="white" />
    </svg>
  );
}

function YoutubeLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M10 15L15 12L10 9V15Z" fill="white" />
    </svg>
  );
}

function TiktokLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path d="M16.6 8.2C15.5 8.2 14.5 7.7 13.8 6.9V13.5C13.8 15.7 12 17.5 9.8 17.5C7.6 17.5 5.8 15.7 5.8 13.5C5.8 11.3 7.6 9.5 9.8 9.5C10.2 9.5 10.6 9.6 11 9.7V11.9C10.6 11.7 10.2 11.6 9.8 11.6C8.8 11.6 7.9 12.5 7.9 13.5C7.9 14.5 8.8 15.4 9.8 15.4C10.8 15.4 11.7 14.5 11.7 13.5V4H13.8C13.8 5.2 14.8 6.2 16 6.2V8.2H16.6Z" fill="#25F4EE" />
      <path d="M16 6.2C14.8 6.2 13.8 5.2 13.8 4V3.5H11.7V13.5C11.7 14.5 10.8 15.4 9.8 15.4C9.5 15.4 9.2 15.3 8.9 15.2C9.4 15.7 10.1 16 10.8 16C12.4 16 13.8 14.7 13.8 13.1V6.9C14.5 7.7 15.5 8.2 16.6 8.2V6.2H16Z" fill="#FE2C55" />
    </svg>
  );
}

/* Helper map to render platform logo SVG */
function PlatformLogo({ brand, category, name, size = 28 }) {
  if (brand === 'instagram') return <InstagramLogo size={size} />;
  if (brand === 'facebook') return <FacebookLogo size={size} />;
  if (brand === 'linkedin') return <LinkedinLogo size={size} />;
  if (brand === 'twitter') return <TwitterXLogo size={size} />;
  if (brand === 'pinterest') return <PinterestLogo size={size} />;
  if (brand === 'whatsapp') return <WhatsappLogo size={size} />;
  if (brand === 'youtube') return <YoutubeLogo size={size} />;
  if (brand === 'tiktok') return <TiktokLogo size={size} />;

  // Category fallback SVG icons
  const iconProps = { size, color: '#6C4CF1', strokeWidth: 2 };
  if (category === 'Presentation' || name.includes('Slide') || name.includes('Deck')) return <Monitor {...iconProps} />;
  if (name.includes('Poster')) return <Layout {...iconProps} />;
  if (name.includes('Flyer')) return <FileText {...iconProps} />;
  if (name.includes('Brochure')) return <BookOpen {...iconProps} />;
  if (name.includes('Card')) return <CreditCard {...iconProps} />;
  if (name.includes('Certificate')) return <Award {...iconProps} />;
  if (name.includes('Magazine')) return <Book {...iconProps} />;
  if (name.includes('Banner')) return <Globe {...iconProps} />;
  if (category === 'Proposal') return <FileCheck {...iconProps} />;
  if (category === 'Print') return <Printer {...iconProps} />;

  return <Sliders {...iconProps} />;
}

/* ─── PLATFORMS PRESET DATA ENRICHMENT ───────────────────────────────────── */

export const PLATFORM_CATEGORIES = [
  { id: 'Social Media', label: 'Social Media', icon: '📱' },
  { id: 'Presentation', label: 'Presentation', icon: '📊' },
  { id: 'Print', label: 'Print', icon: '🖨️' },
  { id: 'Marketing', label: 'Marketing', icon: '🚀' },
  { id: 'Proposal', label: 'Proposal', icon: '📄' },
  { id: 'Custom', label: 'Custom Canvas', icon: '⚙️' }
];

export const ENRICHED_PLATFORMS = [
  // Social Media
  {
    id: 'ig-post', name: 'Instagram Post', width: 1080, height: 1080, unit: 'px',
    shape: 'Square', aspect: '1:1', category: 'Social Media', brand: 'instagram',
    desc: 'Social Feed & Carousel', format: 'PNG / JPG',
    perfectFor: ['Feed Posts', 'Product Promotions', 'Brand Campaigns'],
    safeArea: 'Safe margins: 108px (10%) on all sides for clean rendering.'
  },
  {
    id: 'ig-story', name: 'Instagram Story', width: 1080, height: 1920, unit: 'px',
    shape: 'Portrait', aspect: '9:16', category: 'Social Media', brand: 'instagram',
    desc: 'Story & Reels Format', format: 'PNG / MP4',
    perfectFor: ['Vertical Stories', 'Reels Covers', 'Full-Screen Visuals'],
    safeArea: 'Keep text & key logos 250px away from top & bottom UI overlays.'
  },
  {
    id: 'fb-post', name: 'Facebook Post', width: 1200, height: 630, unit: 'px',
    shape: 'Landscape', aspect: '1.91:1', category: 'Social Media', brand: 'facebook',
    desc: 'News Feed Image', format: 'PNG / JPG',
    perfectFor: ['Link Previews', 'Timeline Ads', 'Community Posts'],
    safeArea: 'Ideal 1.91:1 aspect ratio for desktop & mobile news feeds.'
  },
  {
    id: 'li-post', name: 'LinkedIn Post', width: 1200, height: 627, unit: 'px',
    shape: 'Landscape', aspect: '1.91:1', category: 'Social Media', brand: 'linkedin',
    desc: 'Professional Feed', format: 'PNG / PDF',
    perfectFor: ['Corporate Announcements', 'Thought Leadership', 'Industry Insights'],
    safeArea: 'High legibility typography recommended for desktop feed viewing.'
  },
  {
    id: 'tw-post', name: 'X (Twitter) Post', width: 1600, height: 900, unit: 'px',
    shape: 'Landscape', aspect: '16:9', category: 'Social Media', brand: 'twitter',
    desc: 'Feed & Banner Visual', format: 'PNG / JPG',
    perfectFor: ['Tweet Media', 'Product Teasers', 'Event Highlights'],
    safeArea: 'Centered composition ensures no clipping in in-feed media preview.'
  },
  {
    id: 'pin-pin', name: 'Pinterest Pin', width: 1000, height: 1500, unit: 'px',
    shape: 'Portrait', aspect: '2:3', category: 'Social Media', brand: 'pinterest',
    desc: 'Vertical Idea Pin', format: 'PNG / JPG',
    perfectFor: ['Infographics', 'Recipe Cards', 'E-commerce Discovery'],
    safeArea: 'Optimal 2:3 vertical aspect ratio for mobile feed scrolling.'
  },
  {
    id: 'wa-status', name: 'WhatsApp Status', width: 1080, height: 1920, unit: 'px',
    shape: 'Portrait', aspect: '9:16', category: 'Social Media', brand: 'whatsapp',
    desc: 'Status & Story Media', format: 'PNG / JPG',
    perfectFor: ['Customer Updates', 'Flash Sales', 'Direct Messaging'],
    safeArea: 'Keep crucial info within central 9:16 vertical viewport.'
  },
  {
    id: 'yt-thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, unit: 'px',
    shape: 'Landscape', aspect: '16:9', category: 'Social Media', brand: 'youtube',
    desc: 'Video Cover Graphic', format: 'JPG / PNG',
    perfectFor: ['Video Thumbnails', 'Channel Banners', 'Series Covers'],
    safeArea: 'Avoid bottom-right corner where timestamp badge appears.'
  },

  // Presentation
  {
    id: 'pres-169', name: '16:9 Presentation', width: 1920, height: 1080, unit: 'px',
    shape: 'Landscape', aspect: '16:9', category: 'Presentation',
    desc: 'Widescreen Slide Deck', format: 'PDF / PPTX',
    perfectFor: ['Corporate Keynotes', 'Client Presentations', 'Webinars'],
    safeArea: 'Maintain 5% outer margin for projector safe area.'
  },
  {
    id: 'pres-43', name: '4:3 Presentation', width: 1024, height: 768, unit: 'px',
    shape: 'Landscape', aspect: '4:3', category: 'Presentation',
    desc: 'Standard Slide Aspect', format: 'PDF / PPTX',
    perfectFor: ['Legacy Displays', 'Academic Slides', 'Print Outlines'],
    safeArea: 'Classic 4:3 display ratio with balanced horizontal margins.'
  },
  {
    id: 'pitch-deck', name: 'Pitch Deck', width: 1920, height: 1080, unit: 'px',
    shape: 'Landscape', aspect: '16:9', category: 'Presentation',
    desc: 'Investor Pitch Slides', format: 'PDF',
    perfectFor: ['Startup Fundraising', 'Financial Overviews', 'Product Demos'],
    safeArea: 'High contrast text and clean chart layout zones.'
  },
  {
    id: 'conf-slide', name: 'Conference Slide', width: 1920, height: 1080, unit: 'px',
    shape: 'Landscape', aspect: '16:9', category: 'Presentation',
    desc: 'Stage Screen Projection', format: 'PDF / PNG',
    perfectFor: ['Large Format Screens', 'Keynote Speakers', 'Event Stages'],
    safeArea: 'Large readable font size (minimum 28pt for body text).'
  },

  // Print
  {
    id: 'print-poster', name: 'Poster Frame', width: 2480, height: 3508, unit: 'px',
    shape: 'Portrait', aspect: '3:4', category: 'Print',
    desc: 'A3 High-Res Display', format: 'PDF (Print Quality)',
    perfectFor: ['Event Advertising', 'Wall Art', 'Retail Displays'],
    safeArea: 'Include 3mm bleed margin for professional offset printing.'
  },
  {
    id: 'print-flyer', name: 'Flyer', width: 1748, height: 2480, unit: 'px',
    shape: 'Portrait', aspect: 'A5', category: 'Print',
    desc: 'Promotional Handout', format: 'PDF / PNG',
    perfectFor: ['Local Promotion', 'Event Handouts', 'Direct Mail'],
    safeArea: 'Keep body text 5mm inside standard trim line.'
  },
  {
    id: 'print-brochure', name: 'Brochure', width: 2550, height: 1170, unit: 'px',
    shape: 'Landscape', aspect: 'Tri-fold', category: 'Print',
    desc: 'Tri-fold Company Leaflet', format: 'PDF',
    perfectFor: ['Corporate Overviews', 'Service Offerings', 'Product Catalogs'],
    safeArea: 'Observe tri-fold fold-lines (85mm per panel width).'
  },
  {
    id: 'print-bizcard', name: 'Business Card', width: 1050, height: 600, unit: 'px',
    shape: 'Landscape', aspect: '3.5:2', category: 'Print',
    desc: 'Standard Business Card', format: 'PDF / Vector SVG',
    perfectFor: ['Executive Networking', 'Contact Cards', 'Brand Identity'],
    safeArea: 'Maintain 3mm safety margin inside standard die-cut lines.'
  },
  {
    id: 'print-standee', name: 'Standee Banner', width: 2400, height: 6000, unit: 'px',
    shape: 'Portrait', aspect: '1:2.5', category: 'Print',
    desc: 'Event Standee Display', format: 'PDF / High-Res TIFF',
    perfectFor: ['Trade Shows', 'Lobby Displays', 'Exhibition Entrances'],
    safeArea: 'Keep key headlines in upper 60% of vertical height.'
  },
  {
    id: 'print-cert', name: 'Certificate', width: 3508, height: 2480, unit: 'px',
    shape: 'Landscape', aspect: 'A4', category: 'Print',
    desc: 'Official Award Sheet', format: 'PDF',
    perfectFor: ['Course Completion', 'Employee Recognition', 'Awards'],
    safeArea: 'Centered border layout with space for official seal & signature.'
  },

  // Marketing
  {
    id: 'mkt-poster', name: 'Campaign Poster', width: 1200, height: 1800, unit: 'px',
    shape: 'Portrait', aspect: '2:3', category: 'Marketing',
    desc: 'Key Campaign Visual', format: 'PNG / JPG',
    perfectFor: ['Omnichannel Ads', 'Brand Awareness', 'Social Campaigns'],
    safeArea: 'Bold headline area at top with product showcase in center.'
  },
  {
    id: 'mkt-rollup', name: 'Rollup Banner', width: 800, height: 2000, unit: 'px',
    shape: 'Portrait', aspect: '1:2.5', category: 'Marketing',
    desc: 'Exhibition Rollup', format: 'PDF / TIFF',
    perfectFor: ['Event Sponsorship', 'Exhibition Booths', 'Point of Sale'],
    safeArea: 'Bottom 200mm should contain secondary contact details.'
  },
  {
    id: 'mkt-webbanner', name: 'Web Banner', width: 1200, height: 400, unit: 'px',
    shape: 'Landscape', aspect: '3:1', category: 'Marketing',
    desc: 'Website Hero & Ads', format: 'PNG / WebP',
    perfectFor: ['Website Headers', 'Digital Ad Networks', 'Email Headers'],
    safeArea: 'Horizontal focal flow from left-aligned CTA to right image.'
  },
  {
    id: 'mkt-magcover', name: 'Magazine Cover', width: 2550, height: 3300, unit: 'px',
    shape: 'Portrait', aspect: '8.5:11', category: 'Marketing',
    desc: 'Editorial Front Cover', format: 'PDF / High-Res PNG',
    perfectFor: ['Digital Publications', 'Brand Magazines', 'Lookbooks'],
    safeArea: 'Top masthead clearance for brand title logo.'
  },

  // Proposal
  {
    id: 'prop-cover', name: 'Proposal Cover', width: 2480, height: 3508, unit: 'px',
    shape: 'Portrait', aspect: 'A4', category: 'Proposal',
    desc: 'Document Front Cover', format: 'PDF',
    perfectFor: ['RFP Submissions', 'Client Proposals', 'Project Bids'],
    safeArea: 'Clean title zone with date and client organization meta.'
  },
  {
    id: 'prop-page', name: 'Proposal Page', width: 2480, height: 3508, unit: 'px',
    shape: 'Portrait', aspect: 'A4', category: 'Proposal',
    desc: 'Internal Page Layout', format: 'PDF',
    perfectFor: ['Project Scope', 'Pricing Tables', 'Timelines'],
    safeArea: 'Standard A4 page margins (20mm left/right).'
  },
  {
    id: 'prop-profile', name: 'Company Profile', width: 2480, height: 3508, unit: 'px',
    shape: 'Portrait', aspect: 'A4', category: 'Proposal',
    desc: 'Corporate Dossier', format: 'PDF',
    perfectFor: ['Company Overviews', 'Capabilities Statements', 'Team Profiles'],
    safeArea: 'Structured column grid for high readability.'
  }
];

/* ─── REALISTIC PROPORTIONAL MINI CANVAS PREVIEW ─────────────────────────── */

function MiniCanvasPreview({ width, height, isSelected, brand }) {
  const ratio = width && height ? width / height : 1;
  const maxW = 38;
  const maxH = 38;

  let renderW = maxW;
  let renderH = maxH;

  if (ratio >= 1) {
    renderW = maxW;
    renderH = Math.max(12, Math.round(maxW / ratio));
  } else {
    renderH = maxH;
    renderW = Math.max(12, Math.round(maxH * ratio));
  }

  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: '12px',
      background: isSelected ? 'rgba(108, 76, 241, 0.08)' : '#F8FAFC',
      border: `1.5px solid ${isSelected ? 'rgba(108, 76, 241, 0.3)' : '#E2E8F0'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        width: `${renderW}px`,
        height: `${renderH}px`,
        borderRadius: '3px',
        border: `2px solid ${isSelected ? '#6C4CF1' : '#94A3B8'}`,
        background: isSelected ? 'linear-gradient(135deg, #6C4CF1, #8B5CF6)' : '#CBD5E1',
        boxShadow: isSelected ? '0 2px 8px rgba(108, 76, 241, 0.3)' : 'none',
        transition: 'all 0.2s ease'
      }} />
    </div>
  );
}

/* ─── REUSABLE PLATFORM CARD COMPONENT ───────────────────────────────────── */

function PlatformCard({ platform, isSelected, onClick }) {
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        position: 'relative',
        padding: '16px 18px',
        borderRadius: '18px',
        border: isSelected ? '2px solid #6C4CF1' : '1.5px solid #E2E8F0',
        background: isSelected ? 'rgba(108, 76, 241, 0.04)' : '#FFFFFF',
        boxShadow: isSelected
          ? '0 10px 25px -5px rgba(108, 76, 241, 0.2), 0 0 0 1px #6C4CF1'
          : '0 2px 6px rgba(0,0,0,0.02)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isSelected ? 'scale(1.02)' : 'none',
        outline: 'none'
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#6C4CF1';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(108, 76, 241, 0.12)';
          e.currentTarget.style.background = 'rgba(108, 76, 241, 0.02)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
          e.currentTarget.style.background = '#FFFFFF';
        }
      }}
    >
      {/* TOP ROW: Official Logo & Selection Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <PlatformLogo brand={platform.brand} category={platform.category} name={platform.name} size={30} />

        {/* Animated Checkmark Indicator */}
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: isSelected ? 'none' : '2px solid #CBD5E1',
          background: isSelected ? '#6C4CF1' : 'transparent',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 2px 8px rgba(108, 76, 241, 0.4)' : 'none'
        }}>
          {isSelected && <Check size={13} strokeWidth={3} />}
        </div>
      </div>

      {/* CENTER: Name, Dimensions, & Proportional Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MiniCanvasPreview width={platform.width} height={platform.height} isSelected={isSelected} brand={platform.brand} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14.5px',
            fontWeight: 800,
            color: isSelected ? '#6C4CF1' : '#1E293B',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em'
          }}>
            {platform.name}
          </div>

          <div style={{ fontSize: '12.5px', fontWeight: 650, color: '#475569', marginTop: '2px' }}>
            {platform.width} × {platform.height} {platform.unit}
          </div>
        </div>
      </div>

      {/* BOTTOM: Aspect Badge & Description */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid #F1F5F9'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 750,
          padding: '2px 8px',
          borderRadius: '10px',
          background: isSelected ? 'rgba(108, 76, 241, 0.12)' : '#F1F5F9',
          color: isSelected ? '#6C4CF1' : '#64748B'
        }}>
          {platform.aspect || platform.shape}
        </span>

        <span style={{
          fontSize: '11.5px',
          color: '#94A3B8',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '120px'
        }}>
          {platform.desc}
        </span>
      </div>
    </div>
  );
}

/* ─── MAIN PLATFORM PICKER MODAL COMPONENT ───────────────────────────────── */

export default function PlatformPickerModal({ isOpen, onClose, selectedPlatform, onSelectPlatform }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Social Media');
  const [tempSelected, setTempSelected] = useState(selectedPlatform || ENRICHED_PLATFORMS[0]);

  // Custom canvas inputs
  const [customName, setCustomName] = useState('');
  const [customW, setCustomW] = useState('1080');
  const [customH, setCustomH] = useState('1080');
  const [customUnit, setCustomUnit] = useState('px');

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (selectedPlatform) {
      setTempSelected(selectedPlatform);
      if (selectedPlatform.category) {
        setActiveCategory(selectedPlatform.category);
      }
    }
  }, [selectedPlatform, isOpen]);

  // Escape key & focus handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered platforms logic
  const filteredPlatforms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return ENRICHED_PLATFORMS.filter(p => p.category === activeCategory);
    }
    return ENRICHED_PLATFORMS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    const w = parseFloat(customW) || 1080;
    const h = parseFloat(customH) || 1080;
    const customObj = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || `Custom (${w}×${h} ${customUnit})`,
      width: w,
      height: h,
      unit: customUnit,
      shape: w === h ? 'Square' : w > h ? 'Landscape' : 'Portrait',
      aspect: `${w}:${h}`,
      category: 'Custom',
      desc: 'User Defined Canvas',
      format: 'PNG / JPG / SVG',
      perfectFor: ['Custom Layouts', 'Special Displays', 'Unique Formats'],
      safeArea: 'Custom dimensions canvas.'
    };
    onSelectPlatform(customObj);
    onClose();
  };

  const handleApplySelected = () => {
    if (activeCategory === 'Custom') {
      handleApplyCustom();
    } else if (tempSelected) {
      onSelectPlatform(tempSelected);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      {/* MODAL CARD CONTAINER */}
      <div
        style={{
          width: '1150px',
          maxWidth: '96vw',
          height: '86vh',
          maxHeight: '900px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER & SEARCH BAR */}
        <div style={{
          padding: '20px 32px 16px 32px',
          borderBottom: '1px solid #F1F5F9',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          {/* Title Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6C4CF1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 14px rgba(108, 76, 241, 0.3)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
                Platform Selection
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
                Choose the canvas format and dimensions for your design.
              </p>
            </div>
          </div>

          {/* Search Field */}
          <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              placeholder="Search platform (e.g. instagram, poster, business)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '42px',
                paddingRight: '36px',
                height: '42px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '13.5px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '38px', height: '38px', borderRadius: '12px',
              border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#1E293B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CATEGORY TABS BAR */}
        {!searchQuery && (
          <div style={{
            padding: '12px 32px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto'
          }}>
            {PLATFORM_CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: isActive ? '1.5px solid #6C4CF1' : '1px solid #E2E8F0',
                    background: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#6C4CF1' : '#64748B',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(108, 76, 241, 0.12)' : 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* MAIN BODY: 2-COLUMN LAYOUT (CARDS GRID + RIGHT PREVIEW PANEL) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#FFFFFF' }}>

          {/* LEFT COLUMN: CARDS GRID */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {activeCategory !== 'Custom' || searchQuery ? (
              filteredPlatforms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', color: '#64748B' }}>
                  <Search size={36} style={{ color: '#CBD5E1', marginBottom: '12px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>No matching platforms found</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>Try searching for "instagram", "poster", or "business card"</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredPlatforms.map(p => (
                    <PlatformCard
                      key={p.id || p.name}
                      platform={p}
                      isSelected={tempSelected?.name === p.name}
                      onClick={() => setTempSelected(p)}
                    />
                  ))}
                </div>
              )
            ) : (
              /* CUSTOM CANVAS FORM */
              <div style={{ maxWidth: '520px', margin: '16px auto 0 auto' }}>
                <div style={{
                  padding: '28px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                      Custom Dimensions
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Define custom width, height, and unit for your specific project requirements.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Preset Label (Optional)</label>
                    <input
                      className="input"
                      placeholder="e.g. Website Hero Banner"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      style={{ background: '#FFFFFF' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Width</label>
                      <input
                        type="number"
                        className="input"
                        value={customW}
                        onChange={e => setCustomW(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Height</label>
                      <input
                        type="number"
                        className="input"
                        value={customH}
                        onChange={e => setCustomH(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Unit</label>
                      <select
                        className="select"
                        value={customUnit}
                        onChange={e => setCustomUnit(e.target.value)}
                        style={{ background: '#FFFFFF' }}
                      >
                        <option value="px">px</option>
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                  </div>

                  {/* Proportional Preview Box */}
                  <div style={{
                    padding: '18px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Custom Ratio Preview</span>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                        {customW || 0} × {customH || 0} {customUnit}
                      </div>
                    </div>
                    <MiniCanvasPreview width={parseFloat(customW) || 1} height={parseFloat(customH) || 1} isSelected={true} />
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILED INSPECTION PANEL */}
          {tempSelected && activeCategory !== 'Custom' && (
            <div style={{
              width: '360px',
              borderLeft: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              padding: '28px 24px',
              overflowY: 'auto'
            }}>
              {/* Header Branding */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <PlatformLogo brand={tempSelected.brand} category={tempSelected.category} name={tempSelected.name} size={42} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0, letterSpacing: '-0.01em' }}>
                    {tempSelected.name}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 750,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(108, 76, 241, 0.1)',
                    color: '#6C4CF1',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}>
                    {tempSelected.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                {tempSelected.desc}
              </p>

              {/* Specification Grid */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Canvas Size</span>
                  <span style={{ color: '#1E293B', fontWeight: 750 }}>{tempSelected.width} × {tempSelected.height} {tempSelected.unit}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Aspect Ratio</span>
                  <span style={{ color: '#1E293B', fontWeight: 750 }}>{tempSelected.aspect || tempSelected.shape}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Orientation</span>
                  <span style={{ color: '#1E293B', fontWeight: 750 }}>{tempSelected.shape}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Export Formats</span>
                  <span style={{ color: '#6C4CF1', fontWeight: 750 }}>{tempSelected.format || 'PNG / JPG'}</span>
                </div>
              </div>

              {/* Perfect For List */}
              {tempSelected.perfectFor && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                    Perfect For:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tempSelected.perfectFor.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6C4CF1' }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Area Info */}
              {tempSelected.safeArea && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(108, 76, 241, 0.05)',
                  border: '1px solid rgba(108, 76, 241, 0.15)',
                  display: 'flex',
                  gap: '10px',
                  fontSize: '12px',
                  color: '#4C1D95',
                  lineHeight: '1.4'
                }}>
                  <ShieldCheck size={18} style={{ color: '#6C4CF1', flexShrink: 0 }} />
                  <div>
                    <strong>Layout Guide:</strong> {tempSelected.safeArea}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid #F1F5F9',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            {tempSelected && activeCategory !== 'Custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Currently Selected:</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{tempSelected.name}</span>
                <span style={{
                  background: 'rgba(108, 76, 241, 0.08)',
                  color: '#6C4CF1',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 750
                }}>
                  {tempSelected.width} × {tempSelected.height} {tempSelected.unit}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 22px', borderRadius: '12px', fontWeight: 600 }}
            >
              Cancel
            </button>

            <button
              onClick={handleApplySelected}
              className="btn btn-primary"
              disabled={!tempSelected && activeCategory !== 'Custom'}
              style={{
                padding: '10px 26px',
                borderRadius: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(108, 76, 241, 0.3)',
                opacity: (!tempSelected && activeCategory !== 'Custom') ? 0.5 : 1,
                cursor: (!tempSelected && activeCategory !== 'Custom') ? 'not-allowed' : 'pointer'
              }}
            >
              <Check size={16} strokeWidth={3} /> Apply Platform
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
