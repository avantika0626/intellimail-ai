import { create } from 'zustand';
import api from '../services/api';

export const useMailStore = create((set, get) => ({
  folder: 'INBOX',
  messages: [],
  totalMessages: 0,
  selectedMessage: null,
  selectedThread: null,
  isLoadingMessages: false,
  isLoadingMessageDetail: false,
  searchQuery: '',
  isSmartSearch: false,

  accountStatus: {
    isConnected: false,
    mode: 'sandbox',
    email: 'operator@intellimail.io (Demo)',
    oauthConfigured: false,
  },

  // AI Panel State
  activeAITab: 'summary', // 'summary' | 'reply' | 'explain' | 'actions' | 'dates'
  aiData: {
    summary: null,
    reply: null,
    explain: null,
    actions: null,
    dates: null,
  },
  aiLoading: {
    summary: false,
    reply: false,
    explain: false,
    actions: false,
    dates: false,
  },

  // Compose Modal State
  composeModalOpen: false,
  composeData: {
    id: null,
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    threadId: null,
  },

  // Daily Summary Widget
  dailySummaryData: null,
  isLoadingDailySummary: false,

  setFolder: (folder) => {
    set({ folder, selectedMessage: null, selectedThread: null });
    get().fetchMessages({ folder });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSmartSearch: (isSmartSearch) => set({ isSmartSearch }),
  setActiveAITab: (activeAITab) => set({ activeAITab }),

  openCompose: (initialData = {}) => {
    set({
      composeModalOpen: true,
      composeData: {
        id: initialData.id || initialData.draftId || null,
        to: initialData.to || '',
        cc: initialData.cc || '',
        bcc: initialData.bcc || '',
        subject: initialData.subject || '',
        body: initialData.body || '',
        threadId: initialData.threadId || null,
      },
    });
  },

  closeCompose: () => {
    set({ composeModalOpen: false });
  },

  setComposeData: (data) => {
    set((state) => ({
      composeData: { ...state.composeData, ...data },
    }));
  },

  saveDraft: async (customData = null) => {
    const data = customData || get().composeData;
    if (!data.to && !data.subject && !data.body) {
      return { success: false, message: 'Empty draft' };
    }

    try {
      const res = await api.post('/gmail/drafts', data);
      if (res.data.success) {
        if (!data.id && res.data.draft?.id) {
          set((state) => ({
            composeData: { ...state.composeData, id: res.data.draft.id },
          }));
        }
        // Update mailbox list
        get().fetchMessages();
        return { success: true, draft: res.data.draft };
      }
    } catch (err) {
      console.error('Save draft error:', err);
      return { success: false, error: err.message };
    }
  },

  fetchAccountStatus: async () => {
    try {
      const res = await api.get('/gmail/account/status');
      if (res.data.success) {
        set({ accountStatus: res.data.data });
      }
    } catch (err) {
      console.warn('Could not fetch account status:', err);
    }
  },

  fetchMessages: async (params = {}) => {
    const { folder, searchQuery, isSmartSearch } = get();
    const activeFolder = params.folder || folder;
    const query = params.query !== undefined ? params.query : searchQuery;

    set({ isLoadingMessages: true });
    try {
      if (isSmartSearch && query.trim()) {
        const res = await api.post('/ai/smart-search', { query });
        if (res.data.success) {
          set({
            messages: res.data.data.results || [],
            totalMessages: res.data.data.totalMatches || 0,
            isLoadingMessages: false,
          });
          return;
        }
      }

      const res = await api.get('/gmail/messages', {
        params: { folder: activeFolder, q: query },
      });

      if (res.data.success) {
        set({
          messages: res.data.messages || [],
          totalMessages: res.data.total || 0,
          isLoadingMessages: false,
        });

        // If no message selected and messages exist (and not in DRAFTS folder), select first
        if (!get().selectedMessage && res.data.messages.length > 0 && activeFolder !== 'DRAFTS') {
          get().selectMessage(res.data.messages[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      set({ isLoadingMessages: false });
    }
  },

  selectMessage: async (messageId) => {
    const { folder } = get();

    // If clicking an email in DRAFTS folder, open it in the compose editor immediately!
    const localDraft = get().messages.find((m) => m.id === messageId);
    if (folder === 'DRAFTS' || localDraft?.labelIds?.includes('DRAFTS')) {
      const toEmail = localDraft?.to?.[0]?.email || localDraft?.to?.[0] || '';
      const ccEmail = (localDraft?.cc || []).map((c) => c.email || c).join(', ');
      get().openCompose({
        id: localDraft?.id || messageId,
        to: toEmail,
        cc: ccEmail,
        subject: (localDraft?.subject || '').replace(/^Draft:\s*/i, ''),
        body: localDraft?.body || '',
        threadId: localDraft?.threadId,
      });
      return;
    }

    set({ isLoadingMessageDetail: true, aiData: { summary: null, reply: null, explain: null, actions: null, dates: null } });
    try {
      const res = await api.get(`/gmail/messages/${messageId}`);
      if (res.data.success) {
        const msg = res.data.data;
        set({ selectedMessage: msg, isLoadingMessageDetail: false });

        // Mark as read automatically
        if (!msg.isRead) {
          get().toggleRead(msg.id, true);
        }

        // Fetch thread if exists
        if (msg.threadId) {
          try {
            const threadRes = await api.get(`/gmail/threads/${msg.threadId}`);
            if (threadRes.data.success) {
              set({ selectedThread: threadRes.data.data.messages || [msg] });
            }
          } catch {
            set({ selectedThread: [msg] });
          }
        }
      }
    } catch (err) {
      console.error('Select message error:', err);
      set({ isLoadingMessageDetail: false });
    }
  },

  toggleStar: async (messageId, starredState) => {
    const current = get().messages.find((m) => m.id === messageId);
    const targetState = starredState !== undefined ? starredState : !current?.isStarred;

    // Optimistic update
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isStarred: targetState } : m
      ),
      selectedMessage:
        state.selectedMessage?.id === messageId
          ? { ...state.selectedMessage, isStarred: targetState }
          : state.selectedMessage,
    }));

    try {
      await api.post(`/gmail/messages/${messageId}/star`, { starred: targetState });
    } catch (err) {
      console.error('Star error:', err);
      get().fetchMessages();
    }
  },

  toggleRead: async (messageId, readState) => {
    const current = get().messages.find((m) => m.id === messageId);
    const targetState = readState !== undefined ? readState : !current?.isRead;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isRead: targetState } : m
      ),
      selectedMessage:
        state.selectedMessage?.id === messageId
          ? { ...state.selectedMessage, isRead: targetState }
          : state.selectedMessage,
    }));

    try {
      await api.post(`/gmail/messages/${messageId}/read`, { read: targetState });
    } catch (err) {
      console.error('Read error:', err);
    }
  },

  archiveMessage: async (messageId) => {
    const id = messageId || get().selectedMessage?.id;
    if (!id) return;

    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
      selectedMessage: null,
      selectedThread: null,
    }));

    try {
      await api.post(`/gmail/messages/${id}/archive`);
    } catch (err) {
      console.error('Archive error:', err);
      get().fetchMessages();
    }
  },

  deleteMessage: async (messageId) => {
    const id = messageId || get().selectedMessage?.id;
    if (!id) return;

    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
      selectedMessage: null,
      selectedThread: null,
    }));

    try {
      await api.post(`/gmail/messages/${id}/delete`);
    } catch (err) {
      console.error('Delete error:', err);
      get().fetchMessages();
    }
  },

  sendEmail: async (emailData) => {
    try {
      const res = await api.post('/gmail/send', emailData);
      if (res.data.success) {
        get().closeCompose();
        get().fetchMessages();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email';
      return { success: false, error: msg };
    }
  },

  // ---------------- AI Operations ----------------

  generateAISummary: async (length = 'concise') => {
    const { selectedMessage } = get();
    if (!selectedMessage) return;

    set((state) => ({
      aiLoading: { ...state.aiLoading, summary: true },
      activeAITab: 'summary',
    }));

    try {
      const res = await api.post('/ai/summarize', {
        content: selectedMessage.body || selectedMessage.snippet,
        subject: selectedMessage.subject,
        length,
        messageId: selectedMessage.id,
      });

      if (res.data.success) {
        set((state) => ({
          aiData: { ...state.aiData, summary: res.data.data },
          aiLoading: { ...state.aiLoading, summary: false },
        }));
      }
    } catch (err) {
      console.error('AI Summary error:', err);
      set((state) => ({ aiLoading: { ...state.aiLoading, summary: false } }));
    }
  },

  generateAIReply: async (tone = 'Professional', instructions = '') => {
    const { selectedMessage, selectedThread } = get();
    if (!selectedMessage) return;

    set((state) => ({
      aiLoading: { ...state.aiLoading, reply: true },
      activeAITab: 'reply',
    }));

    try {
      const threadContext = selectedThread
        ? selectedThread.map((m) => `${m.from?.name}: ${m.snippet}`).join('\n')
        : '';

      const res = await api.post('/ai/generate-reply', {
        content: selectedMessage.body || selectedMessage.snippet,
        subject: selectedMessage.subject,
        threadContext,
        tone,
        instructions,
        messageId: selectedMessage.id,
      });

      if (res.data.success) {
        set((state) => ({
          aiData: { ...state.aiData, reply: res.data.data },
          aiLoading: { ...state.aiLoading, reply: false },
        }));
      }
    } catch (err) {
      console.error('AI Reply error:', err);
      set((state) => ({ aiLoading: { ...state.aiLoading, reply: false } }));
    }
  },

  explainEmail: async () => {
    const { selectedMessage } = get();
    if (!selectedMessage) return;

    set((state) => ({
      aiLoading: { ...state.aiLoading, explain: true },
      activeAITab: 'explain',
    }));

    try {
      const res = await api.post('/ai/explain', {
        content: selectedMessage.body || selectedMessage.snippet,
        subject: selectedMessage.subject,
        messageId: selectedMessage.id,
      });

      if (res.data.success) {
        set((state) => ({
          aiData: { ...state.aiData, explain: res.data.data },
          aiLoading: { ...state.aiLoading, explain: false },
        }));
      }
    } catch (err) {
      console.error('AI Explain error:', err);
      set((state) => ({ aiLoading: { ...state.aiLoading, explain: false } }));
    }
  },

  extractActions: async () => {
    const { selectedMessage } = get();
    if (!selectedMessage) return;

    set((state) => ({
      aiLoading: { ...state.aiLoading, actions: true },
      activeAITab: 'actions',
    }));

    try {
      const res = await api.post('/ai/extract-actions', {
        content: selectedMessage.body || selectedMessage.snippet,
        subject: selectedMessage.subject,
        messageId: selectedMessage.id,
      });

      if (res.data.success) {
        set((state) => ({
          aiData: { ...state.aiData, actions: res.data.data.actions || [] },
          aiLoading: { ...state.aiLoading, actions: false },
        }));
      }
    } catch (err) {
      console.error('AI Actions error:', err);
      set((state) => ({ aiLoading: { ...state.aiLoading, actions: false } }));
    }
  },

  extractDates: async () => {
    const { selectedMessage } = get();
    if (!selectedMessage) return;

    set((state) => ({
      aiLoading: { ...state.aiLoading, dates: true },
      activeAITab: 'dates',
    }));

    try {
      const res = await api.post('/ai/extract-dates', {
        content: selectedMessage.body || selectedMessage.snippet,
        subject: selectedMessage.subject,
        messageId: selectedMessage.id,
      });

      if (res.data.success) {
        set((state) => ({
          aiData: { ...state.aiData, dates: res.data.data.dates || [] },
          aiLoading: { ...state.aiLoading, dates: false },
        }));
      }
    } catch (err) {
      console.error('AI Dates error:', err);
      set((state) => ({ aiLoading: { ...state.aiLoading, dates: false } }));
    }
  },

  fetchDailySummary: async () => {
    set({ isLoadingDailySummary: true });
    try {
      const res = await api.get('/ai/daily-summary');
      if (res.data.success) {
        set({ dailySummaryData: res.data.data, isLoadingDailySummary: false });
      }
    } catch (err) {
      console.error('Daily summary error:', err);
      set({ isLoadingDailySummary: false });
    }
  },
}));
