import React, { useState } from 'react';
import {
  LayoutGrid, Sparkles, MonitorPlay, BookMarked, ChevronRight, History,
} from 'lucide-react';

import Dashboard    from './components/Dashboard';
import CreateBrand  from './components/CreateBrand';
import Option1Form  from './components/Option1Form';
import Option2Wizard from './components/Option2Wizard';
import BrandDetails from './components/BrandDetails';
import Platforms    from './components/Platforms';
import PromptBuilder from './components/PromptBuilder';

const SEED_BRANDS = [
  {
    id: 'brand-poco',
    name: 'POCO Athletics',
    industry: 'Sports & Fitness',
    description: 'Performance sports equipment brand built for professional cricketers.',
    colors: ['#FF3B30','#1C1C1E','#FFCC00'],
    typography: { heading:'Barlow Condensed', body:'Archivo', accent:'Oswald' },
    style: 'Bold, Athletic, High-Energy',
    tone: 'Confident, Powerful, Premium',
    dos: ['Lead with primary red #FF3B30.','Maintain bold typographic hierarchy.'],
    campaigns: ['Product Launch', 'Summer Campaign', 'Winter Collection', 'Brand Awareness'],
    assets: [
      { id:'a1', name:'poco-logo.png',       role:'Logo',               previewUrl:'' },
      { id:'a2', name:'white-cricket-ball.png', role:'Product Images',  previewUrl:'' },
      { id:'a3', name:'rainy-stadium.jpg',   role:'Environment Images', previewUrl:'' },
      { id:'a4', name:'sports-poster-ref.jpg', role:'Style References', previewUrl:'' },
    ],
  },
];

function Sidebar({ view, setView, brands, selectedBrandId, setSelectedBrandId }) {
  const navItems = [
    { key:'dashboard',  label:'Dashboard',     icon:<LayoutGrid size={16}/> },
    { key:'platforms',  label:'Platforms',     icon:<MonitorPlay size={16}/> },
    { key:'builder',    label:'Prompt Builder', icon:<Sparkles size={16}/> },
    { key:'history',    label:'Saved Prompts', icon:<BookMarked size={16}/> },
  ];

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={16} color="#fff" />
        </div>
        <div className="sidebar-logo-text">AI Brand<br/><span>Studio</span></div>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Workspace</div>
      {navItems.map(item => (
        <button
          key={item.key}
          className={`nav-item ${view === item.key ? 'active' : ''}`}
          onClick={() => setView(item.key)}
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
            style={{ fontSize:12, padding:'6px 10px' }}
            value={selectedBrandId}
            onChange={e => setSelectedBrandId(e.target.value)}
          >
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
    </nav>
  );
}

function PromptHistory({ prompts, onBack }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Prompts</h1>
          <p className="page-subtitle mt-4">Prompts saved from the AI Prompt Builder.</p>
        </div>
      </div>
      {prompts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><BookMarked size={22} /></div>
            <div className="empty-title">No Saved Prompts</div>
            <div className="empty-body">Use the AI Prompt Builder and click "Save" to archive prompts here.</div>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-16 stagger">
          {prompts.map(p => (
            <div key={p.id} className="card anim-fade-up">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{p.title}</div>
                  <div className="flex items-center gap-8 mt-4">
                    <span className="badge badge-gray">{p.brandName}</span>
                    <span className="badge badge-primary">{p.platform}</span>
                    <span style={{ fontSize:11.5, color:'var(--text-3)' }}>{p.ts}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(p.prompt)}>
                  Copy
                </button>
              </div>
              <pre style={{
                fontFamily:'Menlo,Consolas,monospace', fontSize:11.5, lineHeight:1.7,
                background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                padding:16, maxHeight:200, overflow:'auto', whiteSpace:'pre-wrap', color:'var(--text-2)',
              }}>
                {p.prompt}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView]           = useState('dashboard');
  const [brands, setBrands]       = useState(SEED_BRANDS);
  const [selectedBrandId, setSelectedBrandId] = useState(SEED_BRANDS[0]?.id || null);
  const [activeBrandId, setActiveBrandId] = useState(null); // for BrandDetails
  const [createMode, setCreateMode] = useState(null); // null | 'option1' | 'option2' | 'selector'
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [savedPrompts, setSavedPrompts] = useState([]);

  const handleSaveBrand = (brand) => {
    setBrands(prev => {
      const existing = prev.find(b => b.id === brand.id);
      if (existing) return prev.map(b => b.id === brand.id ? brand : b);
      return [...prev, brand];
    });
    setSelectedBrandId(brand.id);
    setActiveBrandId(brand.id);
    setCreateMode(null);
    setView('brand-details');
  };

  const handleUpdateBrand = (updated) => {
    setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const activeBrand = brands.find(b => b.id === activeBrandId);

  // Routing
  const render = () => {
    // Create brand flow
    if (createMode === 'selector') return <CreateBrand onSelect={setCreateMode} onBack={() => setCreateMode(null)} />;
    if (createMode === 'existing') return <Option1Form onSave={handleSaveBrand} onBack={() => setCreateMode('selector')} />;
    if (createMode === 'scratch')  return <Option2Wizard onSave={handleSaveBrand} onBack={() => setCreateMode('selector')} />;

    if (view === 'brand-details' && activeBrand) {
      return (
        <BrandDetails
          brand={activeBrand}
          onBack={() => setView('dashboard')}
          onUpdateBrand={handleUpdateBrand}
          onDeleteBrand={(id) => {
            setBrands(prev => prev.filter(b => b.id !== id));
            // update selected brand pointer if necessary
            setSelectedBrandId(prev => prev === id ? (brands.find(b => b.id !== id)?.id || '') : prev);
            setView('dashboard');
          }}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            brands={brands}
            onCreateBrand={() => setCreateMode('selector')}
            onOpenBrand={(id) => { setActiveBrandId(id); setView('brand-details'); }}
          />
        );
      case 'platforms':
        return <Platforms selectedPlatform={selectedPlatform} onSelect={setSelectedPlatform} />;
      case 'builder':
        return (
          <PromptBuilder
            brands={brands}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            savedPlatform={selectedPlatform}
            onSavePrompt={p => setSavedPrompts(prev => [p, ...prev])}
          />
        );
      case 'history':
        return <PromptHistory prompts={savedPrompts} />;
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
