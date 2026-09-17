import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const before='.visual-work/before', after='.visual-work/final', output='docs/visual-qa/comparison';
await mkdir(output,{recursive:true});
const manifest=JSON.parse(await readFile(`${after}/capture-manifest.json`,'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const shots=manifest.captures.filter(s=>s.view==='entrance');
const entries=[];
for(const shot of shots){
  const paths=[`${before}/${shot.id}.png`,`${after}/${shot.filename}`];
  for(let i=0;i<2;i++){
    const data=(await readFile(paths[i])).toString('base64');
    const webp=await page.evaluate(async data=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const c=document.createElement('canvas');c.width=1440;c.height=900;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/webp',.86).split(',')[1];},data);
    await writeFile(`${output}/${shot.id}-${i?'after':'before'}.webp`,Buffer.from(webp,'base64'));
  }
  entries.push(`<section><h2>${shot.id}</h2><div class="pair"><figure><img src="${shot.id}-before.webp"><figcaption>Before — original master</figcaption></figure><figure><img src="${shot.id}-after.webp"><figcaption>After — integration candidate, visual review required</figcaption></figure></div></section>`);
}
await writeFile(`${output}/index.html`,`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DutyNight visual comparison</title><style>body{background:#ecece5;color:#243b32;font:16px system-ui;margin:24px}h1{font-size:28px}h2{font-size:18px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%}section{margin:30px 0}figcaption{font-size:13px}@media(max-width:760px){.pair{grid-template-columns:1fr}}</style><h1>DutyNight Before / After</h1><p>相同 spawn、相同視角。工程 PASS 不等於 Visual Lock。原圖 1440×900，此報告使用 WebP 品質 86。完整 100 視角 PNG 保留於本機 .visual-work/final。</p>${entries.join('')}</html>`);
for(let start=0;start<shots.length;start+=9){
 const tiles=await Promise.all(shots.slice(start,start+9).map(async s=>`<figure><img src="data:image/webp;base64,${(await readFile(`${output}/${s.id}-after.webp`)).toString('base64')}"><figcaption>${s.id}</figcaption></figure>`));
 await page.setContent(`<style>body{margin:0;background:#fff}main{display:grid;grid-template-columns:repeat(3,480px)}figure{margin:0}img{width:480px;display:block}figcaption{font:16px sans-serif;padding:8px}</style><main>${tiles.join('')}</main>`);
 await page.screenshot({path:`.visual-work/contact-${start/9}.png`,fullPage:true});
}
await browser.close();console.log(`Comparison: ${shots.length} matched before/after views`);
