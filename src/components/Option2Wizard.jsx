import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Wand2, Check, Sparkles } from 'lucide-react';
import { extractBrandIdentity, generateLogoBrief } from '../utils/mockAi';

const INDUSTRIES = [
  'Sports & Fitness','Technology & AI','Luxury & Fashion','Health & Wellness',
  'Food & Beverage','Real Estate','Education','Finance','Entertainment','Other',
];

const PERSONALITIES = [
  'Modern','Professional','Premium','Sporty','Friendly','Minimal',
  'Luxury','Reliable','Bold','Creative','Innovative','Elegant','Playful','Trustworthy',
];

const TOTAL_STEPS = 7;

function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div className="flex items-center gap-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <React.Fragment key={i}>
            <div
              className={`step-dot ${i < step ? 'done' : ''} ${i === step - 1 ? 'current' : ''}`}
            />
            {i < TOTAL_STEPS - 1 && <div className={`step-line ${i < step - 1 ? 'done' : ''}`} style={{ flex: 1 }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, fontWeight: 500 }}>
        Step {step} of {TOTAL_STEPS}
      </div>
    </div>
  );
}

export default function Option2Wizard({ onSave, onBack }) {
  const [step, setStep]             = useState(1);
  const [name, setName]             = useState('');
  const [industry, setIndustry]     = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience]     = useState('');
  const [personality, setPersonality] = useState([]);
  const [logoFile, setLogoFile]     = useState(null);
  const [logoUrl, setLogoUrl]       = useState('');
  const [logoBrief, setLogoBrief]   = useState('');
  const [logoAction, setLogoAction] = useState(null); // 'upload'|'brief'|'skip'
  const [generating, setGenerating] = useState(false);
  const [identity, setIdentity]     = useState(null);

  const togglePersonality = (p) =>
    setPersonality(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const handleLogoUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoUrl(URL.createObjectURL(f));
    setLogoAction('upload');
  };

  const handleGenerateBrief = () => {
    const brief = generateLogoBrief({ name, industry, description, personality });
    setLogoBrief(brief);
    setLogoAction('brief');
  };

  const handleGenerateIdentity = () => {
    setGenerating(true);
    setTimeout(() => {
      const id = extractBrandIdentity(name, industry);
      // Merge personality into style
      const personalityStr = personality.join(', ');
      setIdentity({
        ...id,
        style: personalityStr ? `${personalityStr}, ${id.style}` : id.style,
        tone: id.tone,
      });
      setGenerating(false);
    }, 1200);
  };

  const updateIdentity = (key, val) =>
    setIdentity(prev => ({ ...prev, [key]: val }));
  const updateColor = (i, val) => {
    const next = [...identity.colors]; next[i] = val;
    setIdentity(prev => ({ ...prev, colors: next }));
  };
  const updateTypo = (key, val) =>
    setIdentity(prev => ({ ...prev, typography: { ...prev.typography, [key]: val } }));

  const handleSave = () => {
    const brand = {
      id: 'brand-' + Date.now(),
      name, industry, description, targetAudience: audience,
      personality,
      logoUrl,
      ...identity,
      assets: logoFile ? [{ id: 'a-' + Date.now(), name: logoFile.name, role: 'Logo', previewUrl: logoUrl }] : [],
    };
    onSave(brand);
  };

  const nextDisabled = () => {
    if (step === 1 && !name.trim())  return true;
    if (step === 2 && !industry)     return true;
    return false;
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <button className="btn btn-ghost mb-24" onClick={onBack} style={{ paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>
        ✨ AI Brand Builder
      </div>
      <ProgressBar step={step} />

      <div className="card anim-fade-up" style={{ padding: 36 }}>

        {/* Step 1: Name */}
        {step === 1 && (
          <>
            <div className="wizard-step-label">Step 1</div>
            <div className="wizard-step-title">What's the brand name?</div>
            <div className="wizard-step-body">This becomes the foundation of your AI identity profile.</div>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input className="input" style={{ fontSize: 18, padding: '14px 16px' }}
                value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. POCO Athletics, Aura, Nova" />
            </div>
          </>
        )}

        {/* Step 2: Industry */}
        {step === 2 && (
          <>
            <div className="wizard-step-label">Step 2</div>
            <div className="wizard-step-title">What industry is it in?</div>
            <div className="wizard-step-body">AI uses your industry to suggest colors, typography, and tone.</div>
            <div className="chip-group">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  className={`chip ${industry === ind ? 'selected' : ''}`}
                  onClick={() => setIndustry(ind)}
                >
                  {ind}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <>
            <div className="wizard-step-label">Step 3</div>
            <div className="wizard-step-title">Tell us about the business</div>
            <div className="wizard-step-body">Help AI understand what makes this brand unique.</div>
            <div className="form-group">
              <textarea
                className="textarea"
                style={{ minHeight: 120, fontSize: 14 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you do, what you sell, and what makes your business unique."
              />
            </div>
          </>
        )}

        {/* Step 4: Audience */}
        {step === 4 && (
          <>
            <div className="wizard-step-label">Step 4</div>
            <div className="wizard-step-title">Who is the target audience?</div>
            <div className="wizard-step-body">This helps AI calibrate the right tone and visual language.</div>
            <div className="form-group">
              <textarea
                className="textarea"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. Professional cricketers aged 18–35, passionate about performance gear"
              />
            </div>
          </>
        )}

        {/* Step 5: Personality */}
        {step === 5 && (
          <>
            <div className="wizard-step-label">Step 5</div>
            <div className="wizard-step-title">Brand Personality</div>
            <div className="wizard-step-body">Select the traits that define the brand's visual identity.</div>
            <div className="chip-group">
              {PERSONALITIES.map(p => (
                <button
                  key={p}
                  className={`chip ${personality.includes(p) ? 'selected' : ''}`}
                  onClick={() => togglePersonality(p)}
                >
                  {personality.includes(p) && <Check size={12} />}
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 6: Logo */}
        {step === 6 && (
          <>
            <div className="wizard-step-label">Step 6</div>
            <div className="wizard-step-title">Logo</div>
            <div className="wizard-step-body">Upload a logo for AI to extract identity, generate a brief, or skip.</div>

            {!logoAction && (
              <div className="flex-col gap-12">
                <label className="upload-zone" style={{ cursor: 'pointer' }}>
                  <Upload size={24} />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Upload Logo</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>AI extracts colors, style & tone</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
                <button className="btn btn-secondary btn-full" onClick={handleGenerateBrief}>
                  <Wand2 size={15} /> Generate Logo Design Brief
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => setLogoAction('skip')}>
                  Skip for now
                </button>
              </div>
            )}

            {logoAction === 'upload' && logoUrl && (
              <div className="flex-col gap-12">
                <div className="flex items-center gap-12" style={{ padding: '12px 16px', background: 'var(--success-light)', borderRadius: 'var(--r-lg)', color: 'var(--success)' }}>
                  <Check size={16} /> Logo uploaded — AI will extract identity on save
                </div>
                <img src={logoUrl} alt="logo" style={{ maxHeight: 80, objectFit: 'contain', margin: '0 auto', borderRadius: 'var(--r-md)' }} />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  Change File <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
              </div>
            )}

            {logoAction === 'brief' && (
              <div className="form-group mt-8">
                <label className="form-label">Generated Logo Brief (editable)</label>
                <textarea className="textarea mono" rows="8" value={logoBrief} onChange={e => setLogoBrief(e.target.value)} />
              </div>
            )}

            {logoAction === 'skip' && (
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)' }}>
                Skipped. AI will generate an identity without logo-based extraction.
              </div>
            )}
          </>
        )}

        {/* Step 7: Generate Identity */}
        {step === 7 && (
          <>
            <div className="wizard-step-label">Step 7</div>
            <div className="wizard-step-title">Generate Brand Identity</div>
            <div className="wizard-step-body">AI generates a complete brand system. All fields are editable before saving.</div>

            {!identity && (
              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleGenerateIdentity}
                disabled={generating}
              >
                <Sparkles size={17} />
                {generating ? 'Generating…' : 'Generate Brand Identity'}
              </button>
            )}

            {identity && (
              <div className="flex-col gap-20 anim-fade-up mt-12">
                {/* Colors */}
                <div>
                  <div className="section-title mb-10">Brand Colors</div>
                  <div className="flex-col gap-8">
                    {identity.colors.map((c, i) => (
                      <div key={i} className="color-edit-row">
                        <div className="swatch">
                          <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} />
                        </div>
                        <span className="color-label">{i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Accent'}</span>
                        <input className="hex-input" value={c} onChange={e => updateColor(i, e.target.value)} maxLength={7} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <div className="section-title mb-10">Typography</div>
                  <div className="grid-3 gap-12">
                    {[['heading','Heading'],['body','Body'],['accent','Accent']].map(([k,l]) => (
                      <div className="form-group" key={k}>
                        <label className="form-label">{l}</label>
                        <input className="input" style={{ fontSize: 12.5 }}
                          value={identity.typography[k]} onChange={e => updateTypo(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style & Tone */}
                <div className="grid-2 gap-12">
                  <div className="form-group">
                    <label className="form-label">Brand Style</label>
                    <input className="input" value={identity.style} onChange={e => updateIdentity('style', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand Tone</label>
                    <input className="input" value={identity.tone} onChange={e => updateIdentity('tone', e.target.value)} />
                  </div>
                </div>

                {/* Dos & Don'ts */}
                <div className="grid-2 gap-16">
                  {[['dos',"Do's",'var(--success)'],['donts',"Don'ts",'var(--danger)']].map(([key,label,color]) => (
                    <div key={key}>
                      <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 8 }}>{label}</div>
                      <div className="flex-col gap-6">
                        {(identity[key] || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-6" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
                            <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{key === 'dos' ? '✓' : '✗'}</span>
                            <input className="input" style={{ fontSize: 12.5 }} value={item}
                              onChange={e => {
                                const next = [...identity[key]]; next[i] = e.target.value;
                                updateIdentity(key, next);
                              }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div
          className="flex justify-between items-center"
          style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}
        >
          <button className="btn btn-ghost" onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}>
            <ArrowLeft size={15} /> {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < TOTAL_STEPS ? (
            <button
              className="btn btn-primary"
              disabled={nextDisabled()}
              onClick={() => {
                if (step === 6 && !logoAction) { setLogoAction('skip'); }
                setStep(s => s + 1);
              }}
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSave}
              disabled={!identity}
            >
              Save Brand <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
