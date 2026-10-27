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
export interface Contract {
  id: number; title: string; english: string; stages: readonly string[]; start: SiteId; facing: Heading;
  order: SiteId[]; past: boolean; turn: boolean; fragile: boolean; transfer: boolean;
  hint: string | null; vocabulary: [string,string][];
}
const vocab: [string,string][] = [
  ['land','לנחות'],['radio / tune','רדיו / לכוון'],['next to','ליד'],
  ['past / towards','לחלוף על פני / לעבר'],['face','לפנות אל / לעמוד מול'],
  ['turn right','לפנות ימינה ביחס לכיוון ההליכה'],['wider / narrower','רחב יותר / צר יותר'],
  ['striped / wooden','מפוספס / מעץ'],['crossing / bridge','מעבר / גשר'],
  ['parcel / deliver','מטען / למסור'],['glass / space','זכוכית / מרחב'],
  ['first / next / then','תחילה / בהמשך / אחר כך'],['roof / station','גג / תחנה'],
];
export function contracts(_variant = 0): Contract[] {
  return [
    {
      id:1,title:'נחיתה ראשונה',
      english:'Deliver the signal to the radio next to the greenhouse.',
      stages:['Deliver the signal to the radio next to the greenhouse.'],
      start:'water',facing:'north',order:['greenhouse'],past:false,turn:false,fragile:false,transfer:false,
      hint:'החממה היא מבנה הזכוכית. הרדיו שלה נמצא לידה על הגג; קפיצה ואז החזקה באוויר פותחת דאון.',vocabulary:vocab,
    },
    {
      id:2,title:'מעבר לחממה',
      english:'First, tune the greenhouse radio. Go past the greenhouse to the bell tower and tune its radio.',
      stages:['First, tune the greenhouse radio.','Go past the greenhouse. Tune the bell-tower radio.'],
      start:'water',facing:'north',order:['greenhouse','bell'],past:true,turn:false,fragile:false,transfer:false,
      hint:'כוונו את הרדיו הראשון לפני שממשיכים. past מחייב לעבור לצד הרחוק של החממה ואז להמשיך למגדל הפעמון.',vocabulary:vocab,
    },
    {
      id:3,title:'פנייה לתחנה',
      english:'From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station.',
      stages:['From the clock, face the bell tower. Turn right at the bell tower and deliver to Radio Station.'],
      start:'clock',facing:'south',order:['west'],past:false,turn:true,fragile:false,transfer:false,
      hint:'אתם מגיעים מהשעון אל מגדל הפעמון. ימין נקבע לפי כיוון ההליכה הזה; חפשו את התורן של תחנת הרדיו.',vocabulary:vocab,
    },
    {
      id:4,title:'מקום למטען',
      english:'The glass parcel needs space. Of the two crossings to Radio Station, take the wider striped bridge and deliver it.',
      stages:['Of the two crossings to Radio Station, take the wider striped bridge. Deliver the parcel.'],
      start:'bell',facing:'west',order:['west'],past:false,turn:false,fragile:true,transfer:false,
      hint:'משווים רק את שני המעברים הישירים מגג הפעמון לתחנת הרדיו. חפשו גשר מפוספס וקורת עץ והשוו את הרוחב שלהם.',vocabulary:vocab,
    },
    {
      id:5,title:'תדר חדש',
      english:'First, tune the bell-tower radio, then the greenhouse radio. Face the bell tower, go past the greenhouse, turn right at the bell tower and deliver to the café.',
      stages:['First, tune the bell-tower radio.','Next, tune the greenhouse radio.','Face the bell tower. Go past the greenhouse, turn right at the bell tower and deliver to the café.'],
      start:'water',facing:'north',order:['bell','greenhouse','east'],past:true,turn:true,fragile:false,transfer:true,
      hint:null,vocabulary:vocab,
    },
  ];
}
/** One authored source for the planning card and each current radio stage. */
export function activeBrief(job: Contract, progress: number): string {
  const index=Math.max(0,Math.min(job.stages.length-1,Math.floor(progress)));
  return job.stages[index]??job.english;
}
/** Landmark identities stay fixed through every contract and replay. */
export function siteName(id: SiteId, _transfer = false): string {return SITE[id].name;}
