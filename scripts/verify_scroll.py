import os, time, subprocess, json
from urllib.request import urlopen
import urllib.request

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
user_data = r'C:\Users\sunan\AppData\Local\Temp\chrome_verify_scroll_' + str(int(time.time()))
port = 9227

proc = subprocess.Popen([
    chrome_path,
    '--headless',
    '--disable-gpu',
    f'--remote-debugging-port={port}',
    f'--user-data-dir={user_data}',
    '--window-size=1280,800',
    'about:blank'
])

time.sleep(1.5)

# We can drive CDP via a node script that uses native WebSocket
node_script = f'''
const fs = require('fs');
const http = require('http');

async function wait(ms) {{ return new Promise(r => setTimeout(r, ms)); }}

async function getJson(url) {{
  return new Promise((resolve, reject) => {{
    http.get(url, res => {{
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve(JSON.parse(d)));
    }}).on('error', reject);
  }});
}}

async function run() {{
  const tabs = await getJson('http://localhost:{port}/json');
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, {{ once: true }}));

  let id = 1;
  const pending = new Map();
  ws.onmessage = e => {{
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {{
      const {{ resolve, reject }} = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }}
  }};
  function send(method, params = {{}}) {{
    return new Promise((resolve, reject) => {{
      const curId = id++;
      pending.set(curId, {{ resolve, reject }});
      ws.send(JSON.stringify({{ id: curId, method, params }}));
    }});
  }}

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', {{ url: 'http://localhost:4173/' }});
  await wait(3000);

  async function snap(name) {{
    const res = await send('Page.captureScreenshot', {{ format: 'png' }});
    fs.writeFileSync('C:\\\\Users\\\\sunan\\\\.gemini\\\\antigravity\\\\brain\\\\a3470498-a9ec-4e12-9f86-78361dbc2af6\\\\' + name, Buffer.from(res.data, 'base64'));
    console.log('Saved', name);
  }}

  // 1. Initial
  await snap('final_scroll_0.png');

  // 2. Wheel scroll 400px (mango emerges)
  for (let i = 0; i < 4; i++) {{
    await send('Input.dispatchMouseEvent', {{ type: 'mouseWheel', x: 640, y: 400, deltaX: 0, deltaY: 100 }});
    await wait(100);
  }}
  await wait(800);
  await snap('final_scroll_emerge.png');

  // 3. Wheel scroll more (mango peeling)
  for (let i = 0; i < 15; i++) {{
    await send('Input.dispatchMouseEvent', {{ type: 'mouseWheel', x: 640, y: 400, deltaX: 0, deltaY: 120 }});
    await wait(60);
  }}
  await wait(800);
  await snap('final_scroll_peeling.png');

  // 4. Wheel scroll further (peeled fruit with bottle card)
  for (let i = 0; i < 20; i++) {{
    await send('Input.dispatchMouseEvent', {{ type: 'mouseWheel', x: 640, y: 400, deltaX: 0, deltaY: 120 }});
    await wait(60);
  }}
  await wait(800);
  await snap('final_scroll_reveal.png');

  ws.close();
  process.exit(0);
}}

run().catch(err => {{ console.error(err); process.exit(1); }});
'''

with open('scripts/temp_snap.cjs', 'w') as f:
    f.write(node_script)

res = subprocess.run(['node', 'scripts/temp_snap.cjs'], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print('Error:', res.stderr)

proc.terminate()
