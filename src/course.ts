import type {DistrictId} from './content';
/** Shared, visible course features. Coordinates are metres; +x east, -z north. */
export const CROSSINGS={beam:{id:'radio-beam',x:-9,z:-2,w:7,d:1.15,y:9},wide:{id:'radio-striped',x:-9,z:3.3,w:7,d:3.6,y:9}} as const;
export const WIND_LIFTS=[
  {id:'first-wind',x:1.2,z:27,y:8.5,h:7,r:2.4},
  {id:'greenhouse-wind',x:0,z:9,y:7.5,h:7,r:2.2},
] as const;
export const SIGNAL_NOTES=[
  {x:0,y:11.0,z:32},{x:.5,y:13.1,z:28},{x:1.2,y:12.0,z:25},{x:2.2,y:10.5,z:22},
  {x:0,y:10.0,z:14},{x:0,y:12.2,z:10},{x:0,y:11.5,z:7},{x:1,y:10,z:4},
  {x:-8,y:10.2,z:-2},{x:-10,y:10.2,z:-2},
  {x:-7,y:10.2,z:3.3},{x:-9,y:10.4,z:3.3},{x:-11,y:10.2,z:3.3},
  {x:8,y:10.0,z:0},{x:11,y:10.0,z:0},{x:15,y:10.0,z:0},
  {x:-18,y:11.2,z:29},{x:-18,y:10.7,z:25},
] as const;
export const HEADING_YAW={north:0,east:Math.PI/2,south:Math.PI,west:-Math.PI/2} as const;
export const COURSE_SOLIDS=[
  {id:'wide-rail-north',x:-9,z:1.47,y:9,w:7,d:.08,h:.72},
  {id:'wide-rail-south',x:-9,z:5.13,y:9,w:7,d:.08,h:.72},
] as const;
const cityLots:{x:number;z:number}[]=[];
for(let row=0;row<9;row++)for(let col=0;col<9;col++){const x=(col-4)*17,z=10+(row-4)*17;if(Math.abs(x)<27&&z>-34&&z<52)continue;cityLots.push({x,z});}
export const CITY_BLOCKS=Array.from({length:58},(_,i)=>{
  const lot=cityLots[Math.floor(i*cityLots.length/58)],width=.70+(i%3)*.07,heightScale=.65+(i*7%9)*.11;
  return {...lot,variant:i%3,width,heightScale,rotation:(i%4)*Math.PI/2,w:13*width,d:13*width,h:[9.035,10.8,10.22][i%3]*heightScale};
});
/** Interactions sit beside their visible objects; destinations never move. */
export const RADIO_SPOTS={
  water:{x:2.5,y:10,z:37.5},greenhouse:{x:-.5,y:9,z:22.2},bell:{x:-2.4,y:9,z:-3.3},
  clock:{x:2.5,y:10,z:-16.5},west:{x:-21.85,y:9,z:-4.4},east:{x:14.65,y:9,z:-1.3},
  laundry:{x:-20,y:9,z:16},antenna:{x:-16.2,y:10,z:34},mural:{x:-16,y:10,z:-16},
} as const;

export interface DistrictFeature {id:string;kind:'platform'|'wall'|'canopy'|'planter'|'observatory';x:number;y:number;z:number;w:number;h:number;d:number}
/** The renderer and simulation consume the same physical envelopes. */
export const DISTRICT_FEATURES:Record<DistrictId,readonly DistrictFeature[]>={
  'old-town':[],
  canals:[
    {id:'canal-step',kind:'platform',x:-18,y:7.95,z:27,w:3.5,h:.25,d:3.5},
    {id:'canal-quay-planter',kind:'planter',x:-22.4,y:9,z:18.7,w:1.6,h:.65,d:2.6},
    {id:'canal-vault',kind:'wall',x:4.6,y:10,z:35,w:2.3,h:.7,d:.4},
  ],
  market:[
    {id:'market-north-step',kind:'platform',x:-9,y:8.1,z:-18,w:3.2,h:.25,d:3.2},
    {id:'market-stall-west',kind:'canopy',x:-22.1,y:11.7,z:18,w:2.7,h:.18,d:3.7},
    {id:'market-display',kind:'wall',x:-22.1,y:9,z:18,w:2.7,h:.75,d:1.1},
    ...[-23.35,-20.85].flatMap(x=>[16.25,19.75].map(z=>({id:`market-stall-post-${x}-${z}`,kind:'wall' as const,x,y:9,z,w:.07,h:2.7,d:.07}))),
  ],
  gardens:[
    {id:'garden-terrace',kind:'platform',x:-18,y:7.6,z:9,w:3.8,h:.28,d:3.8},
    {id:'garden-bed-west',kind:'planter',x:-22.1,y:9,z:18,w:2.2,h:.8,d:3.5},
    {id:'garden-bed-east',kind:'planter',x:4.6,y:9,z:4,w:1.8,h:.65,d:2.6},
  ],
  observatory:[
    {id:'observatory-launch',kind:'platform',x:0,y:8,z:-9,w:3.4,h:.3,d:3.4},
    {id:'observatory-dome-base',kind:'observatory',x:-22.1,y:10,z:-14,w:2.5,h:1.5,d:2.5},
    {id:'observatory-instrument',kind:'wall',x:4.6,y:10,z:-21,w:1.4,h:.75,d:2.4},
  ],
};
/** Later districts replace more fixed walkways with visible jump/glide gaps. */
export const DISTRICT_GAPS:Record<DistrictId,readonly string[]>={
  'old-town':[],canals:['antenna-laundry'],market:['antenna-laundry','clock-mural'],
  gardens:['antenna-laundry','clock-mural','laundry-west'],
  observatory:['antenna-laundry','clock-mural','laundry-west','bell-clock'],
};
export interface WindLift {id:string;x:number;z:number;y:number;h:number;r:number}
export const DISTRICT_WIND_LIFTS:Record<DistrictId,readonly WindLift[]>={
  'old-town':[],
  canals:[{id:'canal-wind',x:-18,z:27,y:7.5,h:7,r:2.4}],
  market:[{id:'market-wind',x:-9,z:-18,y:7.5,h:7,r:2.4},{id:'canal-wind',x:-18,z:27,y:7.5,h:7,r:2.4}],
  gardens:[{id:'garden-wind',x:-18,z:9,y:7,h:7,r:2.5},{id:'market-wind',x:-9,z:-18,y:7.5,h:7,r:2.4},{id:'canal-wind',x:-18,z:27,y:7.5,h:7,r:2.4}],
  observatory:[{id:'star-wind',x:0,z:-9,y:7.5,h:7,r:2.5},{id:'garden-wind',x:-18,z:9,y:7,h:7,r:2.5},{id:'market-wind',x:-9,z:-18,y:7.5,h:7,r:2.4},{id:'canal-wind',x:-18,z:27,y:7.5,h:7,r:2.4}],
};
const skylineLots=CITY_BLOCKS.filter(block=>block.z< -30&&Math.abs(block.x)<55).slice(0,3);
for(const district of ['canals','market','gardens','observatory'] as const){
  const ornaments:DistrictFeature[]=skylineLots.map((block,i)=>({id:`${district}-skyline-${i}`,kind:district==='observatory'?'observatory':district==='gardens'?'planter':district==='market'?'canopy':'platform',x:block.x,y:block.h,z:block.z,w:Math.min(block.w-.6,5),h:district==='observatory'?3.2:district==='gardens'?.8:district==='market'?.18:.4,d:Math.min(block.d-.6,district==='observatory'?5:4)}));
  DISTRICT_FEATURES[district]=[...DISTRICT_FEATURES[district],...ornaments];
}
