/** Authored fixtures, not quotations. World north = -z; east = +x. */
export type Heading = 'north' | 'east' | 'south' | 'west';
export type SiteId = 'water' | 'greenhouse' | 'bell' | 'clock' | 'west' | 'east' | 'laundry' | 'antenna' | 'mural';
export interface Site {id: SiteId; x: number; z: number; y: number; w: number; d: number; name: string; kind: string}
export const SITES: Site[] = [
  {id:'water',x:0,z:36,y:10,w:13,d:13,name:'Water tower',kind:'water'},
  {id:'greenhouse',x:0,z:18,y:9,w:13,d:13,name:'Greenhouse',kind:'greenhouse'},
  {id:'bell',x:0,z:0,y:9,w:13,d:13,name:'Bell tower',kind:'bell'},
  {id:'clock',x:0,z:-18,y:10,w:13,d:13,name:'Clock',kind:'clock'},
  {id:'west',x:-18,z:0,y:9,w:13,d:13,name:'Radio Station',kind:'receiver'},
  {id:'east',x:18,z:0,y:9,w:13,d:13,name:'Café',kind:'cafe'},
  {id:'laundry',x:-18,z:18,y:9,w:13,d:13,name:'Laundry',kind:'laundry'},
  {id:'antenna',x:-18,z:36,y:10,w:13,d:13,name:'Antenna terrace',kind:'antenna'},
  {id:'mural',x:-18,z:-18,y:10,w:13,d:13,name:'Mural',kind:'mural'},
];
export const SITE = Object.fromEntries(SITES.map(s => [s.id,s])) as Record<SiteId,Site>;
export interface Connection {a: SiteId; b: SiteId; width: number; kind: 'awning'|'bridge'|'gap'|'narrow'}
export const CONNECTIONS: Connection[] = [
  {a:'water',b:'greenhouse',width:4,kind:'gap'},
  {a:'greenhouse',b:'bell',width:3.4,kind:'gap'},
  {a:'bell',b:'clock',width:3.4,kind:'bridge'},
  {a:'bell',b:'west',width:1.15,kind:'narrow'},
  {a:'bell',b:'east',width:3.4,kind:'bridge'},
  {a:'greenhouse',b:'laundry',width:4.4,kind:'awning'},
  {a:'laundry',b:'west',width:4.4,kind:'awning'},
  {a:'water',b:'antenna',width:3.4,kind:'bridge'},
  {a:'antenna',b:'laundry',width:3.4,kind:'bridge'},
  {a:'clock',b:'mural',width:3.4,kind:'bridge'},
  {a:'mural',b:'west',width:3.4,kind:'bridge'},
];
export type DistrictId='old-town'|'canals'|'market'|'gardens'|'observatory';
export interface District {id:DistrictId;name:string;nameEn:string;description:string;siteNames:Record<SiteId,string>}
export const DISTRICTS:readonly District[]=[
  {id:'old-town',name:'העיר העתיקה',nameEn:'Old Town',description:'גגות האבן שבהם לומדים את עבודת השליח.',siteNames:{water:'Water tower',greenhouse:'Greenhouse',bell:'Bell tower',clock:'Clock',west:'Radio Station',east:'Café',laundry:'Laundry',antenna:'Antenna terrace',mural:'Mural'}},
  {id:'canals',name:'התעלות',nameEn:'Canals',description:'תעלות, מעברים ומסירות שחוזרות דרך ציוני דרך.',siteNames:{water:'Canal tank',greenhouse:'Canal greenhouse',bell:'Lock tower',clock:'Tide clock',west:'Harbor Radio',east:'Canal Café',laundry:'Drying deck',antenna:'Signal mast',mural:'Canal mural'}},
  {id:'market',name:'השוק',nameEn:'Market',description:'שוק צפוף, מטענים וסדר מדויק בין תחנות.',siteNames:{water:'Market tank',greenhouse:'Herb house',bell:'Market bell',clock:'Market clock',west:'Dispatch Station',east:'Tea stall',laundry:'Cloth terrace',antenna:'Market antenna',mural:'Painted wall'}},
  {id:'gardens',name:'הגנים',nameEn:'Gardens',description:'בתי זכוכית ומסלולים ארוכים עם ביקורים שאסור לדלג עליהם.',siteNames:{water:'Garden tank',greenhouse:'Palm house',bell:'Garden bell',clock:'Garden clock',west:'Garden Radio',east:'Garden Café',laundry:'Linen terrace',antenna:'Garden mast',mural:'Flower mural'}},
  {id:'observatory',name:'המצפה',nameEn:'Observatory',description:'רשת השידור העליונה, מסירות מרובות שלבים וחזרות מדויקות.',siteNames:{water:'Sky tank',greenhouse:'Glasshouse',bell:'Observatory bell',clock:'Star clock',west:'Space Radio',east:'Sky Café',laundry:'Sail terrace',antenna:'Sky antenna',mural:'Star mural'}},
];
/** One-based campaign number, with no grade selection or gate. */
export function districtForLevel(level:number):District{return DISTRICTS[Math.max(0,Math.min(4,Math.floor((level-1)/10)))];}
export function districtSiteName(id:SiteId,district:DistrictId):string{return DISTRICTS.find(d=>d.id===district)!.siteNames[id];}
/** Kept for the original five-level integrations. */
export function siteName(id:SiteId,_transfer=false):string{return SITE[id].name;}
export type RouteRequirement=
  | {kind:'visit';site:SiteId}
  | {kind:'past'}
  | {kind:'turn';approach:Heading;side:'left'|'right'}
  | {kind:'crossing';bridge:'wide'|'beam';direction:'east'|'west'};
export type StageAction='tune'|'collect'|'inspect'|'deliver';
export interface StageRequirement {route?:readonly RouteRequirement[];avoid?:readonly SiteId[];fragile?:boolean;action?:StageAction}
export interface Contract {
  id:number;title:string;english:string;stages:readonly string[];start:SiteId;facing:Heading;
  order:SiteId[];past:boolean;turn:boolean;fragile:boolean;transfer:boolean;
  hint:string|null;vocabulary:[string,string][];
  district?:DistrictId;requirements?:readonly StageRequirement[];task?:'signal'|'parcel'|'inspection'|'collection'|'return';
}
const vocab:[string,string][]=[
  ['radio / tune','רדיו / לכוון'],['next to','ליד'],['past / towards','לחלוף על פני / לעבר'],
  ['face','לפנות אל / לעמוד מול'],['turn right / left','לפנות ימינה / שמאלה ביחס לכיוון ההליכה'],
  ['wider / narrower','רחב יותר / צר יותר'],['striped / wooden','מפוספס / מעץ'],
  ['crossing / bridge','מעבר / גשר'],['parcel / deliver','מטען / למסור'],['collect / inspect','לאסוף / לבדוק'],
  ['return / before / after','לחזור / לפני / אחרי'],['until / without','עד ש־ / בלי'],['that / which','ש־ / אשר'],['if / otherwise','אם / אחרת'],['do not land','לא לנחות'],['via','דרך'],
  ['first / next / finally','תחילה / בהמשך / לבסוף'],['roof / mast / tower','גג / תורן / מגדל'],
];
const V=(site:SiteId):RouteRequirement=>({kind:'visit',site});
const P=():RouteRequirement=>({kind:'past'});
const T=(approach:Heading,side:'left'|'right'):RouteRequirement=>({kind:'turn',approach,side});
const C=(bridge:'wide'|'beam',direction:'east'|'west'):RouteRequirement=>({kind:'crossing',bridge,direction});
interface Leg extends StageRequirement {site:SiteId;text:string}
const L=(site:SiteId,text:string,requirement:StageRequirement={}):Leg=>({site,text,...requirement});
function mission(id:number,district:DistrictId,task:NonNullable<Contract['task']>,title:string,start:SiteId,facing:Heading,legs:Leg[]):Contract{
  const requirements=legs.map(({route,avoid,fragile=false,action='tune'})=>({route:route??[],avoid:avoid??[],fragile,action}));
  return {id,district,task,title,start,facing,order:legs.map(l=>l.site),stages:legs.map(l=>l.text),english:legs.map(l=>l.text).join(' '),requirements,
    past:requirements.some(r=>r.route.some(t=>t.kind==='past')),turn:requirements.some(r=>r.route.some(t=>t.kind==='turn')),fragile:requirements.some(r=>r.fragile),transfer:id%10===0,
    hint:id%10===0?null:'קראו רק את השלב הנוכחי. ביקור פירושו נחיתה על הגג; אחרי מסירה מתחיל שלב חדש. אם נחתתם במקום אסור, חזרו לגג שבו התחיל השלב כדי לנסות שוב.',vocabulary:vocab};
}
function firstFive():Contract[]{return [
  {id:1,district:'old-town',task:'signal',title:'נחיתה ראשונה',english:'Deliver the signal to the radio next to the greenhouse.',stages:['Deliver the signal to the radio next to the greenhouse.'],start:'water',facing:'north',order:['greenhouse'],past:false,turn:false,fragile:false,transfer:false,requirements:[{action:'deliver',fragile:false}],hint:'החממה היא מבנה הזכוכית. הרדיו שלה נמצא לידה על הגג; קפיצה ואז החזקה באוויר פותחת דאון.',vocabulary:vocab},
  {id:2,district:'old-town',task:'signal',title:'מעבר לחממה',english:'First, tune the greenhouse radio. Go past the greenhouse to the bell tower and tune its radio.',stages:['First, tune the greenhouse radio.','Go past the greenhouse. Tune the bell-tower radio.'],start:'water',facing:'north',order:['greenhouse','bell'],past:true,turn:false,fragile:false,transfer:false,requirements:[{action:'tune',fragile:false},{route:[P()],action:'tune',fragile:false}],hint:'כוונו את הרדיו הראשון לפני שממשיכים. past מחייב לעבור לצד הרחוק של החממה ואז להמשיך למגדל הפעמון.',vocabulary:vocab},
  {id:3,district:'old-town',task:'signal',title:'פנייה לתחנה',english:'From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station.',stages:['From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station.'],start:'clock',facing:'south',order:['west'],past:false,turn:true,fragile:false,transfer:false,requirements:[{route:[T('south','right')],action:'deliver',fragile:false}],hint:'אתם מגיעים מהשעון אל מגדל הפעמון. ימין נקבע לפי כיוון ההליכה הזה; חפשו את התורן של תחנת הרדיו.',vocabulary:vocab},
  {id:4,district:'old-town',task:'parcel',title:'מקום למטען',english:'The glass parcel needs space. Of the two crossings to Radio Station, take the wider striped bridge and deliver it.',stages:['Of the two crossings to Radio Station, take the wider striped bridge. Deliver the parcel.'],start:'bell',facing:'west',order:['west'],past:false,turn:false,fragile:true,transfer:false,requirements:[{route:[C('wide','west')],action:'deliver',fragile:true}],hint:'משווים רק את שני המעברים הישירים מגג הפעמון לתחנת הרדיו. חפשו גשר מפוספס וקורת עץ והשוו את הרוחב שלהם.',vocabulary:vocab},
  {id:5,district:'old-town',task:'signal',title:'תדר חדש',english:'First, tune the bell-tower radio, then the greenhouse radio. Face the bell tower, go past the greenhouse, turn right at the bell tower and deliver to the café.',stages:['First, tune the bell-tower radio.','Next, tune the greenhouse radio.','Face the bell tower. Go past the greenhouse, turn right at the bell tower and deliver to the café.'],start:'water',facing:'north',order:['bell','greenhouse','east'],past:true,turn:true,fragile:false,transfer:true,requirements:[{action:'tune',fragile:false},{action:'tune',fragile:false},{route:[P(),T('north','right')],action:'deliver',fragile:false}],hint:null,vocabulary:vocab},
];}
function oldTown():Contract[]{const n=(s:SiteId)=>districtSiteName(s,'old-town');return [
  mission(6,'old-town','signal','שלוש פניות','clock','south',[
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then tune ${n('east')}.`,{route:[T('south','left')]}),
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then tune ${n('greenhouse')}.`,{route:[T('west','left')]}),
    L('west',`Approach ${n('bell')} from ${n('greenhouse')} and turn left, then deliver to ${n('west')}.`,{route:[T('north','left')],action:'deliver'}),
  ]),
  mission(7,'old-town','collection','איסוף בדרך הארוכה','bell','south',[
    L('greenhouse',`Collect the packet at ${n('greenhouse')}.`,{action:'collect'}),
    L('water',`Land at ${n('antenna')} before tuning ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell']}),
    L('bell',`Land at ${n('greenhouse')}, then go past it. Deliver the packet at ${n('bell')}.`,{route:[V('greenhouse'),P()],action:'deliver'}),
  ]),
  mission(8,'old-town','inspection','בדיקה בשלושה קצוות','water','west',[
    L('laundry',`Land at ${n('antenna')}, then inspect ${n('laundry')}.`,{route:[V('antenna')],action:'inspect'}),
    L('clock',`Land at ${n('mural')} before inspecting ${n('clock')}. Do not land at ${n('greenhouse')}.`,{route:[V('mural')],avoid:['greenhouse'],action:'inspect'}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then inspect ${n('east')}; do not land at ${n('west')}.`,{route:[T('south','left')],avoid:['west'],action:'inspect'}),
  ]),
  mission(9,'old-town','parcel','חבילה וסיבוב בדיקה','water','north',[
    L('bell',`Land at ${n('greenhouse')} and go past it. Collect the parcel at ${n('bell')}.`,{route:[V('greenhouse'),P()],action:'collect'}),
    L('west',`Carry the parcel across the wider striped bridge. Deliver it at ${n('west')}.`,{route:[C('wide','west')],fragile:true,action:'deliver'}),
    L('clock',`Land at ${n('mural')}, then inspect ${n('clock')}.`,{route:[V('mural')],action:'inspect'}),
    L('water',`Return via ${n('antenna')} and tune ${n('water')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse']}),
  ]),
  mission(10,'old-town','return','משלוח שחוזר הביתה','bell','east',[
    L('east',`Collect the return packet at ${n('east')}.`,{action:'collect'}),
    L('mural',`Land at ${n('clock')} before tuning ${n('mural')}. Do not land at ${n('greenhouse')}.`,{route:[V('clock')],avoid:['greenhouse']}),
    L('greenhouse',`Land at ${n('laundry')}, then tune ${n('greenhouse')}. Do not land at ${n('clock')}.`,{route:[V('laundry')],avoid:['clock']}),
    L('bell',`Go past ${n('greenhouse')}. Bring the packet home to ${n('bell')}.`,{route:[P()],action:'deliver'}),
  ]),
];}
function canals():Contract[]{const n=(s:SiteId)=>districtSiteName(s,'canals');return [
  mission(11,'canals','signal','שרשרת התעלה','water','west',[
    L('antenna',`Tune ${n('antenna')} without landing at ${n('greenhouse')}.`,{avoid:['greenhouse']}),
    L('laundry',`Land and inspect ${n('laundry')}.`,{action:'inspect'}),
    L('bell',`Land at ${n('greenhouse')}, then go past it and tune ${n('bell')}.`,{route:[V('greenhouse'),P()]}),
    L('east',`Land at ${n('clock')}, then approach ${n('bell')} from ${n('clock')} and turn left. Deliver to ${n('east')}.`,{route:[V('clock'),T('south','left')],action:'deliver'}),
  ]),
  mission(12,'canals','collection','האיסוף שעל הרציף','clock','west',[
    L('mural',`Collect the packet at ${n('mural')}. Do not land at ${n('bell')}.`,{avoid:['bell'],action:'collect'}),
    L('west',`Land at ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge to ${n('west')}.`,{route:[V('clock'),T('south','right'),C('wide','west')]}),
    L('greenhouse',`Land at ${n('laundry')}, then tune ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell']}),
    L('water',`Visit ${n('antenna')} before delivering to ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell'],action:'deliver'}),
  ]),
  mission(13,'canals','inspection','סקר ארבעת הגגות','east','west',[
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, then inspect ${n('clock')}.`,{route:[T('west','right')],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('laundry',`Land at ${n('west')}, then inspect ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse'],action:'inspect'}),
    L('bell',`Land at ${n('greenhouse')} and go past it. Inspect ${n('bell')} without landing at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
  ]),
  mission(14,'canals','parcel','הלוך וחזור עם זכוכית','clock','west',[
    L('bell',`Visit ${n('mural')}, then cross the striped bridge east. Collect the parcel at ${n('bell')}.`,{route:[V('mural'),C('wide','east')],action:'collect'}),
    L('west',`Carry the parcel west across the striped bridge. Tune ${n('west')}.`,{route:[C('wide','west')],fragile:true}),
    L('east',`Cross the striped bridge back east. Deliver the parcel at ${n('east')}.`,{route:[C('wide','east')],fragile:true,action:'deliver'}),
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, then inspect ${n('clock')}.`,{route:[T('west','right')],action:'inspect'}),
  ]),
  mission(15,'canals','return','החזרה דרך העץ','water','north',[
    L('greenhouse',`Collect the return packet at ${n('greenhouse')}.`,{action:'collect'}),
    L('clock',`Go past ${n('greenhouse')}, land at ${n('bell')}, then inspect ${n('clock')}.`,{route:[P(),V('bell')],action:'inspect'}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then tune ${n('east')}.`,{route:[T('south','left')]}),
    L('water',`Cross the wooden beam west. Visit ${n('laundry')}, then ${n('antenna')}, and bring the packet home without landing at ${n('greenhouse')}.`,{route:[C('beam','west'),V('laundry'),V('antenna')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(16,'canals','signal','חמש נקודות על המים','mural','east',[
    L('clock',`Inspect ${n('clock')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('west',`Approach ${n('bell')} from ${n('clock')} and turn right, then cross the wooden beam to ${n('west')}.`,{route:[T('south','right'),C('beam','west')]}),
    L('laundry',`Visit ${n('antenna')} before tuning ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse']}),
    L('greenhouse',`Land and inspect ${n('greenhouse')}; do not land at ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('bell',`Go past ${n('greenhouse')} and deliver the signal to ${n('bell')}.`,{route:[P()],action:'deliver'}),
  ]),
  mission(17,'canals','collection','חבילה מהנמל','clock','south',[
    L('west',`Approach ${n('bell')} from ${n('clock')} and turn right, then use the striped bridge. Collect the packet at ${n('west')}.`,{route:[T('south','right'),C('wide','west')],action:'collect'}),
    L('antenna',`Visit ${n('laundry')}, then tune ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['greenhouse']}),
    L('water',`Land and inspect ${n('water')} without landing at ${n('greenhouse')}.`,{avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Inspect ${n('greenhouse')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then deliver to ${n('east')}.`,{route:[P(),T('north','right')],action:'deliver'}),
  ]),
  mission(18,'canals','inspection','סקר נגד הכיוון','east','west',[
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then inspect ${n('greenhouse')}.`,{route:[T('west','left')],action:'inspect'}),
    L('laundry',`Inspect ${n('laundry')}; do not land at ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('mural',`Visit ${n('west')} before inspecting ${n('mural')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'inspect'}),
    L('clock',`Inspect ${n('clock')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it before inspecting ${n('bell')}. Do not land at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
  ]),
  mission(19,'canals','parcel','מטען לאורך התעלה','antenna','east',[
    L('water',`Collect the glass parcel at ${n('water')}. Do not land at ${n('greenhouse')}.`,{avoid:['greenhouse'],action:'collect'}),
    L('greenhouse',`Carry it via ${n('laundry')}, then tune ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],fragile:true}),
    L('bell',`Go past ${n('greenhouse')} and tune ${n('bell')}. Keep the parcel.`,{route:[P()],fragile:true}),
    L('west',`Use the wider striped bridge to ${n('west')}. Tune its radio and keep the parcel.`,{route:[C('wide','west')],fragile:true}),
    L('east',`Cross the striped bridge east, then deliver the parcel at ${n('east')}.`,{route:[C('wide','east')],fragile:true,action:'deliver'}),
  ]),
  mission(20,'canals','return','סיבוב הבית של הנמל','east','west',[
    L('bell',`Collect the return packet at ${n('bell')}; do not land at ${n('greenhouse')}.`,{avoid:['greenhouse'],action:'collect'}),
    L('clock',`Visit ${n('east')}, then approach ${n('bell')} from ${n('east')} and turn right, then inspect ${n('clock')}.`,{route:[V('east'),T('west','right')],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('laundry',`Visit ${n('west')} before tuning ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse']}),
    L('east',`Visit ${n('greenhouse')}, go past it and approach ${n('bell')} from ${n('greenhouse')} and turn right. Bring the packet home. Do not land at ${n('clock')}.`,{route:[V('greenhouse'),P(),T('north','right')],avoid:['clock'],action:'deliver'}),
  ]),
];}
function market():Contract[]{const n=(s:SiteId)=>districtSiteName(s,'market');return [
  mission(21,'market','signal','מסלול פתיחת השוק','water','west',[
    L('antenna',`Tune ${n('antenna')}; do not land at ${n('greenhouse')}.`,{avoid:['greenhouse']}),
    L('laundry',`Land and inspect ${n('laundry')} without visiting ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('west',`Visit ${n('mural')} before tuning ${n('west')}. Do not land at ${n('greenhouse')}.`,{route:[V('mural')],avoid:['greenhouse']}),
    L('clock',`Cross the wooden beam east. Approach ${n('bell')} from ${n('west')} and turn left, then tune ${n('clock')}.`,{route:[C('beam','east'),T('east','left')]}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then deliver to ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[T('south','left')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(22,'market','collection','החבילה מאחורי הציור','clock','west',[
    L('mural',`Collect the packet at ${n('mural')}; do not land at ${n('bell')}.`,{avoid:['bell'],action:'collect'}),
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge to ${n('west')}.`,{route:[V('clock'),T('south','right'),C('wide','west')]}),
    L('laundry',`Inspect ${n('laundry')} without landing at ${n('greenhouse')}.`,{avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Visit ${n('antenna')}, then ${n('water')}, before tuning ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('antenna'),V('water')],avoid:['bell']}),
    L('bell',`Go past ${n('greenhouse')} and deliver at ${n('bell')}. Do not land at ${n('west')}.`,{route:[P()],avoid:['west'],action:'deliver'}),
  ]),
  mission(23,'market','inspection','סקר שתי הפניות','bell','west',[
    L('west',`Cross the wooden beam west and inspect ${n('west')}. Do not land at ${n('greenhouse')}.`,{route:[C('beam','west')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('laundry')}.`,{avoid:['laundry'],action:'inspect'}),
    L('clock',`Inspect ${n('clock')}; do not land at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('greenhouse',`Visit ${n('west')}, cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn right. Inspect ${n('greenhouse')}. Do not land at ${n('east')}.`,{route:[V('west'),C('beam','east'),T('east','right')],avoid:['east'],action:'inspect'}),
    L('east',`Go past ${n('greenhouse')}, then approach ${n('bell')} from ${n('greenhouse')} and turn right. Inspect ${n('east')} without landing at ${n('clock')}.`,{route:[P(),T('north','right')],avoid:['clock'],action:'inspect'}),
  ]),
  mission(24,'market','parcel','זכוכית סביב השעון','east','west',[
    L('bell',`Visit ${n('greenhouse')} and go past it. Collect the glass parcel at ${n('bell')}.`,{route:[V('greenhouse'),P()],action:'collect'}),
    L('west',`Carry it west across the striped bridge and tune ${n('west')}. Do not land at ${n('mural')}.`,{route:[C('wide','west')],avoid:['mural'],fragile:true}),
    L('clock',`Cross the striped bridge east, then approach ${n('bell')} from ${n('west')} and turn left. Tune ${n('clock')} and keep the parcel.`,{route:[C('wide','east'),T('east','left')],fragile:true}),
    L('mural',`Carry the parcel to ${n('mural')} and inspect its radio. Do not land at ${n('bell')}.`,{avoid:['bell'],fragile:true,action:'inspect'}),
    L('west',`Deliver the parcel at ${n('west')} without landing at ${n('bell')} or ${n('laundry')}.`,{avoid:['bell','laundry'],fragile:true,action:'deliver'}),
  ]),
  mission(25,'market','return','לשוב בלי לקצר','water','north',[
    L('east',`Visit ${n('greenhouse')}, go past it and approach ${n('bell')} from ${n('greenhouse')} and turn right. Collect the return packet at ${n('east')}.`,{route:[V('greenhouse'),P(),T('north','right')],action:'collect'}),
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, then inspect ${n('clock')}. Do not land at ${n('greenhouse')}.`,{route:[T('west','right')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')} or ${n('west')}.`,{avoid:['bell','west'],action:'inspect'}),
    L('laundry',`Visit ${n('west')} before tuning ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse']}),
    L('water',`Visit ${n('antenna')}, then bring the packet home to ${n('water')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(26,'market','signal','שש תחנות לשידור','clock','south',[
    L('west',`Approach ${n('bell')} from ${n('clock')} and turn right, then cross the wooden beam to ${n('west')}.`,{route:[T('south','right'),C('beam','west')]}),
    L('laundry',`Inspect ${n('laundry')} without landing at ${n('greenhouse')} or ${n('mural')}.`,{avoid:['greenhouse','mural'],action:'inspect'}),
    L('antenna',`Land and inspect ${n('antenna')}; do not land at ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('water',`Tune ${n('water')} without landing at ${n('greenhouse')}.`,{avoid:['greenhouse']}),
    L('greenhouse',`Visit ${n('laundry')} before tuning ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell']}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then deliver to ${n('east')}.`,{route:[P(),T('north','right')],action:'deliver'}),
  ]),
  mission(27,'market','collection','איסוף דרך שישה גגות','east','west',[
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then collect the packet at ${n('greenhouse')}.`,{route:[T('west','left')],action:'collect'}),
    L('laundry',`Inspect ${n('laundry')} without landing at ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('mural',`Visit ${n('west')}, then tune ${n('mural')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell']}),
    L('clock',`Inspect ${n('clock')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('west',`Approach ${n('bell')} from ${n('clock')} and turn right, cross the striped bridge west and tune ${n('west')}.`,{route:[T('south','right'),C('wide','west')]}),
    L('east',`Cross the wooden beam east before delivering to ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[C('beam','east')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(28,'market','inspection','סקר ההיקף המערבי','water','west',[
    L('antenna',`Inspect ${n('antenna')} without landing at ${n('greenhouse')}.`,{avoid:['greenhouse'],action:'inspect'}),
    L('laundry',`Inspect ${n('laundry')} without returning to ${n('water')}.`,{avoid:['water'],action:'inspect'}),
    L('west',`Visit ${n('mural')}, then inspect ${n('west')}. Do not land at ${n('bell')}.`,{route:[V('mural')],avoid:['bell'],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('clock')} or ${n('laundry')}.`,{avoid:['clock','laundry'],action:'inspect'}),
    L('clock',`Inspect ${n('clock')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it before inspecting ${n('bell')}. Do not land at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
  ]),
  mission(29,'market','parcel','זכוכית בשישה שלבים','mural','east',[
    L('clock',`Collect the parcel at ${n('clock')}. Do not land at ${n('bell')}.`,{avoid:['bell'],action:'collect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it before tuning ${n('bell')}. Keep the parcel.`,{route:[V('greenhouse'),P()],fragile:true}),
    L('west',`Use the striped bridge west and tune ${n('west')}. Do not land at ${n('mural')} while carrying the parcel.`,{route:[C('wide','west')],avoid:['mural'],fragile:true}),
    L('greenhouse',`Carry it via ${n('laundry')} to ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],fragile:true}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then tune ${n('east')}. Keep the parcel.`,{route:[P(),T('north','right')],fragile:true}),
    L('water',`Carry it via ${n('antenna')} and deliver at ${n('water')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],fragile:true,action:'deliver'}),
  ]),
  mission(30,'market','return','המסלול המלא של השוק','bell','west',[
    L('west',`Use the wooden beam west and collect the return packet at ${n('west')}.`,{route:[C('beam','west')],action:'collect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('laundry')} or ${n('bell')}.`,{avoid:['laundry','bell'],action:'inspect'}),
    L('clock',`Inspect ${n('clock')} without landing at ${n('bell')}.`,{avoid:['bell'],action:'inspect'}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then tune ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[T('south','left')],avoid:['greenhouse']}),
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then tune ${n('greenhouse')}. Do not land at ${n('west')}.`,{route:[T('west','left')],avoid:['west']}),
    L('bell',`Visit ${n('water')}, return to ${n('greenhouse')} and go past it. Bring the packet home to ${n('bell')}.`,{route:[V('water'),V('greenhouse'),P()],action:'deliver'}),
  ]),
];}
function gardens():Contract[]{const n=(s:SiteId)=>districtSiteName(s,'gardens');return [
  mission(31,'gardens','signal','פתיחת רשת הגנים','water','west',[
    L('greenhouse',`Before inspecting ${n('greenhouse')}, which has a glass roof, land at ${n('antenna')} and then ${n('laundry')}. Do not land at ${n('bell')}.`,{route:[V('antenna'),V('laundry')],avoid:['bell'],action:'inspect'}),
    L('east',`Go past ${n('greenhouse')} and approach ${n('bell')} from ${n('greenhouse')} and turn right. Tune ${n('east')} without landing at ${n('clock')}.`,{route:[P(),T('north','right')],avoid:['clock']}),
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, then inspect ${n('clock')}. Do not land at ${n('west')}.`,{route:[T('west','right')],avoid:['west'],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')} or ${n('west')}.`,{avoid:['bell','west'],action:'inspect'}),
    L('west',`Visit ${n('laundry')} before tuning ${n('west')}. Do not land at ${n('clock')}.`,{route:[V('laundry')],avoid:['clock']}),
    L('laundry',`Visit ${n('antenna')}, then deliver at ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(32,'gardens','collection','איסוף בין בתי הזכוכית','clock','south',[
    L('west',`After approaching ${n('bell')} from ${n('clock')} and turning right, cross the bridge that has stripes, heading west. Collect the packet at ${n('west')}.`,{route:[T('south','right'),C('wide','west')],action:'collect'}),
    L('antenna',`Visit ${n('laundry')} before tuning ${n('antenna')}. Do not land at ${n('mural')} or ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['mural','greenhouse']}),
    L('water',`Inspect ${n('water')} without landing at ${n('greenhouse')} or ${n('laundry')}.`,{avoid:['greenhouse','laundry'],action:'inspect'}),
    L('greenhouse',`Visit ${n('laundry')}, then inspect ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],action:'inspect'}),
    L('bell',`Go past ${n('greenhouse')} and inspect ${n('bell')}. Do not land at ${n('west')}.`,{route:[P()],avoid:['west'],action:'inspect'}),
    L('clock',`Visit ${n('mural')} before bringing the packet to ${n('clock')}. Do not land at ${n('greenhouse')}.`,{route:[V('mural')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(33,'gardens','inspection','סקר בלי לדלג','east','west',[
    L('bell',`Visit ${n('greenhouse')} and go past it before inspecting ${n('bell')}. Do not land at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
    L('mural',`Use the crossing that is made of wood, heading west, before inspecting ${n('mural')}. Do not land at ${n('clock')}.`,{route:[C('beam','west')],avoid:['clock'],action:'inspect'}),
    L('west',`Inspect ${n('west')} without landing at ${n('clock')} or ${n('laundry')}.`,{avoid:['clock','laundry'],action:'inspect'}),
    L('laundry',`Visit ${n('antenna')} before inspecting ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Visit ${n('water')}, then inspect ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('water')],avoid:['bell'],action:'inspect'}),
    L('water',`Visit ${n('antenna')} before inspecting ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell'],action:'inspect'}),
  ]),
  mission(34,'gardens','parcel','מסירת הזכוכית של הגן','antenna','east',[
    L('water',`Visit ${n('greenhouse')}, then collect the glass parcel at ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('greenhouse')],avoid:['bell'],action:'collect'}),
    L('greenhouse',`Carry it via ${n('laundry')} and tune ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],fragile:true}),
    L('bell',`Go past ${n('greenhouse')} and tune ${n('bell')}. Do not land at ${n('west')} on this leg.`,{route:[P()],avoid:['west'],fragile:true}),
    L('west',`If you are carrying the glass parcel, use the crossing that has stripes, heading west. Tune ${n('west')} without landing at ${n('mural')}.`,{route:[C('wide','west')],avoid:['mural'],fragile:true}),
    L('mural',`Inspect ${n('mural')} with the parcel. Do not land at ${n('bell')} or ${n('laundry')}.`,{avoid:['bell','laundry'],fragile:true,action:'inspect'}),
    L('clock',`Visit ${n('west')}, cross the striped bridge east, then approach ${n('bell')} from ${n('west')} and turn left. Deliver the parcel at ${n('clock')}.`,{route:[V('west'),C('wide','east'),T('east','left')],fragile:true,action:'deliver'}),
  ]),
  mission(35,'gardens','return','לחזור לציור הפרחים','mural','south',[
    L('clock',`Visit ${n('west')}, then collect the return packet at ${n('clock')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'collect'}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then inspect ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[T('south','left')],avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then tune ${n('greenhouse')}. Do not land at ${n('west')}.`,{route:[T('west','left')],avoid:['west']}),
    L('laundry',`Do not inspect ${n('laundry')} until you have landed at ${n('antenna')}. Avoid landing at ${n('water')} on this leg.`,{route:[V('antenna')],avoid:['water'],action:'inspect'}),
    L('antenna',`Visit ${n('water')}, then tune ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('water')],avoid:['greenhouse']}),
    L('mural',`Visit ${n('west')} and bring the packet home to ${n('mural')}. Do not land at ${n('greenhouse')} or ${n('clock')}.`,{route:[V('west')],avoid:['greenhouse','clock'],action:'deliver'}),
  ]),
  mission(36,'gardens','signal','שבעה גגות מחוברים','water','north',[
    L('antenna',`After landing at ${n('greenhouse')}, which has a glass roof, visit ${n('laundry')} before tuning ${n('antenna')}. Do not land at ${n('bell')}.`,{route:[V('greenhouse'),V('laundry')],avoid:['bell']}),
    L('laundry',`Visit ${n('west')}, then inspect ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Visit ${n('water')} before inspecting ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('water')],avoid:['bell'],action:'inspect'}),
    L('bell',`Go past ${n('greenhouse')} and tune ${n('bell')}. Do not land at ${n('west')}.`,{route:[P()],avoid:['west']}),
    L('east',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn left, then inspect ${n('east')}.`,{route:[V('clock'),T('south','left')],action:'inspect'}),
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, then tune ${n('clock')}. Do not land at ${n('greenhouse')}.`,{route:[T('west','right')],avoid:['greenhouse']}),
    L('west',`Visit ${n('mural')}, approach ${n('bell')} from ${n('clock')} and turn right, then use the wooden beam west. Deliver to ${n('west')}.`,{route:[V('mural'),T('south','right'),C('beam','west')],action:'deliver'}),
  ]),
  mission(37,'gardens','collection','איסוף לאורך החומה','clock','west',[
    L('mural',`Collect the packet at ${n('mural')}, the roof that has a painted wall, without landing at ${n('bell')} or ${n('west')}.`,{avoid:['bell','west'],action:'collect'}),
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge to ${n('west')}.`,{route:[V('clock'),T('south','right'),C('wide','west')]}),
    L('laundry',`Visit ${n('antenna')} before inspecting ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],action:'inspect'}),
    L('antenna',`Visit ${n('water')}, then inspect ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('water')],avoid:['greenhouse'],action:'inspect'}),
    L('water',`Visit ${n('laundry')} before tuning ${n('water')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['greenhouse']}),
    L('greenhouse',`Visit ${n('laundry')} before inspecting ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],action:'inspect'}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then deliver the packet to ${n('east')}. Do not land at ${n('clock')}.`,{route:[P(),T('north','right')],avoid:['clock'],action:'deliver'}),
  ]),
  mission(38,'gardens','inspection','שתי הקפות לבדיקה','east','west',[
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then inspect ${n('greenhouse')}, which has a glass roof. Do not land at ${n('west')} until this inspection is complete.`,{route:[T('west','left')],avoid:['west'],action:'inspect'}),
    L('water',`Visit ${n('antenna')} before inspecting ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell'],action:'inspect'}),
    L('antenna',`Visit ${n('laundry')}, then inspect ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['greenhouse'],action:'inspect'}),
    L('laundry',`Visit ${n('west')}, then inspect ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse'],action:'inspect'}),
    L('west',`Cross the striped bridge east, approach ${n('bell')} from ${n('west')} and turn right, then land at ${n('greenhouse')}. Go past it, approach ${n('bell')} from ${n('greenhouse')} and turn left, cross the striped bridge west and inspect ${n('west')}.`,{route:[C('wide','east'),T('east','right'),V('greenhouse'),P(),T('north','left'),C('wide','west')],action:'inspect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')} or ${n('clock')}.`,{avoid:['bell','clock'],action:'inspect'}),
    L('clock',`Visit ${n('west')}, cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn left. Inspect ${n('clock')} without landing at ${n('laundry')}.`,{route:[V('west'),C('beam','east'),T('east','left')],avoid:['laundry'],action:'inspect'}),
  ]),
  mission(39,'gardens','parcel','המשלוח העדין של הגנים','mural','south',[
    L('clock',`Visit ${n('west')}, then collect the parcel at ${n('clock')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'collect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it. Tune ${n('bell')} and keep the parcel.`,{route:[V('greenhouse'),P()],fragile:true}),
    L('west',`If you damage the glass parcel, you will restart this leg with a replacement. To continue, cross the bridge that has stripes, heading west, tune ${n('west')} and avoid landing at ${n('mural')}.`,{route:[C('wide','west')],avoid:['mural'],fragile:true}),
    L('laundry',`Visit ${n('mural')} before tuning ${n('laundry')}. Do not land at ${n('bell')}.`,{route:[V('mural')],avoid:['bell'],fragile:true}),
    L('greenhouse',`Carry the parcel via ${n('antenna')}, then ${n('water')}, and tune ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('antenna'),V('water')],avoid:['bell'],fragile:true}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then tune ${n('east')}. Keep the parcel.`,{route:[P(),T('north','right')],fragile:true}),
    L('water',`Use the striped bridge west and visit ${n('antenna')}. Deliver the parcel to ${n('water')} without landing at ${n('greenhouse')}.`,{route:[C('wide','west'),V('antenna')],avoid:['greenhouse'],fragile:true,action:'deliver'}),
  ]),
  mission(40,'gardens','return','החזרה הגדולה לגן','bell','north',[
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Collect the return packet at ${n('west')}.`,{route:[V('clock'),T('south','right'),C('wide','west')],action:'collect'}),
    L('mural',`Inspect ${n('mural')} without landing at ${n('bell')} or ${n('laundry')}.`,{avoid:['bell','laundry'],action:'inspect'}),
    L('clock',`Before inspecting ${n('clock')}, the tower that has a clock face, land at ${n('west')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'inspect'}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then tune ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[T('south','left')],avoid:['greenhouse']}),
    L('greenhouse',`Approach ${n('bell')} from ${n('east')} and turn left, then inspect ${n('greenhouse')}. Do not land at ${n('west')}.`,{route:[T('west','left')],avoid:['west'],action:'inspect'}),
    L('water',`Visit ${n('antenna')}, then tune ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell']}),
    L('bell',`Visit ${n('antenna')}, then ${n('laundry')}, then ${n('greenhouse')}, and go past it. Bring the packet home to ${n('bell')}.`,{route:[V('antenna'),V('laundry'),V('greenhouse'),P()],action:'deliver'}),
  ]),
];}
function observatory():Contract[]{const n=(s:SiteId)=>districtSiteName(s,'observatory');return [
  mission(41,'observatory','signal','פתיחת תדרי המצפה','water','west',[
    L('greenhouse',`Before inspecting ${n('greenhouse')}, which has a glass roof, land at ${n('antenna')} and then ${n('laundry')}. Do not land at ${n('bell')}.`,{route:[V('antenna'),V('laundry')],avoid:['bell'],action:'inspect'}),
    L('laundry',`After landing at ${n('water')}, visit ${n('antenna')} before tuning ${n('laundry')}, the roof with hanging cloth. Do not land at ${n('bell')}.`,{route:[V('water'),V('antenna')],avoid:['bell']}),
    L('antenna',`Visit ${n('west')}, then inspect ${n('antenna')}. Do not land at ${n('greenhouse')} or ${n('mural')}.`,{route:[V('west')],avoid:['greenhouse','mural'],action:'inspect'}),
    L('mural',`Visit ${n('laundry')}, then ${n('west')}, before tuning ${n('mural')}. Do not land at ${n('greenhouse')} or ${n('bell')}.`,{route:[V('laundry'),V('west')],avoid:['greenhouse','bell']}),
    L('clock',`Visit ${n('west')}, cross the striped bridge east and approach ${n('bell')} from ${n('west')} and turn left. Inspect ${n('clock')}.`,{route:[V('west'),C('wide','east'),T('east','left')],action:'inspect'}),
    L('west',`Visit ${n('mural')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Tune ${n('west')}.`,{route:[V('mural'),T('south','right'),C('wide','west')]}),
    L('east',`Cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn right; land at ${n('greenhouse')}. Go past it, approach ${n('bell')} from ${n('greenhouse')} and turn right, then deliver to ${n('east')}.`,{route:[C('beam','east'),T('east','right'),V('greenhouse'),P(),T('north','right')],action:'deliver'}),
  ]),
  mission(42,'observatory','collection','איסוף מהחלל העמוק','clock','west',[
    L('west',`Before collecting the packet at ${n('west')}, visit ${n('mural')} and then ${n('clock')}. Approach ${n('bell')} from ${n('clock')} and turn right, then use the crossing that has stripes, heading west.`,{route:[V('mural'),V('clock'),T('south','right'),C('wide','west')],action:'collect'}),
    L('laundry',`Inspect ${n('laundry')} without landing at ${n('greenhouse')} or ${n('clock')}.`,{avoid:['greenhouse','clock'],action:'inspect'}),
    L('greenhouse',`Visit ${n('antenna')}, then ${n('water')}, before tuning ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('antenna'),V('water')],avoid:['bell']}),
    L('water',`Visit ${n('antenna')} before inspecting ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('antenna')],avoid:['bell'],action:'inspect'}),
    L('antenna',`Visit ${n('laundry')}, then inspect ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Visit ${n('west')}, then tune ${n('mural')}. Do not land at ${n('greenhouse')} or ${n('clock')}.`,{route:[V('west')],avoid:['greenhouse','clock']}),
    L('clock',`Visit ${n('west')}, cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn left. Deliver the packet at ${n('clock')} without landing at ${n('laundry')}.`,{route:[V('west'),C('beam','east'),T('east','left')],avoid:['laundry'],action:'deliver'}),
  ]),
  mission(43,'observatory','inspection','סקר המצפה הכפול','east','west',[
    L('bell',`Visit ${n('greenhouse')} and go past it before inspecting ${n('bell')}. Do not land at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
    L('clock',`After visiting ${n('east')}, which has a café canopy, approach ${n('bell')} from ${n('east')} and turn right. Inspect ${n('clock')} without landing at ${n('greenhouse')}.`,{route:[V('east'),T('west','right')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Visit ${n('west')}, then inspect ${n('mural')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'inspect'}),
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the wooden beam west. Inspect ${n('west')}.`,{route:[V('clock'),T('south','right'),C('beam','west')],action:'inspect'}),
    L('laundry',`Visit ${n('antenna')} before inspecting ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('antenna')],avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Visit ${n('water')}, then ${n('antenna')}, then ${n('laundry')}. Inspect ${n('greenhouse')} without landing at ${n('bell')}.`,{route:[V('water'),V('antenna'),V('laundry')],avoid:['bell'],action:'inspect'}),
    L('water',`Visit ${n('laundry')}, then ${n('antenna')}, before inspecting ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('laundry'),V('antenna')],avoid:['bell'],action:'inspect'}),
  ]),
  mission(44,'observatory','parcel','זכוכית בין כוכבים','antenna','east',[
    L('water',`Do not collect the glass parcel at ${n('water')} until you have landed at ${n('greenhouse')}, which has a glass roof. Avoid landing at ${n('bell')} on this leg.`,{route:[V('greenhouse')],avoid:['bell'],action:'collect'}),
    L('greenhouse',`Carry it via ${n('laundry')} and tune ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],fragile:true}),
    L('bell',`Visit ${n('water')}, return to ${n('greenhouse')} and go past it. Tune ${n('bell')} and keep the parcel.`,{route:[V('water'),V('greenhouse'),P()],fragile:true}),
    L('west',`If you damage the glass parcel, you will restart this leg with a replacement. To continue, visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the bridge that has stripes, heading west; tune ${n('west')} and keep the parcel.`,{route:[V('clock'),T('south','right'),C('wide','west')],fragile:true}),
    L('mural',`Visit ${n('laundry')} before inspecting ${n('mural')}. Do not land at ${n('bell')}; keep the parcel.`,{route:[V('laundry')],avoid:['bell'],fragile:true,action:'inspect'}),
    L('clock',`Visit ${n('west')}, cross the striped bridge east and approach ${n('bell')} from ${n('west')} and turn left. Tune ${n('clock')} and keep the parcel.`,{route:[V('west'),C('wide','east'),T('east','left')],fragile:true}),
    L('east',`Approach ${n('bell')} from ${n('clock')} and turn left, then deliver the parcel to ${n('east')}. Do not land at ${n('greenhouse')} or ${n('west')}.`,{route:[T('south','left')],avoid:['greenhouse','west'],fragile:true,action:'deliver'}),
  ]),
  mission(45,'observatory','return','החזרה למסך הכוכבים','mural','south',[
    L('clock',`Visit ${n('west')}, then collect the return packet at ${n('clock')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'collect'}),
    L('east',`After visiting ${n('mural')}, approach ${n('bell')} from ${n('clock')} and turn left. Inspect ${n('east')}, the roof that has a café canopy, without landing at ${n('greenhouse')}.`,{route:[V('mural'),T('south','left')],avoid:['greenhouse'],action:'inspect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it before tuning ${n('bell')}. Do not land at ${n('west')}.`,{route:[V('greenhouse'),P()],avoid:['west']}),
    L('greenhouse',`Visit ${n('west')}, cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn right. Tune ${n('greenhouse')} without landing at ${n('east')}.`,{route:[V('west'),C('beam','east'),T('east','right')],avoid:['east']}),
    L('water',`Visit ${n('laundry')}, then ${n('antenna')}, before tuning ${n('water')}. Do not land at ${n('bell')}.`,{route:[V('laundry'),V('antenna')],avoid:['bell']}),
    L('antenna',`Visit ${n('laundry')} before inspecting ${n('antenna')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Visit ${n('west')} and bring the packet home to ${n('mural')}. Do not land at ${n('greenhouse')} or ${n('clock')}.`,{route:[V('west')],avoid:['greenhouse','clock'],action:'deliver'}),
  ]),
  mission(46,'observatory','signal','המסלול בין שני התדרים','water','north',[
    L('antenna',`After landing at ${n('greenhouse')}, which has a glass roof, visit ${n('laundry')} before tuning ${n('antenna')}. Do not land at ${n('bell')}.`,{route:[V('greenhouse'),V('laundry')],avoid:['bell']}),
    L('laundry',`Visit ${n('west')}, then inspect ${n('laundry')}. Do not land at ${n('greenhouse')}.`,{route:[V('west')],avoid:['greenhouse'],action:'inspect'}),
    L('west',`Visit ${n('mural')}, then ${n('clock')}; approach ${n('bell')} from ${n('clock')} and turn right, then use the striped bridge west. Tune ${n('west')}.`,{route:[V('mural'),V('clock'),T('south','right'),C('wide','west')]}),
    L('bell',`After visiting ${n('mural')}, cross the beam that is made of wood, heading east, and tune ${n('bell')}. Do not land at ${n('greenhouse')} until this radio is tuned.`,{route:[V('mural'),C('beam','east')],avoid:['greenhouse']}),
    L('clock',`Visit ${n('west')}, cross the wooden beam east and approach ${n('bell')} from ${n('west')} and turn left. Inspect ${n('clock')}.`,{route:[V('west'),C('beam','east'),T('east','left')],action:'inspect'}),
    L('east',`Visit ${n('greenhouse')}, go past it and approach ${n('bell')} from ${n('greenhouse')} and turn right. Tune ${n('east')} without landing at ${n('west')}.`,{route:[V('greenhouse'),P(),T('north','right')],avoid:['west']}),
    L('greenhouse',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Visit ${n('laundry')}, then deliver at ${n('greenhouse')}. Do not land at ${n('water')}.`,{route:[V('clock'),T('south','right'),C('wide','west'),V('laundry')],avoid:['water'],action:'deliver'}),
  ]),
  mission(47,'observatory','collection','איסוף כפול דרך המפרשים','clock','west',[
    L('mural',`Visit ${n('west')} before collecting the packet at ${n('mural')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'collect'}),
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Tune ${n('west')}.`,{route:[V('clock'),T('south','right'),C('wide','west')]}),
    L('antenna',`Before inspecting ${n('antenna')}, land at ${n('laundry')}, then ${n('water')}, and return to ${n('laundry')}. Do not land at ${n('greenhouse')}, which has a glass roof.`,{route:[V('laundry'),V('water'),V('laundry')],avoid:['greenhouse'],action:'inspect'}),
    L('water',`Visit ${n('laundry')}, then ${n('antenna')}, before tuning ${n('water')}. Do not land at ${n('greenhouse')}.`,{route:[V('laundry'),V('antenna')],avoid:['greenhouse']}),
    L('greenhouse',`Visit ${n('laundry')}, then inspect ${n('greenhouse')}. Do not land at ${n('bell')}.`,{route:[V('laundry')],avoid:['bell'],action:'inspect'}),
    L('bell',`Visit ${n('water')}, return to ${n('greenhouse')} and go past it. Tune ${n('bell')} without landing at ${n('west')}.`,{route:[V('water'),V('greenhouse'),P()],avoid:['west']}),
    L('east',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn left, then deliver the packet to ${n('east')}. Do not land at ${n('greenhouse')}.`,{route:[V('clock'),T('south','left')],avoid:['greenhouse'],action:'deliver'}),
  ]),
  mission(48,'observatory','inspection','בדיקת הרצף הארוך','east','west',[
    L('greenhouse',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the wooden beam west. Visit ${n('laundry')}, then inspect ${n('greenhouse')}. Do not land at ${n('water')}.`,{route:[V('clock'),T('south','right'),C('beam','west'),V('laundry')],avoid:['water'],action:'inspect'}),
    L('laundry',`Visit ${n('antenna')}, then ${n('water')}, then ${n('antenna')} again. Inspect ${n('laundry')} without landing at ${n('bell')}.`,{route:[V('antenna'),V('water'),V('antenna')],avoid:['bell'],action:'inspect'}),
    L('west',`Visit ${n('mural')}, then ${n('clock')}; approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Inspect ${n('west')}.`,{route:[V('mural'),V('clock'),T('south','right'),C('wide','west')],action:'inspect'}),
    L('mural',`Visit ${n('laundry')}, then inspect ${n('mural')}. Do not land at ${n('bell')} or ${n('clock')}.`,{route:[V('laundry')],avoid:['bell','clock'],action:'inspect'}),
    L('clock',`After visiting ${n('west')}, cross the bridge that has stripes, heading east and approach ${n('bell')} from ${n('west')} and turn left. Inspect ${n('clock')} without landing at ${n('laundry')}.`,{route:[V('west'),C('wide','east'),T('east','left')],avoid:['laundry'],action:'inspect'}),
    L('bell',`Visit ${n('greenhouse')}, then ${n('water')}, then ${n('greenhouse')} again, and go past it. Inspect ${n('bell')} without landing at ${n('west')}.`,{route:[V('greenhouse'),V('water'),V('greenhouse'),P()],avoid:['west'],action:'inspect'}),
    L('water',`Cross the striped bridge west; visit ${n('laundry')}, then ${n('antenna')}. Inspect ${n('water')} without landing at ${n('east')} or ${n('clock')}.`,{route:[C('wide','west'),V('laundry'),V('antenna')],avoid:['east','clock'],action:'inspect'}),
  ]),
  mission(49,'observatory','parcel','הזכוכית האחרונה','mural','south',[
    L('clock',`Visit ${n('west')}, then collect the glass parcel at ${n('clock')}. Do not land at ${n('bell')}.`,{route:[V('west')],avoid:['bell'],action:'collect'}),
    L('bell',`Visit ${n('greenhouse')} and go past it. Tune ${n('bell')} without landing at ${n('west')}; keep the parcel.`,{route:[V('greenhouse'),P()],avoid:['west'],fragile:true}),
    L('west',`If you damage the glass parcel, you will restart this leg with a replacement. To continue, visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the bridge that has stripes, heading west; tune ${n('west')} and keep the parcel.`,{route:[V('clock'),T('south','right'),C('wide','west')],fragile:true}),
    L('greenhouse',`Carry it via ${n('laundry')}, then ${n('antenna')}, then ${n('water')}. Tune ${n('greenhouse')} without landing at ${n('bell')}.`,{route:[V('laundry'),V('antenna'),V('water')],avoid:['bell'],fragile:true}),
    L('east',`Go past ${n('greenhouse')}, approach ${n('bell')} from ${n('greenhouse')} and turn right, then tune ${n('east')}. Do not land at ${n('clock')}; keep the parcel.`,{route:[P(),T('north','right')],avoid:['clock'],fragile:true}),
    L('water',`Use the striped bridge west; visit ${n('laundry')}, then ${n('antenna')}. Tune ${n('water')} without landing at ${n('greenhouse')}; keep the parcel.`,{route:[C('wide','west'),V('laundry'),V('antenna')],avoid:['greenhouse'],fragile:true}),
    L('mural',`Visit ${n('antenna')}, then ${n('laundry')}, then ${n('west')}. Deliver the parcel at ${n('mural')} without landing at ${n('greenhouse')} or ${n('clock')}.`,{route:[V('antenna'),V('laundry'),V('west')],avoid:['greenhouse','clock'],fragile:true,action:'deliver'}),
  ]),
  mission(50,'observatory','return','כל הרשת חוזרת הביתה','bell','south',[
    L('east',`Visit ${n('greenhouse')}, go past it and approach ${n('bell')} from ${n('greenhouse')} and turn right. Collect the final return packet at ${n('east')}.`,{route:[V('greenhouse'),P(),T('north','right')],action:'collect'}),
    L('clock',`Approach ${n('bell')} from ${n('east')} and turn right, visit ${n('mural')}, then inspect ${n('clock')}. Do not land at ${n('greenhouse')}.`,{route:[T('west','right'),V('mural')],avoid:['greenhouse'],action:'inspect'}),
    L('mural',`Visit ${n('west')}, cross the striped bridge east and approach ${n('bell')} from ${n('west')} and turn left. Visit ${n('clock')}, then inspect ${n('mural')}.`,{route:[V('west'),C('wide','east'),T('east','left'),V('clock')],action:'inspect'}),
    L('west',`Visit ${n('clock')}, approach ${n('bell')} from ${n('clock')} and turn right, then cross the striped bridge west. Tune ${n('west')} without landing at ${n('greenhouse')}.`,{route:[V('clock'),T('south','right'),C('wide','west')],avoid:['greenhouse']}),
    L('laundry',`Visit ${n('antenna')}, then ${n('water')}, then ${n('antenna')} again. Inspect ${n('laundry')} without landing at ${n('greenhouse')}.`,{route:[V('antenna'),V('water'),V('antenna')],avoid:['greenhouse'],action:'inspect'}),
    L('greenhouse',`Visit ${n('water')}, then ${n('antenna')}, then ${n('laundry')}. Tune ${n('greenhouse')} without landing at ${n('bell')}.`,{route:[V('water'),V('antenna'),V('laundry')],avoid:['bell']}),
    L('bell',`Before bringing the packet home, visit ${n('water')}, ${n('antenna')}, ${n('laundry')} and ${n('greenhouse')} in that order, then go past the glasshouse. Deliver at ${n('bell')} without landing at ${n('west')} or ${n('clock')} on this leg.`,{route:[V('water'),V('antenna'),V('laundry'),V('greenhouse'),P()],avoid:['west','clock'],action:'deliver'}),
  ]),
];}
export const CAMPAIGN_LENGTH=50;
export function contracts(_variant=0):Contract[]{return [...firstFive(),...oldTown(),...canals(),...market(),...gardens(),...observatory()];}
export function activeBrief(job:Contract,progress:number):string{return job.stages[Math.max(0,Math.min(job.stages.length-1,Math.floor(progress)))]??job.english;}
/** Legacy contracts without explicit stages keep the original last-stage requirements. */
export function stageRequirement(job:Contract,index:number):StageRequirement{
  const authored=job.requirements?.[index];if(authored)return authored;
  const route:RouteRequirement[]=[];
  if(index===job.order.length-1){if(job.past)route.push(P());if(job.turn)route.push(T(job.facing,'right'));if(job.fragile)route.push(C('wide','west'));}
  return {route,avoid:[],fragile:job.fragile,action:'tune'};
}
