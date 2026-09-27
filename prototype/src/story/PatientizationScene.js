import * as THREE from 'three';
import { solid } from '../art/ArtDetails.js';
import { getMaterials, materialForSurface } from '../art/MaterialRegistry.js';
import { disposeZoneArt } from '../art/ArtResources.js';

export class PatientizationScene {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080d0c);
    this.scene.fog = new THREE.FogExp2(0x101512, .035);
    this.camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .03, 20);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'patientization-canvas';
    container.prepend(this.renderer.domElement);
    const m = getMaterials();
    const mesh = (name, material, position, size) => {
      const object = solid(this.scene, material, position, size);
      object.name = name;
      return object;
    };
    mesh('409 tiled floor', materialForSurface('floorTile', 5, 6), [0,-.05,0], [5,.1,6]);
    mesh('409 rear wall', materialForSurface('wall', 5, 3), [0,1.5,-3], [5,3,.15]);
    for(const x of [-2.5,2.5])mesh('409 side wall', materialForSurface('wall',6,3), [x,1.5,0], [.15,3,6]);
    mesh('409 ceiling', materialForSurface('ceiling',5,6), [0,3,0], [5,.1,6]);
    mesh('409 locked door', materialForSurface('doorWood',1,2.3), [1.4,1.15,-2.9], [1,2.3,.08]);
    mesh('409 bed frame', m.metal, [0,.5,0], [1.04,.15,2.2]);
    mesh('409 green mattress', m.wallBumper, [0,.66,0], [.96,.2,2.1]);
    for(const x of [-.55,.55]) {
      mesh('409 metal rail',m.metal,[x,.9,-.15],[.035,.035,1.8]);
      for(const z of [-.85,.6])mesh('409 rail post',m.metal,[x,.73,z],[.035,.4,.035]);
    }
    const skin=new THREE.MeshStandardMaterial({color:0xb4a58d,roughness:.85});
    const leather=new THREE.MeshStandardMaterial({color:0x30271d,roughness:.94});
    for(const x of [-.34,.34]) {
      const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.48,6,16),skin);
      arm.name='Restrained forearm';arm.rotation.x=Math.PI/2;arm.position.set(x,.85,-.02);this.scene.add(arm);
      mesh('Leather wrist restraint',leather,[x,.925,-.19],[.17,.045,.12]);
      mesh('Leather ankle restraint',leather,[x,.79,-.78],[.22,.035,.14]);
    }
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#d9d2ad';ctx.fillRect(0,0,768,256);
    ctx.fillStyle='#18291f';ctx.font='bold 68px sans-serif';ctx.fillText('409-A｜無名病人',25,95);
    ctx.font='38px monospace';ctx.fillText('STAFF ID: NOT FOUND',25,170);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    const tag=new THREE.Mesh(new THREE.PlaneGeometry(.42,.14),new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide}));
    tag.name='409 patient wristband';tag.rotation.x=-Math.PI/2;tag.position.set(-.28,.96,-.16);this.scene.add(tag);
    mesh('409 fluorescent',m.lightWarm,[0,2.93,-.5],[1.1,.04,.15]);
    this.light=new THREE.PointLight(0xc6d8bc,14,10);this.light.position.set(0,2.7,-.4);this.scene.add(this.light);
    this.scene.add(new THREE.AmbientLight(0x738174,.7));
    this.started=performance.now();
    this.resize=()=>{this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);};
    window.addEventListener('resize',this.resize);
    this.frame=()=>{
      const t=(performance.now()-this.started)/1000;
      this.camera.position.set(.025*Math.sin(t),1.08+.25*Math.max(0,1-t*2),.88);
      this.camera.lookAt(t<2.15?-.2:.35,t<2.15?.86:1.35,t<2.15?-.22:-2.85);
      this.light.intensity=14*(1-Math.min(1,Math.max(0,(t-3.4)/.6)));
      this.renderer.setClearColor(t>4?0x000000:0x080d0c);
      this.renderer.render(this.scene,this.camera);
      this.frameRequest=requestAnimationFrame(this.frame);
    };
    this.frame();
  }

  dispose() {
    cancelAnimationFrame(this.frameRequest);
    window.removeEventListener('resize',this.resize);
    disposeZoneArt(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
