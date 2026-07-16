import React from 'react';
import { ArrowLeft, Building2, Sparkles, ChevronRight } from 'lucide-react';

const OPTIONS = [
  {
    key: 'existing',
    icon: '🏢',
    title: 'Existing Brand',
    subtitle: 'Import an existing brand',
    description:
      'Already have brand guidelines, logo, and colors? Import all your assets and define your brand identity manually.',
    accent: '#5b5bd6',
  },
  {
    key: 'scratch',
    icon: '✨',
    title: 'Create New Brand',
    subtitle: 'Build a new brand with AI',
    description:
      'No brand identity yet? Walk through our AI-guided onboarding to generate colors, typography, tone, and a logo brief from scratch.',
    accent: '#16a34a',
  },
];

export default function CreateBrand({ onSelect, onBack }) {
  return (
    <div className="page">
      <button className="btn btn-ghost mb-24" onClick={onBack} style={{ paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="text-center mb-24" style={{ maxWidth: 540, margin: '0 auto 40px' }}>
        <h1 className="page-title">Create a Brand Profile</h1>
        <p className="page-subtitle mt-8">
          Choose how you want to build this brand identity inside AI Brand Studio.
        </p>
      </div>

      <div className="grid-2 anim-fade-up" style={{ maxWidth: 780, margin: '0 auto', gap: 24 }}>
        {OPTIONS.map(opt => (
          <div
            key={opt.key}
            className="card card-hover"
            style={{ cursor: 'pointer', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={() => onSelect(opt.key)}
          >
            <div style={{ fontSize: 44 }}>{opt.icon}</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                {opt.subtitle}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 10 }}>{opt.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{opt.description}</p>
            </div>
            <div
              className="flex items-center gap-6"
              style={{ color: opt.accent, fontWeight: 600, fontSize: 13, marginTop: 4 }}
            >
              Get Started <ChevronRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
