const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const { encrypt, decrypt } = require('../utils/encryption');
const ConnectedAccount = require('../models/ConnectedAccount');
const Activity = require('../models/Activity');

// Comprehensive realistic mock dataset for instant offline local testing
const INITIAL_SANDBOX_MESSAGES = [
  {
    id: 'msg_101',
    threadId: 'thread_101',
    labelIds: ['INBOX', 'UNREAD', 'STARRED'],
    isStarred: true,
    isRead: false,
    from: { name: 'Sarah Jenkins', email: 'sarah.jenkins@enterprise-corp.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [{ name: 'Alex Rivera', email: 'alex@enterprise-corp.com' }],
    subject: 'Urgent: Q3 Architecture Review & Security Audit Deadline',
    snippet: 'Hi team, please review the attached architecture diagram for the microservices migration before our sync on Friday 5 PM. We have strict deadlines...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi Team,</p>
      <p>Please review the proposed architecture diagram for our upcoming microservices migration project. The enterprise client requires a complete security audit report submitted by <strong>this Friday, September 5 at 5:00 PM EST</strong>.</p>
      <p>Key requirements from the client meeting:</p>
      <ul>
        <li>Verify zero-trust authentication implementation for internal APIs</li>
        <li>Review database encryption keys and rotation policy</li>
        <li>Provide updated latency benchmarks for the streaming WebSocket gateway</li>
      </ul>
      <p>Let's schedule a 30-minute sync on <strong>Thursday, September 4 at 2:00 PM</strong> to align on the final proposal before submitting.</p>
      <p>Best regards,<br/><strong>Sarah Jenkins</strong><br/>VP of Platform Engineering</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    aiCategory: 'Engineering',
    aiPriority: 'High',
  },
  {
    id: 'msg_102',
    threadId: 'thread_102',
    labelIds: ['INBOX'],
    isStarred: false,
    isRead: true,
    from: { name: 'AWS Cloud Billing', email: 'no-reply@aws.amazon.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Monthly Cloud Infrastructure Invoice for August 2026 (#INV-88291)',
    snippet: 'Your invoice for August 2026 is ready. Total amount: $1,420.00. Automatic payment scheduled for September 10, 2026...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Dear Customer,</p>
      <p>Thank you for using AWS Cloud Services. Your monthly statement for the billing period of August 1 - August 31, 2026 is now available.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #ddd; background: #2a2e3d; color: #fff;">
          <th style="padding: 8px; text-align: left;">Resource</th>
          <th style="padding: 8px; text-align: right;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #333;">Elastic Kubernetes Clusters (EKS)</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #333;">$890.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #333;">Managed PostgreSQL Aurora Serverless</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #333;">$380.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #333;">CloudFront Edge CDN & DNS</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #333;">$150.00</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 8px; color: #38bdf8;">Total Amount Due:</td>
          <td style="padding: 8px; text-align: right; color: #38bdf8;">$1,420.00</td>
        </tr>
      </table>
      <p>Payment will be automatically processed on <strong>September 10, 2026</strong>. No action is required if your payment method is up to date.</p>
      <p>Sincerely,<br/>Amazon Web Services Billing Team</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    aiCategory: 'Finance',
    aiPriority: 'Medium',
  },
  {
    id: 'msg_103',
    threadId: 'thread_103',
    labelIds: ['INBOX', 'UNREAD'],
    isStarred: false,
    isRead: false,
    from: { name: 'Elena Rostova', email: 'elena@growth-ventures.io' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Partnership Proposal & Strategic Integration Demo',
    snippet: 'Hi! I saw your recent launch of IntelliMail AI and would love to explore a joint venture for our 40+ portfolio companies...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi,</p>
      <p>I came across your work on IntelliMail AI and was thoroughly impressed by your tone-adaptive smart reply model and action-item parser. Our venture portfolio manages 40+ high-growth B2B SaaS startups that are actively looking for email operations automation tools.</p>
      <p>Would you have 20 minutes next week for a quick virtual coffee to discuss potential pilot rollouts and partnership introductions?</p>
      <p>Let me know your availability for either <strong>Tuesday at 11:00 AM EST</strong> or <strong>Wednesday at 3:00 PM EST</strong>.</p>
      <p>Warm regards,<br/><strong>Elena Rostova</strong><br/>General Partner, Growth Ventures</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    aiCategory: 'Sales',
    aiPriority: 'Medium',
  },
  {
    id: 'msg_104',
    threadId: 'thread_104',
    labelIds: ['INBOX'],
    isStarred: true,
    isRead: true,
    from: { name: 'DevOps Incident Monitor', email: 'alerts@pagerduty-system.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Incident Resolved: Database Replica Lag on Cluster US-East-1',
    snippet: 'All systems normal. High replication lag on cluster-us-east-1 has recovered. Duration was 3 minutes 18 seconds...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p><strong style="color: #4ade80;">✔ Status: RESOLVED</strong></p>
      <p>The replication latency incident detected on <em>PostgreSQL Replica Node 2 (US-East-1)</em> has completely recovered as of 14:15 UTC.</p>
      <p><strong>Incident Summary:</strong></p>
      <ul>
        <li>Start Time: 14:12 UTC</li>
        <li>Duration: 3 minutes 18 seconds</li>
        <li>Root Cause: Temporary I/O bottleneck during automated daily snapshot</li>
        <li>Data Integrity: 100% verified. All replicas are in sync.</li>
      </ul>
      <p>No further manual intervention required.</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    aiCategory: 'Engineering',
    aiPriority: 'Low',
  },
  {
    id: 'msg_105',
    threadId: 'thread_105',
    labelIds: ['INBOX', 'UNREAD'],
    isStarred: false,
    isRead: false,
    from: { name: 'Marcus Chen', email: 'marcus@partner-solutions.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Feedback on Sandbox API Keys & Socket Gateway',
    snippet: 'Thanks for sending over the sandbox credentials. We completed our preliminary load test with 5,000 simulated events...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi,</p>
      <p>Thanks for provisioning the sandbox credentials. Our engineering team ran a preliminary load test with 5,000 simulated email workflows over the Socket.IO gateway, and the average response latency was under 45ms!</p>
      <p>We have just two minor questions regarding rate limits on the <code>/api/ai/summarize</code> route. Could we schedule a 15-minute technical check-in tomorrow?</p>
      <p>Best,<br/><strong>Marcus Chen</strong><br/>Lead Solutions Architect</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    aiCategory: 'Engineering',
    aiPriority: 'Medium',
  },
  {
    id: 'msg_106',
    threadId: 'thread_106',
    labelIds: ['INBOX'],
    isStarred: false,
    isRead: true,
    from: { name: 'Stripe Payments', email: 'receipts@stripe.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Payment Receipt: $299.00 for IntelliMail AI Team Plan',
    snippet: 'Receipt for payment to IntelliMail Technologies, Inc. Invoice #ST-48201. Thank you for your business...',
    body: `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>Hi there,</p>
      <p>Your payment of <strong>$299.00</strong> to <strong>IntelliMail Technologies, Inc.</strong> has been successfully processed.</p>
      <p><strong>Receipt Details:</strong></p>
      <ul>
        <li>Plan: IntelliMail AI Enterprise Team (Annual)</li>
        <li>Seats: 10 Operator Licenses</li>
        <li>Date: August 30, 2026</li>
        <li>Card: Visa ending in 4242</li>
      </ul>
      <p>You can manage your billing preferences anytime in Settings.</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
    aiCategory: 'Finance',
    aiPriority: 'Low',
  },

  // 📝 Pre-seeded DRAFTS
  {
    id: 'draft_201',
    threadId: 'thread_draft_201',
    labelIds: ['DRAFTS'],
    isStarred: false,
    isRead: true,
    from: { name: 'Current User', email: 'operator@intellimail.io' },
    to: [{ name: 'Executive Team', email: 'exec-team@enterprise-corp.com' }],
    cc: [{ name: 'Operations', email: 'ops@enterprise-corp.com' }],
    subject: 'Draft: Q4 Strategic Roadmaps & Resource Allocation Proposal',
    snippet: 'Hi leadership, attached is our initial draft for the Q4 OKR milestones and infrastructure budget requirements...',
    body: `<p>Hi Leadership,</p><p>Attached is our working proposal for Q4 engineering objectives and headcount allocations. Key areas of focus:</p><ul><li>AI email summarization latency optimization (&lt; 200ms target)</li><li>SOC-2 compliance certification and encryption review</li><li>Integration with enterprise CRM tools (Salesforce & HubSpot)</li></ul><p>Please review and add comments before our Monday executive sync.</p><p>Best regards,<br/>Operator</p>`,
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    aiCategory: 'Work',
    aiPriority: 'Medium',
  },
  {
    id: 'draft_202',
    threadId: 'thread_draft_202',
    labelIds: ['DRAFTS'],
    isStarred: false,
    isRead: true,
    from: { name: 'Current User', email: 'operator@intellimail.io' },
    to: [{ name: 'Sarah Jenkins', email: 'sarah.jenkins@enterprise-corp.com' }],
    cc: [],
    subject: 'Draft: Follow-up on Security Audit Deliverables',
    snippet: 'Hi Sarah, following up on our sync earlier today, here is the updated checklist for the security audit report...',
    body: `<p>Hi Sarah,</p><p>Following up on our conversation, I have prepared the preliminary checklist for the security audit report due this Friday.</p><p>All encryption parameters and audit log access policies have been confirmed with the DevOps team.</p><p>Best,<br/>Operator</p>`,
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    aiCategory: 'Work',
    aiPriority: 'High',
  },

  // 🚀 Pre-seeded SENT
  {
    id: 'sent_301',
    threadId: 'thread_sent_301',
    labelIds: ['SENT'],
    isStarred: false,
    isRead: true,
    from: { name: 'Current User', email: 'operator@intellimail.io' },
    to: [{ name: 'Alex Rivera', email: 'alex@enterprise-corp.com' }],
    cc: [],
    subject: 'Release Notes: IntelliMail AI Platform v2.4.0 Live',
    snippet: 'Hi Alex, the latest release containing multi-tone AI reply generation and semantic smart search is now live...',
    body: `<p>Hi Alex,</p><p>The production deployment for v2.4.0 completed successfully. Highlights include:</p><ul><li>6-tone AI Smart Reply Generator</li><li>Action-item extraction and deadline parser</li><li>Encrypted OAuth token storage</li></ul><p>Let me know if you spot any issues during QA testing.</p><p>Cheers,<br/>Operator</p>`,
    date: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    aiCategory: 'Work',
    aiPriority: 'Low',
  },

  // 📦 Pre-seeded ARCHIVE
  {
    id: 'arch_401',
    threadId: 'thread_arch_401',
    labelIds: ['ARCHIVE'],
    isStarred: false,
    isRead: true,
    from: { name: 'GitHub Notifications', email: 'notifications@github.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: '[GitHub] Pull Request #142 Merged: "Add AES-256 token encryption"',
    snippet: 'Pull request #142 has been merged into main by sarah-jenkins. 4 commits, 18 files changed...',
    body: `<p>Pull request #142 "Add AES-256 token encryption" was merged into main branch.</p><p>All CI/CD tests passed with 100% code coverage.</p>`,
    date: new Date(Date.now() - 1000 * 60 * 3600).toISOString(),
    aiCategory: 'Engineering',
    aiPriority: 'Low',
  },

  // 🗑️ Pre-seeded TRASH
  {
    id: 'trash_501',
    threadId: 'thread_trash_501',
    labelIds: ['TRASH'],
    isStarred: false,
    isRead: true,
    from: { name: 'Daily Marketing Deals', email: 'promo@unsolicited-deals.com' },
    to: [{ name: 'Current User', email: 'operator@intellimail.io' }],
    cc: [],
    subject: 'Limited Time: 50% Off Cloud Hosting Packages',
    snippet: 'Upgrade your servers now with our special summer discount...',
    body: `<p>Unsubscribe from promotional emails.</p>`,
    date: new Date(Date.now() - 1000 * 60 * 7200).toISOString(),
    aiCategory: 'Personal',
    aiPriority: 'Low',
  },
];

// In-memory message store keyed by userId for fast interactive demo usage
const userSandboxMessages = new Map();

function getOrCreateUserSandbox(userId) {
  const uid = String(userId);
  if (!userSandboxMessages.has(uid)) {
    userSandboxMessages.set(uid, JSON.parse(JSON.stringify(INITIAL_SANDBOX_MESSAGES)));
  }
  return userSandboxMessages.get(uid);
}

class GmailService {
  /**
   * Generates Google OAuth 2.0 URL
   */
  getOAuthUrl(state = '') {
    if (!config.google.clientId || !config.google.clientSecret) {
      return null;
    }
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: config.google.scopes,
      state: state,
    });
  }

  /**
   * Handles Google OAuth callback and stores encrypted credentials
   */
  async handleOAuthCallback(code, userId) {
    if (!config.google.clientId || !config.google.clientSecret) {
      throw new Error('Google OAuth credentials not configured in server environment');
    }

    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    const encryptedAccess = encrypt(tokens.access_token);
    const encryptedRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : '';
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

    let account = await ConnectedAccount.findOne({ userId, provider: 'google' });
    if (account) {
      account.providerAccountId = profile.id;
      account.email = profile.email;
      account.accessTokenEncrypted = encryptedAccess;
      if (encryptedRefresh) account.refreshTokenEncrypted = encryptedRefresh;
      account.tokenExpiry = expiryDate;
      account.scopes = config.google.scopes;
      account.isConnected = true;
      await account.save();
    } else {
      account = await ConnectedAccount.create({
        userId,
        provider: 'google',
        providerAccountId: profile.id,
        email: profile.email,
        accessTokenEncrypted: encryptedAccess,
        refreshTokenEncrypted: encryptedRefresh,
        tokenExpiry: expiryDate,
        scopes: config.google.scopes,
        isConnected: true,
      });
    }

    await Activity.create({
      userId,
      actionType: 'ACCOUNT_CONNECTED',
      resourceId: profile.email,
      metadata: { provider: 'google', email: profile.email },
      status: 'success',
    });

    return { success: true, email: profile.email };
  }

  /**
   * Retrieves an authenticated OAuth2 client for the user if available
   */
  async getOAuthClient(userId) {
    const account = await ConnectedAccount.findOne({ userId, provider: 'google', isConnected: true });
    if (!account || !account.accessTokenEncrypted) {
      return null;
    }

    try {
      const accessToken = decrypt(account.accessTokenEncrypted);
      const refreshToken = account.refreshTokenEncrypted ? decrypt(account.refreshTokenEncrypted) : null;

      const oauth2Client = new google.auth.OAuth2(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUri
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: account.tokenExpiry?.getTime(),
      });

      // Handle token expiration & refresh
      if (account.tokenExpiry && account.tokenExpiry.getTime() <= Date.now() && refreshToken) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        account.accessTokenEncrypted = encrypt(credentials.access_token);
        if (credentials.refresh_token) {
          account.refreshTokenEncrypted = encrypt(credentials.refresh_token);
        }
        if (credentials.expiry_date) {
          account.tokenExpiry = new Date(credentials.expiry_date);
        }
        await account.save();
      }

      return oauth2Client;
    } catch (err) {
      console.error('[GmailService] Error preparing OAuth client:', err.message);
      return null;
    }
  }

  /**
   * Fetch account status
   */
  async getAccountStatus(userId) {
    const account = await ConnectedAccount.findOne({ userId, provider: 'google' });
    const isLive = Boolean(account && account.isConnected);

    return {
      isConnected: isLive,
      mode: isLive ? 'live' : 'sandbox',
      email: isLive ? account.email : 'operator@intellimail.io (Demo)',
      provider: 'google',
      oauthConfigured: Boolean(config.google.clientId && config.google.clientSecret),
    };
  }

  /**
   * Disconnect account
   */
  async disconnectAccount(userId) {
    const account = await ConnectedAccount.findOne({ userId, provider: 'google' });
    if (account) {
      account.isConnected = false;
      account.accessTokenEncrypted = '';
      account.refreshTokenEncrypted = '';
      await account.save();
    }

    await Activity.create({
      userId,
      actionType: 'ACCOUNT_DISCONNECTED',
      resourceId: account?.email || 'google',
      metadata: { provider: 'google' },
      status: 'success',
    });

    return { success: true, message: 'Google account disconnected' };
  }

  /**
   * Retrieve list of messages with folder & query filter
   */
  async getMessages(userId, { folder = 'INBOX', q = '', limit = 50, pageToken = null } = {}) {
    const authClient = await this.getOAuthClient(userId);

    if (authClient) {
      try {
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        let query = q;
        if (folder === 'STARRED') query = `is:starred ${q}`.trim();
        else if (folder === 'SENT') query = `in:sent ${q}`.trim();
        else if (folder === 'DRAFTS') query = `in:draft ${q}`.trim();
        else if (folder === 'TRASH') query = `in:trash ${q}`.trim();
        else if (folder === 'ARCHIVE') query = `-in:inbox -in:trash ${q}`.trim();
        else if (folder === 'INBOX') query = `in:inbox ${q}`.trim();

        const res = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: limit,
          pageToken: pageToken || undefined,
        });

        const messages = [];
        if (res.data.messages) {
          for (const m of res.data.messages) {
            const detail = await this.getMessage(userId, m.id);
            if (detail) messages.push(detail);
          }
        }

        return {
          messages,
          nextPageToken: res.data.nextPageToken || null,
          total: res.data.resultSizeEstimate || messages.length,
          mode: 'live',
        };
      } catch (err) {
        console.error('[GmailService] Live API list error, fallback to sandbox:', err.message);
      }
    }

    // Interactive Sandbox Mailbox
    const sandbox = getOrCreateUserSandbox(userId);
    let filtered = [...sandbox];

    if (folder === 'STARRED') {
      filtered = filtered.filter(m => m.isStarred);
    } else if (folder === 'SENT') {
      filtered = filtered.filter(m => m.labelIds.includes('SENT'));
    } else if (folder === 'DRAFTS') {
      filtered = filtered.filter(m => m.labelIds.includes('DRAFTS'));
    } else if (folder === 'TRASH') {
      filtered = filtered.filter(m => m.labelIds.includes('TRASH'));
    } else if (folder === 'ARCHIVE') {
      filtered = filtered.filter(m => m.labelIds.includes('ARCHIVE'));
    } else if (folder === 'INBOX') {
      filtered = filtered.filter(m => m.labelIds.includes('INBOX') && !m.labelIds.includes('TRASH'));
    }

    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.subject.toLowerCase().includes(lower) ||
          m.snippet.toLowerCase().includes(lower) ||
          m.from?.name?.toLowerCase().includes(lower) ||
          m.from?.email?.toLowerCase().includes(lower)
      );
    }

    return {
      messages: filtered.slice(0, limit),
      nextPageToken: null,
      total: filtered.length,
      mode: 'sandbox',
    };
  }

  /**
   * Get single message detail
   */
  async getMessage(userId, messageId) {
    const authClient = await this.getOAuthClient(userId);

    if (authClient) {
      try {
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        const res = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full',
        });

        const msg = res.data;
        const headers = msg.payload?.headers || [];
        const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        let body = '';
        if (msg.payload?.parts) {
          const htmlPart = msg.payload.parts.find(p => p.mimeType === 'text/html');
          const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
          const chosen = htmlPart || textPart;
          if (chosen && chosen.body?.data) {
            body = Buffer.from(chosen.body.data, 'base64').toString('utf-8');
          }
        } else if (msg.payload?.body?.data) {
          body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
        }

        const fromHeader = getHeader('From');
        const fromMatch = fromHeader.match(/(.*?)\s*<(.+?)>/) || [null, fromHeader, fromHeader];

        return {
          id: msg.id,
          threadId: msg.threadId,
          labelIds: msg.labelIds || [],
          isStarred: (msg.labelIds || []).includes('STARRED'),
          isRead: !(msg.labelIds || []).includes('UNREAD'),
          from: { name: fromMatch[1]?.replace(/"/g, '').trim() || fromMatch[2], email: fromMatch[2]?.trim() },
          to: [{ name: getHeader('To'), email: getHeader('To') }],
          cc: getHeader('Cc') ? [{ name: getHeader('Cc'), email: getHeader('Cc') }] : [],
          subject: getHeader('Subject') || '(No Subject)',
          snippet: msg.snippet || '',
          body: body || `<p>${msg.snippet}</p>`,
          date: getHeader('Date') ? new Date(getHeader('Date')).toISOString() : new Date().toISOString(),
          aiCategory: 'Work',
          aiPriority: 'Medium',
        };
      } catch (err) {
        console.error('[GmailService] Live getMessage error, fallback to sandbox:', err.message);
      }
    }

    const sandbox = getOrCreateUserSandbox(userId);
    const msg = sandbox.find(m => m.id === messageId);
    if (!msg) {
      throw new Error(`Email message not found: ${messageId}`);
    }
    return msg;
  }

  /**
   * Retrieve thread messages
   */
  async getThread(userId, threadId) {
    const sandbox = getOrCreateUserSandbox(userId);
    const threadMessages = sandbox.filter(m => m.threadId === threadId);
    if (threadMessages.length > 0) {
      return {
        id: threadId,
        messages: threadMessages,
        subject: threadMessages[0].subject,
      };
    }
    const singleMsg = await this.getMessage(userId, threadId);
    return {
      id: threadId,
      messages: [singleMsg],
      subject: singleMsg.subject,
    };
  }

  /**
   * Save an email draft (creates or updates an unsent draft)
   */
  async saveDraft(userId, { id = null, to, cc, bcc, subject, body, threadId = null }) {
    const sandbox = getOrCreateUserSandbox(userId);
    const draftId = id || `draft_${Date.now()}`;

    const existingIndex = sandbox.findIndex(m => m.id === draftId);
    const toFormatted = Array.isArray(to) ? to.map(e => ({ name: e, email: e })) : (to ? [{ name: to, email: to }] : []);
    const ccFormatted = cc ? (Array.isArray(cc) ? cc.map(e => ({ name: e, email: e })) : [{ name: cc, email: cc }]) : [];

    const draftDoc = {
      id: draftId,
      threadId: threadId || `thread_${Date.now()}`,
      labelIds: ['DRAFTS'],
      isStarred: false,
      isRead: true,
      from: { name: 'Current User', email: 'operator@intellimail.io' },
      to: toFormatted,
      cc: ccFormatted,
      subject: subject || 'Draft: (No Subject)',
      snippet: (body || '').replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
      body: body || '',
      date: new Date().toISOString(),
      aiCategory: 'Draft',
      aiPriority: 'Low',
    };

    if (existingIndex >= 0) {
      sandbox[existingIndex] = { ...sandbox[existingIndex], ...draftDoc };
    } else {
      sandbox.unshift(draftDoc);
    }

    await Activity.create({
      userId,
      actionType: 'DRAFT_SAVED',
      resourceId: draftId,
      metadata: { to, subject },
      status: 'success',
    });

    return {
      success: true,
      draft: draftDoc,
      message: 'Draft saved successfully',
    };
  }

  /**
   * Send an email (with draft cleanup if sending an existing draft)
   */
  async sendEmail(userId, { id = null, draftId = null, to, cc, bcc, subject, body, threadId = null, inReplyTo = null }) {
    const authClient = await this.getOAuthClient(userId);

    if (authClient) {
      try {
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const toHeader = Array.isArray(to) ? to.join(', ') : to;

        let messageParts = [
          `To: ${toHeader}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${utf8Subject}`,
        ];

        if (cc) messageParts.push(`Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}`);
        if (inReplyTo) messageParts.push(`In-Reply-To: ${inReplyTo}`);
        if (threadId) messageParts.push(`References: ${threadId}`);

        messageParts.push('');
        messageParts.push(body);

        const rawMessage = Buffer.from(messageParts.join('\r\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: rawMessage,
            threadId: threadId || undefined,
          },
        });

        await Activity.create({
          userId,
          actionType: 'EMAIL_SENT',
          resourceId: response.data.id,
          metadata: { to, subject, threadId },
          status: 'success',
        });

        return {
          id: response.data.id,
          threadId: response.data.threadId,
          success: true,
        };
      } catch (err) {
        console.error('[GmailService] Send error, fallback to sandbox:', err.message);
      }
    }

    // Sandbox send simulation
    const sandbox = getOrCreateUserSandbox(userId);
    const targetDraftId = id || draftId;

    // If this was an existing draft, remove it from DRAFTS
    if (targetDraftId) {
      const dIndex = sandbox.findIndex(m => m.id === targetDraftId);
      if (dIndex >= 0) {
        sandbox.splice(dIndex, 1);
      }
    }

    const newId = `msg_${Date.now()}`;
    const newMsg = {
      id: newId,
      threadId: threadId || `thread_${Date.now()}`,
      labelIds: ['SENT'],
      isStarred: false,
      isRead: true,
      from: { name: 'Current User', email: 'operator@intellimail.io' },
      to: Array.isArray(to) ? to.map(e => ({ name: e, email: e })) : [{ name: to, email: to }],
      cc: cc ? (Array.isArray(cc) ? cc.map(e => ({ name: e, email: e })) : [{ name: cc, email: cc }]) : [],
      subject: subject || '(No Subject)',
      snippet: (body || '').replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
      body,
      date: new Date().toISOString(),
      aiCategory: 'Work',
      aiPriority: 'Low',
    };

    sandbox.unshift(newMsg);

    await Activity.create({
      userId,
      actionType: 'EMAIL_SENT',
      resourceId: newId,
      metadata: { to, subject, threadId: newMsg.threadId },
      status: 'success',
    });

    return {
      id: newId,
      threadId: newMsg.threadId,
      success: true,
    };
  }

  /**
   * Star or unstar a message
   */
  async setStar(userId, messageId, starState) {
    const sandbox = getOrCreateUserSandbox(userId);
    const msg = sandbox.find(m => m.id === messageId);
    if (msg) {
      msg.isStarred = Boolean(starState);
      if (starState && !msg.labelIds.includes('STARRED')) msg.labelIds.push('STARRED');
      if (!starState) msg.labelIds = msg.labelIds.filter(l => l !== 'STARRED');
    }

    await Activity.create({
      userId,
      actionType: starState ? 'EMAIL_STARRED' : 'EMAIL_UNSTARRED',
      resourceId: messageId,
      metadata: { messageId, starState },
      status: 'success',
    });

    return { id: messageId, isStarred: Boolean(starState), success: true };
  }

  /**
   * Mark message as read or unread
   */
  async setRead(userId, messageId, readState) {
    const sandbox = getOrCreateUserSandbox(userId);
    const msg = sandbox.find(m => m.id === messageId);
    if (msg) {
      msg.isRead = Boolean(readState);
      if (readState) msg.labelIds = msg.labelIds.filter(l => l !== 'UNREAD');
      if (!readState && !msg.labelIds.includes('UNREAD')) msg.labelIds.push('UNREAD');
    }

    await Activity.create({
      userId,
      actionType: readState ? 'EMAIL_READ' : 'EMAIL_UNREAD',
      resourceId: messageId,
      metadata: { messageId, readState },
      status: 'success',
    });

    return { id: messageId, isRead: Boolean(readState), success: true };
  }

  /**
   * Archive message (remove from INBOX)
   */
  async archiveMessage(userId, messageId) {
    const sandbox = getOrCreateUserSandbox(userId);
    const msg = sandbox.find(m => m.id === messageId);
    if (msg) {
      msg.labelIds = msg.labelIds.filter(l => l !== 'INBOX');
      if (!msg.labelIds.includes('ARCHIVE')) msg.labelIds.push('ARCHIVE');
    }

    await Activity.create({
      userId,
      actionType: 'EMAIL_ARCHIVED',
      resourceId: messageId,
      metadata: { messageId },
      status: 'success',
    });

    return { id: messageId, archived: true, success: true };
  }

  /**
   * Move message to Trash
   */
  async deleteMessage(userId, messageId) {
    const sandbox = getOrCreateUserSandbox(userId);
    const msg = sandbox.find(m => m.id === messageId);
    if (msg) {
      msg.labelIds = msg.labelIds.filter(l => l !== 'INBOX' && l !== 'ARCHIVE');
      if (!msg.labelIds.includes('TRASH')) msg.labelIds.push('TRASH');
    }

    await Activity.create({
      userId,
      actionType: 'EMAIL_DELETED',
      resourceId: messageId,
      metadata: { messageId },
      status: 'success',
    });

    return { id: messageId, deleted: true, success: true };
  }
}

module.exports = new GmailService();
