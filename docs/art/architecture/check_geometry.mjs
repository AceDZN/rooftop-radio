import fs from 'node:fs';
import crypto from 'node:crypto';
import * as T from 'three';
const paths=process.argv.slice(2); const reports=[];
for(const path of paths){
 const data=fs.readFileSync(path); const len=data.readUInt32LE(12); const doc=JSON.parse(data.subarray(20,20+len).toString());
 const whole=new T.Box3(); let triangles=0,draws=0;
 const norm=(v,a)=>!a.normalized?v: a.componentType===5120?Math.max(-1,v/127):a.componentType===5121?v/255:a.componentType===5122?Math.max(-1,v/32767):a.componentType===5123?v/65535:v;
 function walk(index,parent){
  const node=doc.nodes[index];let mat=new T.Matrix4();
  if(node.matrix)mat.fromArray(node.matrix);else mat.compose(new T.Vector3().fromArray(node.translation??[0,0,0]),new T.Quaternion().fromArray(node.rotation??[0,0,0,1]),new T.Vector3().fromArray(node.scale??[1,1,1]));
  mat.premultiply(parent);
  if(node.mesh!==undefined)for(const p of doc.meshes[node.mesh].primitives){
   const a=doc.accessors[p.attributes.POSITION];
   const box=new T.Box3(new T.Vector3(...a.min.map(v=>norm(v,a))),new T.Vector3(...a.max.map(v=>norm(v,a))));whole.union(box.applyMatrix4(mat));draws++;triangles+=(p.indices===undefined?a.count:doc.accessors[p.indices].count)/3;
  }
  for(const child of node.children??[])walk(child,mat);
 }
 for(const root of doc.scenes[doc.scene??0].nodes)walk(root,new T.Matrix4());
 const size=whole.getSize(new T.Vector3());
 const report={path,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),triangles,draws,bounds:{min:whole.min.toArray(),max:whole.max.toArray(),size:size.toArray()},extensions:doc.extensionsUsed??[]};
 if(Math.abs(size.x-13)>.01||Math.abs(size.z-13)>.01||Math.abs(whole.min.y)>.01||(path.includes('distant')?(whole.max.y<8.99||whole.max.y>11):Math.abs(whole.max.y-9.035)>.06))throw new Error('Geometry contract failed: '+JSON.stringify(report));
 if(path.includes('distant')&&triangles>2000)throw new Error('Distant model exceeds 2000 triangles');
 if(data.length>3000000)throw new Error('Runtime module exceeds 3 MB: '+path);
 reports.push(report);
}

console.log(JSON.stringify(reports,null,2));
