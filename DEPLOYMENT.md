# 🚀 Complete Project Deployment Guide — IntelliMail AI

This step-by-step guide walks you through deploying **IntelliMail AI** to production using the standard modern deployment stack:
- **Frontend** ➔ **Vercel**
- **Backend** ➔ **Render**
- **Database** ➔ **MongoDB Atlas**
- **Source Code** ➔ **GitHub**

---

## 📁 Repository Structure Overview

```
Agentic AI automatic platform/
├── client/                     # Next.js 14 Frontend (Deploy to Vercel)
│   ├── src/
│   │   ├── components/         # Google Mail UI components & AI companions
│   │   ├── pages/              # Routing: /, /login, /register, /dashboard, etc.
│   │   ├── store/              # State management (authStore, mailStore)
│   │   ├── styles/             # Tailwind CSS & Google Mail theme
│   │   └── services/           # Axios API client
│   ├── public/                 # Static assets & icons
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                     # Express.js REST API Backend (Deploy to Render)
│   ├── src/
│   │   ├── controllers/        # Gmail, AI, Auth, Activity, Settings handlers
│   │   ├── middleware/         # JWT auth guard, error handler
│   │   ├── models/             # Mongoose & In-Memory Schemas
│   │   ├── routes/             # RESTful API route mounts
│   │   ├── services/           # Gmail API sync, AI Summaries/Replies/NLP
│   │   ├── config/             # Environment & DB configurations
│   │   └── server.js           # Server entrypoint
│   ├── test/                   # Automated backend integration test suite
│   ├── package.json
│   └── .env.example
│
├── vercel.json                 # Vercel deployment & proxy config
├── render.yaml                 # Render infrastructure-as-code blueprint
├── docker-compose.yml          # Containerized local/cloud deployment
├── .gitignore                  # Git ignore rules for node_modules and .env
├── README.md                   # Project documentation & feature overview
└── DEPLOYMENT.md               # This deployment guide
```

---

## 🛠️ Step 1: Pre-Deployment Verification Checklist

Before deploying, ensure your application passes all local checks:

| Area | Checkpoint | Status |
|---|---|:---:|
| **Navigation** | All 9 pages load cleanly without console errors | ✅ Passed |
| **Auth** | Sign in with demo credentials or register a new user | ✅ Passed |
| **CRUD** | Save drafts, edit drafts, delete messages, create templates | ✅ Passed |
| **Sending** | Send outbound email and verify draft conversion | ✅ Passed |
| **AI Features** | Generate summaries, multi-tone replies, action tasks, and deadlines | ✅ Passed |
| **Backend API** | Run `node server/test/intellimail.test.js` | ✅ 100% Passed (15/15) |

---

## 🗄️ Step 2: Set Up Database on MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Click **Create a Deployment** and select the **M0 Free Shared Cluster** (AWS or Google Cloud).
3. Under **Security Quickstart**:
   - **Username & Password**: Create a database user (e.g. `intellimail_admin` / password). Save this password!
   - **IP Access List**: Click **Add My Current IP Address**, and also add `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
4. Click **Finish and Close**.
5. On your Cluster Overview, click **Connect** ➔ **Drivers** (Node.js).
6. Copy the connection string:
   ```text
   mongodb+srv://intellimail_admin:<password>@cluster0.abcde.mongodb.net/intellimail_ai?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password).*

> 💡 **Note**: If you skip MongoDB Atlas, IntelliMail AI will automatically run in high-performance **In-Memory fallback mode** with complete session data persistence.

---

## 🐙 Step 3: Push Source Code to GitHub

1. Open your terminal in the project root (`Agentic AI automatic platform`):
   ```bash
   git init
   git add .
   git commit -m "feat: complete IntelliMail AI Google Mail workspace"
   ```
2. Go to [GitHub](https://github.com/new) and create a new repository (e.g. `intellimail-ai`).
3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/intellimail-ai.git
   git push -u origin main
   ```

---

## ⚙️ Step 4: Deploy Backend to Render

1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository (`intellimail-ai`).
3. Configure the Web Service settings:
   - **Name**: `intellimail-ai-backend`
   - **Region**: Choose the region closest to you (e.g., Oregon / Frankfurt / Singapore)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** ➔ **Add Environment Variables**:

| Key | Recommended Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-frontend.vercel.app` *(update after Step 5)* |
| `JWT_SECRET` | `generate-any-32-char-random-key-here-12345` |
| `ENCRYPTION_KEY` | `generate-any-32-char-random-key-here-67890` |
| `MONGODB_URI` | `mongodb+srv://... (Your MongoDB Atlas connection string from Step 2)` |
| `GOOGLE_CLIENT_ID` | *(Optional: Your Google Cloud Client ID for live Gmail sync)* |
| `GOOGLE_CLIENT_SECRET` | *(Optional: Your Google Cloud Client Secret)* |
| `GOOGLE_REDIRECT_URI` | `https://intellimail-ai-backend.onrender.com/api/gmail/oauth/callback` |

5. Click **Create Web Service**.
6. Wait 1–2 minutes until the deployment completes. Copy your live Render Backend URL:
   `https://intellimail-ai-backend.onrender.com`
7. Test the health endpoint in your browser:
   `https://intellimail-ai-backend.onrender.com/api/health` ➔ should return `{"status":"ok"}`.

---

## 🎨 Step 5: Deploy Frontend to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** ➔ **Project**.
2. Import your GitHub repository (`intellimail-ai`).
3. In the project configuration screen:
   - **Project Name**: `intellimail-ai`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `client`
4. Expand **Environment Variables** and add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://intellimail-ai-backend.onrender.com/api` |

5. Click **Deploy**!
6. Vercel will build the Next.js app and provide your live URL (e.g. `https://intellimail-ai.vercel.app`).

---

## 🔄 Step 6: Link Frontend & Backend CORS Settings

1. Copy your live Vercel URL: `https://intellimail-ai.vercel.app`.
2. Go back to [Render Dashboard](https://dashboard.render.com/) ➔ Select `intellimail-ai-backend` ➔ **Environment**.
3. Update the `CLIENT_URL` environment variable:
   - `CLIENT_URL` = `https://intellimail-ai.vercel.app`
4. Click **Save Changes** (Render will automatically re-deploy in seconds).

---

## 🔒 Step 7: (Optional) Enable Live Google OAuth 2.0

If you want live Gmail sync on your deployed app:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) ➔ **APIs & Services** ➔ **Credentials**.
2. Edit your **OAuth 2.0 Client ID**.
3. Under **Authorized JavaScript origins**, add:
   - `https://intellimail-ai.vercel.app`
4. Under **Authorized redirect URIs**, add:
   - `https://intellimail-ai-backend.onrender.com/api/gmail/oauth/callback`
5. Save changes.

---

## ✅ Step 8: Final Production Smoke Test

Visit your live Vercel domain (`https://intellimail-ai.vercel.app`):
1. **Sign In**: Click **Sign In** ➔ click **"Fill Demo Operator Credentials"** ➔ click **Next**.
2. **View Inbox**: Verify your 6 pre-seeded emails and the **Today's Inbox Overview** card render.
3. **Test Gemini AI Tools**: Open an email and click **Summary**, **Help me Reply**, **Explain**, and **Tasks**.
4. **Test Compose & Drafts**: Click **`+ Compose`**, write an email, click **Save Draft**, and confirm it appears in the **Drafts** mailbox.
5. **Send Outbound**: Click **Send Email** and confirm the success notification.

🎉 **Your IntelliMail AI Workspace is now 100% Live in Production!**
