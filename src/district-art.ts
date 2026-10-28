import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {DistrictId} from './content';
import {CITY_BLOCKS,DISTRICT_FEATURES} from './course';

/** District appearance only. Traversable/hard foreground geometry is authored in
 * course.ts and consumed by both this renderer and the simulation. */
interface DistrictLook {
  sky:number;fog:number;sun:number;sunPower:number;sunPosition:[number,number,number];
  skyLight:number;groundLight:number;ambient:number;exposure:number;
  plaster:number;stone:number;timber:number;roof:number;roofPaint:boolean;metal:number;water:number;
}
const LOOKS:Record<DistrictId,DistrictLook>={
  'old-town':{sky:0x9ed0dd,fog:0xb3d1d7,sun:0xffead0,sunPower:3.2,sunPosition:[-30,65,25],skyLight:0xe0f3ff,groundLight:0x796d73,ambient:2,exposure:1.16,plaster:0xfff0d5,stone:0xf0d8af,timber:0x338789,roof:0xffffff,roofPaint:false,metal:0xc69b55,water:0x559caa},
  canals:{sky:0xa9dce5,fog:0xc4e1e2,sun:0xfff1d6,sunPower:3.0,sunPosition:[30,50,-20],skyLight:0xe7faff,groundLight:0x5d8589,ambient:2.15,exposure:1.12,plaster:0xe6f3e5,stone:0xddd8bb,timber:0x3c829a,roof:0x6d8991,roofPaint:true,metal:0x9cae9c,water:0x278f9d},
  market:{sky:0xf0d1aa,fog:0xe2c3a1,sun:0xffd29a,sunPower:3.4,sunPosition:[-40,38,38],skyLight:0xffecd1,groundLight:0x8a6462,ambient:2.0,exposure:1.08,plaster:0xffd6a3,stone:0xf2ce99,timber:0x7c5c48,roof:0xffd0ae,roofPaint:false,metal:0xd8a450,water:0x6a999d},
  gardens:{sky:0xc4ded4,fog:0xd0e0d0,sun:0xfff4d8,sunPower:2.8,sunPosition:[25,60,30],skyLight:0xe8fae8,groundLight:0x638264,ambient:2.15,exposure:1.14,plaster:0xf5efd4,stone:0xe7ddae,timber:0x61794c,roof:0x929678,roofPaint:true,metal:0xb6a16d,water:0x669c8d},
  observatory:{sky:0x273d66,fog:0x5c718b,sun:0xb9d9ff,sunPower:2.65,sunPosition:[-35,45,-45],skyLight:0xc6d8ff,groundLight:0x665776,ambient:2.1,exposure:1.2,plaster:0xc1d0df,stone:0xd8d7d7,timber:0x455e87,roof:0x536e8a,roofPaint:true,metal:0xd6b879,water:0x375f82},
};
type SurfaceMaterial=T.MeshStandardMaterial;
interface BorrowedMaterial {material:SurfaceMaterial;color:T.Color;map:T.Texture|null;roughness:number;metalness:number;role:'plaster'|'stone'|'timber'|'roof'|'metal'}
function material(name:string,color:number,roughness=.8,metalness=0){return new T.MeshStandardMaterial({name:`District / ${name}`,color,roughness,metalness});}
function mesh(parent:T.Object3D,geometry:T.BufferGeometry,mat:T.Material,x=0,y=0,z=0,shadow=true){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
function box(parent:T.Object3D,mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number,bevel=.04){return mesh(parent,new RoundedBoxGeometry(w,h,d,1,Math.min(bevel,w*.2,h*.2,d*.2)),mat,x,y,z);}
function cylinder(parent:T.Object3D,mat:T.Material,x:number,y:number,z:number,r:number,h:number,top=r){return mesh(parent,new T.CylinderGeometry(top,r,h,24),mat,x,y,z);}
function leafGeometry(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.15,.08,.3,0,.02,.65,.15,.08,.3,0,-.025,.28],3));g.setIndex([0,1,2,0,2,3,0,4,1,1,4,2,2,4,3,3,4,0]);g.computeVertexNormals();return g;}
function dome(parent:T.Object3D,mat:T.Material,x:number,y:number,z:number,w:number,h:number,d:number){const o=mesh(parent,new T.SphereGeometry(1,32,14,0,Math.PI*2,0,Math.PI/2),mat,x,y,z);o.scale.set(w/2,h,d/2);return o;}
function batch(root:T.Group){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert();const groups=new Map<T.Material,{parts:T.BufferGeometry[];old:T.Mesh[]}>();
  root.traverse(o=>{if(!(o instanceof T.Mesh)||o instanceof T.InstancedMesh||Array.isArray(o.material)||o.material.transparent)return;let b=groups.get(o.material);if(!b){b={parts:[],old:[]};groups.set(o.material,b);}let g=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(g.index){const converted=g.toNonIndexed();g.dispose();g=converted;}for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);if(!g.getAttribute('uv'))g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.getAttribute('position').count*2),2));b.parts.push(g);b.old.push(o);});
  for(const [mat,b] of groups){const geometry=mergeGeometries(b.parts,false);if(geometry){const o=mesh(root,geometry,mat);o.name=mat.name;for(const old of b.old){old.removeFromParent();old.geometry.dispose();}}for(const g of b.parts)g.dispose();}
}

export class DistrictArt {
  readonly root=new T.Group();
  private readonly groups=new Map<DistrictId,T.Group>();
  private readonly borrowed=new Map<T.Material,BorrowedMaterial>();
  private readonly murals=new Map<SurfaceMaterial,T.Texture|null>();
  private readonly muralMaps=new Map<DistrictId,T.Texture>();
  private readonly waters:T.Mesh[]=[];
  private current:DistrictId='old-town';
  private disposed=false;
  constructor(private scene:T.Scene,private sun:T.DirectionalLight,private ambient:T.HemisphereLight,private renderer:Pick<T.WebGLRenderer,'toneMappingExposure'>){
    this.root.name='Five original district environments';scene.add(this.root);
    this.paintMurals();
    for(const id of Object.keys(LOOKS) as DistrictId[]){const g=new T.Group();g.name=`District: ${id}`;g.visible=id===this.current;this.root.add(g);this.groups.set(id,g);this.buildFeatures(g,id);this.buildBackdrop(g,id);batch(g);}
    this.applyLook();
  }
  registerArchitecture(root:T.Object3D){
    root.traverse(o=>{if(!(o instanceof T.Mesh))return;for(const raw of Array.isArray(o.material)?o.material:[o.material]){
      if(!(raw instanceof T.MeshStandardMaterial)||this.borrowed.has(raw))continue;const name=raw.name.toLowerCase();if(name.includes('original swift mural')){if(!this.murals.has(raw))this.murals.set(raw,raw.map);continue;}let role:BorrowedMaterial['role']|undefined;
      if(/plaster|ochre|warm lime/.test(name))role='plaster';else if(/limestone/.test(name))role='stone';else if(/teal (timber|wood)|painted teal/.test(name))role='timber';else if(/barrel terracotta|landmarks \/ terracotta/.test(name))role='roof';else if(/landmarks \/ aged brass/.test(name))role='metal';
      if(role)this.borrowed.set(raw,{material:raw,color:raw.color.clone(),map:raw.map,roughness:raw.roughness,metalness:raw.metalness,role});
    }});this.applyMaterials();
  }
  setDistrict(id:DistrictId){if(this.disposed||id===this.current)return false;this.current=id;for(const [key,g] of this.groups)g.visible=key===id;this.applyLook();return true;}
  update(time:number,reduced:boolean){if(this.current!=='canals')return;for(const water of this.waters){const mat=water.material as T.MeshStandardMaterial;if(mat.normalMap){mat.normalMap.offset.set(reduced?0:time*.012,reduced?0:time*.007);}water.position.y=.18+(reduced?0:Math.sin(time*.6)*.008);}}
  state(){return {district:this.current,cachedDistricts:this.groups.size,sharedFeatures:DISTRICT_FEATURES[this.current].length,retintedMaterials:this.borrowed.size,muralVariants:this.muralMaps.size};}
  dispose(){if(this.disposed)return;this.disposed=true;this.root.removeFromParent();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();this.root.traverse(o=>{if(!(o instanceof T.Mesh)&&!(o instanceof T.Points))return;if(o instanceof T.InstancedMesh)o.dispose();geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();for(const b of this.borrowed.values()){b.material.color.copy(b.color);b.material.map=b.map;b.material.roughness=b.roughness;b.material.metalness=b.metalness;b.material.needsUpdate=true;}for(const [m,original] of this.murals){m.map=original;m.needsUpdate=true;}for(const t of this.muralMaps.values())t.dispose();this.murals.clear();this.muralMaps.clear();this.borrowed.clear();this.groups.clear();this.waters.length=0;}
  private applyLook(){const look=LOOKS[this.current];(this.scene.background as T.Color).setHex(look.sky);if(this.scene.fog instanceof T.Fog){this.scene.fog.color.setHex(look.fog);this.scene.fog.near=this.current==='observatory'?80:65;this.scene.fog.far=this.current==='observatory'?200:175;}this.sun.color.setHex(look.sun);this.sun.intensity=look.sunPower;this.sun.position.set(...look.sunPosition);this.ambient.color.setHex(look.skyLight);this.ambient.groundColor.setHex(look.groundLight);this.ambient.intensity=look.ambient;this.renderer.toneMappingExposure=look.exposure;this.applyMaterials();}
  private applyMaterials(){const look=LOOKS[this.current];for(const b of this.borrowed.values()){const m=b.material;const oldMap=m.map;if(this.current==='old-town'){m.color.copy(b.color);m.map=b.map;m.roughness=b.roughness;m.metalness=b.metalness;}else{m.color.setHex(look[b.role]);m.map=b.role==='roof'&&look.roofPaint?null:b.map;m.roughness=b.role==='metal'?.4:b.roughness;m.metalness=b.role==='metal'?.55:b.metalness;}if(oldMap!==m.map)m.needsUpdate=true;}for(const [m,original] of this.murals){m.map=this.muralMaps.get(this.current)??original;m.needsUpdate=true;}}
  private paintMurals(){
    if(typeof document==='undefined')return;
    for(const id of ['canals','market','gardens','observatory'] as const){const c=document.createElement('canvas');c.width=512;c.height=288;const p=c.getContext('2d');if(!p)continue;p.scale(.5,.5);p.fillStyle=id==='observatory'?'#334f70':'#ead8b3';p.fillRect(0,0,1024,576);p.strokeStyle=id==='observatory'?'#d5bb78':'#a56c4b';p.lineWidth=8;p.strokeRect(20,20,984,536);
      if(id==='gardens'){
        for(let i=0;i<7;i++){const x=100+i*137,y=200+(i%3)*50;p.strokeStyle='#51724a';p.lineWidth=12;p.beginPath();p.moveTo(x,500);p.quadraticCurveTo(x+40,350,x,y);p.stroke();for(let j=0;j<7;j++){const a=j*Math.PI*2/7;p.fillStyle=i%2?'#ba7450':'#d6ac58';p.beginPath();p.ellipse(x+Math.cos(a)*37,y+Math.sin(a)*37,24,35,a,0,Math.PI*2);p.fill();}p.fillStyle='#536342';p.beginPath();p.arc(x,y,23,0,Math.PI*2);p.fill();}
      }else if(id==='observatory'){
        const points=[[180,365],[310,170],[470,280],[620,110],[800,210],[875,400]];p.strokeStyle='#bacbda';p.lineWidth=4;p.beginPath();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.stroke();for(const [x,y] of points){p.fillStyle='#eed7a1';p.beginPath();for(let j=0;j<10;j++){const a=-Math.PI/2+j*Math.PI/5,r=j%2?7:18;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;j?p.lineTo(px,py):p.moveTo(px,py);}p.closePath();p.fill();}p.strokeStyle='#92b8c2';p.beginPath();p.ellipse(520,295,310,185,-.3,0,Math.PI*2);p.stroke();
      }else if(id==='canals'){
        for(let i=0;i<5;i++){p.strokeStyle=i%2?'#4a99a2':'#2e6979';p.lineWidth=32;p.beginPath();p.moveTo(55,165+i*71);p.bezierCurveTo(320,45+i*71,620,285+i*71,970,120+i*71);p.stroke();}p.fillStyle='#c89751';p.beginPath();p.arc(790,120,61,0,Math.PI*2);p.fill();
      }else{
        const colors=['#b75d43','#c79b4e','#38777a'];for(let i=0;i<8;i++){p.fillStyle=colors[i%3];p.beginPath();p.moveTo(65+i*112,120);p.lineTo(145+i*112,120);p.lineTo(105+i*112,260);p.closePath();p.fill();}p.strokeStyle='#3d6f70';p.lineWidth=22;for(let i=0;i<4;i++){p.beginPath();p.arc(510,490,100+i*65,Math.PI,Math.PI*2);p.stroke();}
      }
      const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;this.muralMaps.set(id,t);
    }
  }
  private buildFeatures(g:T.Group,id:DistrictId){
    const look=LOOKS[id],stone=material(`${id} dressed stone`,look.stone),edge=material(`${id} coping`,0xf1e7cf),wood=material(`${id} timber`,look.timber),metal=material(`${id} copper`,look.metal,.42,.55),soil=material(`${id} soil`,0x514b3b),leafMat=material(`${id} foliage`,id==='gardens'?0x5a7e42:0x6c8b64);leafMat.side=T.DoubleSide;
    for(const f of DISTRICT_FEATURES[id]){
      const body=new T.Group();body.name=f.id;body.userData.sharedSolid=f.id;g.add(body);
      if(f.kind==='observatory'){
        const r=Math.min(f.w,f.d)/2;cylinder(body,stone,f.x,f.y+f.h*.18,f.z,r,f.h*.36);dome(body,metal,f.x,f.y+f.h*.36,f.z,f.w,f.h*.64,f.d);
        // A 6 mm applied meridian stripe follows the exact ellipsoid surface.
        const slit=mesh(body,new T.SphereGeometry(1,2,14,Math.PI/2-.045,.09,0,Math.PI/2),wood,f.x,f.y+f.h*.36,f.z);slit.scale.set(f.w/2+.006,f.h*.64+.006,f.d/2+.006);
      }else if(f.kind==='canopy'){
        const red=material(`${id} canopy stripe`,id==='market'?0xb5513c:0x2e7d8c),cream=material(`${id} canopy linen`,0xf0dfbb);red.side=cream.side=T.DoubleSide;
        for(let i=0;i<9;i++){const w=f.w/9;box(body,i%2?cream:red,f.x-f.w/2+(i+.5)*w,f.y+f.h/2,f.z,w+.004,f.h,f.d,.01);}
      }else if(f.id.startsWith('market-stall-post-')){
        cylinder(body,wood,f.x,f.y+f.h/2,f.z,Math.min(f.w,f.d)/2,f.h);
      }else{
        box(body,f.kind==='platform'?wood:stone,f.x,f.y+f.h/2,f.z,f.w,f.h,f.d);
        if(f.kind==='planter'){
          box(body,edge,f.x,f.y+f.h-.045,f.z,f.w,.09,f.d,.02);box(body,soil,f.x,f.y+f.h+.008,f.z,f.w*.88,.015,f.d*.85,.01);
          const n=Math.max(5,Math.ceil(f.w*f.d*3)),leaves=new T.InstancedMesh(leafGeometry(),leafMat,n*8),dummy=new T.Object3D();
          for(let i=0;i<n*8;i++){const a=i*2.399963,x=f.x+Math.sin(i*8.21)*f.w*.38,z=f.z+Math.cos(i*5.87)*f.d*.36;dummy.position.set(x,f.y+f.h,z);dummy.rotation.set(-.35,a,.18*Math.sin(i));dummy.scale.setScalar(.45+(i%4)*.12);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.castShadow=true;body.add(leaves);
        }else{
          // Thin masonry/wood joint marks sit within the existing body face.
          const count=Math.min(12,Math.floor(f.w/.7));for(let i=1;i<count;i++)box(body,edge,f.x-f.w/2+i*f.w/count,f.y+f.h*.52,f.z+f.d/2-.003,.013,f.h*.78,.009,.001);
        }
      }
    }
  }
  private buildBackdrop(g:T.Group,id:DistrictId){
    if(id==='canals')this.canals(g);else if(id==='market')this.market(g);else if(id==='gardens')this.gardens(g);else if(id==='observatory')this.observatory(g);
  }
  private canals(g:T.Group){
    const data=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;data[i]=128+Math.sin(x*.22+y*.13)*19;data[i+1]=128+Math.cos(y*.29-x*.07)*17;data[i+2]=251;data[i+3]=255;}const normal=new T.DataTexture(data,128,128);normal.wrapS=normal.wrapT=T.RepeatWrapping;normal.repeat.set(8,18);normal.needsUpdate=true;
    const water=material('canal water',LOOKS.canals.water,.2,.28);water.normalMap=normal;water.normalScale.set(.35,.35);
    for(const x of [-9,9]){const w=mesh(g,new T.PlaneGeometry(4.6,84),water,x,.18,9,false);w.rotation.x=-Math.PI/2;this.waters.push(w);}
    for(const z of [-9,27]){const w=mesh(g,new T.PlaneGeometry(86,4.6),water,0,.18,z,false);w.rotation.x=-Math.PI/2;this.waters.push(w);}
    // Canal extensions beyond the recovery area create a real waterfront horizon.
    const horizon=mesh(g,new T.PlaneGeometry(170,220),water,0,.11,-125,false);horizon.rotation.x=-Math.PI/2;
  }
  private market(g:T.Group){
    const red=material('market madder banners',0xb8493d),gold=material('market saffron banners',0xcf9c3d);red.side=gold.side=T.DoubleSide;
    // Flexible façade banners are applied to existing CITY_BLOCKS, not new lots.
    for(const [i,b] of CITY_BLOCKS.entries()){if(i%2)continue;const geo=new T.PlaneGeometry(1.3,2.2,3,8),p=geo.getAttribute('position');for(let j=0;j<p.count;j++)p.setZ(j,Math.sin(p.getY(j)*3+i)*.06);geo.computeVertexNormals();mesh(g,geo,i%4?red:gold,b.x,9*b.heightScale-1.6,b.z+5.95*b.width+.02,false);}
  }
  private gardens(g:T.Group){
    const leafMat=material('garden living roof leaves',0x6b9257);leafMat.side=T.DoubleSide;
    const blocks=CITY_BLOCKS.filter(b=>b.variant===0),leaves=new T.InstancedMesh(leafGeometry(),leafMat,blocks.length*96),dummy=new T.Object3D();
    for(const [i,b] of blocks.entries()){
      for(let j=0;j<96;j++){const phase=j*2.4,rr=.4+(j%12)/12*2.4;dummy.position.set(b.x+Math.sin(phase)*rr,b.h+.12+(j%7)*.12,b.z+Math.cos(phase)*rr);dummy.rotation.set(Math.sin(j)*.5,phase,Math.cos(j)*.6);dummy.scale.set(1.0,1.0,1.2);dummy.updateMatrix();leaves.setMatrixAt(i*96+j,dummy.matrix);}}
    leaves.castShadow=false;g.add(leaves);
    const hillMat=material('garden hills',0x92ac8a);for(let i=0;i<8;i++){const o=mesh(g,new T.ConeGeometry(34,27+i%3*7,7),hillMat,-145+i*42,-5,-125-i%2*18,false);o.scale.z=.65;}
  }
  private observatory(g:T.Group){
    const chart=material('observatory brass roof charts',0xc3b17a,.75,.2);
    for(const b of CITY_BLOCKS.filter(b=>b.variant===0)){const r=Math.min(b.w,b.d)*.35;for(const radius of [r,r*.58]){const o=mesh(g,new T.RingGeometry(radius-.025,radius,48),chart,b.x,b.h+.008,b.z,false);o.rotation.x=-Math.PI/2;}}
    const stars:number[]=[];let seed=8821;for(let i=0;i<220;i++){seed=(seed*1664525+1013904223)>>>0;const a=(seed/4294967296)*Math.PI*2;seed=(seed*1664525+1013904223)>>>0;const y=38+seed/4294967296*100,r=125+seed%35;stars.push(Math.sin(a)*r,y,Math.cos(a)*r);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(stars,3));const points=new T.Points(geometry,new T.PointsMaterial({name:'District / distant stars',color:0xe6ebff,size:.38,sizeAttenuation:true,fog:false}));g.add(points);
    mesh(g,new T.SphereGeometry(4.2,24,16),new T.MeshBasicMaterial({name:'District / moon',color:0xf3e8ce,fog:false}),48,58,-112,false);
  }
}
