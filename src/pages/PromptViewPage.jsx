import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Sparkles, Check, Search } from 'lucide-react';

export default function PromptViewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const [promptText] = useState(state.prompt || '');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const charCount = promptText.length;
  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length;
  const tokenEstimate = Math.ceil(charCount / 4);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    // Navigate back to the prompt builder preserving wizard state
    const brandId = state.brandId;
    const campaignId = state.selectedCampaignId;
    if (brandId && campaignId) {
      navigate(`/editor/brands/${brandId}/campaigns/${campaignId}`, {
        state: {
          resumeDraft: {
            ...state,
            prompt: promptText
          }
        }
      });
    } else {
      navigate('/editor/dashboard');
    }
  };

  // Highlight search query in read-only per-line view
  const renderHighlightedLine = (line) => {
    if (!searchQuery.trim()) return line || '\u00A0';
    const regex = new RegExp(`(${searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = line.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} style={{ background: '#fef08a', color: '#1e293b', padding: '1px 2px', borderRadius: '2px' }}>{part}</mark> : part
    );
  };

  // Generate line numbers array
  const lines = promptText.split('\n');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className="page anim-fade-up" style={{ maxWidth: 1200, width: '100%', margin: '40px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <button className="btn btn-ghost" onClick={handleBack} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Generate Design
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-1)' }}>Final Compiled Prompt</h1>
          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 14 }}>Review the complete prompt that will be sent to the AI model.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 30, alignItems: 'start' }}>
          {/* LEFT COLUMN: Code editor style prompt viewer */}
          <div className="card" style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', width: '100%', maxWidth: 300 }}>
                <Search size={14} color="var(--text-3)" />
                <input
                  type="text"
                  placeholder="Search prompt..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, width: '100%', color: 'var(--text-1)' }}
                />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Prompt</>}
              </button>
            </div>

            {/* Premium code editor style panel */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              height: 'calc(100vh - 280px)',
              minHeight: '600px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                padding: '20px 0 32px 0',
                tabSize: 4
              }}>
                {lines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0, minHeight: '22px' }}>
                    <div style={{
                      userSelect: 'none',
                      width: '50px',
                      textAlign: 'right',
                      paddingRight: '12px',
                      color: 'var(--text-3)',
                      background: 'var(--surface-3)',
                      borderRight: '1px solid var(--border)',
                      marginRight: '12px',
                      flexShrink: 0,
                      position: 'sticky',
                      left: 0,
                      zIndex: 10
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      whiteSpace: 'pre-wrap', 
                      wordBreak: 'break-word', 
                      overflowWrap: 'anywhere',
                      color: 'var(--text-2)', 
                      paddingRight: '16px' 
                    }}>
                      {renderHighlightedLine(line)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Statistics & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats Card */}
            <div className="card" style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Prompt Statistics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>Characters</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{charCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>Words</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{wordCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>Estimated Tokens</span>
                  <span style={{ fontWeight: 600, color: '#6C4CF1' }}>{tokenEstimate}</span>
                </div>
              </div>
            </div>

            {/* Download Actions Card */}
            <div className="card" style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>Actions</div>
              <button
                className="btn btn-secondary btn-full"
                onClick={() => downloadFile(promptText, 'compiled_prompt.txt', 'text/plain')}
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Download size={14} /> Download as TXT
              </button>
              <button
                className="btn btn-secondary btn-full"
                onClick={() => downloadFile(`# Compiled AI Design Prompt\n\n\`\`\`text\n${promptText}\n\`\`\``, 'compiled_prompt.md', 'text/markdown')}
                style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Download size={14} /> Download as Markdown
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
