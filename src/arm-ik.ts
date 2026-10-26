import {Bone,Quaternion,Vector3} from 'three';

/** CCD on the real upper-arm/forearm chain; the wrist is the end effector. */
export function solveArm(upper:Bone,forearm:Bone,hand:Bone,target:Vector3):number {
  const origin=new Vector3(),end=new Vector3(),from=new Vector3(),to=new Vector3();
  const parentRotation=new Quaternion(),delta=new Quaternion(),localDelta=new Quaternion();
  for(let iteration=0;iteration<14;iteration++){
    for(const joint of [forearm,upper]){
      joint.getWorldPosition(origin);hand.getWorldPosition(end);from.subVectors(end,origin);to.subVectors(target,origin);
      if(from.lengthSq()<1e-10||to.lengthSq()<1e-10)continue;
      delta.setFromUnitVectors(from.normalize(),to.normalize());
      joint.parent!.getWorldQuaternion(parentRotation);
      localDelta.copy(parentRotation).invert().multiply(delta).multiply(parentRotation);
      joint.quaternion.premultiply(localDelta).normalize();joint.updateWorldMatrix(false,true);
    }
    if(hand.getWorldPosition(end).distanceToSquared(target)<.000025)break;
  }
  return hand.getWorldPosition(end).distanceTo(target);
}

export function orientBoneWorld(bone:Bone,rotation:Quaternion){
  const parent=bone.parent!.getWorldQuaternion(new Quaternion());
  bone.quaternion.copy(parent.invert().multiply(rotation));bone.updateWorldMatrix(false,true);
}
