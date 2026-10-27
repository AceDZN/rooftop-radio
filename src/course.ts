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
} as const;
