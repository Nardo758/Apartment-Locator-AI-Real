const fs = require('fs');

const input = process.argv[2] || 'eslint-warnings.json';
const output = process.argv[3] || 'eslint-warnings.csv';

function escapeCsv(s) {
  if (s == null) return '';
  return '"' + String(s).replace(/"/g, '""') + '"';
}

const raw = fs.readFileSync(input, 'utf8');
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(2);
}

const rows = [];
rows.push(['filePath','line','column','ruleId','severity','message','source'].map(escapeCsv).join(','));

parsed.forEach(file => {
  const filePath = file.filePath;
  (file.messages || []).forEach(msg => {
    rows.push([
      filePath,
      msg.line || 0,
      msg.column || 0,
      msg.ruleId || '',
      msg.severity || 0,
      msg.message || '',
      (msg.source || '').replace(/\n/g, ' ')
    ].map(escapeCsv).join(','));
  });
});

fs.writeFileSync(output, rows.join('\n'));
console.log('Wrote', output);
