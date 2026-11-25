const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userData = 'C:\\Users\\sunan\\AppData\\Local\\Temp\\chrome_err_test_' + Date.now();
const port = 9225;

const proc = spawn(chromePath, [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userData}`,
  '--window-size=1280,800',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const tabs = await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/json`, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let id = 1;
  const pending = new Map();
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  const logs = [];
  ws.addEventListener('message', e => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + JSON.stringify(msg.params.exceptionDetails));
    }
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Page loaded on 5173. Console logs:', logs);

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.querySelector('.hero-seq-wrap');
      const canvas = document.querySelector('canvas');
      return {
        wrapOpacity: wrap ? getComputedStyle(wrap).opacity : null,
        wrapVisibility: wrap ? getComputedStyle(wrap).visibility : null,
        wrapTransform: wrap ? getComputedStyle(wrap).transform : null,
        canvasWidth: canvas ? canvas.width : null,
        canvasHeight: canvas ? canvas.height : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Initial DOM state:', res.result.value);

  // Simulate mouse wheel scroll
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: 640,
    y: 400,
    deltaX: 0,
    deltaY: 500
  });
  await new Promise(r => setTimeout(r, 1000));

  const afterScroll = await send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.querySelector('.hero-seq-wrap');
      return {
        scrollY: window.scrollY,
        wrapOpacity: wrap ? getComputedStyle(wrap).opacity : null,
        wrapVisibility: wrap ? getComputedStyle(wrap).visibility : null,
        wrapTransform: wrap ? getComputedStyle(wrap).transform : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After wheel 500:', afterScroll.result.value);

  // Wheel down another 2000
  for (let step = 0; step < 5; step++) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 640,
      y: 400,
      deltaX: 0,
      deltaY: 500
    });
    await new Promise(r => setTimeout(r, 300));
  }
  await new Promise(r => setTimeout(r, 1000));

  const deepScroll = await send('Runtime.evaluate', {
    expression: `(() => {
      const wrap = document.querySelector('.hero-seq-wrap');
      return {
        scrollY: window.scrollY,
        wrapOpacity: wrap ? getComputedStyle(wrap).opacity : null,
        wrapVisibility: wrap ? getComputedStyle(wrap).visibility : null,
        wrapTransform: wrap ? getComputedStyle(wrap).transform : null
      };
    })()`,
    returnByValue: true
  });
  console.log('After deep scroll:', deepScroll.result.value);

  ws.close();
  proc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  proc.kill();
  process.exit(1);
});
