import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public/assets');
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else files.push({ path: path.relative(root, p).replaceAll('\\','/'), size: s.size });
  }
}
walk(root);

const limits = {
  'models/campusTree.glb': 17_000_000,
};
for (const [file, max] of Object.entries(limits)) {
  const found = files.find(x => x.path === file);
  if (!found) throw new Error('Missing budgeted asset: ' + file);
  if (found.size > max) throw new Error(`${file} exceeds budget: ${found.size} > ${max}`);
}

const total = files.reduce((n,x)=>n+x.size,0);
const top = files.sort((a,b)=>b.size-a.size).slice(0,20);
console.log(JSON.stringify({ totalRuntimeAssetBytes: total, top20: top }, null, 2));
