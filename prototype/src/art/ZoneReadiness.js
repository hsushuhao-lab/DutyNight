import {preloadZoneEssential} from './ZoneAssetManifest.js';

export async function prepareZoneWithRetry(zoneId){
  while(true){
    try{return await preloadZoneEssential(zoneId);}
    catch(error){
      console.error('[art] essential zone load failed',zoneId,error);
      const overlay=document.createElement('div');
      overlay.style.cssText='position:fixed;inset:0;z-index:50001;background:#101813;color:#e0e6df;display:grid;place-content:center;text-align:center';
      overlay.setAttribute('role','alert');
      const message=document.createElement('p');message.textContent='必要資料載入失敗，請重試。';
      const retry=document.createElement('button');retry.textContent='重新載入';
      overlay.append(message,retry);document.body.append(overlay);
      await new Promise(resolve=>retry.addEventListener('click',resolve,{once:true}));
      overlay.remove();
    }
  }
}
