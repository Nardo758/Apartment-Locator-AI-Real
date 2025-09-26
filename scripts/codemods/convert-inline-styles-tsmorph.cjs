#!/usr/bin/env node
// ts-morph based codemod (CommonJS)
// Usage: node convert-inline-styles-tsmorph.cjs --dry-run

const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const root = path.resolve(process.cwd(), 'src');
const dryRun = process.argv.includes('--dry-run');

const allowedDelays = new Set([75,100,150,200,300,500,700,1000]);

function walkFiles(dir){
  const out = [];
  for(const n of fs.readdirSync(dir)){
    const full = path.join(dir, n);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) out.push(...walkFiles(full));
    else if(/\.(tsx|ts|jsx|js)$/.test(full)) out.push(full);
  }
  return out;
}

const project = new Project({ tsConfigFilePath: undefined, skipAddingFilesFromTsConfig: true });
const files = walkFiles(root);
project.addSourceFilesAtPaths(files);

const changes = [];

project.getSourceFiles().forEach(sf => {
  let modified = false;
  const jsxAttrs = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  jsxAttrs.forEach(attr => {
    const name = attr.getName();
    if(name !== 'style' && name !== 'className') return;
    const parent = attr.getParent();
    const host = parent.getParent(); // JSX opening element
    if(!host) return;

    // handle style attribute: look for object literal with cursor or animationDelay
    if(name === 'style'){
      const initializer = attr.getInitializer();
      if(!initializer) return;
      // we only handle: style={{ cursor: 'pointer', animationDelay: '100ms' }} or similar object literal
      const expr = initializer.getKindName().includes('JsxExpression') ? initializer.getExpression() : null;
      if(!expr) return;
      if(expr.getKind() !== SyntaxKind.ObjectLiteralExpression) return;
      const obj = expr;
      const props = obj.getProperties();
      let hasCursor = false;
      let hasDelay = null;
      props.forEach(p => {
        if(p.getKind() !== SyntaxKind.PropertyAssignment) return;
        const n = p.getName?.();
        const val = p.getInitializer?.();
        if(!n || !val) return;
        if(n === 'cursor' && /pointer/.test(val.getText())){
          hasCursor = true;
          p.remove();
          modified = true;
        }
        if(n === 'animationDelay'){
          const txt = val.getText().replace(/['"`]/g,'');
          const m = /([0-9]+)\s*ms/.exec(txt);
          if(m && allowedDelays.has(Number(m[1]))){
            hasDelay = Number(m[1]);
            p.remove();
            modified = true;
          }
        }
      });

      // if object has no props left, remove the whole attribute
      if(obj.getProperties().length === 0){
        attr.remove();
      }

      // if we found cursor or delay, try to add to className safely
      if(hasCursor || hasDelay !== null){
        const classAttr = host.getAttribute('className');
        if(classAttr){
          const init = classAttr.getInitializer();
          if(init){
            const expr = init.getKindName().includes('JsxExpression') ? init.getExpression() : init;
            // only handle string literal / no template expressions
            if(expr && (expr.getKind() === SyntaxKind.StringLiteral || expr.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral)){
              let value = expr.getText();
              value = value.replace(/^['`"]|['`"]$/g, '');
              if(hasCursor && !/\bcursor-pointer\b/.test(value)) value = (value + ' cursor-pointer').trim();
              if(hasDelay !== null){
                const cls = `delay-${hasDelay}`;
                if(!new RegExp(`\\b${cls}\\b`).test(value)) value = (value + ' ' + cls).trim();
              }
              // replace initializer with new string literal
              classAttr.setInitializer(`"${value}"`);
            }
          }
        } else {
          // no className attr: add one with new classes
          const toAdd = [];
          if(hasCursor) toAdd.push('cursor-pointer');
          if(hasDelay !== null) toAdd.push(`delay-${hasDelay}`);
          if(toAdd.length) host.addAttribute({ name: 'className', initializer: `"${toAdd.join(' ')}"` });
          modified = true;
        }
      }
    }
  });

  if(modified){
    changes.push(sf.getFilePath());
    if(!dryRun) sf.saveSync();
  }
});

if(dryRun){
  if(changes.length === 0) console.log('No changes detected by ts-morph codemod.');
  else{
    console.log('ts-morph codemod would modify the following files:');
    changes.forEach(f => console.log('-', f));
  }
} else {
  console.log('Applied ts-morph codemod to', changes.length, 'file(s).');
}
