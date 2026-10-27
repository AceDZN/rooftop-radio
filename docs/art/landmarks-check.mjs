/** Reproducible geometry/coverage check and texture-free offline proof export.
 * node docs/art/landmarks-check.mjs (does not launch a browser).
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const root=fileURLToPath(new URL('../..',import.meta.url));
fs.mkdirSync(path.join(root,'node_modules/.cache'),{recursive:true});
const temp=fs.mkdtempSync(path.join(root,'node_modules/.cache/landmark-check-'));
for(const name of ['landmark-layout','landmark-kit']){
  const source=fs.readFileSync(path.join(root,'src',`${name}.ts`),'utf8').replace("from './landmark-layout'","from './landmark-layout.mjs'");
  fs.writeFileSync(path.join(temp,`${name}.mjs`),stripTypeScriptTypes(source));
}
try{
  const {createLandmarks}=await import(pathToFileURL(path.join(temp,'landmark-kit.mjs')));
  const {LANDMARK_SOLIDS,LANDMARK_ORIGINS,LANDMARK_TOPS}=await import(pathToFileURL(path.join(temp,'landmark-layout.mjs')));
  const {group}=createLandmarks();group.updateMatrixWorld(true);
  const ids=new Set(),materialNames=new Set();let triangles=0,draws=0;
  const report=[];
  for(const child of group.children){
    let count=0;child.traverse(o=>{if(!o.isMesh)return;const n=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;count+=n;triangles+=n;draws++;materialNames.add(o.material.name);for(const id of o.userData.solidIds??[])ids.add(id);for(const name of ['position','normal']){const a=o.geometry.attributes[name];if(!a||[...a.array].some(v=>!Number.isFinite(v)))throw Error(`Invalid ${name}: ${child.name}`);}});
    const box=new T.Box3().setFromObject(child);report.push({name:child.name,triangles:count,bounds:{min:box.min.toArray(),max:box.max.toArray()}});
  }
  const missing=LANDMARK_SOLIDS.filter(s=>!ids.has(s.id));if(missing.length)throw Error(`Colliders without associated mesh: ${missing.map(s=>s.id).join(', ')}`);
  for(const s of LANDMARK_SOLIDS)if(s.h<=0||s.w<=0||s.d<=0)throw Error(`Invalid collider: ${s.id}`);
  // Probe the real landing/decision portals, with 0.38 m player radius and 1.8 m height.
  const portals=[['bell west beam',-6.0,9,-2],['bell west wide',-6,9,3.3],['receiver east beam',-12,9,-2],['receiver east wide',-12,9,3.3],['greenhouse west',-6,9,18],['greenhouse centre',0,9,18],['bell centre',0,9,0],['water spawn',0,10,39]];
  const blocked=[];
  for(const [name,x,y,z] of portals)for(const s of LANDMARK_SOLIDS){if(y>=s.y+s.h-.02||y+1.8<=s.y)continue;const dx=Math.max(Math.abs(x-s.x)-s.w/2,0),dz=Math.max(Math.abs(z-s.z)-s.d/2,0);if(Math.hypot(dx,dz)<.38)blocked.push(`${name}: ${s.id}`);}
  if(blocked.length)throw Error(`Blocked portal: ${blocked.join(', ')}`);
  const result={triangles,drawsBeforeWorldMerge:draws,sharedMaterialCount:materialNames.size,colliders:LANDMARK_SOLIDS.length,associatedColliderIds:ids.size,standableTops:LANDMARK_TOPS.length,portalChecks:portals.length,modules:report};
  fs.writeFileSync(path.join(root,'docs/art/landmarks-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  // Reposition clones into a review grid; the actual source world positions above
  // remain unchanged. Canvas labels/mural are absent in this Node-only export.
  const proof=new T.Group();
  for(const [i,child] of group.children.entries()){
    const clone=child.clone(true),origin=LANDMARK_ORIGINS[child.userData.landmark];clone.position.set((i%3)*12,-origin.y,Math.floor(i/3)*12);
    // Child geometry is local to its landmark site; centre only for this proof.
    clone.position.y=0;proof.add(clone);
  }
  globalThis.FileReader=class{result=null;onloadend=null;readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onloadend?.();});}};
  const glb=await new GLTFExporter().parseAsync(proof,{binary:true});fs.writeFileSync(path.join(root,'docs/art/landmarks-proof.glb'),Buffer.from(glb));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
