import {spawnSync} from 'node:child_process';
import {readdirSync,mkdirSync,writeFileSync} from 'node:fs';
const tests=readdirSync('.').filter(p=>/^test_.*_qa\.js$/.test(p)).sort();
const results=[];mkdirSync('qa-results/node',{recursive:true});
for(const file of tests){const p=spawnSync(process.execPath,[file],{encoding:'utf8',timeout:120000,maxBuffer:12*1024*1024});writeFileSync(`qa-results/node/${file}.log`,(p.stdout||'')+(p.stderr||''));results.push({file,status:p.status===0?'PASS':'FAIL',exitCode:p.status,error:p.error?.message});console.log(results.at(-1).status,file);}
writeFileSync('qa-results/node-summary.json',JSON.stringify({source:process.env.DUTYNIGHT_SOURCE_SHA||process.env.GITHUB_SHA,tests:results},null,2));if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
