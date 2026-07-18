import React from 'react';
import { Plus, Layers, Sparkles, LayoutGrid, TrendingUp } from 'lucide-react';

function BrandCard({ brand, onClick }) {
  const logo = brand.assets?.find(a => a.role === 'Logo');
  const assetCount = (brand.assets || []).length;

  return (
    <div
      className="card card-hover anim-fade-up"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 0 }}
      onClick={() => onClick(brand._id || brand.id)}
    >
      {/* Color bar */}
      <div
        style={{
          height: 5,
          borderRadius: '12px 12px 0 0',
          background: brand.colors?.length >= 2
            ? `linear-gradient(90deg, ${brand.colors[0]}, ${brand.colors[1]})`
            : brand.colors?.[0] || 'var(--primary)',
          margin: '-24px -24px 20px',
        }}
      />

      {/* Logo + name */}
      <div className="flex items-center gap-12" style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 48, height: 48,
            borderRadius: 'var(--r-lg)',
            backgroundColor: brand.colors?.[0] || 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 18, color: '#fff',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {logo?.previewUrl
            ? <img src={logo.previewUrl} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : brand.name.substring(0, 2).toUpperCase()
          }
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.02em', color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {brand.name}
          </div>
          <div className="badge badge-gray mt-4">{brand.industry}</div>
        </div>
      </div>

      {/* Description */}
      {brand.description && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {brand.description}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto' }}
      >
        <div className="flex items-center gap-6" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          <Layers size={13} />
          <span>{assetCount} assets</span>
        </div>
        <div className="flex gap-4">
          {brand.colors?.slice(0, 4).map((c, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%', background: c,
              border: '1.5px solid rgba(0,0,0,.1)',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ brands, onCreateBrand, onOpenBrand, stats }) {
  const statsList = [
    { label: 'Total Brands', value: stats?.totalBrands ?? brands.length, icon: <LayoutGrid size={18} color="var(--primary)" /> },
    { label: 'Total Campaigns', value: stats?.totalCampaigns ?? 0, icon: <Sparkles size={18} color="var(--primary)" /> },
    { label: 'Total Assets', value: stats?.totalAssets ?? 0, icon: <Layers size={18} color="var(--primary)" /> },
    { label: 'Generated Designs', value: stats?.totalDesigns ?? 0, icon: <Sparkles size={18} color="var(--primary)" /> },
    { label: 'Saved Prompts', value: stats?.totalPrompts ?? 0, icon: <TrendingUp size={18} color="var(--primary)" /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-10">
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-lg)',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <h1 className="page-title">AI Brand Studio</h1>
          </div>
          <p className="page-subtitle mt-4">
            Manage brand identities, upload assets, and compile AI-powered design prompts.
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onCreateBrand}>
          <Plus size={18} />
          Create Brand
        </button>
      </div>

      {/* Stats row */}
      {brands.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }} className="stagger">
          {statsList.map((s, i) => (
            <div key={i} className="card anim-fade-up flex items-center gap-16" style={{ padding: '16px 20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em' }}>{s.value}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 1 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand grid */}
      {brands.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Layers size={26} /></div>
            <div className="empty-title">No Brands Yet</div>
            <div className="empty-body">
              Create your first brand profile. Define your identity, upload assets, and start compiling AI design prompts.
            </div>
            <button className="btn btn-primary mt-12" onClick={onCreateBrand}>
              <Plus size={16} /> Create Brand
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 14 }}>
            Brand Profiles — {brands.length}
          </div>
          <div className="grid-3 stagger">
            {brands.map(b => <BrandCard key={b._id || b.id} brand={b} onClick={onOpenBrand} />)}
          </div>
        </>
      )}
    </div>
  );
}
