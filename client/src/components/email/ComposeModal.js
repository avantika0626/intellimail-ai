import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Wand2,
  Paperclip,
  Trash2,
  Loader2,
  Check,
  BookOpen,
  ChevronDown,
  Lock,
  Save,
  FileEdit,
  Smile,
  Image,
  Link2,
  Minus,
  Maximize2,
} from 'lucide-react';
import { useMailStore } from '../../store/mailStore';
import api from '../../services/api';

const TONES = ['Professional', 'Friendly', 'Formal', 'Concise', 'Confident'];

export default function ComposeModal() {
  const {
    composeModalOpen,
    composeData,
    setComposeData,
    closeCompose,
    sendEmail,
    saveDraft,
  } = useMailStore();

  const [showCc, setShowCc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (composeModalOpen) {
      api.get('/settings/templates')
        .then((res) => {
          if (res.data.success) setTemplates(res.data.data);
        })
        .catch(() => {});
    }
  }, [composeModalOpen]);

  if (!composeModalOpen) return null;

  const handleClose = async () => {
    // Auto-save as draft if unsent content exists
    if (composeData.to || composeData.subject || composeData.body) {
      await saveDraft();
    }
    closeCompose();
  };

  const handleExplicitSaveDraft = async () => {
    setIsSavingDraft(true);
    const res = await saveDraft();
    setIsSavingDraft(false);
    if (res?.success) {
      setStatusMessage({ type: 'success', text: 'Draft saved to Drafts folder' });
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.body) {
      setStatusMessage({ type: 'error', text: 'Please specify at least one recipient and body.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    const res = await sendEmail(composeData);
    setIsSending(false);

    if (res.success) {
      closeCompose();
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to send' });
    }
  };

  const handleRewrite = async (tone = 'Professional') => {
    if (!composeData.body) return;
    setIsRewriting(true);
    try {
      const res = await api.post('/ai/rewrite', {
        text: composeData.body,
        tone,
      });
      if (res.data.success && res.data.data.rewrittenText) {
        setComposeData({ body: res.data.data.rewrittenText });
      }
    } catch (err) {
      console.error('Rewrite error:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSuggestSubject = async () => {
    if (!composeData.body) return;
    setIsGeneratingSubject(true);
    try {
      const res = await api.post('/ai/generate-subject', { body: composeData.body });
      if (res.data.success && res.data.data.suggestions?.length > 0) {
        setComposeData({ subject: res.data.data.suggestions[0] });
      }
    } catch (err) {
      console.error('Subject suggestion error:', err);
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  const handleSelectTemplate = (tpl) => {
    setComposeData({
      subject: tpl.subject || composeData.subject,
      body: tpl.body || composeData.body,
    });
    setShowTemplates(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      {/* Signature Google Mail Compose Window Card */}
      <div className="w-full max-w-2xl bg-[#ffffff] border border-[#dadce0] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Top Window Bar */}
        <div className="px-4 py-2.5 bg-[#f2f6fc] border-b border-[#e0e2ec] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium font-['Google_Sans',sans-serif] text-[#1f1f1f]">
              {composeData.threadId ? 'Reply to conversation' : composeData.id ? 'Edit Draft' : 'New Message'}
            </span>
            {composeData.id && (
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#fef7e0] text-[#b06000] font-medium">
                Saved Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[#5f6368]">
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-[#e0e2ec] hover:text-[#1f1f1f] transition-colors"
              title="Save & Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between ${
              statusMessage.type === 'error'
                ? 'bg-[#fce8e6] text-[#c5221f]'
                : 'bg-[#e6f4ea] text-[#137333]'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-[#5f6368] hover:text-black">✕</button>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 space-y-1.5 border-b border-[#f1f3f4] bg-[#ffffff]">
            {/* Recipients */}
            <div className="flex items-center gap-2 border-b border-[#f1f3f4] pb-1.5">
              <span className="text-xs text-[#5f6368] w-12">Recipients</span>
              <input
                type="email"
                required
                value={composeData.to}
                onChange={(e) => setComposeData({ to: e.target.value })}
                placeholder="recipient@example.com"
                className="flex-1 h-8 px-2 text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCc(!showCc)}
                className="text-xs text-[#5f6368] hover:text-[#1f1f1f] px-2 py-0.5 rounded hover:bg-[#f1f3f4]"
              >
                Cc/Bcc
              </button>
            </div>

            {/* Optional CC & BCC */}
            {showCc && (
              <div className="space-y-1 pt-1 animate-in fade-in">
                <div className="flex items-center gap-2 border-b border-[#f1f3f4] pb-1">
                  <span className="text-xs text-[#5f6368] w-12">Cc</span>
                  <input
                    type="text"
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ cc: e.target.value })}
                    placeholder="cc@example.com"
                    className="flex-1 h-7 px-2 text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 border-b border-[#f1f3f4] pb-1">
                  <span className="text-xs text-[#5f6368] w-12">Bcc</span>
                  <input
                    type="text"
                    value={composeData.bcc}
                    onChange={(e) => setComposeData({ bcc: e.target.value })}
                    placeholder="bcc@example.com"
                    className="flex-1 h-7 px-2 text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) => setComposeData({ subject: e.target.value })}
                placeholder="Subject"
                className="flex-1 h-8 px-2 text-xs text-[#1f1f1f] placeholder-[#5f6368] focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={handleSuggestSubject}
                disabled={isGeneratingSubject || !composeData.body}
                title="Gemini AI Subject Suggestion"
                className="px-2.5 py-1 rounded-full bg-[#f3e8ff] hover:bg-[#ebd5ff] text-[#6b21a8] text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
              >
                <Sparkles className={`w-3 h-3 ${isGeneratingSubject ? 'animate-spin' : ''}`} />
                <span>AI Subject</span>
              </button>
            </div>
          </div>

          {/* Gemini AI Assist Ribbon */}
          <div className="px-4 py-1.5 bg-[#f8fafd] border-b border-[#f1f3f4] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[#5f6368] font-medium flex items-center gap-1 text-[11px] mr-1">
                <Wand2 className="w-3 h-3 text-[#7c3aed]" />
                <span>Rewrite Tone:</span>
              </span>
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleRewrite(t)}
                  disabled={isRewriting || !composeData.body}
                  className="px-2 py-0.5 rounded-md bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4] text-[11px] font-medium transition-colors disabled:opacity-40"
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Template picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-2.5 py-1 rounded-md bg-[#ffffff] border border-[#dadce0] text-[#444746] hover:bg-[#f1f3f4] text-[11px] font-medium flex items-center gap-1.5"
              >
                <BookOpen className="w-3 h-3 text-[#1a73e8]" />
                <span>Templates</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTemplates && templates.length > 0 && (
                <div className="absolute right-0 mt-1 w-56 rounded-2xl bg-[#ffffff] border border-[#dadce0] shadow-xl p-1.5 z-50">
                  <p className="px-2 py-1 text-[10px] font-bold text-[#5f6368] uppercase">Insert Template</p>
                  {templates.map((tpl) => (
                    <button
                      key={tpl._id || tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#f1f3f4] text-xs text-[#1f1f1f]"
                    >
                      <p className="font-medium">{tpl.name}</p>
                      <p className="text-[10px] text-[#5f6368] truncate">{tpl.subject}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email Body TextArea */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#ffffff]">
            <textarea
              required
              rows={10}
              value={composeData.body}
              onChange={(e) => setComposeData({ body: e.target.value })}
              placeholder="Write your email here..."
              className="w-full h-full min-h-[220px] p-2 text-sm text-[#202124] leading-relaxed font-sans focus:outline-none bg-transparent custom-scrollbar resize-none"
            />
          </div>

          {/* Signature Gmail Footer Action Toolbar */}
          <div className="px-4 py-3 border-t border-[#f1f3f4] bg-[#ffffff] flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              {/* Google Blue Send Button */}
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-medium font-['Google_Sans',sans-serif] flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send</span>}
              </button>

              <button
                type="button"
                onClick={handleExplicitSaveDraft}
                disabled={isSavingDraft}
                className="px-3 py-1.5 rounded-full border border-[#dadce0] hover:bg-[#f1f3f4] text-xs font-medium text-[#444746] flex items-center gap-1.5 transition-colors"
              >
                {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-[#5f6368]" />}
                <span>Save Draft</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#5f6368]">
              <button
                type="button"
                onClick={() => {
                  setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '', id: null });
                  closeCompose();
                }}
                className="p-2 rounded-full hover:bg-[#f1f3f4] hover:text-[#d93025] transition-colors"
                title="Discard draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
