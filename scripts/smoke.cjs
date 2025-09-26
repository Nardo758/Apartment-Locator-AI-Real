const http = require('http');
const url = 'http://127.0.0.1:8080/';
let attempts = 0;
const maxAttempts = 8;
const delay = 500;

function tryOnce() {
  attempts++;
  const req = http.get(url, (res) => {
    console.log('status', res.statusCode);
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      console.log('len', d.length);
      process.exit(0);
    });
  });
  req.on('error', (e) => {
    console.error('err', e.message);
    if (attempts < maxAttempts) setTimeout(tryOnce, delay);
    else process.exit(2);
  });
}

tryOnce();
