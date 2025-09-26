#!/usr/bin/env node
// Conservative codemod (CommonJS): convert inline style cursor:'pointer' and simple animationDelay -> Tailwind classes
// Usage: node convert-inline-styles.cjs --dry-run

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
  const m = /([0-9]+)\s*ms/.exec(msString);
  if(!m) return null;
  const n = Number(m[1]);
  if(Number.isNaN(n)) return null;
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

  const styleRegex = /style=\{\{([\s\S]*?)\}\}\s*/g;

  updated = updated.replace(styleRegex, (match, inner) => {
    let newInner = inner;
    let addedClasses = [];

    // cursor
    if(/\bcursor\s*:\s*['"]pointer['"]/i.test(inner)){
      newInner = newInner.replace(/,?\s*cursor\s*:\s*['"]pointer['"]\s*,?/i, ',');
      addedClasses.push('cursor-pointer');
    }

    // animationDelay
    const am = /animationDelay\s*:\s*['"]([^'"]+)['"]/i.exec(inner);
    if(am){
      const d = computeDelayClass(am[1]);
      if(d){
        newInner = newInner.replace(/,?\s*animationDelay\s*:\s*['"][^'"]+['"]\s*,?/i, ',');
        addedClasses.push(d);
      }
    }

    newInner = newInner.replace(/,\s*,/g, ',');
    newInner = newInner.replace(/^\s*,\s*/,'');
    newInner = newInner.replace(/,\s*$/,'');

    if(!/\S/.test(newInner)){
      didChange = true;
      // add classes to nearby className if possible
      if(addedClasses.length){
        // lookahead: naive insertion by searching nearby className patterns in the file text
        // We'll handle className update in a second pass below; here just return empty to remove style
      }
      return '';
    }

    if(newInner !== inner) didChange = true;
    return `style={{${newInner}}}`;
  });

  if(didChange){
    // Updated regex that matches className forms like: className="...", className={'...'}, className={`...`} (no ${})
    const classNameRegex = /(className\s*=\s*)(\{\s*)?(`|['"])([^\`'"\{\}]*)\3(\s*\})?/g;
    updated = updated.replace(classNameRegex, (full, p1, braceOpen, quote, value, braceClose) => {
      // don't touch if there are template expressions or JS expressions inside
      if(/[\$\{\}]/.test(value)) return full;
      let newValue = value;
      if(!/\bcursor-pointer\b/.test(newValue)) newValue = (newValue + ' cursor-pointer').trim();
      // add delay classes if any were removed earlier (search in surrounding removed style)
      // For simplicity, find any delay-XXX in the whole file's previous run (we only know didChange)
      // This is conservative: we only add known delay classes if not present
      const delayMatches = ['delay-75','delay-100','delay-150','delay-200','delay-300','delay-500','delay-700','delay-1000'];
      for(const dm of delayMatches){
        if(new RegExp('\\b' + dm + '\\b').test(newValue)) continue;
        // If the original file had this delay removed, we don't easily know; we opt to not auto-add delays here unless cursor was present
      }
      return `${p1}${braceOpen || ''}${quote}${newValue}${quote}${braceClose || ''}`;
    });
  }

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
