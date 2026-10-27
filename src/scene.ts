import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SITES,type SiteId} from './content';
import {SURFACES,OBSTACLES,surfaceHeight,type Simulation} from './sim';
import {createLandmarks} from './landmark-kit';
import {CITY_BLOCKS,COURSE_SOLIDS,SIGNAL_NOTES,WIND_LIFTS} from './course';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {orientBoneWorld,solveArm} from './arm-ik';

const colors={stone:0xf3dfba,trim:0xffedcf,terra:0xc16b4b,teal:0x277f80,brass:0xc99b4d,shadow:0x213d53};
const materialCache=new Map<string,T.MeshStandardMaterial>();
function material(color:number,roughness=.85){const key=`${color}:${roughness}`;let m=materialCache.get(key);if(!m){m=new T.MeshStandardMaterial({color,roughness});materialCache.set(key,m);}return m;}
const mats={stone:material(colors.stone),trim:material(colors.trim),terra:material(colors.terra),teal:material(colors.teal),brass:material(colors.brass,.32),dark:material(colors.shadow),wood:material(0x705344),leaf:material(0x476a41),glass:new T.MeshStandardMaterial({color:0x82b1ab,roughness:.2,metalness:.08,transparent:true,opacity:.48,side:T.DoubleSide})};
function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material,shadow=true){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent:T.Object3D,x:number,y:number,z:number,r:number,h:number,mat:T.Material,top=r){const m=new T.Mesh(new T.CylinderGeometry(top,r,h,16),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function label(text:string,w=3.8){const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d')!;x.fillStyle='#203d47';x.fillRect(0,0,512,96);x.fillStyle='#f7e7cc';x.fillRect(9,9,494,3);x.font='500 38px Rubik, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,54);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map,depthTest:true}));s.scale.set(w,w*96/512,1);return s;}
function tiledRoof(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d')!;g.fillStyle='#bd6c50';g.fillRect(0,0,256,256);let seed=12;for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=32){seed=(seed*1664525+1013904223)>>>0;g.fillStyle=`rgb(${170+seed%45},${83+seed%25},${59+seed%20})`;g.fillRect(x+(y%32?16:0),y,31,14);g.fillStyle='#db9770';g.fillRect(x+(y%32?16:0),y,30,2);}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return new T.MeshStandardMaterial({map:t,roughness:.95});}
function paving(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d')!;g.fillStyle='#8d8879';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=32)for(let x=-64;x<256;x+=64){const shade=155+((x*7+y*13)%23+23)%23;g.fillStyle=`rgb(${shade+15},${shade+9},${shade-3})`;g.fillRect(x+(y%64?32:0)+1,y+1,62,30);g.fillStyle='#d1c6b0';g.fillRect(x+(y%64?32:0)+2,y+2,60,1);}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(90,95);map.anisotropy=4;return new T.MeshStandardMaterial({map,roughness:.96});}

export class World {
  scene=new T.Scene();camera=new T.PerspectiveCamera(58,1,.1,240);renderer:T.WebGLRenderer;
  player=new T.Group();wing=new T.Group();parcel=new T.Group();character=new T.Group();devMarker=new T.Group();
  private mixer:T.AnimationMixer|null=null;private clips:Record<string,T.AnimationAction>={};private currentClip='';private skeletonBones=0;
  private courierObject:T.Object3D|null=null;private bones=new Map<string,T.Bone>();private boneRest=new Map<string,T.Quaternion>();
  private gearSocket:T.Object3D|null=null;private gripHardware=new T.Group();private courierBaseY=0;private soleOffset=0;
  private gripErrors={left:0,right:0};private gripActive=false;
  private labels=new Map<SiteId,T.Sprite>();private relays=new Map<SiteId,T.Group>();private courseDecor=new T.Group();private noteMeshes:T.Group[]=[];private windStreaks:T.InstancedMesh|null=null;private lastNotes=new Set<number>();private landingRing:T.Mesh|null=null;private dustClock=0;
  private foundations=new T.Group();private skyline=new T.Group();private buildingKit=new T.Group();private buildingCount=0;
  private firstCamera=true;private particles:{mesh:T.Mesh;vel:T.Vector3;life:number}[]=[];private wingOpen=0;private wingBank=0;private time=0;private wasGrounded=true;private landTime=0;private previousYaw=0;
  rigLoaded=false;gliderLoaded=false;assetError='';fps=60;rendererName='unavailable';cameraPitch=.245;private frames:number[]=[];
  constructor(public canvas:HTMLCanvasElement){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;
    const gl=this.renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');this.rendererName=debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'unavailable';const software=/swiftshader|llvmpipe/i.test(this.rendererName);if(software)this.renderer.setPixelRatio(1);
    this.scene.background=new T.Color(0x9ed0dd);this.scene.fog=new T.Fog(0xb3d1d7,65,175);
    this.scene.add(new T.HemisphereLight(0xe0f3ff,0x796d73,2.0));const sun=new T.DirectionalLight(0xffead0,3.2);sun.position.set(-30,65,25);sun.castShadow=true;sun.shadow.mapSize.set(software?512:2048,software?512:2048);sun.shadow.camera.left=-62;sun.shadow.camera.right=62;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.camera.far=140;sun.shadow.bias=-.0006;sun.shadow.normalBias=.06;this.scene.add(sun);
    this.scene.add(this.foundations,this.skyline,this.buildingKit);this.buildDistrict();this.mergeArchitecture();this.buildPlayer();this.scene.add(this.player);this.buildCourse();this.resize();
  }
  resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  private mergeArchitecture(){
    this.mergeStatic(this.scene,[this.foundations,this.skyline]);
    this.mergeStatic(this.foundations);this.mergeStatic(this.skyline);
  }
  private mergeStatic(root:T.Object3D,exclude:T.Object3D[]=[]){
    root.updateWorldMatrix(true,true);const inverseRoot=root.matrixWorld.clone().invert();
    const groups=new Map<string,{material:T.Material;cast:boolean;geometries:T.BufferGeometry[]}>();const originals:T.Mesh[]=[];
    root.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;let p:T.Object3D|null=o;while(p){if(exclude.includes(p))return;p=p.parent;}const geometry=o.geometry.clone();
      // Quantized GLB positions must become floats before applying world transforms.
      for(const name of Object.keys(geometry.attributes)){const attribute=geometry.getAttribute(name);if(attribute.normalized||!(attribute.array instanceof Float32Array)){const values=new Float32Array(attribute.count*attribute.itemSize);for(let i=0;i<attribute.count;i++)for(let c=0;c<attribute.itemSize;c++)values[i*attribute.itemSize+c]=c===0?attribute.getX(i):c===1?attribute.getY(i):c===2?attribute.getZ(i):attribute.getW(i);geometry.setAttribute(name,new T.Float32BufferAttribute(values,attribute.itemSize));}}
      geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverseRoot,o.matrixWorld));const key=o.material.uuid+Object.keys(geometry.attributes).sort().join(',')+o.castShadow;let group=groups.get(key);if(!group){group={material:o.material,cast:o.castShadow,geometries:[]};groups.set(key,group);}group.geometries.push(geometry);originals.push(o);});
    for(const o of originals){o.removeFromParent();o.geometry.dispose();}
    for(const group of groups.values()){const geometry=mergeGeometries(group.geometries);if(geometry){const mesh=new T.Mesh(geometry,group.material);mesh.castShadow=group.cast;mesh.receiveShadow=true;root.add(mesh);}for(const g of group.geometries)g.dispose();}
  }
  async loadArchitecture(manifestPath:string){
    const response=await fetch(manifestPath);if(!response.ok)throw Error(`Building manifest ${response.status}`);
    const manifest=await response.json() as {details:string[];distant:string[];height:number};
    const loader=new GLTFLoader(),materials=new Map<string,T.Material>(),textures=new Map<string,T.Texture>();
    const load=async(path:string)=>{const gltf=await loader.loadAsync(path);gltf.scene.traverse(o=>{if(!(o instanceof T.Mesh))return;o.castShadow=true;o.receiveShadow=true;
      const list=Array.isArray(o.material)?o.material:[o.material];const canonical=list.map(raw=>{const m=raw as T.MeshStandardMaterial;
        for(const slot of ['map','normalMap','roughnessMap','metalnessMap','aoMap'] as const){const texture=m[slot];if(!texture?.name)continue;const key=texture.name+texture.colorSpace+texture.channel;const old=textures.get(key);if(old)m[slot]=old;else textures.set(key,texture);}
        const key=[m.name,m.color?.getHex(),m.roughness,m.metalness,m.opacity,m.map?.name,m.normalMap?.name,m.roughnessMap?.name].join(':');const previous=materials.get(key);if(previous)return previous;materials.set(key,m);return m;});o.material=Array.isArray(o.material)?canonical:canonical[0];});return gltf.scene;};
    const [details,distant]=await Promise.all([Promise.all(manifest.details.map(load)),Promise.all(manifest.distant.map(load))]);
    if(!details.length||!distant.length)throw Error('Building kit requires detailed and distant modules.');
    this.foundations.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});this.foundations.clear();this.skyline.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});this.skyline.clear();
    for(const [i,site] of SITES.entries()){const model=details[i%details.length].clone(true);model.position.set(site.x,0,site.z);model.scale.y=site.y/manifest.height;model.rotation.y=(i%4)*Math.PI/2;this.buildingKit.add(model);}
    for(const block of CITY_BLOCKS){const model=distant[block.variant].clone(true);model.position.set(block.x,0,block.z);model.scale.set(block.width,block.heightScale,block.width);model.rotation.y=block.rotation;model.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=false;});this.buildingKit.add(model);}
    this.buildingCount=SITES.length+58;this.mergeStatic(this.buildingKit);
  }
  private buildDistrict(){
    const roof=tiledRoof();
    box(this.scene,-3,-.2,9,190,.3,200,material(0x9a9889));
    box(this.scene,-3,.05,9,190,.2,200,paving(),false);
    for(const deck of SURFACES.filter(s=>s.kind==='deck'&&s.id!=='recovery')){box(this.scene,deck.x,deck.y-.12,deck.z,deck.w,.24,deck.d,mats.wood);for(let i=-2;i<=2;i++)box(this.scene,deck.x+i*.8,deck.y+.015,deck.z,.035,.03,deck.d,mats.trim,false);for(const x of [-1,1])for(const z of [-1,1])cylinder(this.scene,deck.x+x*(deck.w/2-.15),deck.y+.25,deck.z+z*(deck.d/2-.15),.07,.6,mats.brass);}
    for(const s of SITES){
      const plaster=material([0xe9d5b0,0xe2cba8,0xe8d8be,0xddd2b7][SITES.indexOf(s)%4]);
      box(this.foundations,s.x,(s.y-.5)/2,s.z,s.w,s.y-.5,s.d,plaster);
      box(this.foundations,s.x,s.y-.28,s.z,s.w+.3,.5,s.d+.3,mats.trim);
      box(this.foundations,s.x,s.y-.035,s.z,s.w,.08,s.d,roof);
      // Shaded windows and slim shutters, facades rather than flat roof platforms.
      for(let side=0;side<4;side++)for(let row=0;row<2;row++)for(let col=-1;col<=1;col++){
        const y=3+row*3,off=col*3.4;
        if(side<2){const z=s.z+(side===0?1:-1)*(s.d/2+.02);box(this.foundations,s.x+off,y,z,1.25,1.8,.08,mats.dark,false);box(this.foundations,s.x+off-.8,y,z,.28,1.9,.13,mats.teal,false);box(this.foundations,s.x+off+.8,y,z,.28,1.9,.13,mats.teal,false);box(this.foundations,s.x+off,y-1,z,1.7,.16,.4,mats.trim,false);}
        else {const x=s.x+(side===2?1:-1)*(s.w/2+.02);box(this.foundations,x,y,s.z+off,.08,1.8,1.25,mats.dark,false);box(this.foundations,x,y,s.z+off-.8,.13,1.9,.28,mats.teal,false);box(this.foundations,x,y,s.z+off+.8,.13,1.9,.28,mats.teal,false);}
      }
      // Low parapets keep silhouettes detailed while the travel corridors stay open.
      for(const side of [-1,1]){box(this.foundations,s.x+side*5.4,s.y+.2,s.z+5.7,2,.42,.35,mats.trim);box(this.foundations,s.x+side*5.4,s.y+.2,s.z-5.7,2,.42,.35,mats.trim);}
      const sign=label(s.name,3.1);const anchors:Partial<Record<SiteId,[number,number,number]>>={greenhouse:[-3.65,13.2,22.28],west:[-21.85,13.6,-4.4],east:[14.65,12.8,-3.8]};const anchor=anchors[s.id];if(anchor)sign.position.set(...anchor);else sign.position.set(s.x,s.y+2.1,s.z-4.9);this.scene.add(sign);this.labels.set(s.id,sign);
    }
    for(const s of SURFACES.filter(s=>s.kind!=='roof'&&s.kind!=='deck')){
      const y=surfaceHeight(s,s.x,s.z);const bridge=box(this.scene,s.x,y-.13,s.z,s.w,.24,s.d,s.id.startsWith('spring')?mats.terra:s.kind==='awning'?mats.teal:s.kind==='narrow'?mats.wood:mats.trim);
      if(s.ramp){const r=s.ramp;if(r.ax!==r.bx)bridge.rotation.z=Math.atan2(r.by-r.ay,r.bx-r.ax);else bridge.rotation.x=-Math.atan2(r.by-r.ay,r.bz-r.az);}
      if(s.id==='radio-striped'||s.id.startsWith('spring')){
        const horizontal=s.w>s.d;for(let n=-2;n<=2;n++){if(horizontal)box(this.scene,s.x+n*1.35,y+.02,s.z,.25,.045,s.d,mats.trim,false);else box(this.scene,s.x,y+.02,s.z+n*1.35,s.w,.045,.25,mats.trim,false);}
        for(const side of [-1,1]){const x=s.x+(horizontal?0:side*s.w/2),z=s.z+(horizontal?side*s.d/2:0);box(this.scene,x,y-.5,z,horizontal?s.w:.08,.65,horizontal?.08:s.d,mats.teal,false);}
      }
    }
    for(const o of OBSTACLES.filter(o=>o.kind==='wall'))box(this.scene,o.x,o.y+o.h/2,o.z,o.w,o.h,o.d,mats.trim);
    const landmarks=createLandmarks();this.scene.add(landmarks.group);
    for(const rail of COURSE_SOLIDS)box(this.scene,rail.x,rail.y+rail.h/2,rail.z,rail.w,rail.h,rail.d,mats.wood);
    const narrow=label('Wooden beam',2.8);narrow.position.set(-9,9.6,-2);this.scene.add(narrow);
    const wide=label('Striped bridge',3.1);wide.position.set(-9,9.6,3.3);this.scene.add(wide);
    // City skyline and sea: geometry occupies the horizon without extending the game map.
    const sea=new T.Mesh(new T.PlaneGeometry(500,350),material(0x6da5b5,.28));sea.rotation.x=-Math.PI/2;sea.position.set(0,-.1,-135);this.scene.add(sea);
    for(let i=0;i<55;i++){const angle=i/55*Math.PI*2,r=70+(i%4)*7,x=Math.sin(angle)*r,z=10+Math.cos(angle)*r,h=5+(i*7%13);box(this.skyline,x,h/2,z,5+(i%3),h,5+(i%4),material(i%3===0?0xcba98b:0xe0c5a2),false);box(this.skyline,x,h,z,6.5,.35,6.5,mats.terra,false);}
    for(let i=0;i<7;i++){const hill=new T.Mesh(new T.ConeGeometry(35+i*2,18+i%3*6,5),material(0x93b3bb));hill.position.set(-150+i*48,-2,-115-i%2*20);this.scene.add(hill);}
  }
  private buildCourse(){
    this.scene.add(this.courseDecor);
    const noteMaterial=new T.MeshStandardMaterial({color:0xffd57b,emissive:0x9b5c17,emissiveIntensity:.45,roughness:.3,metalness:.65});
    for(const note of SIGNAL_NOTES){const g=new T.Group();
      const head=new T.Mesh(new T.SphereGeometry(.13,10,7),noteMaterial);head.scale.set(1.25,.7,.65);g.add(head);
      box(g,.12,.2,0,.045,.42,.045,noteMaterial,false);const flag=box(g,.20,.37,0,.21,.065,.045,noteMaterial,false);flag.rotation.z=-.3;
      const halo=new T.Mesh(new T.TorusGeometry(.29,.012,4,20),noteMaterial);halo.rotation.y=Math.PI/2;g.add(halo);g.position.set(note.x,note.y,note.z);this.mergeStatic(g);this.courseDecor.add(g);this.noteMeshes.push(g);}
    const airMaterial=new T.MeshBasicMaterial({color:0xdbf9f5,transparent:true,opacity:.35,depthWrite:false});
    this.windStreaks=new T.InstancedMesh(new T.CylinderGeometry(.012,.012,.55,4),airMaterial,WIND_LIFTS.length*16);this.windStreaks.frustumCulled=false;this.courseDecor.add(this.windStreaks);
    this.landingRing=new T.Mesh(new T.RingGeometry(.6,.66,40),new T.MeshBasicMaterial({color:0xffd481,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));this.landingRing.rotation.x=-Math.PI/2;this.courseDecor.add(this.landingRing);
  }
  private puff(point:T.Vector3,color:number,count=5){
    if(this.particles.length>70)return;for(let i=0;i<count;i++){const mesh=new T.Mesh(new T.SphereGeometry(.045,5,4),material(color));mesh.position.copy(point);this.scene.add(mesh);this.particles.push({mesh,vel:new T.Vector3(Math.cos(i*2.4)*1.2,.5+Math.sin(i)*.3,Math.sin(i*2.4)*1.2),life:.5});}
  }
  private animateCourse(sim:Simulation,dt:number,reduced:boolean){
    if(this.lastNotes.size>sim.notes.size)this.lastNotes.clear();
    for(const [i,g] of this.noteMeshes.entries()){const note=SIGNAL_NOTES[i];g.visible=!sim.notes.has(i);g.position.y=note.y+(reduced?0:Math.sin(this.time*2.4+i)*.12);g.rotation.y=this.time*.9+i;
      if(sim.notes.has(i)&&!this.lastNotes.has(i)){this.puff(new T.Vector3(note.x,note.y,note.z),0xffd778,7);this.lastNotes.add(i);}}
    if(this.windStreaks){const dummy=new T.Object3D();for(let i=0;i<WIND_LIFTS.length*16;i++){const wind=WIND_LIFTS[Math.floor(i/16)],phase=(i%16)/16,angle=phase*Math.PI*2+this.time*.8,radius=wind.r*(.6+Math.sin(phase*24)*.18);dummy.position.set(wind.x+Math.cos(angle)*radius,wind.y+((phase+this.time*.25)%1)*wind.h,wind.z+Math.sin(angle)*radius);dummy.rotation.z=.2*Math.sin(angle);dummy.updateMatrix();this.windStreaks.setMatrixAt(i,dummy.matrix);}this.windStreaks.instanceMatrix.needsUpdate=true;}
    if(this.landingRing){this.landingRing.visible=sim.landingPulse>0;this.landingRing.position.set(sim.p.x,sim.p.y+.035,sim.p.z);this.landingRing.scale.setScalar(1+(1-sim.landingPulse)*2);(this.landingRing.material as T.MeshBasicMaterial).opacity=sim.landingPulse*.45;}
    this.dustClock+=dt;if(sim.mode==='play'&&this.dustClock>.11&&Math.hypot(sim.v.x,sim.v.z)>3){this.dustClock=0;if(sim.onGround)this.puff(new T.Vector3(sim.p.x,sim.p.y+.08,sim.p.z),0xdda684,2);else if(sim.dashPulse>.1)this.puff(new T.Vector3(sim.p.x,sim.p.y+1,sim.p.z),0xd6f5ed,3);}
  }
  private buildPlayer(){
    this.player.add(this.character,this.wing,this.parcel,this.devMarker);
    const capsule=new T.Mesh(new T.CapsuleGeometry(.32,1,6,12),mats.teal);capsule.position.y=.85;capsule.castShadow=true;this.devMarker.add(capsule);const dev=label('RIG PENDING',1.8);dev.position.y=2;this.devMarker.add(dev);
    // The wing is an authored rigid cloth assembly, distinct from skeletal character animation.
    const geo=new T.BufferGeometry();const positions=[-3,0,.35,-1.6,.45,-.5,0,.65,-1.1,1.6,.45,-.5,3,0,.35,-3,0,1.3,-1.6,.35,1,0,.5,.8,1.6,.35,1,3,0,1.3];geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex([0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,8,3,8,4,4,8,9]);geo.computeVertexNormals();this.wing.add(new T.Mesh(geo,new T.MeshStandardMaterial({color:0xf4e5c2,side:T.DoubleSide,roughness:.95})));
    for(let i=0;i<5;i++){const a=new T.Vector3(...positions.slice(i*3,i*3+3) as [number,number,number]);const b=new T.Vector3(...positions.slice((i+5)*3,(i+5)*3+3) as [number,number,number]);const curve=new T.LineCurve3(a,b);this.wing.add(new T.Mesh(new T.TubeGeometry(curve,1,.025,5,false),mats.brass));}
    this.wing.position.set(0,2,0);
    const glass=new T.MeshStandardMaterial({color:0xa6dcd8,roughness:.17,metalness:.08,transparent:true,opacity:.78});
    for(const x of [-.61,.61])for(const z of [-.21,.21])box(this.parcel,x,0,z,.05,.54,.05,mats.wood);
    for(const y of [-.25,.23])for(const z of [-.21,.21])box(this.parcel,0,y,z,1.27,.055,.055,mats.wood);
    box(this.parcel,0,-.25,0,1.27,.06,.44,mats.wood);for(const x of [-.42,-.14,.14,.42]){cylinder(this.parcel,x,-.04,0,.085,.31,glass);cylinder(this.parcel,x,.15,0,.037,.10,mats.brass);}
    for(const x of [-.37,.37])box(this.parcel,x,0,.246,.045,.57,.024,mats.trim,false);
    this.mergeStatic(this.parcel);this.parcel.visible=false;
  }
  async loadCourier(path:string){
    try{const gltf=await new GLTFLoader().loadAsync(path);const object=gltf.scene;object.traverse(o=>{if(o instanceof T.SkinnedMesh)this.skeletonBones=Math.max(this.skeletonBones,o.skeleton.bones.length);if(o instanceof T.Bone){const name=o.name.replace(/^mixamorig[:_]?/,'');this.bones.set(name,o);this.boneRest.set(name,o.quaternion.clone());}});if(!this.skeletonBones||gltf.animations.length===0)throw Error('Courier GLB requires a real skeleton and animation clips.');const bounds=new T.Box3().setFromObject(object);const size=bounds.getSize(new T.Vector3());const scale=1.85/size.y;object.scale.setScalar(scale);object.position.y=-bounds.min.y*scale;object.rotation.y=Math.PI;object.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});this.character.add(object);this.courierObject=object;this.courierBaseY=object.position.y;this.player.updateWorldMatrix(true,true);
      this.soleOffset=Math.min(...['LeftToeBase','RightToeBase','LeftToe_End','RightToe_End'].map(name=>this.bones.get(name)?.getWorldPosition(new T.Vector3()).y??Infinity));
      const hips=this.bones.get('Hips')!;
      // Tripo's in-place run retains a constant one-metre Z offset. The game owns root motion.
      const animations=gltf.animations.map(source=>{const clip=source.clone();for(const track of clip.tracks)if(/Hips\.position$/.test(track.name)){for(let i=0;i<track.values.length;i+=3){track.values[i]=hips.position.x;track.values[i+2]=hips.position.z;if(clip.name==='jump'||clip.name==='jump_down')track.values[i+1]=hips.position.y;}}return clip;});
      this.devMarker.visible=false;this.rigLoaded=true;this.mixer=new T.AnimationMixer(object);for(const clip of animations)this.clips[clip.name]=this.mixer.clipAction(clip);
      const down=animations.find(clip=>clip.name==='jump_down');
      if(down){const landing=T.AnimationUtils.subclip(down,'land',(down.duration-.6)*30,down.duration*30,30);this.clips.land=this.mixer.clipAction(landing);}
      for(const name of ['jump','jump_down','land'])if(this.clips[name]){this.clips[name].setLoop(T.LoopOnce,1);this.clips[name].clampWhenFinished=true;}
      if(this.clips.idle){this.clips.idle.play();this.currentClip='idle';this.mixer.update(0);}this.attachEquipment();
    }catch(e){this.assetError=String(e);}
  }
  async loadGlider(path:string){
    try{const gltf=await new GLTFLoader().loadAsync(path);const object=gltf.scene,bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3());
      const scale=4.6/size.x;object.scale.setScalar(scale);object.rotation.y=0;object.position.set((bounds.min.x+size.x/2)*scale,-bounds.min.y*scale,(bounds.min.z+size.z/2)*scale);
      object.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});this.wing.clear();this.wing.add(object);this.gliderLoaded=true;
      const bar=cylinder(this.gripHardware,0,-.18,-1.2,.024,.88,mats.wood);bar.rotation.z=Math.PI/2;
      for(const side of [-1,1]){const a=new T.Vector3(side*.42,-.18,-1.2),b=new T.Vector3(side*.55,.12,-1.45);const brace=new T.Mesh(new T.CylinderGeometry(.015,.015,a.distanceTo(b),8),mats.brass);brace.position.copy(a).add(b).multiplyScalar(.5);brace.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());this.gripHardware.add(brace);}this.wing.add(this.gripHardware);this.attachEquipment();
    }catch(e){this.assetError=String(e);}
  }
  private attachEquipment(){
    const spine=this.bones.get('Spine2');if(!spine||this.gearSocket)return;
    this.player.updateWorldMatrix(true,true);const rotation=this.character.getWorldQuaternion(new T.Quaternion()),back=new T.Vector3(0,0,.24).applyQuaternion(rotation);
    const point=spine.getWorldPosition(new T.Vector3()).add(back).add(new T.Vector3(0,-.05,0));
    const world=new T.Matrix4().compose(point,rotation,new T.Vector3(1,1,1));const local=spine.matrixWorld.clone().invert().multiply(world);
    const socket=new T.Object3D();socket.name='RadioGearSocket';local.decompose(socket.position,socket.quaternion,socket.scale);spine.add(socket);socket.add(this.wing,this.parcel);this.parcel.position.set(0,-.40,.12);this.gearSocket=socket;
  }
  private animateCharacter(sim:Simulation,dt:number){
    if(!this.mixer)return;
    if(sim.onGround&&!this.wasGrounded&&sim.landingPulse>.4)this.landTime=.48;
    this.wasGrounded=sim.onGround;this.landTime=Math.max(0,this.landTime-dt);
    const speed=Math.hypot(sim.v.x,sim.v.z);
    const name=!sim.onGround?(sim.v.y>0||sim.gliding?'jump':'jump_down'):this.landTime>0?'land':speed>1?'run':'idle';
    const action=this.clips[name]??this.clips.idle;
    if(action&&name!==this.currentClip){if(this.clips[this.currentClip])this.clips[this.currentClip].fadeOut(.12);action.reset().fadeIn(.12).play();this.currentClip=name;}
    if(this.clips.run)this.clips.run.timeScale=Math.max(.7,Math.min(1.5,speed/5.8));
    if(this.currentClip==='jump'&&sim.gliding&&action.time>.7){action.time=.7;action.paused=true;}else if(action)action.paused=false;
    const direction=speed>1?Math.atan2(sim.v.x,-sim.v.z):sim.yaw;
    const target=-(direction-sim.yaw),delta=Math.atan2(Math.sin(target-this.character.rotation.y),Math.cos(target-this.character.rotation.y));
    this.character.rotation.y+=delta*(1-Math.exp(-dt*12));
    if(this.courierObject)this.courierObject.position.y=this.courierBaseY;
    this.mixer.update(dt);this.player.updateWorldMatrix(true,true);
    if(sim.onGround&&this.courierObject&&Number.isFinite(this.soleOffset)){
      const footY=Math.min(...['LeftToeBase','RightToeBase','LeftToe_End','RightToe_End'].map(name=>this.bones.get(name)?.getWorldPosition(new T.Vector3()).y??Infinity));
      this.courierObject.position.y+=sim.p.y+this.soleOffset-footY;this.courierObject.updateWorldMatrix(true,true);
    }
  }
  private updateGrip(sim:Simulation){
    this.gripActive=sim.gliding&&this.wingOpen>.72&&this.gliderLoaded&&this.rigLoaded;this.gripHardware.visible=this.wingOpen>.72;
    if(!this.gripActive)return;this.player.updateWorldMatrix(true,true);
    const rotation=this.wing.getWorldQuaternion(new T.Quaternion()),forward=new T.Vector3(0,0,-1).applyQuaternion(rotation),down=new T.Vector3(0,-1,0).applyQuaternion(rotation);
    const xAxis=new T.Vector3().crossVectors(forward,down).normalize();const handRotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(xAxis,forward,down));
    for(const [side,sign] of [['Left',-1],['Right',1]] as const){
      const upper=this.bones.get(`${side}Arm`),forearm=this.bones.get(`${side}ForeArm`),hand=this.bones.get(`${side}Hand`);if(!upper||!forearm||!hand)continue;
      const grip=this.wing.localToWorld(new T.Vector3(sign*.33,-.18,-1.2));const target=grip.clone().addScaledVector(forward,-.055).addScaledVector(down,-.012);
      const error=solveArm(upper,forearm,hand,target);this.gripErrors[side==='Left'?'left':'right']=error;orientBoneWorld(hand,handRotation);
      for(const finger of ['Index','Middle','Ring','Pinky','Thumb'])for(let joint=1;joint<=3;joint++){const name=`${side}Hand${finger}${joint}`,bone=this.bones.get(name),rest=this.boneRest.get(name);if(!bone||!rest)continue;const curl=finger==='Thumb'?.45:joint===1?.8:1.15;bone.quaternion.copy(rest).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),curl));}
    }
  }
  artState(){return {courier:this.rigLoaded,glider:this.gliderLoaded,bones:this.skeletonBones,clips:Object.keys(this.clips),activeClip:this.currentClip,equipmentBone:this.gearSocket?.parent?.name??null,grip:{active:this.gripActive,...this.gripErrors},buildings:this.buildingCount,error:this.assetError};}
  recordFrame(seconds:number){if(seconds<=0)return;this.frames.push(seconds);if(this.frames.length>120)this.frames.shift();this.fps=1/(this.frames.reduce((a,b)=>a+b,0)/this.frames.length);}
  snapCamera(){this.firstCamera=true;}
  render(sim:Simulation,dt:number,reduced:boolean,draw=true){
    this.time+=dt;
    this.player.position.set(sim.p.x,sim.p.y,sim.p.z);this.player.rotation.y=-sim.yaw;this.parcel.visible=sim.job.fragile;
    this.wingOpen=T.MathUtils.damp(this.wingOpen,sim.gliding?1:0,12,dt);
    this.wing.scale.set((.12+this.wingOpen*.88)*.74,(.3+this.wingOpen*.7)*.74,(.25+this.wingOpen*.75)*.74);this.wing.visible=this.gliderLoaded||this.wingOpen>.02;
    if(dt>0){const rate=Math.atan2(Math.sin(sim.yaw-this.previousYaw),Math.cos(sim.yaw-this.previousYaw))/dt;this.previousYaw=sim.yaw;const sideSpeed=sim.v.x*Math.cos(sim.yaw)+sim.v.z*Math.sin(sim.yaw);const bank=reduced?0:T.MathUtils.clamp(rate*.10-sideSpeed*.025,-.28,.28)*this.wingOpen;this.wingBank=T.MathUtils.damp(this.wingBank,bank,8,dt);}
    this.animateCharacter(sim,sim.mode==='play'?dt:0);
    // The folded pack follows the spine. The deployed aerofoil stays level as the torso moves.
    if(this.gearSocket){
      this.player.updateWorldMatrix(true,true);const parentRotation=this.gearSocket.getWorldQuaternion(new T.Quaternion());
      const rotation=this.character.getWorldQuaternion(new T.Quaternion());const openRotation=parentRotation.invert().multiply(rotation).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),this.wingBank));
      this.wing.quaternion.identity().slerp(openRotation,this.wingOpen);
      const point=this.gearSocket.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,.6,.8).applyQuaternion(rotation));
      const local=this.gearSocket.worldToLocal(point);this.wing.position.set(0,-.15,0).lerp(local,this.wingOpen);
    }else this.wing.position.set(0,2,0);
    this.updateGrip(sim);
    for(const [id,sign] of this.labels){const dx=sign.position.x-sim.p.x,dz=sign.position.z-sim.p.z;sign.visible=id!==sim.currentSite&&id!==sim.lastSite&&dx*Math.sin(sim.yaw)-dz*Math.cos(sim.yaw)>-3&&Math.hypot(dx,dz)>4&&Math.hypot(dx,dz)<29;}
    for(const relay of sim.relays){if(relay.site==='west'||relay.site==='east')continue;let g=this.relays.get(relay.site);if(!g){g=new T.Group();
      const body=new T.Mesh(new RoundedBoxGeometry(.8,.9,.55,2,.08),mats.teal);body.position.y=.45;body.castShadow=true;g.add(body);
      box(g,0,.45,.29,.66,.7,.04,mats.trim,false);
      for(let i=0;i<6;i++)box(g,-.12,.31+i*.065,.32,.32,.026,.025,mats.dark,false);
      for(const y of [.3,.62]){const dial=cylinder(g,.23,y,.34,.075,.065,mats.brass);dial.rotation.x=Math.PI/2;}
      cylinder(g,-.22,1.22,0,.025,.75,mats.brass);cylinder(g,.21,1.13,0,.023,.58,mats.dark);
      box(g,0,.025,0,1,.05,.75,mats.wood);this.mergeStatic(g);this.scene.add(g);this.relays.set(relay.site,g);}g.position.set(relay.pos.x,relay.pos.y,relay.pos.z);}
    this.animateCourse(sim,dt,reduced);
    const forward=new T.Vector3(Math.sin(sim.yaw),0,-Math.cos(sim.yaw)),distance=5+this.wingOpen*(this.camera.aspect<.8?4:.8);const desired=new T.Vector3(sim.p.x-forward.x*distance+Math.cos(sim.yaw)*(this.camera.aspect<.8?0:.8),sim.p.y+1.5+Math.tan(this.cameraPitch)*8+this.wingOpen*(this.camera.aspect<.8?1.8:1.1),sim.p.z-forward.z*distance+Math.sin(sim.yaw)*(this.camera.aspect<.8?0:.8));
    if(this.firstCamera){this.camera.position.copy(desired);this.firstCamera=false;}else this.camera.position.lerp(desired,1-Math.exp(-dt*(reduced?30:7)));
    const target=new T.Vector3(sim.p.x+forward.x*3+Math.cos(sim.yaw)*(this.camera.aspect<.8?0:.9),sim.p.y+1.5,sim.p.z+forward.z*3+Math.sin(sim.yaw)*(this.camera.aspect<.8?0:.9));this.camera.lookAt(target);this.camera.fov=T.MathUtils.damp(this.camera.fov,!reduced&&sim.dashPulse>0?70:sim.gliding&&!reduced?63:58,4,dt);this.camera.updateProjectionMatrix();
    if(sim.signalPulse>.95&&this.particles.length===0){for(let i=0;i<18;i++){const mesh=new T.Mesh(new T.SphereGeometry(.045,4,4),mats.brass);mesh.position.set(sim.p.x,sim.p.y+1,sim.p.z);this.scene.add(mesh);this.particles.push({mesh,vel:new T.Vector3(Math.cos(i)*2,2+Math.sin(i),Math.sin(i)*2),life:1});}}
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;if(p.life<=0){this.scene.remove(p.mesh);p.mesh.geometry.dispose();this.particles.splice(i,1);}else{p.mesh.position.addScaledVector(p.vel,dt);p.mesh.scale.setScalar(p.life);}}
    if(draw)this.renderer.render(this.scene,this.camera);
  }
}
