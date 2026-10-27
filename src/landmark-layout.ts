/** Original rooftop prop layout. Metres; +X east, +Y up, +Z south.
 * Collider x/z are centres; y is the BOTTOM. No renderer dependencies.
 * Soft leaves, hanging cloth, cables and shallow surface ornament are decorative.
 */
export type LandmarkId = 'water'|'greenhouse'|'bell'|'clock'|'cafe'|'receiver'|'laundry'|'antenna'|'mural';
export interface LandmarkOrigin { x:number; y:number; z:number; label:string }
export const LANDMARK_ORIGINS: Record<LandmarkId,LandmarkOrigin> = {
  water:{x:0,y:10,z:36,label:'Water tower'},
  greenhouse:{x:0,y:9,z:18,label:'Greenhouse'},
  bell:{x:0,y:9,z:0,label:'Bell tower'},
  clock:{x:0,y:10,z:-18,label:'Clock tower'},
  cafe:{x:18,y:9,z:0,label:'Café'},
  receiver:{x:-18,y:9,z:0,label:'Radio station'},
  laundry:{x:-18,y:9,z:18,label:'Laundry'},
  antenna:{x:-18,y:10,z:36,label:'Antenna terrace'},
  mural:{x:-18,y:10,z:-18,label:'Mural'},
};
interface SolidBase { id:string; landmark:LandmarkId; x:number; y:number; z:number; h:number; /** Safe horizontal top, suitable for the landing solver. */ standable?:boolean }
export interface LandmarkBox extends SolidBase { shape:'box'; w:number; d:number }
export interface LandmarkCylinder extends SolidBase { shape:'cylinder'; r:number; /** Bounding box compatibility; use r for round collision. */ w:number; d:number }
export type LandmarkSolid = LandmarkBox|LandmarkCylinder;
const solids:LandmarkSolid[]=[];
function box(id:string,landmark:LandmarkId,x:number,y:number,z:number,w:number,h:number,d:number,standable=false){const o=LANDMARK_ORIGINS[landmark];solids.push({id,landmark,shape:'box',x:o.x+x,y:o.y+y,z:o.z+z,w,h,d,...(standable?{standable:true}:{})});}
function cylinder(id:string,landmark:LandmarkId,x:number,y:number,z:number,r:number,h:number,standable=false){const o=LANDMARK_ORIGINS[landmark];solids.push({id,landmark,shape:'cylinder',x:o.x+x,y:o.y+y,z:o.z+z,r,w:r*2,d:r*2,h,...(standable?{standable:true}:{})});}

// Compact 2.8 m tank in the back-left corner. The four legs remain separate.
for(const x of [-.94,.94])for(const z of [-.94,.94]){
  cylinder(`water-foot-${x}-${z}`,'water',-4+x,0,3.8+z,.19,.16);
  cylinder(`water-leg-${x}-${z}`,'water',-4+x,.16,3.8+z,.085,2.13);
}
box('water-platform','water',-4,2.26,3.8,2.8,.17,2.8,true);
cylinder('water-tank','water',-4,2.43,3.8,1.26,1.8);
cylinder('water-lid','water',-4,4.23,3.8,1.34,.16);
cylinder('water-cap','water',-4,4.39,3.8,1.29,.43);
box('water-ladder','water',-5.45,.1,3.8,.17,3.1,.54);

// Greenhouse in the south-west corner, clear of the west landing at local z=0.
const gx=-3.65,gz=4.28,gw=3.35,gd=3.48;
box('greenhouse-base','greenhouse',gx,0,gz,gw+.18,.18,gd+.18,true);
for(const side of [-1,1]){
  box(`greenhouse-plinth-${side}`,'greenhouse',gx+side*gw/2,.18,gz,.15,.38,gd);
  box(`greenhouse-side-${side}`,'greenhouse',gx+side*gw/2,.56,gz,.065,2.22,gd);
  for(const wing of [-1,1]){
    box(`greenhouse-end-${side}-${wing}`,'greenhouse',gx+wing*1.2,.18,gz+side*gd/2,.95,2.6,.09);
  }
  box(`greenhouse-door-head-${side}`,'greenhouse',gx,2.48,gz+side*gd/2,1.48,.3,.12);
}
// Thin horizontal roof strips follow the actual pitched glazing, not a solid box.
for(let i=0;i<10;i++){
  const x=-gw/2+(i+.5)*gw/10,roof=2.78+1.02*(1-Math.abs(x)/(gw/2));
  box(`greenhouse-roof-${i}`,'greenhouse',gx+x,roof-.055,gz,gw/10,.11,gd+.1);
  for(const side of [-1,1])box(`greenhouse-gable-${side}-${i}`,'greenhouse',gx+x,2.78,gz+side*gd/2,gw/10,roof-2.78,.07);
}
for(const side of [-1,1])box(`greenhouse-bench-${side}`,'greenhouse',gx+side*1.1,.18,gz,.62,.72,2.35,true);
for(const z of [-1.25,0,1.25])for(const side of [-1,1])cylinder(`greenhouse-pot-${side}-${z}`,'greenhouse',gx+side*1.1,.9,gz+z,.3,.38);

// Open campanile: four slender piers and arches; no invisible solid shaft.
const bx=-4.65,bz=-4.55;
for(const x of [-.88,.88])for(const z of [-.88,.88]){
  box(`bell-foot-${x}-${z}`,'bell',bx+x,0,bz+z,.56,.22,.56,true);
  box(`bell-pier-${x}-${z}`,'bell',bx+x,.22,bz+z,.39,5.16,.39);
  box(`bell-capital-${x}-${z}`,'bell',bx+x,4.25,bz+z,.54,.22,.54);
}
// Each arch is divided into small physical spandrels, leaving its curved opening.
for(const side of [-1,1])for(let i=0;i<8;i++){
  const t=-.69+(i+.5)*1.38/8,under=4.36+Math.sqrt(Math.max(0,.69*.69-t*t));
  box(`bell-arch-z-${side}-${i}`,'bell',bx+t,under,bz+side*.88,1.38/8+.012,5.28-under,.32);
  box(`bell-arch-x-${side}-${i}`,'bell',bx+side*.88,under,bz+t,.32,5.28-under,1.38/8+.012);
}
box('bell-entablature','bell',bx,5.28,bz,2.6,.3,2.6,true);
for(let i=0;i<5;i++)box(`bell-roof-${i}`,'bell',bx,5.58+i*.22,bz,2.7-i*.46,.23,2.7-i*.46);
cylinder('bell-finial','bell',bx,6.68,bz,.065,.45);
cylinder('bell-bronze','bell',bx,3.35,bz,.54,1.1);
box('bell-yoke','bell',bx,4.45,bz,1.17,.12,.12);
cylinder('bell-clapper','bell',bx,3.12,bz,.1,.5);
box('bell-sign','bell',bx,2.76,bz+.23,2.1,.4,.08);

// Clock: round masonry, four clock faces, copper cupola, distinct from the bell.
const cx=-4.5,cz=-4.35;
cylinder('clock-plinth','clock',cx,0,cz,1.42,.28,true);
cylinder('clock-shaft','clock',cx,.28,cz,1.07,3.8);
cylinder('clock-drum','clock',cx,4.08,cz,1.36,1.65);
cylinder('clock-cornice','clock',cx,5.73,cz,1.52,.25,true);
cylinder('clock-roof-low','clock',cx,5.98,cz,1.58,.35);
cylinder('clock-roof-mid','clock',cx,6.33,cz,1.17,.55);
cylinder('clock-roof-high','clock',cx,6.88,cz,.51,.45);
cylinder('clock-finial','clock',cx,7.33,cz,.07,.48);

// Permanent east café. The porch has over 2.4 m headroom; furniture is individual.
box('cafe-kiosk','cafe',-3.35,0,-3.8,3.8,2.78,2.5);
box('cafe-cornice','cafe',-3.35,2.78,-3.8,4.08,.24,2.78,true);
box('cafe-roof','cafe',-3.35,3.02,-3.8,4.2,.3,2.9,true);
box('cafe-counter','cafe',-3.35,.93,-2.32,3.3,.18,.58,true);
for(const x of [-2.7,2.7])cylinder(`cafe-post-${x}`,'cafe',x,0,1.68,.075,2.48);
for(const x of [-2.7,2.7])cylinder(`cafe-post-back-${x}`,'cafe',x,0,-1.45,.075,2.98);
box('cafe-front-beam','cafe',0,2.44,1.68,5.65,.15,.13);
box('cafe-back-beam','cafe',0,2.91,-1.45,5.65,.15,.13);
for(let i=0;i<7;i++){
  const z=-1.45+(i+.5)*3.2/7,y=2.98-(z+1.45)*.13;
  box(`cafe-canopy-${i}`,'cafe',0,y,z,5.8,.065,3.2/7+.01);
}
for(const [i,x] of [-1.5,1.5].entries()){
  cylinder(`cafe-table-foot-${i}`,'cafe',x,0,.3,.34,.1);
  cylinder(`cafe-table-leg-${i}`,'cafe',x,.1,.3,.06,.68);
  cylinder(`cafe-table-top-${i}`,'cafe',x,.78,.3,.56,.08,true);
  for(const side of [-1,1]){
    box(`cafe-chair-${i}-${side}`,'cafe',x+side*.81,0,.3,.49,.46,.48,true);
    box(`cafe-chair-back-${i}-${side}`,'cafe',x+side*1.02,.46,.3,.06,.39,.48);
  }
}

// Permanent west radio station, north-west of both crossing landing portals.
const rx=-3.85,rz=-4.4;
box('receiver-base','receiver',rx,0,rz,2.1,.16,1.65,true);
box('receiver-cabinet','receiver',rx,.16,rz,1.85,1.32,1.4,true);
cylinder('receiver-mast','receiver',rx-.5,1.48,rz,.065,4.4);
box('receiver-dish','receiver',rx+.4,2.12,rz+.23,2.0,1.91,1.5);
cylinder('receiver-dish-support','receiver',rx+.4,1.48,rz+.04,.095,.86);
box('receiver-array-1','receiver',rx-.5,4.45,rz,2.3,.065,.085);
box('receiver-array-2','receiver',rx-.5,5.25,rz,1.72,.065,.085);

// Laundry: hard posts, baskets and wash stand; flexible sheets are non-solid.
for(const x of [-3.8,3.8]){
  cylinder(`laundry-foot-${x}`,'laundry',x,0,4.4,.23,.12);
  cylinder(`laundry-post-${x}`,'laundry',x,.12,4.4,.06,2.62);
  box(`laundry-crossbar-${x}`,'laundry',x,2.7,4.4,.09,.09,1.35);
}
box('laundry-washstand','laundry',4.6,0,-4.8,1.45,.88,.84,true);
cylinder('laundry-basket','laundry',3.1,0,4.9,.45,.58,true);
cylinder('laundry-pot','laundry',4.7,0,4.9,.39,.54);

// Separate tall Yagi antenna; fine wire elements are decorative, mast/base solid.
box('antenna-case','antenna',-4.35,0,4.3,1.55,.74,1.35,true);
cylinder('antenna-mast','antenna',-4.35,.74,4.3,.075,5.6);
for(let i=0;i<3;i++)box(`antenna-boom-${i}`,'antenna',-4.35,4.25+i*.86,4.3,2.9-i*.45,.065,.065);

// Curved mural screen and its masonry feet; relief paint is non-solid ornament.
box('mural-wall','mural',-3.45,.15,-4.9,4.6,2.3,.25);
box('mural-top','mural',-3.45,2.45,-4.9,4.6,.38,.25);
for(const x of [-5.55,-1.35])box(`mural-foot-${x}`,'mural',x,0,-4.9,.55,.25,.75,true);

// Roof life remains at corners. North/south central approaches and both west
// junction crossings (z=-2 and z=3.3) deliberately have no hard props.
export const ROOF_PLANTERS: ReadonlyArray<{id:string;landmark:LandmarkId;x:number;z:number;r:number;h:number;species:'olive'|'rosemary'|'agave'}> = [
  {id:'water-olive',landmark:'water',x:4.9,z:4.9,r:.42,h:.58,species:'olive'},
  {id:'greenhouse-herb',landmark:'greenhouse',x:4.9,z:4.9,r:.39,h:.5,species:'rosemary'},
  {id:'bell-agave',landmark:'bell',x:4.9,z:-4.9,r:.45,h:.55,species:'agave'},
  {id:'clock-olive',landmark:'clock',x:4.9,z:4.9,r:.42,h:.58,species:'olive'},
  {id:'cafe-herb',landmark:'cafe',x:4.9,z:-4.9,r:.4,h:.54,species:'rosemary'},
  {id:'receiver-agave',landmark:'receiver',x:4.9,z:-4.9,r:.44,h:.55,species:'agave'},
  {id:'laundry-olive',landmark:'laundry',x:-4.9,z:-4.9,r:.42,h:.58,species:'olive'},
  {id:'antenna-herb',landmark:'antenna',x:4.9,z:4.9,r:.4,h:.54,species:'rosemary'},
  {id:'mural-agave',landmark:'mural',x:4.9,z:-4.9,r:.44,h:.55,species:'agave'},
];
for(const p of ROOF_PLANTERS)cylinder(p.id,p.landmark,p.x,0,p.z,p.r,p.h);

export const LANDMARK_SOLIDS:readonly LandmarkSolid[]=solids;
export const LANDMARK_TOPS=LANDMARK_SOLIDS.filter(s=>s.standable).map(s=>({
  id:`landmark-top:${s.id}`,landmark:s.landmark,x:s.x,y:s.y+s.h,z:s.z,
  w:s.shape==='box'?s.w:s.r*1.4,d:s.shape==='box'?s.d:s.r*1.4,
}));
