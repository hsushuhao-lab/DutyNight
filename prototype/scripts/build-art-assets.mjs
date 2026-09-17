import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFile, mkdir } from 'node:fs/promises';

// Original metre-scale furniture. Offline authoring only; runtime loads these GLBs.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(buffer => { this.result = buffer; this.onloadend(); }); }
};
const palette = {
  wood: new THREE.MeshStandardMaterial({ color: '#ad8c64', roughness: .6 }),
  edge: new THREE.MeshStandardMaterial({ color: '#876849', roughness: .62 }),
  ivory: new THREE.MeshStandardMaterial({ color: '#dedbd1', roughness: .64 }),
  sage: new THREE.MeshStandardMaterial({ color: '#81978e', roughness: .82 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#668177', roughness: .94 }),
  metal: new THREE.MeshStandardMaterial({ color: '#9a9e9b', roughness: .36, metalness: .65 }),
  dark: new THREE.MeshStandardMaterial({ color: '#383d3c', roughness: .73 }),
  white: new THREE.MeshStandardMaterial({ color: '#e5e4d9', roughness: .92 }),
  paper: new THREE.MeshStandardMaterial({ color: '#f2eedf', roughness: .98 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#496943', roughness: .82, side: THREE.DoubleSide }),
  soil: new THREE.MeshStandardMaterial({ color: '#4b4033', roughness: 1 }),
};
for (const [name, mat] of Object.entries(palette)) mat.name = name;
function mesh(group, geometry, material, x, y, z, name) {
  const obj = new THREE.Mesh(geometry, palette[material]); obj.position.set(x,y,z); obj.name=name;
  group.add(obj); return obj;
}
function box(g,x,y,z,w,h,d,mat,name,r=.015) {
  return mesh(g,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),mat,x,y,z,name);
}
function rod(g,a,b,r,mat,name) {
  const from=new THREE.Vector3(...a), to=new THREE.Vector3(...b), direction=to.clone().sub(from);
  const obj=mesh(g,new THREE.CylinderGeometry(r,r,direction.length(),10),mat,...from.clone().add(to).multiplyScalar(.5).toArray(),name);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()); return obj;
}
function group(name) {const g=new THREE.Group();g.name=name;return g;}
function chair() {
  const g=group('officeChair');
  box(g,0,.46,0,.48,.09,.46,'fabric','Upholstered seat',.045);
  const back=box(g,0,.78,-.205,.47,.46,.065,'fabric','Curved padded back',.035); back.rotation.x=-.1;
  box(g,0,.75,-.245,.44,.42,.025,'dark','Back shell',.025);
  rod(g,[0,.12,0],[0,.42,0],.031,'metal','Gas lift');
  rod(g,[0,.3,0],[0,.47,-.18],.023,'dark','Back support');
  for(let i=0;i<5;i++) {
    const angle=i*Math.PI*2/5, x=Math.sin(angle)*.27,z=Math.cos(angle)*.27;
    rod(g,[0,.13,0],[x,.09,z],.021,'metal','Five star base arm');
    const caster=mesh(g,new THREE.CylinderGeometry(.038,.038,.045,14),'dark',x,.045,z,'Caster');caster.rotation.z=Math.PI/2;
  }
  for(const side of [-1,1]) {
    rod(g,[side*.245,.46,.10],[side*.27,.64,.10],.016,'dark','Arm support');
    box(g,side*.27,.65,.02,.065,.035,.31,'dark','Arm pad',.016);
  }
  return g;
}
function desk() {
  const g=group('workDesk');
  box(g,0,.735,0,1.4,.05,.72,'wood','Laminate worktop',.018);
  box(g,0,.704,0,1.405,.018,.725,'edge','Edge banding',.009);
  for(const x of [-.635,.635]) for(const z of [-.28,.28]) {
    box(g,x,.36,z,.035,.69,.035,'metal','Steel leg',.007);
    box(g,x,.022,z,.045,.025,.045,'dark','Leveling foot',.007);
  }
  box(g,0,.46,-.29,1.24,.35,.025,'ivory','Modesty panel');
  box(g,-.43,.46,.02,.38,.47,.58,'ivory','Drawer pedestal');
  for(let i=0;i<3;i++) {
    box(g,-.43,.61-i*.15,.317,.348,.138,.026,'ivory','Individual drawer front',.006);
    rod(g,[-.51,.615-i*.15,.35],[-.35,.615-i*.15,.35],.007,'metal','Drawer handle');
  }
  return g;
}
function cabinet() {
  const g=group('storageCabinet');
  box(g,0,.92,0,.9,1.76,.45,'ivory','Cabinet carcass');
  box(g,0,.045,0,.82,.09,.38,'dark','Recessed plinth');
  for(const side of [-1,1]) {
    box(g,side*.219,.94,.24,.429,1.66,.035,'sage','Inset door',.008);
    rod(g,[side*.045,.82,.276],[side*.045,1.0,.276],.008,'metal','Vertical pull');
    for(const y of [.38,1.4]) box(g,side*.418,y,.264,.012,.05,.008,'metal','Door hinge',.002);
  }
  return g;
}
function bed() {
 const g=group('hospitalBed');
 box(g,0,.39,0,.94,.12,2.0,'metal','Bed chassis');
 box(g,0,.53,0,.91,.19,1.97,'white','Mattress with rounded seams',.075);
 box(g,0,.638,.22,.92,.04,1.48,'sage','Folded cotton blanket',.017);
 box(g,0,.68,-.70,.63,.13,.36,'white','Pillow',.065);
 for(const z of [-1.04,1.04]) {
   for(const x of [-.44,.44]) rod(g,[x,.15,z],[x,.97,z],.022,'metal','End upright');
   box(g,0,.84,z,.91,.3,.055,'ivory','Rounded bed end',.024);
 }
 for(const x of [-.46,.46]) for(const z of [-.76,.76]) {
  rod(g,[x,.12,z],[x,.4,z],.021,'metal','Caster leg');
  const wheel=mesh(g,new THREE.CylinderGeometry(.065,.065,.04,16),'dark',x,.065,z,'Brake caster');wheel.rotation.z=Math.PI/2;
 }
 for(const x of [-.48,.48]) {
  rod(g,[x,.66,-.48],[x,.66,.57],.017,'metal','Safety rail');
  for(const z of [-.48,.04,.57]) rod(g,[x,.42,z],[x,.66,z],.012,'metal','Rail riser');
 }
 return g;
}
function bench() {
 const g=group('bench');
 for(const x of [-.62,.62]) {
   rod(g,[x,.03,.2],[x,.43,.17],.024,'metal','Front leg');
   rod(g,[x,.03,-.21],[x,.82,-.20],.024,'metal','Back leg');
 }
 rod(g,[-.72,.35,0],[.72,.35,0],.026,'metal','Cross support');
 for(const x of [-.54,0,.54]) {
   box(g,x,.46,0,.51,.085,.47,'fabric','Separate seat cushion',.036);
   const back=box(g,x,.67,-.22,.51,.34,.075,'fabric','Separate back cushion',.036);back.rotation.x=-.12;
 }
 return g;
}
function printer() {
 const g=group('printer');
 box(g,0,.13,0,.48,.25,.42,'ivory','Printer body',.025);
 box(g,0,.267,-.025,.46,.025,.36,'dark','Scanner gasket',.012);
 box(g,0,.294,-.025,.47,.035,.37,'ivory','Scanner lid',.014);
 box(g,0,.319,-.10,.27,.025,.20,'ivory','Document feeder',.013);
 box(g,0,.345,-.14,.30,.015,.17,'paper','Loaded paper',.002);
 box(g,0,.176,.215,.34,.055,.015,'dark','Output slot',.005);
 box(g,0,.155,.245,.34,.012,.12,'ivory','Output tray',.004);
 box(g,-.12,.268,.19,.10,.045,.035,'dark','Control panel',.005);
 box(g,-.125,.293,.2,.058,.006,.025,'sage','Status screen',.003);
 for(let i=0;i<3;i++) box(g,.15,.08+i*.019,.218,.07,.005,.006,'dark','Vent opening',.002);
 return g;
}
function plant() {
 const g=group('plant');
 mesh(g,new THREE.CylinderGeometry(.16,.115,.3,24),'ivory',0,.15,0,'Ceramic planter');
 mesh(g,new THREE.CylinderGeometry(.144,.144,.012,24),'soil',0,.298,0,'Potting soil');
 for(let i=0;i<10;i++) {
  const angle=i*2.399, height=.60+(i%4)*.12, x=Math.cos(angle)*.23,z=Math.sin(angle)*.23;
  rod(g,[0,.30,0],[x*.7,height,z*.7],.005,'leaf','Petiole');
  const shape=new THREE.Shape(); shape.moveTo(0,0);shape.bezierCurveTo(-.10,.1,-.08,.25,0,.34);shape.bezierCurveTo(.08,.25,.10,.10,0,0);
  const leaf=mesh(g,new THREE.ShapeGeometry(shape,8),'leaf',x*.7,height,z*.7,'Lanceolate leaf');leaf.rotation.set(-.4,angle,-.6);
 }
 return g;
}
const models={officeChair:chair(),workDesk:desk(),storageCabinet:cabinet(),hospitalBed:bed(),bench:bench(),printer:printer(),plant:plant()};
const output=new URL('../public/assets/models/',import.meta.url);await mkdir(output,{recursive:true});
for(const [name, scene] of Object.entries(models)) {
 const data=await new GLTFExporter().parseAsync(scene,{binary:true});
 await writeFile(new URL(`${name}.glb`,output),new Uint8Array(data));
 console.log(name,data.byteLength,new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3()).toArray());
}
