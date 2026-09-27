import * as THREE from 'three';

const base=import.meta.env.BASE_URL||'/';
export const ART_PASS2=Object.freeze({
  opening: base+'assets/artpass2/opening-night-campus.webp',
  archiveGallery: base+'assets/artpass2/archive-gallery.webp',
  memoryFragments: base+'assets/artpass2/memory-fragments.webp'
});

const imageCache=new Map();
const imagePromises=new Map();

export function preloadArtPass2Image(key){
  const url=ART_PASS2[key]||key;
  if(imageCache.has(url))return Promise.resolve(imageCache.get(url));
  if(imagePromises.has(url))return imagePromises.get(url);
  const promise=new Promise((resolve,reject)=>{
    const image=new Image();
    image.decoding='async';
    image.onload=()=>{
      const done=()=>{imageCache.set(url,image);imagePromises.delete(url);resolve(image);};
      if(typeof image.decode==='function')image.decode().then(done).catch(done);
      else done();
    };
    image.onerror=error=>{imagePromises.delete(url);reject(error);};
    image.src=url;
  });
  imagePromises.set(url,promise);
  return promise;
}

export function preloadArtPass2(){
  return Promise.allSettled(Object.keys(ART_PASS2).map(key=>preloadArtPass2Image(key)));
}

export function getArtPass2Image(key){
  return imageCache.get(ART_PASS2[key]||key)||null;
}

function cropForMemoryIndex(index){
  return [
    [210,45,510,245],
    [425,35,715,245],
    [690,45,980,235],
    [105,270,425,475],
    [410,280,715,500],
    [750,265,1060,500]
  ][Math.abs(index)%6];
}

export function drawCoverCrop(ctx,image,sourceRect,dx,dy,dw,dh){
  if(!image)return false;
  const [sx,sy,ex,ey]=sourceRect;
  const sw=Math.max(1,ex-sx),sh=Math.max(1,ey-sy);
  const scale=Math.max(dw/sw,dh/sh);
  const visibleW=dw/scale,visibleH=dh/scale;
  const csx=sx+(sw-visibleW)/2,csy=sy+(sh-visibleH)/2;
  ctx.drawImage(image,csx,csy,visibleW,visibleH,dx,dy,dw,dh);
  return true;
}

export function drawMemoryFragment(ctx,index,dx,dy,dw,dh){
  const image=getArtPass2Image('memoryFragments');
  if(!image)return false;
  return drawCoverCrop(ctx,image,cropForMemoryIndex(index),dx,dy,dw,dh);
}

export async function buildArchiveGalleryTexture(){
  const image=await preloadArtPass2Image('archiveGallery');
  const canvas=document.createElement('canvas');
  canvas.width=1400;canvas.height=700;
  const ctx=canvas.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,0,700);
  grad.addColorStop(0,'#211a14');grad.addColorStop(1,'#0d0c0a');
  ctx.fillStyle=grad;ctx.fillRect(0,0,1400,700);
  ctx.fillStyle='#d6c6a6';ctx.font='bold 50px sans-serif';ctx.fillText('青嶺醫療中心｜院史照片牆',54,70);
  ctx.fillStyle='#8d9a8d';ctx.font='24px sans-serif';ctx.fillText('封存影像・舊院區與夜班工作',57,108);

  const source=[
    [260,128,558,300],
    [590,125,900,302],
    [168,348,399,504],
    [430,350,648,506],
    [683,348,925,505]
  ];
  const dest=[
    [55,155,470,395],
    [500,155,1340,395],
    [55,465,380,635],
    [415,465,770,635],
    [805,465,1340,635]
  ];
  const labels=['護理部合影','舊病房走廊','臨床教學留影','值班室','院內同仁合影'];
  for(let i=0;i<source.length;i++){
    const [x1,y1,x2,y2]=dest[i];
    ctx.fillStyle='#59422f';ctx.fillRect(x1-10,y1-10,x2-x1+20,y2-y1+44);
    drawCoverCrop(ctx,image,source[i],x1,y1,x2-x1,y2-y1);
    ctx.fillStyle='#211a14';ctx.fillRect(x1,y2,x2-x1,30);
    ctx.fillStyle='#d5c3a0';ctx.font='20px sans-serif';ctx.fillText(labels[i],x1+10,y2+22);
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.needsUpdate=true;
  return texture;
}
