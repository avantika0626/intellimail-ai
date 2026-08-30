# IntelliMail AI — Intelligent Email Management Workspace

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v14-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-v4-lightgrey.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-green.svg)](https://www.mongodb.com/)

---

## 1. Project Name
**IntelliMail AI** — Intelligent Google Mail Workspace & AI Productivity Platform

---

## 2. Problem Statement
Professionals, operators, and developers spend hours every day managing cluttered inboxes, reading lengthy technical email threads, deciphering urgent requests, tracking deadlines across conversations, and drafting repetitive replies.

**IntelliMail AI** solves this problem by providing an intelligent email workspace styled after **Google Mail (Gmail / Google Workspace)**. It automatically analyzes email context, extracts action items and deadlines into structured checklists, generates executive summaries, drafts multi-tone context-aware responses, and enables semantic natural-language email search—all while keeping humans in the loop with strict zero-trust security.

---

## 3. Features

### 🌟 Core Capabilities
- **📥 Google Mail 3-Pane Workspace**: Familiar, clean Google Workspace interface featuring Primary/Promotions/Social categories, Starred, Sent, Drafts, Archive, and Trash.
- **⚡ AI Email Summaries**: Instantly extracts concise executive summaries, key bullet points, and required actions from long conversations.
- **✍️ Multi-Tone Smart Replies**: Generates context-aware response drafts across 6 distinct tones (*Professional, Friendly, Formal, Concise, Apologetic, Confident*).
- **💡 "Explain This Email"**: Translates technical, formal, or legal email bodies into plain English with *"What this means"*, *"Action steps for you"*, and *"Deadlines"*.
- **☑️ Interactive Action Item Extraction**: Automatically converts unstructured email paragraphs into checkable task lists.
- **📅 Deadline & Milestone Detection**: Identifies submission dates, scheduled meetings, and milestone timeframes.
- **📝 Unsent Email Draft Auto-Save**: Unsent emails in the compose window automatically save to the **Drafts** folder upon close or cancel.
- **🔍 Semantic Smart Search**: Search messages using natural language queries (e.g., *"Show emails with invoices over $500"* or *"Security audits due this week"*).
- **📊 Productivity Analytics**: Telemetry on incoming vs. sent email volume, AI operations usage, and estimated time saved.
- **📑 Reusable Email Templates**: Library for saving, categorizing, and 1-click inserting canned responses into the composer.
- **🛡️ Human-in-the-Loop Zero Trust**: AI drafts and assists, but emails are **never** auto-sent without explicit user confirmation.
- **🔄 Dual Sandbox & Live OAuth 2.0**: Out-of-the-box offline sandbox mode with pre-seeded emails, plus full live Google Cloud OAuth 2.0 integration for real Gmail accounts.

---

## 4. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Next.js 14, Tailwind CSS, Lucide React Icons, Zustand (State Management), DOMPurify (Sanitization) |
| **Backend** | Node.js, Express.js REST API, JSON Web Tokens (JWT), BcryptJS, Google APIs Client (`googleapis`) |
| **Database** | MongoDB Atlas (Mongoose ODM) + Built-in high-performance In-Memory Proxy Store fallback |
| **AI Intelligence** | Gemini / OpenAI Engine Model Adapter, Multi-Tone Synthesis, Semantic Pattern Matching |
| **Security** | AES-256 OAuth Token Encryption, HTTP-Only Token Auth, CORS Guard, Input Sanitization |
| **Deployment** | Vercel (Frontend), Render (Backend Web Service), MongoDB Atlas (Cloud Database), GitHub (Source Control) |

---

## 5. Screenshots & Interface Overview

### 📬 Google Mail Workspace & AI Side Companion
- **Header**: Authentic Google Mail logo, Google search pill (`#eaf1fb`) with Smart AI search toggle, profile menu, and live status badge.
- **Sidebar**: Signature Google floating **`+ Compose`** pill button, unread counts, and Google active pill highlights (`#d3e3fd`).
- **List Panel**: Star toggles, sender bolding, snippet preview, and hover quick-action bars (Archive, Delete, Mark Read).
- **Gemini Companion**: Tabbed side panel with Summary, Help me Reply, Explain, Tasks, and Dates.
- **Compose Modal**: Floating Gmail-style compose card with AI subject suggestion, tone rewrite ribbon, template picker, and Google blue send button.

---

## 6. Live Demo
- **Frontend (Vercel)**: [https://intellimail-ai.vercel.app](https://intellimail-ai.vercel.app) *(or your deployed Vercel URL)*

---

## 7. Backend API
- **Backend Service (Render)**: [https://intellimail-ai-backend.onrender.com](https://intellimail-ai-backend.onrender.com)
- **Health Check Endpoint**: [https://intellimail-ai-backend.onrender.com/api/health](https://intellimail-ai-backend.onrender.com/api/health)

---

## 8. Setup Instructions (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` (bundled with Node.js)
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/avantika0626/intellimail-ai.git
cd intellimail-ai
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```
*(Or manually run `npm install` in the root, `cd server && npm install`, and `cd client && npm install`).*

### Step 3: Run the Development Server
```bash
npm run dev
```
- **Frontend** will start at: [http://localhost:3000](http://localhost:3000)
- **Backend** will start at: [http://localhost:5000](http://localhost:5000)

### Step 4: Sign In (Demo Credentials)
1. Open [http://localhost:3000/login](http://localhost:3000/login).
2. Click **"Fill Demo Operator Credentials"** (or use `operator@intellimail.io` / `Password123!`).
3. Click **Next** to access the workspace.

---

## 9. Environment Variables

> ⚠️ **Security Notice**: Never commit actual API keys, passwords, or secrets to version control. The repository uses `.env.example` templates.

### Backend (`server/.env`):
| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` or `https://intellimail-ai.vercel.app` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<password>@cluster0...` |
| `JWT_SECRET` | Secret key for JWT signing | `32+ character random string` |
| `JWT_EXPIRES_IN` | Session expiration duration | `7d` |
| `ENCRYPTION_KEY` | 32-byte key for AES-256 encryption | `32+ character random string` |
| `GOOGLE_CLIENT_ID` | *(Optional)* Google OAuth Client ID | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | *(Optional)* Google OAuth Client Secret | `GOCSPX-your-secret` |
| `GOOGLE_REDIRECT_URI` | *(Optional)* Google OAuth Redirect URI | `http://localhost:5000/api/gmail/oauth/callback` |
| `OPENAI_API_KEY` | *(Optional)* OpenAI API key | `sk-...` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API key | `AIzaSy...` |

### Frontend (`client/.env.local`):
| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Full URL to backend REST API | `http://localhost:5000/api` or `https://intellimail-ai-backend.onrender.com/api` |

---

## 10. Automated Test Suite & Verification

Run the full integration test suite covering database operations, authentication, Gmail sync, AI summarization, multi-tone replies, and draft conversions:

```bash
node server/test/intellimail.test.js
```

Verify all 9 frontend and backend endpoints:

```bash
node scripts/verify-routes.js
```

---

## 11. Final Submission Verification Checklist

- [x] **Project Built & Configured**: Full-stack application developed with Next.js 14 and Express.js.
- [x] **Working Functionality**: All CRUD operations, email sending, draft auto-save, and AI tools active.
- [x] **Database Connected**: MongoDB Atlas connection configured with in-memory fallback resilience.
- [x] **Authentication Working**: Login, registration, and session management verified.
- [x] **Google Mail Design**: Authentic Google Workspace UI with responsive layouts.
- [x] **No Secrets Exposed**: `.gitignore` configured to protect all `.env` files and credentials.
- [x] **GitHub Repository Live**: [https://github.com/avantika0626/intellimail-ai](https://github.com/avantika0626/intellimail-ai)
- [x] **Deployment Ready**: Deployment blueprints included for Vercel, Render, and Docker.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
