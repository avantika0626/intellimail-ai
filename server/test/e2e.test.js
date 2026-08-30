const assert = require('assert');
const { app } = require('../src/server');
const { connectDB } = require('../src/config/db');
const { encrypt, decrypt } = require('../src/utils/encryption');
const authService = require('../src/services/authService');
const workflowService = require('../src/services/workflowService');
const executionService = require('../src/services/executionService');
const aiService = require('../src/services/aiService');
const orchestrator = require('../src/agents/orchestrator');

async function runTests() {
  console.log('🚀 Running Agentflow_AI E2E & Unit Test Suite...\n');

  // 1. Connect Database
  await connectDB();
  console.log('✅ 1. Database connection & fallback initialized.');

  // 2. Test AES-256 Encryption & Decryption
  const testSecret = 'xoxb-secret-slack-token-12345678';
  const cipher = encrypt(testSecret);
  assert(cipher !== testSecret, 'Cipher must be encrypted');
  const decrypted = decrypt(cipher);
  assert.strictEqual(decrypted, testSecret, 'Decrypted token must match original');
  console.log('✅ 2. AES-256-GCM Credential Encryption & Decryption verified.');

  // 3. Test Auth Registration & Login
  const uniqueEmail = `test.operator.${Date.now()}@agentflow.io`;
  const registerResult = await authService.register({
    name: 'Test Operator',
    email: uniqueEmail,
    password: 'TestPassword123!',
    role: 'operator',
  });
  assert(registerResult.token, 'Token must be issued upon registration');
  assert.strictEqual(registerResult.user.email, uniqueEmail);

  const loginResult = await authService.login({
    email: uniqueEmail,
    password: 'TestPassword123!',
  });
  assert(loginResult.token, 'Token must be issued upon login');
  console.log('✅ 3. User Registration, bcrypt hashing, and JWT Login verified.');

  const userId = registerResult.user.id;

  // 4. Test AI Workflow Generation
  const generatedWorkflow = await aiService.generateWorkflow('Ingest customer emails from Gmail, parse with AI, and alert Slack');
  assert(generatedWorkflow.nodes.length > 0, 'Generated workflow must have nodes');
  assert(generatedWorkflow.edges.length > 0, 'Generated workflow must have edges');
  console.log(`✅ 4. AI Workflow Generation verified (${generatedWorkflow.nodes.length} nodes created).`);

  // 5. Test Workflow Creation & CRUD
  const createdWf = await workflowService.createWorkflow(userId, {
    name: 'E2E Invoice Pipeline',
    description: 'Automated invoice workflow test',
    nodes: generatedWorkflow.nodes,
    edges: generatedWorkflow.edges,
    tags: ['test', 'e2e'],
  });
  const wfId = createdWf._id || createdWf.id;
  assert(wfId, 'Workflow must be created with ID');
  console.log(`✅ 5. Workflow CRUD & persistence verified (ID: ${wfId}).`);

  // 6. Test Multi-Agent Execution Chain
  const execution = await workflowService.executeWorkflow(userId, wfId, {
    totalAmount: 1250,
    vendor: 'Acme Software Labs',
  });
  const execId = execution._id || execution.id;
  assert(execId, 'Execution record must be created');

  // Run orchestration synchronously in test
  const completedExec = await orchestrator.runExecution(execId, userId);
  assert.strictEqual(completedExec.status, 'COMPLETED', 'Execution must complete successfully');
  assert(completedExec.duration > 0, 'Execution must record duration');
  console.log(`✅ 6. 5-Agent Execution Chain (Planner -> Execution -> Validation -> Recovery -> Monitoring) completed in ${completedExec.duration}ms.`);

  // 7. Test Execution Timeline Logs
  const timeline = await executionService.getExecutionTimeline(userId, execId);
  assert(timeline.length >= 4, 'Timeline must contain logs across all agent phases');
  console.log(`✅ 7. Audit Timeline verified (${timeline.length} granular agent logs recorded).`);

  // 8. Test Dashboard Stats Aggregation
  const dashboard = await workflowService.getDashboardStats(userId);
  assert(dashboard.metrics.totalWorkflows >= 1, 'Dashboard must aggregate workflows count');
  assert(dashboard.metrics.totalRuns >= 1, 'Dashboard must aggregate total runs count');
  console.log('✅ 8. Dashboard Analytics & MetricGrid telemetry aggregated successfully.');

  console.log('\n🎉 ALL E2E AGENTIC ORCHESTRATION TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
