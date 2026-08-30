Complete Specification
Project Overview & Tech Stack
Project Overview
Build a full-stack AI Operations Automation Platform called Agentic AI Automation Platform (Agentflow_AI) that lets operators describe an automation in natural language and turn it into an executable visual workflow. The platform must generate workflow graphs from prompts, render those graphs on a drag-and-drop canvas, execute them through a chain of cooperating AI agents, integrate with real third-party tools (Gmail, Slack, Discord, Google Sheets) over OAuth, queue and retry background jobs, stream live execution events to the browser, and persist a full timeline of every step for auditing.
Tech Stack
Frontend: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (@xyflow/react), Socket.IO client, and lucide-react icons.
Backend: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, BullMQ on Redis (via ioredis), Socket.IO, helmet, morgan, compression, express-validator, and bcryptjs.
AI Integration: OpenRouter API and Google Generative AI SDK, with LangChain and LangGraph available for agentic orchestration.
Integrations: OAuth and bot integrations covering Gmail, Slack, Discord, and Google Sheets. Sensitive credentials are encrypted at rest with an application-level key.
Authentication, Workflows, and Agentic Orchestration
Authentication
The authentication system must support registration, login, JWT-based session handling, protected routes, an /auth/me profile endpoint, role separation between admin and operator, password hashing with bcrypt at cost factor 12, and persistent login state on the client through Zustand.
Workflow Management
Users must be able to create workflows manually, generate workflows from a natural-language prompt, list and search their workflows, open any workflow on a React Flow canvas, drag nodes from a palette, configure each node through a side panel, save, duplicate, version, and delete workflows, and trigger executions on demand. Every workflow stores its nodes, edges, trigger configuration, tags, and version number.
Agentic Orchestration
For agentic execution, the backend must run each workflow through a fixed chain of agents:
Planner Agent: Decides node ordering and emits a confidence score.
Execution Agent: Runs each node against the correct integration or AI provider.
Validation Agent: Verifies required output fields.
Recovery Agent: Classifies failures (MISSING_FIELDS, API_FAILURE, AUTH_EXPIRED, RATE_LIMIT, TRANSIENT) and decides between retry_with_backoff and escalate.
Monitoring Agent: Emits timeline events.
LangGraph must be importable as the orchestration substrate, and the orchestrator must report langGraph: 'available' | 'not-installed' with each run.
Integrations, Executions, AI Generation, and Real-Time Layer
Third-Party Integrations
The integrations layer must support Gmail (send/read mail), Slack (post messages/subscribe to events), Discord (post bot messages), and Google Sheets (append rows/read ranges). Each provider must support an OAuth start endpoint, an OAuth callback endpoint, and a connected/disconnected status. Access tokens and refresh tokens must be encrypted at rest using CREDENTIAL_ENCRYPTION_KEY. The connection state must be visible from the integrations page, and a missing or expired credential must surface as a clear INTEGRATION_NOT_CONNECTED or AUTH_EXPIRED error in the execution timeline rather than a silent failure.
Execution Engine
The backend must persist every run as an Execution document with one of PENDING, RUNNING, COMPLETED, FAILED, RETRYING, PAUSED, or CANCELLED status, record the workflow snapshot at runtime, capture input, output, error, duration, and retry count, and write one ExecutionLog row per agent event. Users must be able to pause, resume, and cancel a running execution. BullMQ on Redis must handle background scheduling and retry backoff, with an in-memory fallback when Redis is not configured.
AI Workflow Generation
When a user submits a prompt, the system must return a complete workflow with named nodes, positions, edges, and per-node configuration. The generator must prefer OpenRouter when OPENROUTER_API_KEY is set, fall back to Google Gemini when GEMINI_API_KEY is set, and fall back to a deterministic rule-based builder when neither is available. The deterministic builder must still produce a runnable graph for common prompts (send email, invoice routing, Slack/Discord notification, sheet append).
Real-Time Layer
The Socket.IO server must broadcast agent events (planner, execution, validation, recovery, monitoring) for each execution to subscribed clients, and the client must render those events as a live timeline. Notifications generated during execution (success, failure, escalation) must persist and appear in a notifications drawer.
Frontend Pages
The application uses the Next.js Pages Router. The root / page redirects authenticated users to the dashboard and unauthenticated users to login.
/ – Landing page featuring platform introduction, multi-agent orchestration showcase, CTA buttons, and responsive layout with dark theme support.
/login – Form for email/password authentication with JWT handling, Zustand persistence, validation, and error states.
/register – Form for user registration with password validation, session persistence, and error handling.
/dashboard – Operator console with workflow metrics (MetricGrid), active workflow statistics, recent execution summaries, success rate indicators, AI activity feed, and real-time execution panels (AppShell layout).
/workflows/builder – Prompt-to-workflow generation page featuring PromptInputPanel, GraphPreviewPanel, WorkflowCanvas (React Flow), and WorkflowToolbar.
/workflows/[id] – Full workflow editor with node palette on the left, canvas in the center, node configuration panel on the right, plus execution controls and logs.
/executions – List of workflow executions with status badges, execution duration, timeline links, logs, filter/sort options, pagination, and live updates via Socket.IO.
/integrations – Status page for Gmail, Slack, Discord, and Google Sheets integrations with OAuth connection flows, reconnect buttons, and status toggles.
/settings – Profile management, user role details, API key/encryption key health checks, security controls, and theme settings.
Backend Architecture & Database Collections
Backend Architecture
Routes: Handles HTTP routing, request validation via express-validator, and middleware composition (auth, validation, error handler).
Controllers: Request parsing and response shaping only (never talks directly to MongoDB).
Services: Business logic ownership (workflow CRUD, execution lifecycle, token encryption, retry classification, notification creation, AI generation, log aggregation).
Agents Layer: Holds planner, execution, validation, recovery, monitoring, and orchestrator modules.
Integrations Layer: Wraps third-party SDKs behind a common interface defined in baseIntegration.js.
Queues Layer: Wraps BullMQ and Redis.
Config Layer: Centralizes environment variables, MongoDB connection (with in-memory fallback), and Socket.IO setup.
Database Collections
Users: Stores authenticated users (name, email, password with select: false, role: admin | operator, lastLogin).
Workflows: Stores workflows (name, description, owner, status: draft | active | paused | archived, triggerConfig, nodes, edges, version, tags).
Executions: Stores run instances (workflowId, immutable workflow snapshot, status, currentNode, startTime, endTime, duration, inputs, outputs, error, retryCount).
ExecutionLogs: Stores granular timeline events (executionId, workflowId, nodeId, agent: planner | execution | validation | recovery | monitoring, level: info | warning | error | success, message, metadata).
Integrations: Stores third-party connections (owner, provider: gmail | slack | google-sheets | discord | openrouter | gemini, isConnected, scopes, encrypted tokens, expiresAt).
Notifications: Stores alerts (owner, workflowId, executionId, type, title, message, isRead).
AgentMemory: Stores agent context across execution steps (workflowId, executionId, agentId, key, value, confidenceScore).
API Endpoints
Health and Auth
GET /api/health – System heartbeat and status check.
POST /api/auth/register – Register a new user account.
POST /api/auth/login – Authenticate user and issue JWT.
GET /api/auth/me – Fetch current user profile.
Workflows
GET /api/workflows/dashboard – Aggregated workflow and execution stats.
GET /api/workflows – List user workflows with pagination/filtering.
POST /api/workflows – Create a new workflow manually.
POST /api/workflows/generate – Generate workflow graph from prompt via AI.
GET /api/workflows/:id – Fetch single workflow details.
PUT /api/workflows/:id – Update existing workflow structure.
POST /api/workflows/:id/duplicate – Clone an existing workflow.
POST /api/workflows/:id/execute – Trigger an execution run.
DELETE /api/workflows/:id – Delete a workflow.
Executions
GET /api/executions – List all execution runs.
GET /api/executions/:id – Fetch execution run details and snapshot.
GET /api/executions/:id/timeline – Fetch detailed agent timeline logs.
POST /api/executions/:id/pause – Pause an active run.
POST /api/executions/:id/resume – Resume a paused run.
POST /api/executions/:id/cancel – Cancel a running execution.
Integrations & Notifications
GET /api/integrations – List all user integration connections.
GET /api/integrations/status – Provider health and token validity checks.
GET /api/integrations/oauth/:provider/start – Initiate OAuth flow.
GET /api/integrations/oauth/:provider/callback – Handle OAuth callback.
GET /api/integrations/oauth/error – OAuth error response endpoint.
POST /api/integrations – Manual integration credential setup.
GET /api/notifications – List user notifications.
Folder Structure & Development Phases
Frontend Structure
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── MetricGrid/
    │   ├── NodePalette/
    │   ├── NodeConfigPanel/
    │   ├── WorkflowCanvas/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── integrations.js
    │   ├── settings.js
    │   ├── executions/
    │   │   ├── index.js
    │   │   └── [id].js
    │   └── workflows/
    │       ├── index.js
    │       ├── builder.js
    │       └── [id].js
    ├── store/
    │   ├── authStore.js
    │   └── workflowStore.js
    └── services/
        ├── api.js
        └── socket.js


Backend Structure
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── socket.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── workflowRoutes.js
    │   ├── executionRoutes.js
    │   ├── integrationRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── workflowController.js
    │   ├── executionController.js
    │   └── integrationController.js
    ├── services/
    │   ├── authService.js
    │   ├── workflowService.js
    │   ├── executionService.js
    │   ├── aiService.js
    │   └── integrationService.js
    ├── agents/
    │   ├── orchestrator.js
    │   ├── plannerAgent.js
    │   ├── executionAgent.js
    │   ├── validationAgent.js
    │   ├── recoveryAgent.js
    │   └── monitoringAgent.js
    ├── integrations/
    │   ├── baseIntegration.js
    │   ├── gmailIntegration.js
    │   ├── slackIntegration.js
    │   ├── discordIntegration.js
    │   └── googleSheetsIntegration.js
    ├── models/
    │   ├── User.js
    │   ├── Workflow.js
    │   ├── Execution.js
    │   ├── ExecutionLog.js
    │   ├── Integration.js
    │   └── Notification.js
    └── queues/
        └── executionQueue.js


Development Phases
Phase 1: Project setup (Next.js, Express, MongoDB with in-memory fallback, JWT authentication, Zustand auth store, AppShell layout).
Phase 2: Workflow CRUD, canvas integration with React Flow, node palette, configuration panel, and metadata persistence.
Phase 3: AI prompt-to-workflow generation (OpenRouter primary, Gemini fallback, deterministic rule engine fallback).
Phase 4: Multi-agent orchestration engine (planner, executor, validator, recovery, monitoring) and execution control lifecycle (pause, resume, cancel).
Phase 5: Third-party OAuth integrations (Gmail, Slack, Discord, Google Sheets) with credential encryption.
Phase 6: BullMQ background queues, Socket.IO real-time event streaming, live execution timeline updates, and notification drawer.
UI, Security, Outcome, and Codex Instructions
UI and UX Requirements
The UI must use a clean operator-console aesthetic with Tailwind, be fully responsive, include loading states and skeleton loaders, render the workflow graph with React Flow including animated edges, support drag-from-palette node creation, surface a right-hand configuration panel for any selected node, render live execution events in a timeline with color-coded agent badges (planner / execution / validation / recovery / monitoring), and provide a notifications drawer accessible from the AppShell.
Security Requirements
The application must hash passwords with bcrypt at cost 12, sign and verify JWTs with JWT_SECRET, encrypt OAuth access and refresh tokens at rest with CREDENTIAL_ENCRYPTION_KEY, set HTTP security headers via helmet, apply CORS limited to CLIENT_URL, rate-limit auth endpoints via express-rate-limit, validate every request body with express-validator, never log decrypted tokens, and treat any missing or expired credential as an explicit INTEGRATION_NOT_CONNECTED / AUTH_EXPIRED error rather than a generic 500.
Final Expected Outcome
The completed platform must let an operator describe an automation in plain English, watch it materialize as a graph on the canvas, save it, execute it through the agent chain, see each agent event stream in real time, recover or escalate failures automatically, and receive notifications—all backed by real OAuth integrations and a full audit trail in MongoDB. The final application should feel like a modern operations console—close in spirit to n8n or Zapier, but with an explicit agentic execution layer on top.
Codex & AI Agent Implementation Instructions
The AI coding agent must build the application phase by phase, follow the folder structure strictly, keep controllers thin and push logic into services, keep agents pure (no HTTP knowledge), wrap every integration behind the baseIntegration interface, never call Mongo from a controller, never call an integration from an agent without going through the integration service, treat every secret as process.env, use the in-memory store fallback when Mongo or Redis is unavailable so local dev still works, emit a Socket.IO event for every agent step, write one ExecutionLog per agent event, and report the list of files created or changed at the end of every phase.
# PROJECT BUILD SPECIFICATION

# Intelligent AI Email Assistant

## 1. PROJECT OVERVIEW

Build a complete, production-style full-stack web application called:

**IntelliMail AI**
**Tagline:** *Your AI-powered email workspace.*

The application is an AI-powered email management platform that allows users to securely connect their Gmail account using Google OAuth and manage their emails from a custom dashboard.

Users should be able to:

* Connect their Gmail account securely using OAuth
* View inbox emails and email threads
* Search and filter emails
* Read complete emails
* Mark emails as read or unread
* Star emails
* Archive emails
* Delete emails
* Compose and send emails
* Reply to emails
* Generate AI-powered summaries
* Generate AI-powered replies
* Edit AI-generated replies before sending
* Choose the tone of AI-generated responses
* Extract action items and deadlines
* Classify and prioritize emails
* View email activity/history
* Monitor connected account status

The application must have a polished, modern SaaS-style UI and a fully working frontend-backend integration.

---

# 2. MAIN GOAL

The application should solve the problem of email overload.

Instead of forcing users to manually read every long email, understand what action is required, and write replies from scratch, IntelliMail AI should use AI to help users:

1. Understand emails faster
2. Identify important messages
3. Extract important actions and deadlines
4. Generate useful replies
5. Organize their inbox efficiently

The AI should assist the user, but the user must always have control over important actions such as sending emails or deleting emails.

---

# 3. REQUIRED TECH STACK

Use the following stack unless there is a strong technical reason to substitute an equivalent.

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Modern component library such as shadcn/ui
* Lucide icons

## Backend

Use one of the following:

### Preferred

Next.js API routes / server actions for backend functionality.

OR, if a separate backend is preferred:

* Node.js
* Express
* TypeScript

The architecture must be clean and modular.

## Database

Use:

* PostgreSQL

Recommended ORM:

* Prisma

Database should store application-level user information, connected accounts, OAuth metadata where appropriate, preferences, activity history, cached metadata, and AI activity.

Do not unnecessarily duplicate the entire Gmail mailbox if Gmail remains the source of truth.

## Authentication

Use secure authentication combined with Google OAuth.

Recommended:

* Auth.js / NextAuth

The system must support:

* User login
* Secure session handling
* Google OAuth
* Gmail permission scopes
* Account connection status
* Logout

## AI Provider

Create an abstraction layer so the AI provider can be changed easily.

Possible providers:

* OpenAI API
* Google Gemini API
* Anthropic API

The provider API key must only exist on the server.

Never expose AI API keys to the frontend.

---

# 4. USER ROLES

For the initial version, implement one primary role:

## Standard User

A user can:

* Connect Gmail
* Access their own emails
* Use AI features
* Compose emails
* Send emails
* Manage their mailbox
* View their activity

Users must never be able to access another user's Gmail data.

Ensure proper authorization checks on every server-side request.

---

# 5. COMPLETE USER FLOW

## First-Time User Flow

```text
Landing Page
      ↓
Sign Up / Log In
      ↓
Connect Gmail
      ↓
Google OAuth Login
      ↓
Google Consent Screen
      ↓
Permission Granted
      ↓
Secure Token Storage
      ↓
Gmail Account Connected
      ↓
Inbox Dashboard
```

## Email Reading Flow

```text
User Opens Inbox
      ↓
Application Fetches Emails
      ↓
User Selects Email
      ↓
Email Content Opens
      ↓
User Can:
- Read
- Summarize with AI
- Explain Email
- Extract Action Items
- Extract Dates
- Generate Reply
- Reply Manually
- Archive
- Star
- Delete
```

## AI Reply Flow

```text
Open Email
      ↓
Click "Generate Reply"
      ↓
Select Tone
      ↓
AI Analyzes Email Context
      ↓
Generate Draft
      ↓
Show Editable Draft
      ↓
User Reviews and Edits
      ↓
User Clicks Send
      ↓
Email Sent Through Gmail API
      ↓
Activity Logged
```

---

# 6. APPLICATION PAGES

Build the following pages.

---

## 6.1 LANDING PAGE

Create a professional SaaS landing page.

### Hero Section

Title:

**Your Inbox, Powered by AI**

Subtitle:

> Manage emails faster with AI-powered summaries, smart replies, action item extraction, and intelligent inbox organization.

Buttons:

* Get Started
* Connect Gmail

### Feature Section

Display cards for:

* AI Email Summaries
* Smart Reply Generation
* Action Item Extraction
* Deadline Detection
* Inbox Organization
* Intelligent Search

### How It Works

```text
1. Connect Gmail
        ↓
2. Read and Manage Emails
        ↓
3. Let AI Summarize and Assist
        ↓
4. Review and Send
```

### Security Section

Explain:

* Secure Google OAuth
* No email passwords collected
* User-controlled permissions
* Secure server-side API access

### Footer

Include:

* Product
* Features
* Security
* Privacy
* Terms
* GitHub if applicable

---

# 7. AUTHENTICATION AND GMAIL CONNECTION

## Google OAuth Flow

The Gmail connection must follow this flow:

```text
User clicks Connect Gmail
        ↓
Redirect to Google
        ↓
User logs in with Google
        ↓
Google shows requested permissions
        ↓
User approves
        ↓
OAuth callback
        ↓
Application securely stores required authorization data
        ↓
Gmail account connected
```

Do not ever ask the user for their Gmail password.

### Gmail API Permissions

Request only the minimum scopes necessary for implemented features.

Potential capabilities include:

* Read emails
* Modify mailbox state
* Send emails

Keep scopes configurable and documented.

---

# 8. EMAIL DASHBOARD

The main application dashboard should have a modern Gmail-inspired layout.

## Layout

```text
-----------------------------------------------------
| Logo        Search Emails              Profile     |
-----------------------------------------------------
| Sidebar       | Email List | Email Content        |
|               |            |                      |
| Inbox         | Email 1    | Selected Email       |
| Starred       | Email 2    |                      |
| Sent          | Email 3    | Subject              |
| Drafts        | Email 4    | Sender               |
| Archive       |            | Full Message         |
| Trash         |            |                      |
|               |            | AI Actions           |
-----------------------------------------------------
```

The layout must be responsive.

On smaller screens:

* Sidebar should collapse
* Email list and message view should transition smoothly
* Important controls must remain accessible

---

# 9. EMAIL LIST

Each email row should show:

* Sender name
* Sender email if appropriate
* Subject
* Short preview/snippet
* Timestamp/date
* Read/unread state
* Star state
* Important/priority indicator if available
* AI priority badge if enabled

Features:

* Pagination or infinite scrolling
* Loading state
* Empty state
* Error state
* Refresh button

Support:

* Inbox
* Starred
* Sent
* Drafts
* Archive
* Trash

---

# 10. EMAIL DETAIL VIEW

When the user opens an email, display:

## Header

* Subject
* Sender
* Recipient
* Date and time
* Email labels where available

## Body

Render the email safely.

Support:

* Plain text emails
* HTML emails

Sanitize HTML before rendering.

Do not render unsafe scripts or active content.

## Actions

Include buttons for:

* Reply
* Reply All
* Forward
* Star
* Mark Read/Unread
* Archive
* Delete
* AI Summary
* Explain This Email
* Extract Action Items
* Extract Dates/Deadlines
* Generate AI Reply

---

# 11. EMAIL THREADS

Emails belonging to the same conversation should be grouped using Gmail thread information.

Display:

```text
Thread Subject

Message 1
↓
Message 2
↓
Message 3
```

The user should be able to:

* Expand individual messages
* Collapse messages
* View the complete conversation
* Generate AI summaries based on the entire thread
* Generate replies using relevant thread context

Avoid using unrelated messages when generating replies.

---

# 12. EMAIL SEARCH

Implement a search bar.

Support standard Gmail-style searching where feasible.

Examples:

```text
from:john@example.com
subject:meeting
has:attachment
after:2026/01/01
```

Also implement a simple user-friendly search mode.

The backend should safely pass supported queries to Gmail search functionality.

---

# 13. BASIC EMAIL MANAGEMENT

Users must be able to:

### Mark as Read

Update the Gmail message state.

### Mark as Unread

Update the Gmail message state.

### Star

Add the star label.

### Unstar

Remove the star label.

### Archive

Remove from inbox while preserving the email.

### Delete

Move the message to trash.

Before destructive actions, show confirmation where appropriate.

Use optimistic UI updates carefully and revert the UI if the API operation fails.

---

# 14. EMAIL COMPOSITION

Create a compose email modal or page.

Fields:

* To
* CC
* BCC
* Subject
* Message Body

Features:

* Rich text or well-supported plain text composition
* AI subject suggestion
* Grammar improvement
* Rewrite assistance
* Tone adjustment

Buttons:

* Send
* Save Draft
* Discard

The user must explicitly click Send.

AI must never automatically send an email without user confirmation.

---

# 15. AI EMAIL SUMMARIZATION

Add a button:

**Summarize with AI**

When clicked:

1. Send relevant email content to the server.
2. Server prepares a safe AI request.
3. AI generates a concise summary.
4. Display the summary in the UI.

Suggested format:

```text
SUMMARY

The client is requesting an update on the project timeline.

KEY POINTS

• Project deadline is approaching.
• Client requires an update by Friday.
• A revised timeline may be needed.

ACTION REQUIRED

Send the updated project timeline.
```

The user should be able to:

* Copy summary
* Regenerate summary
* Choose short or detailed summary

---

# 16. AI-GENERATED REPLIES

Add a button:

**Generate AI Reply**

Before generation, allow tone selection:

* Professional
* Friendly
* Formal
* Concise
* Apologetic
* Confident

The AI should receive:

* Current email
* Relevant thread context
* Selected tone
* Optional user instructions

Example:

```text
Instruction:
Reply professionally and confirm that the report will be sent by Friday.
```

The generated reply should open in an editable editor.

The user can:

* Edit text
* Regenerate
* Change tone
* Copy
* Insert into reply
* Send manually

Never automatically send AI-generated messages.

---

# 17. EXPLAIN THIS EMAIL

Create an AI feature called:

**Explain This Email**

This should simplify complicated emails.

Example output:

```text
WHAT THIS MEANS

The sender is asking you to provide the revised proposal.

WHAT YOU NEED TO DO

1. Review the proposal.
2. Make the requested changes.
3. Send it before Friday.

DEADLINE

Friday, 5 PM
```

This feature should be especially useful for:

* Long emails
* Complex instructions
* Technical communication
* Formal communication

---

# 18. ACTION ITEM EXTRACTION

Create:

**Extract Action Items**

Example output:

```text
ACTION ITEMS

☐ Review attached document
☐ Update project timeline
☐ Send response to client
```

Each action item should optionally support:

* Mark as completed locally
* Copy
* Add to task system in future versions

---

# 19. DATE AND DEADLINE EXTRACTION

Create:

**Extract Dates & Deadlines**

Example:

```text
IMPORTANT DATES

📅 September 5 — Submit report
📅 September 10 — Team meeting
⏰ Friday 5 PM — Reply to client
```

The AI should distinguish between:

* Explicit deadlines
* Meetings
* Mentioned dates
* Suggested timeframes

Do not present uncertain dates as guaranteed facts.

If confidence is low, indicate that the date may need confirmation.

---

# 20. AI EMAIL CLASSIFICATION

Implement optional classification.

Possible categories:

* Important
* Work
* Personal
* Finance
* Promotions
* Updates
* Social
* Other

Display the AI category as a badge.

Classification should not permanently modify Gmail labels unless the user explicitly chooses to apply changes.

---

# 21. PRIORITY DETECTION

Create an AI priority system.

Possible levels:

```text
🔴 High Priority
🟡 Medium Priority
🟢 Low Priority
```

The AI should analyze factors such as:

* Explicit deadlines
* Urgent language
* Requests requiring action
* Important contacts if configured by the user

Clearly indicate that AI priority is an assistant-generated suggestion.

---

# 22. SPAM / PHISHING ASSISTANCE

If implementing phishing detection, use cautious wording.

Possible warnings:

```text
⚠️ Potentially Suspicious Email

Reasons:
• Unexpected request
• Suspicious link pattern
• Unusual sender information
```

Do not automatically delete emails based only on AI analysis.

Allow the user to review the email.

---

# 23. SMART AI SEARCH

Implement an optional semantic search interface.

Example user query:

> Show me emails where someone asked me to submit something before next week.

The AI/search layer should identify relevant messages.

Keep standard Gmail search available as the reliable default.

Clearly separate:

* Standard Search
* AI Smart Search

---

# 24. ACTIVITY HISTORY

Create an Activity page.

Record relevant application actions such as:

```text
10:30 AM — AI Summary generated
10:32 AM — AI Reply generated
10:35 AM — Email sent
10:40 AM — Email archived
```

Activity data should belong only to the authenticated user.

Include:

* Timestamp
* Action type
* Related email/thread identifier where appropriate
* Status

Possible filters:

* AI Actions
* Email Actions
* Today
* This Week

---

# 25. SETTINGS PAGE

Include:

## Connected Accounts

Show:

* Connected Gmail account
* Connection status
* Disconnect button

## AI Preferences

Allow users to configure:

* Default reply tone
* Default summary length
* Enable/disable priority suggestions
* Enable/disable classification

## Privacy

Explain what email content is processed when AI features are used.

## Danger Zone

Allow:

* Disconnect Gmail
* Delete application data if implemented

Disconnecting an account should revoke or invalidate application access as appropriate.

---

# 26. DATABASE DESIGN

Use a relational database.

Suggested models:

## User

```text
id
name
email
image
createdAt
updatedAt
```

## ConnectedAccount

```text
id
userId
provider
providerAccountId
email
accessTokenEncrypted
refreshTokenEncrypted
tokenExpiry
scopes
createdAt
updatedAt
```

Sensitive tokens must not be stored as plain text if persistent storage is required.

## UserPreferences

```text
id
userId
defaultTone
summaryLength
priorityEnabled
classificationEnabled
createdAt
updatedAt
```

## Activity

```text
id
userId
actionType
resourceId
metadata
status
createdAt
```

## AIInteraction

Optionally store metadata such as:

```text
id
userId
type
resourceId
model
status
createdAt
```

Avoid unnecessarily storing sensitive email content in the database.

Gmail should remain the primary source of mailbox content.

---

# 27. BACKEND API DESIGN

Create clean APIs or equivalent server actions.

Suggested endpoints:

## Authentication

```text
GET /api/auth/*
```

Authentication routes depend on the selected authentication framework.

---

## Gmail

```text
GET /api/gmail/messages
GET /api/gmail/messages/:id
GET /api/gmail/threads/:id

POST /api/gmail/send

POST /api/gmail/messages/:id/star
POST /api/gmail/messages/:id/unstar

POST /api/gmail/messages/:id/read
POST /api/gmail/messages/:id/unread

POST /api/gmail/messages/:id/archive
POST /api/gmail/messages/:id/delete

GET /api/gmail/search
```

---

## AI

```text
POST /api/ai/summarize
POST /api/ai/generate-reply
POST /api/ai/explain
POST /api/ai/extract-actions
POST /api/ai/extract-dates
POST /api/ai/classify
POST /api/ai/priority
POST /api/ai/rewrite
POST /api/ai/generate-subject
```

---

## Activity

```text
GET /api/activity
```

Every protected endpoint must verify:

1. User authentication
2. User authorization
3. Ownership of the requested resource where applicable

---

# 28. AI ARCHITECTURE

Create a reusable AI service layer.

Suggested structure:

```text
/lib
    /ai
        provider.ts
        prompts.ts
        summarize.ts
        generateReply.ts
        explainEmail.ts
        extractActions.ts
        extractDates.ts
        classifyEmail.ts
        detectPriority.ts
```

The application should not scatter AI prompts throughout frontend components.

Centralize AI logic.

---

# 29. AI PROMPT REQUIREMENTS

AI prompts should instruct the model to:

* Stay grounded in the provided email/thread content
* Avoid inventing deadlines or facts
* Clearly identify uncertainty
* Produce structured output where required
* Avoid sending emails automatically
* Follow selected tone instructions
* Keep replies relevant and concise

For structured features, prefer predictable JSON responses.

Example:

```json
{
  "summary": "The client is requesting a revised timeline.",
  "keyPoints": [
    "Deadline is Friday",
    "Budget needs approval"
  ],
  "actionRequired": [
    "Send revised timeline"
  ]
}
```

Validate AI output on the server before returning it to the frontend.

---

# 30. SECURITY REQUIREMENTS

Security is extremely important.

## Never Do the Following

* Never ask users for Gmail passwords
* Never expose OAuth client secrets
* Never expose access tokens
* Never expose refresh tokens
* Never expose AI API keys
* Never commit `.env` files to GitHub
* Never put secrets in frontend JavaScript
* Never trust client-side authorization alone

## Required Security Practices

### OAuth

Use the proper OAuth authorization flow.

Use secure redirect URIs.

Validate OAuth state where applicable.

Request minimum necessary permissions.

### API Security

All sensitive API routes must:

* Require authentication
* Verify authorization
* Validate request input
* Handle errors safely

### Input Validation

Use a schema validation library such as:

* Zod

Validate:

* API request bodies
* Query parameters
* AI options
* Email sending fields

### XSS Protection

Email HTML must be sanitized before rendering.

Do not directly inject untrusted HTML.

### Token Protection

Sensitive OAuth tokens should be protected server-side.

If stored, use secure encryption or a secure token storage mechanism appropriate to the deployment environment.

### Rate Limiting

Implement rate limiting for AI endpoints where practical.

Especially protect:

* AI generation
* Email sending
* Authentication-sensitive operations

### Logging

Do not log:

* OAuth tokens
* API keys
* Full sensitive email content unnecessarily

---

# 31. ENVIRONMENT VARIABLES

Create a `.env.example` file.

Example:

```env
DATABASE_URL=

AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

OPENAI_API_KEY=

NEXT_PUBLIC_APP_URL=
```

If using another AI provider:

```env
GEMINI_API_KEY=
```

Never hardcode these values.

Document every environment variable in the README.

---

# 32. ERROR HANDLING

Implement clear error handling.

Possible states:

### Gmail API Error

```text
Unable to load emails.

[Retry]
```

### OAuth Expired

Attempt secure token refresh where supported.

If reconnection is required:

```text
Your Gmail connection needs to be renewed.

[Reconnect Gmail]
```

### AI Error

```text
Unable to generate AI response.

Please try again.
```

Provide:

* Retry button
* Clear user-friendly message
* Server-side logging without exposing secrets

---

# 33. LOADING STATES

Every asynchronous action should have a proper loading state.

Examples:

```text
Fetching emails...
Generating AI summary...
Generating reply...
Sending email...
Archiving email...
```

Use:

* Skeleton loaders
* Spinners where appropriate
* Disabled buttons during critical operations

Avoid duplicate requests.

---

# 34. EMPTY STATES

Create polished empty states.

Examples:

### No Email Selected

```text
📨

Select an email to start reading.
```

### No Search Results

```text
No emails found.

Try another search.
```

### Inbox Zero

```text
🎉

Your inbox is clear!
```

---

# 35. UI/UX DESIGN REQUIREMENTS

The UI should look like a polished modern SaaS application.

Style:

* Clean
* Professional
* Minimal
* Modern
* AI-focused

Recommended visual elements:

* Rounded cards
* Subtle borders
* Soft shadows
* Smooth transitions
* Clear typography
* Good spacing
* Responsive design

Do not make the interface look like a basic student CRUD project.

It should feel similar in quality to a modern AI productivity product.

---

# 36. COMPONENT STRUCTURE

Suggested frontend structure:

```text
/components

    /layout
        Sidebar
        Header
        MobileNavigation

    /email
        EmailList
        EmailItem
        EmailViewer
        EmailThread
        ComposeEmail
        EmailActions

    /ai
        AISummary
        AIReplyGenerator
        ExplainEmail
        ActionItems
        DeadlineExtractor
        PriorityBadge

    /dashboard
        DashboardStats
        ActivityFeed

    /ui
        Reusable UI components
```

Use reusable components.

Avoid putting the entire application inside one large component.

---

# 37. PROJECT STRUCTURE

Suggested architecture:

```text
project-root/

├── app/
│   ├── page.tsx
│   ├── dashboard/
│   ├── inbox/
│   ├── activity/
│   ├── settings/
│   └── api/
│
├── components/
│   ├── layout/
│   ├── email/
│   ├── ai/
│   └── ui/
│
├── lib/
│   ├── auth/
│   ├── gmail/
│   ├── ai/
│   ├── db/
│   ├── security/
│   └── utils/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

Adapt the structure if needed, but maintain clean separation of concerns.

---

# 38. GMAIL SERVICE LAYER

Create a dedicated Gmail service.

Example:

```text
/lib/gmail

gmailClient.ts
getMessages.ts
getMessage.ts
getThread.ts
searchMessages.ts
sendEmail.ts
updateMessage.ts
```

The frontend must not directly communicate with Gmail using exposed credentials.

All Gmail communication should happen securely through server-side code.

---

# 39. EMAIL SENDING

When sending an email:

```text
User writes or edits email
        ↓
Frontend validates required fields
        ↓
Request sent to secure backend
        ↓
Backend verifies authenticated user
        ↓
Backend validates input
        ↓
Gmail API sends message
        ↓
Success response
        ↓
UI updates
        ↓
Activity logged
```

Show clear success feedback:

```text
✓ Email sent successfully
```

If sending fails:

```text
Email could not be sent.

[Try Again]
```

---

# 40. BONUS FEATURE: DAILY AI EMAIL SUMMARY

Create an optional dashboard widget:

**Today's AI Inbox Summary**

Example:

```text
TODAY'S OVERVIEW

Total New Emails: 12

🔴 High Priority: 2
🟡 Medium Priority: 4
🟢 Low Priority: 6

TOP ACTIONS

1. Submit project report
2. Reply to client
3. Confirm meeting attendance
```

Generate only when the user requests it or according to an explicitly configured schedule.

---

# 41. BONUS FEATURE: EMAIL ANALYTICS

Create an analytics dashboard.

Possible metrics:

* Emails received
* Emails sent
* High-priority emails
* AI summaries generated
* AI replies generated
* Average response time if data is available

Use clear charts.

Keep analytics privacy-conscious.

---

# 42. BONUS FEATURE: EMAIL TEMPLATES

Allow users to save reusable templates.

Example:

```text
Template Name:
Meeting Follow-Up

Template:
Hello,

Thank you for your time today...
```

Users can:

* Create
* Edit
* Delete
* Insert template into compose/reply

---

# 43. BONUS FEATURE: MULTIPLE ACCOUNTS

Design the architecture so multiple email accounts can be supported later.

The UI may include:

```text
Connected Accounts

● work@gmail.com
● personal@gmail.com

+ Connect another account
```

Ensure account switching always maintains proper authorization.

---

# 44. ACCESSIBILITY

The application must include:

* Keyboard navigation
* Visible focus states
* Accessible buttons
* Proper labels
* ARIA attributes where needed
* Sufficient contrast
* Screen-reader-friendly controls

---

# 45. RESPONSIVE DESIGN

Support:

* Desktop
* Tablet
* Mobile

On mobile:

* Sidebar becomes collapsible
* Email list transitions to full-screen or stacked view
* Compose interface is usable
* AI actions remain easily accessible

---

# 46. PERFORMANCE

Optimize for performance.

Requirements:

* Avoid unnecessary Gmail API calls
* Cache non-sensitive metadata where appropriate
* Use pagination
* Lazy-load heavy components where useful
* Avoid loading entire email bodies unnecessarily
* Debounce search
* Prevent duplicate AI requests

---

# 47. TESTING

Include basic tests where practical.

Test:

### Authentication

* Unauthorized users cannot access protected pages

### API Authorization

* Users cannot access other users' resources

### Input Validation

* Invalid request data is rejected

### AI Features

* Correct request format
* Structured response parsing
* Error handling

### Email Operations

* Archive
* Star
* Read/unread
* Send flow

---

# 48. README DOCUMENTATION

Create a complete README.

Include:

## Project Description

Explain what IntelliMail AI does.

## Features

List all core and bonus features.

## Tech Stack

List:

* Next.js
* TypeScript
* PostgreSQL
* Prisma
* Google OAuth
* Gmail API
* AI provider
* Tailwind CSS

## Installation

```text
git clone
npm install
```

## Environment Setup

Explain `.env`.

## Database Setup

Include Prisma migration instructions.

## Google OAuth Setup

Explain:

1. Create Google Cloud project
2. Enable Gmail API
3. Configure OAuth consent screen
4. Add redirect URI
5. Add client ID and secret to environment variables

Do not include real secrets.

## Running Locally

```text
npm run dev
```

## Deployment

Document deployment requirements.

---

# 49. DEPLOYMENT

Deploy the complete application.

Recommended:

### Frontend / Next.js

* Vercel

### Database

* Neon
* Supabase PostgreSQL
* Railway PostgreSQL

Configure production environment variables securely.

Ensure OAuth redirect URLs are configured for both:

```text
Local Development
Production Deployment
```

The final deployed application should:

* Load correctly
* Support authentication
* Connect Gmail
* Fetch emails
* Execute AI features
* Send emails
* Handle errors correctly

---

# 50. FINAL DELIVERABLES

The final project must include:

## Fully Working Application

Not just UI mockups.

## Working Frontend

All screens functional.

## Working Backend

All API integrations functional.

## Gmail OAuth

Securely implemented.

## Gmail API Integration

Working for supported operations.

## AI Integration

Working summaries and replies.

## Database

Proper schema and migrations.

## Security

Secrets protected.

## Environment Configuration

`.env.example` included.

## README

Complete setup instructions.

## Deployment

Provide a working deployed application.

## Source Code

Clean and organized.

---

# 51. DEVELOPMENT PRIORITY

Build in this order.

## PHASE 1 — FOUNDATION

1. Initialize project
2. Configure TypeScript
3. Configure Tailwind
4. Configure database
5. Configure authentication
6. Create base UI

## PHASE 2 — GMAIL INTEGRATION

1. Google OAuth
2. Gmail connection
3. Inbox retrieval
4. Email detail view
5. Threads
6. Search

## PHASE 3 — EMAIL MANAGEMENT

1. Read/unread
2. Star/unstar
3. Archive
4. Delete
5. Compose
6. Reply
7. Send

## PHASE 4 — AI FEATURES

1. AI summarization
2. AI reply generation
3. Tone selection
4. Explain email
5. Action extraction
6. Date extraction

## PHASE 5 — ADVANCED FEATURES

1. Classification
2. Priority detection
3. Smart search
4. Daily summary
5. Analytics
6. Templates

## PHASE 6 — FINALIZATION

1. Security review
2. Error handling
3. Responsive design
4. Testing
5. Documentation
6. Deployment

---

# 52. IMPORTANT BUILD RULES

Follow these rules strictly:

1. Build a REAL working application, not a static prototype.
2. Do not use fake Gmail data as the final implementation when real Gmail integration is configured.
3. OAuth must be used. Never ask users for Gmail passwords.
4. Never expose secrets in frontend code.
5. AI-generated replies must always be editable before sending.
6. AI must never automatically send emails.
7. Gmail should remain the source of truth for mailbox data.
8. Sanitize email HTML before rendering.
9. Validate all backend inputs.
10. Check authentication and authorization on protected operations.
11. Build clean reusable components.
12. Use TypeScript properly.
13. Handle loading, empty, and error states.
14. Make the application responsive.
15. Do not leave placeholder buttons or non-functional features.
16. If a feature is displayed in the final UI, it should work or be clearly marked as unavailable/not yet enabled.
17. Keep AI provider logic modular so it can be changed later.
18. Do not hardcode credentials.
19. Include `.env.example`.
20. Provide complete README documentation.
21. Deploy and verify the application.

---

# 53. FINAL SUCCESS CRITERIA

The project is complete only when a user can do the following:

```text
✓ Open the application
✓ Create/login to an account
✓ Connect Gmail through OAuth
✓ Grant Gmail permissions
✓ View inbox
✓ Open emails
✓ View threads
✓ Search emails
✓ Star/unstar
✓ Mark read/unread
✓ Archive
✓ Delete
✓ Compose email
✓ Reply
✓ Generate AI summary
✓ Generate AI reply
✓ Edit AI reply
✓ Send email
✓ Extract action items
✓ Extract deadlines
✓ View activity
✓ Manage settings
✓ Use the application on mobile and desktop
✓ Use the deployed production application
```

---

# FINAL INSTRUCTION TO ANTIGRAVITY

**Build this entire project as a complete, working, production-style full-stack web application called IntelliMail AI.**

Do not stop at generating only the UI.

Implement the frontend, backend, database, authentication, Google OAuth, Gmail API integration, AI integration, security, error handling, responsive design, environment configuration, documentation, and deployment.

Start by building the core working MVP first:

```text
Authentication
→ Gmail OAuth
→ Inbox
→ Read Email
→ Email Threads
→ Search
→ Archive / Star / Read-Unread / Delete
→ Compose / Reply / Send
→ AI Summarization
→ AI Reply Generation
→ Activity History
```

Then implement the advanced and bonus features.

The final result should feel like a polished AI SaaS product rather than a simple student project.

Prioritize:

**Functionality → Security → Reliability → Clean Architecture → User Experience → Visual Polish**

Before considering the project complete, verify that all core user flows work end-to-end with a real Gmail account and that no sensitive credentials are exposed.

