import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/layout/AppShell';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Send,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useMailStore } from '../store/mailStore';
import api from '../services/api';

export default function TemplatesPage() {
  const { openCompose } = useMailStore();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '', category: 'Work' });
  const [copiedId, setCopiedId] = useState(null);

  const fetchTemplates = () => {
    setIsLoading(true);
    api.get('/settings/templates')
      .then((res) => {
        if (res.data.success) {
          setTemplates(res.data.data);
        }
      })
      .catch((err) => console.error('Fetch templates error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/templates', formData);
      setShowModal(false);
      setFormData({ name: '', subject: '', body: '', category: 'Work' });
      fetchTemplates();
    } catch (err) {
      console.error('Save template error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/settings/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error('Delete template error:', err);
    }
  };

  const handleUseTemplate = (tpl) => {
    openCompose({
      subject: tpl.subject,
      body: tpl.body,
    });
  };

  const handleCopy = (tpl) => {
    navigator.clipboard.writeText(`SUBJECT: ${tpl.subject}\n\n${tpl.body}`);
    setCopiedId(tpl._id || tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <Head>
        <title>Templates — IntelliMail AI (Google Workspace)</title>
      </Head>

      <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar bg-[#ffffff]">
        {/* Header */}
        <div className="pb-5 border-b border-[#e0e2ec] mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-[#1f1f1f] tracking-tight flex items-center gap-2.5 font-['Google_Sans',sans-serif]">
              <BookOpen className="w-6 h-6 text-[#fbbc04]" />
              <span>Email Templates Library</span>
            </h1>
            <p className="text-xs text-[#5f6368] mt-1">
              Create and manage reusable standard responses, client outreach frameworks, and meeting outlines.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium font-['Google_Sans',sans-serif] flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#5f6368]">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-3xl bg-[#ffffff] border border-[#dadce0]">
            <BookOpen className="w-8 h-8 text-[#5f6368] mx-auto" />
            <p className="text-sm font-medium text-[#202124]">No templates yet</p>
            <p className="text-xs text-[#5f6368]">Click 'New Template' to create your first standard response.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl._id || tpl.id}
                className="p-5 rounded-3xl bg-[#ffffff] border border-[#dadce0] shadow-sm flex flex-col justify-between hover:border-[#1a73e8] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#e8f0fe] text-[#0b57d0]">
                      {tpl.category || 'General'}
                    </span>

                    <button
                      onClick={() => handleDelete(tpl._id || tpl.id)}
                      className="p-1 text-[#5f6368] hover:text-[#d93025] transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-medium text-[#202124] mb-1 font-['Google_Sans',sans-serif]">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[#0b57d0] font-medium mb-2">{tpl.subject}</p>
                  <p className="text-xs text-[#5f6368] line-clamp-3 leading-relaxed mb-4">{tpl.body}</p>
                </div>

                <div className="pt-3 border-t border-[#f1f3f4] flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(tpl)}
                    className="p-1.5 rounded-lg hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === (tpl._id || tpl.id) ? (
                      <Check className="w-3.5 h-3.5 text-[#137333]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === (tpl._id || tpl.id) ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="px-4 py-1.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Use in Compose</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Template Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#ffffff] border border-[#dadce0] rounded-3xl shadow-2xl p-6 animate-in fade-in">
              <h3 className="text-base font-medium text-[#202124] mb-4 font-['Google_Sans',sans-serif]">
                Create Email Template
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Architecture Signoff Request"
                    className="w-full h-10 px-3 rounded-xl border border-[#dadce0] text-xs text-[#1f1f1f] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">Default Subject Line</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Action Required: Architecture Signoff"
                    className="w-full h-10 px-3 rounded-xl border border-[#dadce0] text-xs text-[#1f1f1f] focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">Template Content</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Write template message body..."
                    className="w-full p-3 rounded-xl border border-[#dadce0] text-xs text-[#202124] focus:outline-none focus:border-[#1a73e8] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-full border border-[#dadce0] text-xs font-medium text-[#444746] hover:bg-[#f1f3f4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium font-['Google_Sans',sans-serif]"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
