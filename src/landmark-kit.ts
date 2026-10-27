import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {LANDMARK_ORIGINS,LANDMARK_SOLIDS,ROOF_PLANTERS,type LandmarkId} from './landmark-layout';

/** Original, locally authored architecture. No downloaded/generated prop models.
 * All world placement and collision dimensions come from landmark-layout.ts.
 */
export interface LandmarkKit {group:T.Group;cafe:T.Group;receiver:T.Group}
type Palette=ReturnType<typeof palette>;
const TAU=Math.PI*2;
function standard(name:string,color:number,roughness=.82,metalness=0){const m=new T.MeshStandardMaterial({name,color,roughness,metalness});return m;}
function palette(){return {
  plaster:standard('Landmarks / warm lime',0xf1dfbb),stone:standard('Landmarks / honey limestone',0xd8bc8e),
  edge:standard('Landmarks / fresh cut limestone',0xf9e8c9),teal:standard('Landmarks / painted teal wood',0x2b7576),
  blue:standard('Landmarks / radio blue enamel',0x315a86,.48,.12),iron:standard('Landmarks / graphite iron',0x293c41,.56,.48),
  brass:standard('Landmarks / aged brass',0xb78c46,.4,.63),terra:standard('Landmarks / terracotta',0xb96643),
  red:standard('Landmarks / café vermilion canvas',0xb74835,.94),linen:standard('Landmarks / natural linen',0xf1dfb7,.96),
  wood:standard('Landmarks / oiled walnut',0x715044),dark:standard('Landmarks / deep recess',0x20383e,.98),
  leaf:standard('Landmarks / olive leaves',0x61784e,.95),leafLight:standard('Landmarks / leaf silver',0x91a276,.96),
  soil:standard('Landmarks / pot soil',0x4a4034,1),copper:standard('Landmarks / weathered copper',0x568a7d,.55,.32),
  glass:new T.MeshPhysicalMaterial({name:'Landmarks / greenhouse glass',color:0x9fc9bd,roughness:.2,metalness:.04,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false}),
};}
function mesh(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function rounded(w:number,h:number,d:number,r=.035){return new RoundedBoxGeometry(w,h,d,1,Math.min(r,w*.21,h*.21,d*.21));}
function block(p:T.Object3D,m:T.Material,x:number,y:number,z:number,w:number,h:number,d:number,r=.035){return mesh(p,rounded(w,h,d,r),m,x,y,z);}
function tube(p:T.Object3D,m:T.Material,a:T.Vector3,b:T.Vector3,r=.025,segments=8){const o=mesh(p,new T.CylinderGeometry(r,r,a.distanceTo(b),segments),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return o;}
function cylinder(p:T.Object3D,m:T.Material,x:number,y:number,z:number,r:number,h:number,top=r,segments=24){return mesh(p,new T.CylinderGeometry(top,r,h,segments),m,x,y,z);}
function lathe(p:T.Object3D,m:T.Material,x:number,y:number,z:number,profile:number[][],segments=32){const ordered=profile[0][1]>profile[profile.length-1][1]?[...profile].reverse():profile;return mesh(p,new T.LatheGeometry(ordered.map(([r,h])=>new T.Vector2(r,h)),segments),m,x,y,z);}
function torus(p:T.Object3D,m:T.Material,x:number,y:number,z:number,r:number,t=.035){const o=mesh(p,new T.TorusGeometry(r,t,6,32),m,x,y,z);o.rotation.x=Math.PI/2;return o;}
function quad(p:T.Object3D,m:T.Material,points:number[],indices=[0,2,1,0,3,2]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return mesh(p,g,m);}
function texture(w:number,h:number,paint:(c:CanvasRenderingContext2D)=>void){if(typeof document==='undefined')return undefined;const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)return undefined;paint(ctx);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return map;}
function paintedMaterial(name:string,map:T.Texture|undefined,color=0xf1dfb7){return new T.MeshStandardMaterial({name,color:map?0xffffff:color,...(map?{map}:{}),roughness:.86});}
function sign(p:T.Object3D,m:Palette,text:string,x:number,y:number,z:number,w:number,h=.44,rotation=0){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rotation;p.add(g);block(g,m.wood,0,0,0,w,h,.075,.045);
  const map=texture(1024,192,c=>{c.fillStyle='#f3e3bd';c.fillRect(0,0,1024,192);c.strokeStyle='#a7834e';c.lineWidth=5;c.strokeRect(12,12,1000,168);c.fillStyle='#23494d';c.font='600 76px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,512,103,950);});
  mesh(g,new T.PlaneGeometry(w-.08,h-.07),paintedMaterial(`Landmarks / sign / ${text}`,map),0,0,.041);return g;
}
function archShape(width:number,spring:number,rise:number,bottom=0){const s=new T.Shape();s.moveTo(-width/2,bottom);s.lineTo(width/2,bottom);s.lineTo(width/2,spring);s.absellipse(0,spring,width/2,rise,0,Math.PI,false,0);s.closePath();return s;}
function archRing(p:T.Object3D,m:T.Material,width:number,spring:number,rise:number,thickness:number,depth:number,x:number,y:number,z:number,rotation=0){
  // A single connected U-shaped outline keeps the opening joined to the outside
  // below. A separate "hole" crossing the bottom edge triangulates incorrectly.
  const half=width/2,s=new T.Shape();s.moveTo(-half-thickness,0);s.lineTo(-half-thickness,spring);s.absellipse(0,spring,half+thickness,rise+thickness,Math.PI,0,true,0);s.lineTo(half+thickness,0);s.lineTo(half,0);s.lineTo(half,spring);s.absellipse(0,spring,half,rise,0,Math.PI,false,0);s.lineTo(-half,0);s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:1,curveSegments:16});const o=mesh(p,g,m,x,y,z-depth/2);o.rotation.y=rotation;return o;
}
function leaf(p:T.Object3D,m:T.Material,a:T.Vector3,b:T.Vector3,width:number){const delta=b.clone().sub(a),side=new T.Vector3(delta.z*.3,0,-delta.x*.3).normalize().multiplyScalar(width);if(side.lengthSq()<.01)side.set(width,0,0);const mid=a.clone().lerp(b,.55).add(new T.Vector3(0,width*.4,0));const pts=[...a.toArray(),...mid.clone().add(side).toArray(),...b.toArray(),...mid.clone().sub(side).toArray()];const o=quad(p,m,pts);o.material=(m as T.MeshStandardMaterial);return o;}

export function createLandmarks():LandmarkKit {
  const group=new T.Group();group.name='Original rooftop landmark kit';const m=palette();const groups={} as Record<LandmarkId,T.Group>;
  m.leaf.side=m.leafLight.side=T.DoubleSide;
  for(const id of Object.keys(LANDMARK_ORIGINS) as LandmarkId[]){const o=LANDMARK_ORIGINS[id],g=new T.Group();g.name=o.label;g.position.set(o.x,o.y,o.z);g.userData.landmark=id;group.add(g);groups[id]=g;}
  const byId=new Map(LANDMARK_SOLIDS.map(s=>[s.id,s]));const used=new Set<string>();
  function solid(id:string,material:T.Material,style:'box'|'cylinder'|'none'='box'){
    const s=byId.get(id);if(!s)throw Error(`Unknown landmark solid ${id}`);used.add(id);if(style==='none')return s;
    const o=LANDMARK_ORIGINS[s.landmark],g=groups[s.landmark];let result:T.Mesh;
    if(s.shape==='cylinder')result=cylinder(g,material,s.x-o.x,s.y-o.y+s.h/2,s.z-o.z,s.r,s.h);
    else result=block(g,material,s.x-o.x,s.y-o.y+s.h/2,s.z-o.z,s.w,s.h,s.d);
    result.userData.solidIds=[s.id];return s;
  }
  function mark(ids:string[],o:T.Object3D){ids.forEach(id=>solid(id,m.stone,'none'));o.userData.solidIds=ids;}

  // Water tank: stave seams, iron straps, domed cap, short ladder and open legs.
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='water')){
    if(s.id==='water-cap'||s.id==='water-ladder'){solid(s.id,m.iron,'none');continue;}
    solid(s.id,s.id==='water-tank'?m.teal:s.id.includes('lid')?m.brass:m.iron);
  }
  const water=groups.water;
  const cap=lathe(water,m.teal,-4,4.39,3.8,[[0,0],[1.29,0],[1.17,.1],[.85,.28],[.36,.4],[0,.43]]);cap.userData.solidIds=['water-cap'];
  for(const y of [2.54,3.27,4.1])torus(water,m.brass,-4,y,3.8,1.267,.032);
  for(let i=0;i<24;i++){const a=i*TAU/24;block(water,m.dark,-4+Math.sin(a)*1.261,3.33,3.8+Math.cos(a)*1.261,.019,1.66,.019,.002);}
  for(const z of [3.58,4.02])tube(water,m.iron,new T.Vector3(-5.45,.12,z),new T.Vector3(-5.45,3.16,z),.025).userData.solidIds=['water-ladder'];
  for(let y=.25;y<3.1;y+=.28)tube(water,m.brass,new T.Vector3(-5.45,y,3.56),new T.Vector3(-5.45,y,4.04),.023);
  sign(water,m,'WATER',-4,3.42,5.072,1.32,.36);

  // Greenhouse: translucent panes, inset masonry bed and a genuinely open door
  // at either end. Fine glazing bars are surface ornament of the pane colliders.
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='greenhouse')){
    if(s.id.includes('roof')||s.id.includes('gable')||s.id.includes('pot')){solid(s.id,m.glass,'none');continue;}
    solid(s.id,s.id.includes('side')||s.id.includes('end')?m.glass:s.id.includes('bench')?m.wood:m.stone);
  }
  const greenhouse=groups.greenhouse,gx=-3.65,gz=4.28,w=3.35,d=3.48;
  for(const side of [-1,1]){
    for(let i=0;i<=4;i++)block(greenhouse,m.teal,gx+side*w/2,1.69,gz-d/2+i*d/4,.055,2.3,.055,.008);
    for(const y of [.56,1.69,2.78])block(greenhouse,m.teal,gx+side*w/2,y,gz,.07,.065,d+.08,.008);
    for(const x of [-w/2,-.74,.74,w/2])block(greenhouse,m.teal,gx+x,1.48,gz+side*d/2,.075,2.63,.075,.008);
    block(greenhouse,m.teal,gx,2.78,gz+side*d/2,w+.08,.085,.085,.008);
    tube(greenhouse,m.teal,new T.Vector3(gx-w/2,2.78,gz+side*d/2),new T.Vector3(gx,3.8,gz+side*d/2),.038);
    tube(greenhouse,m.teal,new T.Vector3(gx,3.8,gz+side*d/2),new T.Vector3(gx+w/2,2.78,gz+side*d/2),.038);
    const pane=quad(greenhouse,m.glass,[gx-w/2,2.78,gz+side*d/2,gx,3.8,gz+side*d/2,gx+w/2,2.78,gz+side*d/2],[0,1,2]);pane.userData.solidIds=Array.from({length:10},(_,i)=>`greenhouse-gable-${side}-${i}`);
  }
  for(const side of [-1,1]){const o=quad(greenhouse,m.glass,[gx,3.8,gz-d/2-.05,gx+side*w/2,2.78,gz-d/2-.05,gx+side*w/2,2.78,gz+d/2+.05,gx,3.8,gz+d/2+.05]);o.userData.solidIds=Array.from({length:5},(_,i)=>`greenhouse-roof-${side<0?i:i+5}`);}
  for(let i=0;i<=4;i++)for(const side of [-1,1])tube(greenhouse,m.teal,new T.Vector3(gx,3.82,gz-d/2+i*d/4),new T.Vector3(gx+side*w/2,2.8,gz-d/2+i*d/4),.028);
  tube(greenhouse,m.brass,new T.Vector3(gx,3.82,gz-d/2-.1),new T.Vector3(gx,3.82,gz+d/2+.1),.044);
  for(const z of [-1.25,0,1.25])for(const side of [-1,1]){
    const px=gx+side*1.1,pz=gz+z;lathe(greenhouse,m.terra,px,.9,pz,[[.22,0],[.28,.34],[.3,.36],[.25,.38]]).userData.solidIds=[`greenhouse-pot-${side}-${z}`];
    for(let j=0;j<6;j++){const a=j*TAU/6;leaf(greenhouse,j%2?m.leaf:m.leafLight,new T.Vector3(px,1.2,pz),new T.Vector3(px+Math.cos(a)*.32,1.65+(j%2)*.16,pz+Math.sin(a)*.32),.095);}
  }
  sign(greenhouse,m,'GREENHOUSE',gx,2.64,gz-d/2-.09,2.28,.33,Math.PI);

  // Slender open belfry. The visible bell and daylight through every side carry
  // the landmark identity; no large blank shaft obscures the junction.
  const bell=groups.bell,bx=-4.65,bz=-4.55;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='bell')){
    if(s.id.includes('arch')||s.id.includes('roof')||['bell-bronze','bell-yoke','bell-clapper','bell-sign'].includes(s.id)){solid(s.id,m.stone,'none');continue;}
    solid(s.id,s.id.includes('finial')?m.brass:s.id.includes('capital')||s.id==='bell-entablature'?m.edge:m.stone);
  }
  for(const x of [-.88,.88])for(const z of [-.88,.88])for(let i=0;i<11;i++)block(bell,i%3===0?m.edge:m.plaster,bx+x,.4+i*.34,bz+z,.405,.325,.405,.012);
  for(const side of [-1,1]){
    const a=archRing(bell,m.edge,1.38,0,.69,.18,.32,bx,4.36,bz+side*.88);mark(Array.from({length:8},(_,i)=>`bell-arch-z-${side}-${i}`),a);
    const b=archRing(bell,m.edge,1.38,0,.69,.18,.32,bx+side*.88,4.36,bz,Math.PI/2);mark(Array.from({length:8},(_,i)=>`bell-arch-x-${side}-${i}`),b);
    for(let i=1;i<8;i++){const a=i*Math.PI/8;const s=block(bell,m.stone,bx+Math.cos(a)*.78,4.36+Math.sin(a)*.78,bz+side*.88,.018,.18,.336,.002);s.rotation.z=a-Math.PI/2;}
  }
  const roof=mesh(bell,new T.ConeGeometry(1.91,1.1,4,1),m.terra,bx,6.13,bz);roof.rotation.y=Math.PI/4;mark(Array.from({length:5},(_,i)=>`bell-roof-${i}`),roof);
  for(let i=0;i<4;i++){const size=2.7*(1-(.03+i*.22)/1.1)+.04;const edge=block(bell,m.terra,bx,5.61+i*.22,bz,size,.035,size,.012);edge.userData.decoration=true;}
  const bronze=lathe(bell,m.brass,bx,3.35,bz,[[0,1.02],[.17,1.1],[.24,.95],[.26,.57],[.38,.22],[.54,.1],[.54,.015],[.46,0],[.35,.16],[.22,.5],[.16,.88],[0,.92]]);bronze.userData.solidIds=['bell-bronze'];
  tube(bell,m.wood,new T.Vector3(bx-.53,4.51,bz),new T.Vector3(bx+.53,4.51,bz),.055).userData.solidIds=['bell-yoke'];cylinder(bell,m.iron,bx,3.4,bz,.06,.45).userData.solidIds=['bell-clapper'];mesh(bell,new T.SphereGeometry(.1,10,8),m.iron,bx,3.22,bz);
  sign(bell,m,'BELL TOWER',bx,2.96,bz+.23,2.1,.4).children[0].userData.solidIds=['bell-sign']; // over 2.7 m clear headroom

  // Clock face numerals are painted once on a local canvas, not remote fonts.
  const clock=groups.clock,cx=-4.5,cz=-4.35;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='clock'))solid(s.id,s.id.includes('roof')?m.copper:s.id.includes('finial')?m.brass:s.id.includes('cornice')?m.edge:m.stone,s.id.includes('roof')?'none':'box');
  lathe(clock,m.copper,cx,5.98,cz,[[0,1.35],[.3,1.27],[.46,1.03],[.73,.86],[.96,.68],[1.11,.41],[1.48,.17],[1.58,.04],[1.58,0]]).userData.solidIds=['clock-roof-low','clock-roof-mid','clock-roof-high'];
  for(let i=0;i<8;i++){const a=i*TAU/8;const points=[[1.56,.08],[1.12,.42],[.95,.7],[.47,1.05],[.3,1.27]].map(([r,y])=>new T.Vector3(cx+Math.sin(a)*r,5.98+y,cz+Math.cos(a)*r));mesh(clock,new T.TubeGeometry(new T.CatmullRomCurve3(points),12,.018,5,false),m.brass);}
  for(let y=.6;y<4;y+=.55)torus(clock,y%1.1<.1?m.edge:m.stone,cx,y,cz,1.078,.025);
  const clockMap=texture(512,512,c=>{c.fillStyle='#f4e5c3';c.fillRect(0,0,512,512);c.translate(256,256);c.strokeStyle='#34494a';c.lineWidth=5;c.beginPath();c.arc(0,0,224,0,TAU);c.stroke();for(let i=0;i<60;i++){c.save();c.rotate(i*TAU/60);c.lineWidth=i%5?2:7;c.beginPath();c.moveTo(0,-201);c.lineTo(0,i%5?-210:-218);c.stroke();c.restore();}c.fillStyle='#304749';c.font='600 35px Georgia, serif';c.textAlign='center';c.textBaseline='middle';for(let i=1;i<=12;i++){const a=i*TAU/12;c.fillText(String(i),Math.sin(a)*174,-Math.cos(a)*174);}c.lineCap='round';c.lineWidth=12;c.beginPath();c.moveTo(0,0);c.lineTo(-76,-58);c.stroke();c.lineWidth=7;c.beginPath();c.moveTo(0,0);c.lineTo(51,-120);c.stroke();c.beginPath();c.arc(0,0,13,0,TAU);c.fill();});
  const faceMaterial=paintedMaterial('Landmarks / clock dial',clockMap);
  for(let i=0;i<4;i++){const a=i*Math.PI/2,g=new T.Group();g.position.set(cx+Math.sin(a)*1.37,4.91,cz+Math.cos(a)*1.37);g.rotation.y=a;clock.add(g);mesh(g,new T.CircleGeometry(.64,40),faceMaterial);const rim=mesh(g,new T.TorusGeometry(.66,.038,6,40),m.brass);rim.position.z=.015;block(g,m.iron,-.1,.08,.035,.03,.28,.022,.009).rotation.z=.9;block(g,m.iron,.075,.19,.035,.025,.42,.022,.009).rotation.z=-.38;mesh(g,new T.CircleGeometry(.045,12),m.brass,0,0,.05);}
  sign(clock,m,'CLOCK TOWER',cx,2.12,cz+1.09,1.8,.38);

  // Café: carved stone kiosk, deep service arch, striped curved cloth, scallops,
  // brass posts, real bistro tables and bent timber chair backs.
  const cafe=groups.cafe;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='cafe')){
    if(s.id.includes('canopy')||s.id.startsWith('cafe-chair-')){solid(s.id,m.linen,'none');continue;}
    solid(s.id,s.id.includes('kiosk')?m.plaster:s.id.includes('roof')?m.terra:s.id.includes('counter')||s.id.includes('chair')?m.wood:s.id.includes('table-top')?m.edge:s.id.includes('cornice')?m.edge:m.iron);
  }
  const opening=archShape(2.45,1.06,.43);mesh(cafe,new T.ShapeGeometry(opening,20),m.dark,-3.35,.94,-2.539);
  archRing(cafe,m.stone,2.45,1.06,.43,.12,.12,-3.35,.94,-2.5);
  for(const x of [-4.12,-2.58])block(cafe,m.teal,x,1.57,-2.44,.09,1.2,.08,.012);
  sign(cafe,m,'CAFÉ',-3.35,2.58,-2.47,1.55,.38);
  for(let i=0;i<9;i++){
    const x=-2.9+i*5.8/9,ww=5.8/9,points:number[]=[];
    for(let j=0;j<=12;j++){const t=j/12,z=-1.45+t*3.2,y=2.98-t*.416-Math.sin(t*Math.PI)*.065;points.push(x,y,z,x+ww,y,z);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));const indices:number[]=[];for(let j=0;j<12;j++){const v=j*2;indices.push(v,v+2,v+1,v+1,v+2,v+3);}geo.setIndex(indices);geo.computeVertexNormals();const mat=i%2?m.linen:m.red;const cloth=mesh(cafe,geo,mat);cloth.userData.solidIds=Array.from({length:7},(_,j)=>`cafe-canopy-${j}`);mat.side=T.DoubleSide;
    const scallop=new T.Shape();scallop.moveTo(0,0);scallop.lineTo(ww,0);scallop.lineTo(ww,-.12);scallop.quadraticCurveTo(ww/2,-.35,0,-.12);scallop.closePath();mesh(cafe,new T.ShapeGeometry(scallop,10),mat,x,2.56,1.75);
  }
  for(const x of [-2.7,2.7]){torus(cafe,m.brass,x,.23,1.68,.095,.025);torus(cafe,m.brass,x,2.35,1.68,.095,.025);tube(cafe,m.brass,new T.Vector3(x,2.44,1.68),new T.Vector3(x,2.96,-1.45),.026);}
  for(const x of [-1.5,1.5])for(const side of [-1,1]){
    const chairX=x+side*.81;for(const z of [.14,.46])for(const xx of [-.18,.18])cylinder(cafe,m.iron,chairX+xx,.22,z,.021,.44);
    block(cafe,m.wood,chairX,.44,.3,.49,.055,.48,.055).userData.solidIds=[`cafe-chair-${x<0?0:1}-${side}`];
    for(let i=0;i<3;i++)block(cafe,m.wood,chairX+side*.21,.55+i*.1,.3,.075,.055,.45,.018).userData.solidIds=[`cafe-chair-back-${x<0?0:1}-${side}`];
  }
  for(const x of [-1.5,1.5]){lathe(cafe,m.linen,x,.86,.3,[[.06,0],[.065,.11],[.078,.12],[.072,.13]]);torus(cafe,m.linen,x,.869,.3,.11,.014);}
  // Roof tile rows and a narrow dark drip edge break the kiosk's box silhouette.
  for(let i=0;i<15;i++)for(let row=0;row<5;row++){
    const tile=cylinder(cafe,m.terra,-5.31+i*.28,3.32,-5.11+row*.57,.145,.57,.145,8);tile.rotation.x=Math.PI/2;tile.scale.x=.62;tile.scale.z=.4;
  }

  // Radio station: concave dish, electric blue cabinet, analogue meters and two
  // unmistakable horizontal mast arrays; unlike the thin antenna terrace.
  const receiver=groups.receiver,rx=-3.85,rz=-4.4;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='receiver'))solid(s.id,s.id==='receiver-cabinet'?m.blue:s.id==='receiver-base'?m.edge:m.brass,s.id==='receiver-dish'?'none':'box');
  const dishGroup=new T.Group();dishGroup.position.set(rx+.4,2.95,rz+.04);dishGroup.rotation.x=Math.PI*.32;receiver.add(dishGroup);
  const dish=lathe(dishGroup,m.linen,0,0,0,[[0,0],[.2,.015],[.4,.06],[.62,.15],[.82,.28],[.95,.42],[.96,.45],[.91,.46],[.8,.32],[.6,.19],[.38,.1],[.15,.065],[0,.055]],40);dish.userData.solidIds=['receiver-dish'];
  torus(dishGroup,m.brass,0,.44,0,.945,.026);tube(dishGroup,m.brass,new T.Vector3(0,0,0),new T.Vector3(0,.9,0),.025);mesh(dishGroup,new T.SphereGeometry(.095,12,8),m.blue,0,.88,0);
  for(let i=0;i<3;i++){const a=i*TAU/3;tube(dishGroup,m.brass,new T.Vector3(Math.sin(a)*.89,.4,Math.cos(a)*.89),new T.Vector3(0,.8,0),.015);}
  for(const y of [4.48,5.28])for(const x of [-.7,0,.7])tube(receiver,m.brass,new T.Vector3(rx-.5+x,y,rz-.35),new T.Vector3(rx-.5+x,y,rz+.35),.018);
  block(receiver,m.dark,rx,.92,rz+.707,1.52,.65,.025,.04);
  for(const x of [-.48,0,.48]){
    mesh(receiver,new T.CircleGeometry(.17,20),m.linen,rx+x,1.04,rz+.726);
    const needle=block(receiver,m.red,rx+x+.025,1.07,rz+.733,.015,.16,.015,.003);needle.rotation.z=-.45;
    cylinder(receiver,m.brass,rx+x,.63,rz+.742,.047,.055).rotation.x=Math.PI/2;
  }
  for(let i=0;i<8;i++)block(receiver,m.iron,rx-.57+i*.16,.36,rz+.719,.065,.12,.025,.009);
  sign(receiver,m,'RADIO STATION',rx,1.52,rz+.73,2.1,.38);

  // Laundry cloth silhouettes, pegs and woven baskets. Cloth remains flexible.
  const laundry=groups.laundry;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='laundry'))solid(s.id,s.id.includes('basket')?m.wood:s.id.includes('pot')?m.terra:s.id.includes('washstand')?m.stone:m.iron);
  for(const side of [-1,1]){const points=[new T.Vector3(-3.8,2.73,4.4+side*.52),new T.Vector3(0,2.55,4.4+side*.52),new T.Vector3(3.8,2.73,4.4+side*.52)];mesh(laundry,new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.012,5,false),m.iron);}
  for(let i=0;i<6;i++){
    const x=-2.8+i*1.1,z=4.4+(i%2?-.52:.52),top=2.55+Math.abs(x)/3.8*.18,mat=i%3===0?m.teal:i%3===1?m.linen:m.red;
    const s=new T.Shape();s.moveTo(-.38,0);if(i%2){s.lineTo(-.62,-.18);s.lineTo(-.5,-.44);s.lineTo(-.31,-.34);}s.lineTo(-.36,-1.1);s.quadraticCurveTo(0,-1.21,.37,-1.08);s.lineTo(.34,-.34);if(i%2){s.lineTo(.52,-.44);s.lineTo(.62,-.18);}s.lineTo(.38,0);s.closePath();
    const cloth=mesh(laundry,new T.ShapeGeometry(s,8),mat,x,top,z);cloth.rotation.y=(i%3-1)*.12;mat.side=T.DoubleSide;
    for(const dx of [-.27,.27])block(laundry,m.wood,x+dx,top+.012,z,.035,.11,.035,.009);
  }
  for(let i=0;i<8;i++)torus(laundry,m.linen,3.1,.06+i*.067,4.9,.435,.018);
  torus(laundry,m.wood,3.1,.58,4.9,.45,.038);
  block(laundry,m.linen,3.1,.57,4.9,.65,.12,.38,.06);
  lathe(laundry,m.edge,4.6,.88,-4.8,[[0,0],[.48,0],[.54,.12],[.51,.16],[.42,.13],[.4,.04],[0,.04]]);
  sign(laundry,m,'LAUNDRY',-3.8,2.1,4.48,1.7,.36);

  const antenna=groups.antenna;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='antenna'))solid(s.id,s.id==='antenna-case'?m.teal:m.brass);
  for(let i=0;i<3;i++)for(let j=0;j<7;j++){
    const x=-4.35-(2.9-i*.45)/2+j*(2.9-i*.45)/6,len=.85- Math.abs(j-3)*.09;
    tube(antenna,m.iron,new T.Vector3(x,4.25+i*.86,4.3-len),new T.Vector3(x,4.25+i*.86,4.3+len),.019);
  }
  cylinder(antenna,m.red,-4.35,6.37,4.3,.095,.12);for(let i=0;i<5;i++)block(antenna,m.dark,-4.85+i*.23,.38,4.985,.13,.06,.025,.008);
  sign(antenna,m,'ANTENNA',-4.35,.85,5.0,1.75,.34);

  // Original ceramic mural: sunrise, a swift and radio waves. Curved painted
  // outline sits on the physical stepped masonry screen, never a floating decal.
  const mural=groups.mural;
  for(const s of LANDMARK_SOLIDS.filter(s=>s.landmark==='mural'))solid(s.id,s.id.includes('foot')?m.stone:m.plaster,s.id==='mural-wall'||s.id==='mural-top'?'none':'box');
  const muralWall=mesh(mural,new T.ExtrudeGeometry(archShape(4.6,2.3,.38),{depth:.25,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:1,curveSegments:20}),m.plaster,-3.45,.15,-5.025);muralWall.userData.solidIds=['mural-wall','mural-top'];
  const muralMap=texture(1024,576,c=>{
    c.fillStyle='#e9d2a4';c.fillRect(0,0,1024,576);c.fillStyle='#2b7275';c.beginPath();c.moveTo(0,425);c.bezierCurveTo(210,245,370,600,620,430);c.bezierCurveTo(800,300,970,410,1024,330);c.lineTo(1024,576);c.lineTo(0,576);c.fill();
    c.fillStyle='#bd6143';c.beginPath();c.arc(730,190,100,0,TAU);c.fill();c.strokeStyle='#f6e9c8';c.lineWidth=13;for(let i=0;i<5;i++){c.beginPath();c.arc(285,260,68+i*38,-1.05,1.05);c.stroke();}
    c.fillStyle='#253d48';c.beginPath();c.moveTo(200,302);c.bezierCurveTo(350,135,458,109,585,143);c.bezierCurveTo(486,191,436,218,429,247);c.bezierCurveTo(510,246,558,285,603,342);c.bezierCurveTo(471,309,350,302,200,302);c.fill();
    c.strokeStyle='#bd6143';c.lineWidth=6;c.strokeRect(18,18,988,540);
  });
  mesh(mural,new T.PlaneGeometry(4.39,2.12),paintedMaterial('Landmarks / original swift mural',muralMap),-3.45,1.3,-4.763);
  mesh(mural,new T.CircleGeometry(.32,32),m.terra,-2.15,1.94,-4.746);
  for(let i=0;i<3;i++){const wave=mesh(mural,new T.TorusGeometry(.34+i*.19,.024,5,28,Math.PI*.8),i%2?m.terra:m.teal,-4.17,1.3,-4.737);wave.rotation.z=-Math.PI*.4;}
  sign(mural,m,'THE ROOFTOP MURAL',-3.45,2.65,-4.756,3.3,.32);

  // Terracotta lip, dark soil, authored leaf profiles; no faceted green balls.
  for(const p of ROOF_PLANTERS){
    solid(p.id,m.terra,'none');const g=groups[p.landmark];const pot=lathe(g,m.terra,p.x,0,p.z,[[p.r*.66,0],[p.r*.7,.08],[p.r*.94,p.h-.1],[p.r,p.h-.08],[p.r,p.h],[p.r*.83,p.h],[p.r*.81,p.h-.06],[p.r*.65,.12]]);pot.userData.solidIds=[p.id];
    cylinder(g,m.soil,p.x,p.h-.05,p.z,p.r*.8,.025);torus(g,m.edge,p.x,p.h-.055,p.z,p.r*.965,.018);
    if(p.species==='agave')for(let i=0;i<13;i++){const a=i*2.4,len=.4+(i%3)*.12;leaf(g,i%2?m.leaf:m.leafLight,new T.Vector3(p.x,p.h,p.z),new T.Vector3(p.x+Math.sin(a)*len,p.h+.42+(i%4)*.12,p.z+Math.cos(a)*len),.105);}
    else if(p.species==='olive'){
      const trunkTop=new T.Vector3(p.x+.1,p.h+1.25,p.z);tube(g,m.wood,new T.Vector3(p.x,p.h,p.z),trunkTop,.035);
      for(let i=0;i<7;i++){const a=i*2.4,end=new T.Vector3(p.x+Math.sin(a)*.42,p.h+.83+(i%3)*.2,p.z+Math.cos(a)*.42);tube(g,m.wood,trunkTop.clone().add(new T.Vector3(0,-.35,0)),end,.012);for(let j=0;j<8;j++){const q=end.clone().add(new T.Vector3(Math.sin(j*2.4)*.17,(j%3)*.07,Math.cos(j*2.4)*.17));for(const side of [-1,1]){const angle=a+side*.9;leaf(g,j%2?m.leaf:m.leafLight,q,q.clone().add(new T.Vector3(Math.sin(angle)*.21,.065,Math.cos(angle)*.21)),.055);}}}
    }else for(let i=0;i<24;i++){const a=i*2.4,start=new T.Vector3(p.x,p.h,p.z),end=new T.Vector3(p.x+Math.sin(a)*(.15+i%3*.07),p.h+.35+i%4*.07,p.z+Math.cos(a)*(.15+i%3*.07));tube(g,m.leaf,start,end,.011,5);for(let j=0;j<3;j++){const a=start.clone().lerp(end,.4+j*.18);leaf(g,m.leafLight,a,a.clone().add(new T.Vector3(.075,.05,.045)),.025);}}
  }
  const missing=LANDMARK_SOLIDS.filter(s=>!used.has(s.id));if(missing.length)throw Error(`Unrendered landmark solids: ${missing.map(s=>s.id).join(', ')}`);
  group.userData.colliderCount=LANDMARK_SOLIDS.length;
  // Merge opaque static geometry per material within each landmark. Transparent
  // glazing stays separate for correct sorting; labels retain their local maps.
  for(const g of Object.values(groups))mergeOpaque(g);
  return {group,cafe:groups.cafe,receiver:groups.receiver};
}

function mergeOpaque(root:T.Group){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert();
  const batches=new Map<T.Material,{parts:T.BufferGeometry[];meshes:T.Mesh[];ids:Set<string>}>();
  root.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material)||o.material.transparent)return;
    let batch=batches.get(o.material);if(!batch){batch={parts:[],meshes:[],ids:new Set()};batches.set(o.material,batch);}
    const clone=o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));const geometry=clone.index?clone.toNonIndexed():clone;
    for(const name of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(name))geometry.deleteAttribute(name);
    // All authored geometries have position/normal; provide UVs for shape panels.
    if(!geometry.getAttribute('uv'))geometry.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geometry.getAttribute('position').count*2),2));
    batch.parts.push(geometry);batch.meshes.push(o);for(const id of o.userData.solidIds??[])batch.ids.add(id);
  });
  for(const [material,batch] of batches){const geometry=mergeGeometries(batch.parts,false);if(!geometry)continue;const merged=mesh(root,geometry,material);merged.name=material.name;merged.userData.solidIds=[...batch.ids];for(const o of batch.meshes){o.removeFromParent();o.geometry.dispose();}for(const part of batch.parts)part.dispose();}
}
