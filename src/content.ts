/** Authored fixtures, not quotations. World north = -z; east = +x. */
export type Heading = 'north' | 'east' | 'south' | 'west';
export type SiteId = 'water' | 'greenhouse' | 'bell' | 'clock' | 'west' | 'east' | 'laundry' | 'antenna' | 'mural';
export interface Site {id: SiteId; x: number; z: number; y: number; w: number; d: number; name: string; kind: string}
export const SITES: Site[] = [
  {id:'water',x:0,z:36,y:10,w:13,d:13,name:'Water tower',kind:'water'},
  {id:'greenhouse',x:0,z:18,y:9,w:13,d:13,name:'Greenhouse',kind:'greenhouse'},
  {id:'bell',x:0,z:0,y:9,w:13,d:13,name:'Bell tower',kind:'bell'},
  {id:'clock',x:0,z:-18,y:10,w:13,d:13,name:'Clock',kind:'clock'},
  {id:'west',x:-18,z:0,y:9,w:13,d:13,name:'Receiver',kind:'receiver'},
  {id:'east',x:18,z:0,y:9,w:13,d:13,name:'Café',kind:'cafe'},
  {id:'laundry',x:-18,z:18,y:9,w:13,d:13,name:'Laundry',kind:'laundry'},
  {id:'antenna',x:-18,z:36,y:10,w:13,d:13,name:'Antenna terrace',kind:'antenna'},
  {id:'mural',x:-18,z:-18,y:10,w:13,d:13,name:'Mural',kind:'mural'},
];
export const SITE = Object.fromEntries(SITES.map(s => [s.id,s])) as Record<SiteId,Site>;
export interface Connection {a: SiteId; b: SiteId; width: number; kind: 'awning'|'bridge'|'gap'|'narrow'}
export const CONNECTIONS: Connection[] = [
  {a:'water',b:'greenhouse',width:4,kind:'gap'},
  {a:'greenhouse',b:'bell',width:3.4,kind:'bridge'},
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
  id: number; title: string; english: string; start: SiteId; facing: Heading;
  order: SiteId[]; past: boolean; turn: boolean; fragile: boolean; transfer: boolean;
  hint: string | null; vocabulary: [string,string][];
}
const vocab: [string,string][] = [['relay','ממסר רדיו'],['next to','ליד'],['past','מעבר ל־ / לחלוף על פני'],['towards','לעבר'],['opposite','ממול'],['wider','רחב יותר'],['narrower','צר יותר'],['fragile','שביר'],['first / then','תחילה / אחר כך'],['turn right','פנו ימינה ביחס לכיוון ההליכה']];
export function contracts(_variant = 0): Contract[] {
  return [
    {id:1,title:'האות הראשון',english:'From the water tower, face the greenhouse. Tune the relay next to the greenhouse.',start:'water',facing:'north',order:['greenhouse'],past:false,turn:false,fragile:false,transfer:false,hint:'החממה היא מבנה הזכוכית. הממסר שלידה נמצא על אותו גג. אפשר לקפוץ ואז לפתוח דאון.',vocabulary:vocab},
    {id:2,title:'מעבר לחממה',english:'From the water tower, face the clock. First, tune the relay beside the greenhouse. Go past the greenhouse. Then tune the relay at the bell tower.',start:'water',facing:'north',order:['greenhouse','bell'],past:true,turn:false,fragile:false,transfer:false,hint:'המילה past מחייבת להמשיך מעבר לחממה. התקרבות אליה בלבד אינה מספיקה.',vocabulary:vocab},
    {id:3,title:'ימינה ביחס להליכה',english:'From the clock, face the bell tower. Go straight to the bell tower. Turn right. Tune the receiver opposite the café.',start:'clock',facing:'south',order:['west'],past:false,turn:true,fragile:false,transfer:false,hint:'מתקדמים דרומה מהשעון אל מגדל הפעמון. ימין נקבע לפי כיוון ההליכה, גם כשהמצלמה מסתובבת.',vocabulary:vocab},
    {id:4,title:'מרחב למטען',english:'From the bell tower, carry the glass parcel. It needs space: the narrow beam can shake it loose. The direct crossing is narrower than the awning route. Take the wider awning route to the receiver opposite the café.',start:'bell',facing:'south',order:['west'],past:false,turn:false,fragile:true,transfer:false,hint:'המטען צריך רוחב. מסלול הסוככים עובר ליד גג הכביסה, והוא רחב יותר מהקורה הישירה.',vocabulary:vocab},
    {id:5,title:'תדר חדש',english:'From the water tower, face the clock. First, tune the bell-tower relay. Next, tune the greenhouse relay. Finally, go past the greenhouse, turn right at the bell tower and tune the receiver opposite the café.',start:'water',facing:'north',order:['bell','greenhouse','east'],past:true,turn:true,fragile:false,transfer:true,hint:null,vocabulary:vocab},
  ];
}
export function siteName(id: SiteId, transfer: boolean): string {
  if (transfer && id === 'west') return 'Café';
  if (transfer && id === 'east') return 'Receiver';
  return SITE[id].name;
}
