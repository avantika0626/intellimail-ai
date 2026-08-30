const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config/env');
const { connectDB, getDatabaseStatus } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const gmailRoutes = require('./routes/gmailRoutes');
const aiRoutes = require('./routes/aiRoutes');
const activityRoutes = require('./routes/activityRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow local dev client and configured clientUrl
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 2. Health & Heartbeat Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IntelliMail AI Intelligent Workspace Engine',
    version: '1.0.0',
    environment: config.nodeEnv,
    database: dbStatus.mode,
    databaseConnected: dbStatus.connected,
    features: {
      googleOAuthLive: Boolean(config.google.clientId && config.google.clientSecret),
      openAiConfigured: Boolean(config.openaiApiKey),
      geminiConfigured: Boolean(config.geminiApiKey),
      sandboxMailbox: true,
    },
  });
});

// 3. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/settings', settingsRoutes);

// 4. Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

// 6. Startup Function
async function startServer() {
  try {
    // Initialize Database (with in-memory fallback)
    await connectDB();

    // Auto-seed default demo operator
    const authService = require('./services/authService');
    await authService.seedDemoUser();

    // Start Listening
    server.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`  IntelliMail AI Backend Service Started Successfully!`);
      console.log(`  ---------------------------------------------------`);
      console.log(`  Port:        http://localhost:${config.port}`);
      console.log(`  Health Check:http://localhost:${config.port}/api/health`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  OAuth Mode:  ${config.google.clientId ? 'Live Google OAuth' : 'Interactive Sandbox + Live Ready'}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
