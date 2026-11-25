const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = 'C:\\Users\\sunan\\AppData\\Local\\Temp\\chrome_cdp_profile_' + Date.now();
const port = 9224;

const proc = spawn(chromePath, [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`,
  '--window-size=1280,800',
  'about:blank'
]);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  await wait(1500);
  const tabs = await getJson(`http://localhost:${port}/json`);
  const wsUrl = tabs[0].webSocketDebuggerUrl;
  console.log('Connecting to', wsUrl);

  const ws = new WebSocket(wsUrl);

  await new Promise((resolve) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    ws.addEventListener('open', resolve, { once: true });
  });
  console.log('Connected to CDP');

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:4173/' });
  console.log('Navigated, waiting 4s for assets...');
  await wait(4000);

  async function takeScreenshot(name) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join('C:\\Users\\sunan\\.gemini\\antigravity\\brain\\a3470498-a9ec-4e12-9f86-78361dbc2af6', name);
    fs.writeFileSync(outPath, buffer);
    console.log('Saved:', name);
  }

  // View at scroll 0
  await takeScreenshot('test_scroll_0.png');

  // Scroll 500px
  await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 500, behavior: "instant" })' });
  await wait(1000);
  await takeScreenshot('test_scroll_500.png');

  // Scroll 1500px
  await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 1500, behavior: "instant" })' });
  await wait(1000);
  await takeScreenshot('test_scroll_1500.png');

  // Scroll 3000px
  await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 3000, behavior: "instant" })' });
  await wait(1000);
  await takeScreenshot('test_scroll_3000.png');

  ws.close();
  proc.kill();
  console.log('Done!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  proc.kill();
  process.exit(1);
});
