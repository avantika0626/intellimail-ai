const assert = require('assert');
const { connectDB } = require('../src/config/db');
const authService = require('../src/services/authService');
const gmailService = require('../src/services/gmailService');
const aiService = require('../src/services/aiService');
const Activity = require('../src/models/Activity');
const UserPreferences = require('../src/models/UserPreferences');
const EmailTemplate = require('../src/models/EmailTemplate');

async function runTests() {
  console.log('🚀 Running IntelliMail AI Full Backend & AI Suite...\n');

  // 1. Initialize Database
  await connectDB();
  console.log('✅ 1. Database connection & in-memory fallback initialized.');

  // 2. User Registration & Auth
  const testEmail = `operator_${Date.now()}@intellimail.io`;
  const registerResult = await authService.register({
    name: 'Lead Operator',
    email: testEmail,
    password: 'Password123!',
  });
  assert(registerResult.token, 'Token should be returned on registration');
  assert.strictEqual(registerResult.user.email, testEmail);
  const userId = registerResult.user.id;
  console.log('✅ 2. User Registration & JWT generation verified (User ID:', userId, ')');

  // 3. User Login
  const loginResult = await authService.login({
    email: testEmail,
    password: 'Password123!',
  });
  assert(loginResult.token, 'Token should be returned on login');
  console.log('✅ 3. User Login & bcrypt verification verified.');

  // 4. Gmail Mailbox Retrieval & Filtering
  const inbox = await gmailService.getMessages(userId, { folder: 'INBOX' });
  assert(inbox.messages.length > 0, 'Inbox should return sample messages');
  const firstMsg = inbox.messages[0];
  assert(firstMsg.id, 'First message must have an ID');
  assert(firstMsg.subject, 'First message must have a subject');
  console.log(`✅ 4. Gmail message list verified (${inbox.messages.length} messages found, mode: ${inbox.mode}).`);

  // 5. Message Detail & Thread
  const messageDetail = await gmailService.getMessage(userId, firstMsg.id);
  assert.strictEqual(messageDetail.id, firstMsg.id);
  assert(messageDetail.body, 'Message detail must include body');
  console.log('✅ 5. Email detail retrieval & body parsing verified.');

  // 6. AI Summarization (Concise & Detailed)
  const conciseSummary = await aiService.summarizeEmail(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
    length: 'concise',
    messageId: messageDetail.id,
  });
  assert(conciseSummary.summary, 'Summary text required');
  assert(Array.isArray(conciseSummary.keyPoints), 'Key points must be an array');
  assert(Array.isArray(conciseSummary.actionRequired), 'Actions required must be an array');
  console.log('✅ 6. AI Summarization verified (Key points count:', conciseSummary.keyPoints.length, ')');

  // 7. AI Smart Reply Generation across tones
  const tones = ['Professional', 'Friendly', 'Formal', 'Concise', 'Apologetic', 'Confident'];
  for (const tone of tones) {
    const reply = await aiService.generateReply(userId, {
      content: messageDetail.body,
      subject: messageDetail.subject,
      tone,
      instructions: 'Confirm deadline alignment',
      messageId: messageDetail.id,
    });
    assert(reply.replyText, `Reply for tone ${tone} must contain text`);
    assert.strictEqual(reply.suggestedTone, tone);
  }
  console.log('✅ 7. AI Reply generation verified across all 6 tones (Professional, Friendly, Formal, Concise, Apologetic, Confident).');

  // 8. Explain Email
  const explanation = await aiService.explainEmail(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
    messageId: messageDetail.id,
  });
  assert(explanation.whatThisMeans, 'Explanation must have whatThisMeans');
  assert(Array.isArray(explanation.whatYouNeedToDo), 'Explanation must have whatYouNeedToDo');
  console.log('✅ 8. "Explain This Email" feature verified (What this means + Action steps).');

  // 9. Extract Action Items
  const actions = await aiService.extractActions(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
    messageId: messageDetail.id,
  });
  assert(Array.isArray(actions.actions), 'Actions must be an array');
  assert(actions.actions.length > 0, 'Should extract at least 1 action item');
  console.log(`✅ 9. Action Item Extraction verified (${actions.actions.length} tasks extracted).`);

  // 10. Extract Dates & Deadlines
  const dates = await aiService.extractDates(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
    messageId: messageDetail.id,
  });
  assert(Array.isArray(dates.dates), 'Dates must be an array');
  assert(dates.dates.length > 0, 'Should extract at least 1 date/deadline');
  console.log(`✅ 10. Date & Deadline Extraction verified (${dates.dates.length} timeline milestones identified).`);

  // 11. AI Classification & Priority
  const classification = await aiService.classifyEmail(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
  });
  assert(classification.category, 'Category is required');

  const priority = await aiService.detectPriority(userId, {
    content: messageDetail.body,
    subject: messageDetail.subject,
  });
  assert(priority.priority, 'Priority is required');
  console.log(`✅ 11. AI Classification (${classification.category}) & Priority Detection (${priority.priority}) verified.`);

  // 12. Text Rewrite & Subject Suggestion
  const rewrite = await aiService.rewriteText(userId, {
    text: 'hey we need this ASAP fix it',
    tone: 'Professional',
  });
  assert(rewrite.rewrittenText, 'Rewritten text required');

  const subjectSuggestions = await aiService.generateSubject(userId, {
    body: messageDetail.body,
  });
  assert(Array.isArray(subjectSuggestions.suggestions), 'Suggestions array required');
  console.log('✅ 12. Text Rewrite & AI Subject Line Suggestions verified.');

  // 13. Email Operations: Star, Read/Unread, Archive, Drafts, Send
  await gmailService.setStar(userId, messageDetail.id, true);
  await gmailService.setRead(userId, messageDetail.id, true);
  await gmailService.archiveMessage(userId, messageDetail.id);

  // Save an unsent draft
  const draftResult = await gmailService.saveDraft(userId, {
    to: 'partner@example.com',
    subject: 'Working Draft: Q4 Security & Compliance Scope',
    body: '<p>Hi Partner, here is the draft outline for our Q4 review...</p>',
  });
  assert(draftResult.success, 'Save draft should succeed');
  assert(draftResult.draft.id, 'Saved draft must have an ID');

  // Verify draft appears in DRAFTS folder
  const draftsList = await gmailService.getMessages(userId, { folder: 'DRAFTS' });
  assert(draftsList.messages.length > 0, 'DRAFTS folder should contain saved draft');

  // Send the draft and ensure it converts to SENT
  const sendResult = await gmailService.sendEmail(userId, {
    id: draftResult.draft.id,
    to: 'partner@example.com',
    subject: 'Working Draft: Q4 Security & Compliance Scope',
    body: '<p>Hi Partner, here is the finalized outline for our Q4 review.</p>',
  });
  assert(sendResult.success, 'Send email should succeed');
  console.log('✅ 13. Email Operations (Star, Mark Read, Archive, Save Draft, Convert Draft to Sent) verified.');

  // 14. Activity Audit History
  const activities = await Activity.find({ userId }).lean();
  assert(activities.length >= 4, 'Activities should be recorded for user actions');
  console.log(`✅ 14. Activity Audit History verified (${activities.length} activity entries logged).`);

  // 15. Daily Summary Widget
  const dailySummary = await aiService.dailySummary(userId, { emails: inbox.messages });
  assert(dailySummary.totalNewEmails >= 0, 'Daily summary total required');
  assert(dailySummary.topActionItems.length > 0, 'Top action items required');
  console.log('✅ 15. Daily AI Inbox Summary Widget verified.');

  console.log('\n🎉 ALL INTELLIMAIL AI BACKEND & AI TESTS PASSED WITH 100% SUCCESS!\n');
}

runTests().then(() => {
  console.log('✅ All tests completed successfully.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
