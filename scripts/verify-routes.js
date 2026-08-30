const http = require('http');

async function getUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', (err) => reject(err));
  });
}

async function verifyAll() {
  console.log('🔍 Testing all IntelliMail AI Web Pages and API Endpoints...\n');

  const routes = [
    { name: 'Backend Health Check', url: 'http://localhost:5000/api/health' },
    { name: 'SaaS Landing Page', url: 'http://localhost:3000/' },
    { name: 'Sign In Page', url: 'http://localhost:3000/login' },
    { name: 'Registration Page', url: 'http://localhost:3000/register' },
    { name: 'Inbox Workspace Dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'Activity History & Audit Log', url: 'http://localhost:3000/activity' },
    { name: 'Email Analytics Dashboard', url: 'http://localhost:3000/analytics' },
    { name: 'Email Templates Manager', url: 'http://localhost:3000/templates' },
    { name: 'Settings & AI Preferences', url: 'http://localhost:3000/settings' },
  ];

  let passed = 0;
  for (const r of routes) {
    try {
      const res = await getUrl(r.url);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`✅ [${res.statusCode}] ${r.name.padEnd(32)} -> ${r.url}`);
        passed++;
      } else {
        console.error(`❌ [${res.statusCode}] ${r.name} -> Unexpected status code`);
      }
    } catch (err) {
      console.error(`❌ ${r.name} (${r.url}) -> ${err.message}`);
    }
  }

  console.log(`\n🎉 Verification Completed: ${passed}/${routes.length} routes responding successfully!\n`);
  process.exit(passed === routes.length ? 0 : 1);
}

verifyAll();
