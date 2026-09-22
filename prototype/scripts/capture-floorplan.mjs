import {chromium} from 'playwright';import {preview} from 'vite';import fs from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const output=process.argv[2]||'qa-results/screens';await fs.mkdir(output,{recursive:true});
const server=await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{host:'127.0.0.1',port:4175,strictPort:true}});
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{channel:'chrome'}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const surface={viewport:{width:1280,height:720},deviceScaleFactor:process.env.CI?.5:1};
const captures=[],errors=[];
try{const p=await browser.newPage(surface);p.setDefaultTimeout(90000);p.on('pageerror',e=>errors.push(e.message));
const views=[
 ['3f-workstations','first_campus_3f',8,1.7,5.1,-Math.PI/2,0],
 ['4f-lobby','first_campus_4f',0,1.7,7.5,0,0],
 ['4f-vestibule','first_campus_4f',0,1.7,1,0,0],
 ['4f-inner-gate-to-station','first_campus_4f',0,1.7,-1.2,0,0],
 ['4f-glass-bypass','first_campus_4f',6,1.7,1,0,0],
 ['4f-station-ward-door','first_campus_4f',4,1.7,-7.2,0,0],
 ['1f-steel-shutters','first_campus_1f',16,1.7,4,-Math.PI/2,0],
 ['1f-clear-core-entry','first_campus_1f',-8,1.7,6,Math.PI,0],
 ['4f-cabinet','first_campus_4f',-9,1.7,7.7,Math.PI,0],
 ['second5-direct-entry','second_campus_5f',72,1.7,6,0,0],
 ['second5-vestibule','second_campus_5f',72,1.7,1,0,0],
 ['second5-glass-bypass','second_campus_5f',78,1.7,1,0,0],
 ['second5-inner-gate-to-station','second_campus_5f',72,1.7,-1.2,0,0],
 ['second5-station-ward-door','second_campus_5f',76,1.7,-7.2,0,0],
 ['er-staff-entry','first_campus_2f',6.4,1.7,2.3,Math.PI,0],
 ['er-glass-link','first_campus_2f',6.0,1.7,6,-Math.PI/2,0],
 ['4f-duty','first_campus_4f',-9.5,1.7,6,Math.PI/2,-.1],
 ['4f-station','first_campus_4f',0,1.7,-4.3,Math.PI,0],
 ['second5-station','second_campus_5f',72,1.7,-4.3,Math.PI,0],
 ['second5-hall','second_campus_5f',78,1.7,-9,Math.PI/2,0],
 ['2f-beds-gate','first_campus_2f',14.5,1.7,1.7,Math.PI,0],
 ['2f-hillside-gate','first_campus_2f',24,1.7,0,Math.PI/2,0],
 ['8f-bridge-gate','first_campus_8f',-2.8,1.7,0,-Math.PI/2,0],
 ['second2-bridge-gate','second_campus_2f',63,1.7,0,Math.PI/2,0],
 ['second-core','second_campus_2f',72,1.7,8.5,Math.PI,0]
 ];
for(const [name,zone,x,y,z,yaw,pitch] of views){await p.goto(`http://127.0.0.1:4175/?zone=${zone}&x=${x}&y=${y}&z=${z}&yaw=${yaw}&pitch=${pitch}`,{waitUntil:'load',timeout:120000});await p.waitForFunction(()=>window.worldRouter?.activeZoneInstance,null,{timeout:120000});await p.waitForTimeout(400);await p.screenshot({path:`${output}/${name}.png`,timeout:90000});captures.push({name,zone});console.log('CAPTURE',name);}
if(errors.length)throw Error(JSON.stringify(errors));
}finally{await fs.writeFile(`${output}/manifest.json`,JSON.stringify({surface,captures,errors,method:'Fixed URL viewpoints; not traversal proof'},null,2));await browser.close();await new Promise(res=>server.httpServer.close(res));}
