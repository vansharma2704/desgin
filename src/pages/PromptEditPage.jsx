import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, Redo2, RotateCcw, Save, X, Eye } from 'lucide-react';
import { generatePrompt } from '../utils/mockAi';

export default function PromptEditPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const originalPrompt = state.prompt || '';
  const [promptText, setPromptText] = useState(originalPrompt);
  const [showPreview, setShowPreview] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState([originalPrompt]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save edit to history
  const updateText = (newText, skipHistory = false) => {
    setPromptText(newText);
    if (!skipHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      setHistory([...nextHistory, newText]);
      setHistoryIndex(nextHistory.length);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setPromptText(history[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setPromptText(history[idx]);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the prompt to its original compiled state? This will discard custom modifications.')) {
      updateText(originalPrompt);
    }
  };

  const handleSave = () => {
    // Navigate back to the prompt builder, replacing the compiled prompt
    const brandId = state.brandId;
    const campaignId = state.selectedCampaignId;
    if (brandId && campaignId) {
      navigate(`/editor/brands/${brandId}/campaigns/${campaignId}`, {
        state: {
          resumeDraft: {
            ...state,
            prompt: promptText,
            isCustomEdited: true
          }
        }
      });
    } else {
      navigate('/editor/dashboard');
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  const handleBack = () => {
    const brandId = state.brandId;
    const campaignId = state.selectedCampaignId;
    if (brandId && campaignId) {
      navigate(`/editor/brands/${brandId}/campaigns/${campaignId}`, {
        state: {
          resumeDraft: {
            ...state
          }
        }
      });
    } else {
      navigate('/editor/dashboard');
    }
  };

  // Stats
  const charCount = promptText.length;
  const tokenEstimate = Math.ceil(charCount / 4);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className="page anim-fade-up" style={{ maxWidth: 1200, width: '100%', margin: '40px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <button className="btn btn-ghost" onClick={handleBack} style={{ marginBottom: 24, paddingLeft: 0 }}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Generate Design
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-1)' }}>Edit Final Prompt</h1>
            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 14 }}>Fine-tune the compiled guidelines, tokens, and details prior to image generation.</p>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleUndo} disabled={historyIndex === 0} title="Undo">
              <Undo2 size={14} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleRedo} disabled={historyIndex === history.length - 1} title="Redo">
              <Redo2 size={14} />
            </button>
            <button className="btn btn-secondary btn-sm text-danger" onClick={handleReset} title="Reset to Original">
              <RotateCcw size={14} style={{ marginRight: 6 }} /> Reset
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 30, alignItems: 'start' }}>
          {/* LEFT COLUMN: Prompt Editor Textarea */}
          <div className="card" style={{ padding: 24, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <textarea
              value={promptText}
              onChange={e => updateText(e.target.value)}
              placeholder="Type your custom prompt instructions here..."
              style={{
                width: '100%',
                minHeight: 480,
                resize: 'vertical',
                fontFamily: 'Menlo, Consolas, monospace',
                fontSize: 13,
                lineHeight: '1.6',
                outline: 'none',
                background: 'var(--surface-2)',
                padding: 20,
                borderRadius: 12,
                color: 'var(--text-1)',
                boxSizing: 'border-box',
                border: '1px solid var(--border)'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} style={{ background: '#6C4CF1', borderColor: '#6C4CF1' }}>
                <Save size={16} style={{ marginRight: 6 }} /> Save Changes
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Stats & Preview Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Live Metrics */}
            <div className="card" style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Live Metrics</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>Characters</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{charCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>Estimated Tokens</span>
                  <span style={{ fontWeight: 600, color: '#6C4CF1' }}>{tokenEstimate}</span>
                </div>
              </div>
            </div>

            {/* Preview Toggle Card */}
            <div className="card" style={{ padding: 20, borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Preview Compilation</span>
                <button className="icon-btn" onClick={() => setShowPreview(!showPreview)}>
                  <Eye size={14} />
                </button>
              </div>
              {showPreview && (
                <pre style={{
                  fontFamily: 'Menlo, Consolas, monospace',
                  fontSize: 12,
                  lineHeight: '1.5',
                  color: 'var(--text-2)',
                  background: 'var(--surface-2)',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  maxHeight: 200,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}>
                  {promptText}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
