#!/usr/bin/env node
// Conservative codemod: convert inline style cursor:'pointer' and simple animationDelay -> Tailwind classes
// Usage: node convert-inline-styles.js --dry-run

const fs = require('fs');
const path = require('path');
const process = require('process');

const root = path.resolve(process.cwd(), 'src');
const dryRun = process.argv.includes('--dry-run');

const TW_DELAYS = [75, 100, 150, 200, 300, 500, 700, 1000];

function listFiles(dir, exts = ['.tsx', '.jsx', '.ts', '.js']){
  const out = [];
  for(const name of fs.readdirSync(dir)){
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if(stat.isDirectory()){
      out.push(...listFiles(full, exts));
    } else if(exts.includes(path.extname(full))){
      out.push(full);
    }
  }
  return out;
}

function computeDelayClass(msString){
  // msString like '100ms' or "100ms"
  const m = /([0-9]+)\s*ms/.exec(msString);
  if(!m) return null;
  const n = Number(m[1]);
  if(Number.isNaN(n)) return null;
  // only map exact matches in TW_DELAYS
  if(TW_DELAYS.includes(n)) return `delay-${n}`;
  return null;
}

function unifiedDiff(original, updated, filePath){
  const oLines = original.split(/\r?\n/);
  const uLines = updated.split(/\r?\n/);
  const max = Math.max(oLines.length, uLines.length);
  const lines = [];
  lines.push('--- a/' + filePath);
  lines.push('+++ b/' + filePath);
  for(let i=0;i<max;i++){
    const o = oLines[i];
    const u = uLines[i];
    if(o === u){
      lines.push(' ' + (o === undefined ? '' : o));
    } else {
      if(o !== undefined) lines.push('-' + o);
      if(u !== undefined) lines.push('+' + u);
    }
  }
  return lines.join('\n');
}

function processFile(file){
  let src = fs.readFileSync(file, 'utf8');
  let updated = src;
  let didChange = false;

  // Regex to find style={{ ... cursor: 'pointer' ... }}
  const styleCursorRegex = /style=\{\{([\s\S]*?)\}\}\s*/g;

  updated = updated.replace(styleCursorRegex, (match, inner) => {
    if(!/\bcursor\s*:\s*['"]pointer['"]/i.test(inner)) return match; // no cursor in this style block

    // Attempt to remove the cursor: 'pointer' property from inner
    // This is heuristic: remove "cursor: 'pointer'," or ", cursor: 'pointer'" or "cursor: 'pointer'"
    let newInner = inner.replace(/,?\s*cursor\s*:\s*['"]pointer['"]\s*,?/i, (m)=>{
      // return empty or single comma depending on surrounding
      return ','; // we'll cleanup later
    });

    // cleanup duplicate commas and leading/trailing commas
    newInner = newInner.replace(/,\s*,/g, ',');
    newInner = newInner.replace(/^\s*,\s*/,'');
    newInner = newInner.replace(/,\s*$/,'');

    // If style becomes empty, remove the whole style attribute
    if(!/\S/.test(newInner)){
      didChange = true;
      return '';
    }

    // Otherwise return cleaned style attribute
    didChange = true;
    return `style={{${newInner}}}`;
  });

  // For each change where we removed cursor, try to find className="..." nearby and add cursor-pointer
  if(didChange){
    // Only conservative approach: if className appears as className="..." or className={'...'} or className={`...`} without ${}
    // We'll find patterns like <... className="..." ...> and add cursor-pointer if not present
    const classNameRegex = /(className\s*=\s*)(\{?`?)(['"])([^"'`{}]*)(['"])(`?\}?)/g;
    updated = updated.replace(classNameRegex, (full, p1, braceOrTickOpen, quote, value, quoteClose, braceOrTickClose) => {
      // only operate when value doesn't contain ${ or { or }
      if(/[\$\{\}]/.test(value)) return full;
      if(/\bcursor-pointer\b/.test(value)) return full; // already present
      return `${p1}${braceOrTickOpen}${quote}${value} cursor-pointer${quote}${braceOrTickClose}`;
    });
  }

  // Now handle animationDelay
  // find style blocks containing animationDelay: '100ms' or "100ms"
  let changedDelay = false;
  updated = updated.replace(styleCursorRegex, (match, inner) => {
    const m = /animationDelay\s*:\s*['"]([^'"]+)['"]/i.exec(inner);
    if(!m) return match;
    const delayClass = computeDelayClass(m[1]);
    if(!delayClass) return match; // only convert known values

    // remove the animationDelay property from inner
    let newInner = inner.replace(/,?\s*animationDelay\s*:\s*['"][^'"]+['"]\s*,?/i, ',');
    newInner = newInner.replace(/,\s*,/g, ',');
    newInner = newInner.replace(/^\s*,\s*/,'');
    newInner = newInner.replace(/,\s*$/,'');

    // add the delayClass to className if possible
    const classNameRegex = /(className\s*=\s*)(\{?`?)(['"])([^"'`{}]*)(['"])(`?\}?)/g;
    let newUpdated = updated.replace(classNameRegex, (full, p1, braceOrTickOpen, quote, value, quoteClose, braceOrTickClose) => {
      if(/[\$\{\}]/.test(value)) return full;
      if(new RegExp(`\\b${delayClass}\\b`).test(value)) return full;
      return `${p1}${braceOrTickOpen}${quote}${value} ${delayClass}${quote}${braceOrTickClose}`;
    });

    changedDelay = true;
    // replace original match in newUpdated with cleaned style
    if(!/\S/.test(newInner)){
      return '';
    }
    return `style={{${newInner}}}`;
  });

  if(src !== updated){
    return {file, src, updated};
  }
  return null;
}

function run(){
  const files = listFiles(root);
  const changes = [];
  for(const f of files){
    const res = processFile(f);
    if(res) changes.push(res);
  }

  if(changes.length === 0){
    console.log('No changes found.');
    return 0;
  }

  for(const c of changes){
    const rel = path.relative(process.cwd(), c.file);
    const diff = unifiedDiff(c.src, c.updated, rel);
    console.log('\n' + diff + '\n');
    if(!dryRun){
      fs.writeFileSync(c.file, c.updated, 'utf8');
      console.log('Wrote', rel);
    }
  }

  if(dryRun){
    console.log(`Dry-run: ${changes.length} file(s) would be changed.`);
  } else {
    console.log(`Applied changes to ${changes.length} file(s).`);
  }
  return 0;
}

try{
  const code = run();
  process.exit(code);
} catch(e){
  console.error('Error running codemod', e);
  process.exit(2);
}
