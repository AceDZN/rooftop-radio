import {it,expect} from 'vitest';
import {Bone,Group,Vector3} from 'three';
import {solveArm} from '../src/arm-ik';

it('places a real wrist on a reachable grip under rotated, scaled parents',()=>{
  const body=new Group();body.position.set(3,2,-4);body.rotation.y=Math.PI/3;body.scale.setScalar(1.85);
  const upper=new Bone(),forearm=new Bone(),hand=new Bone();body.add(upper);upper.add(forearm);forearm.add(hand);forearm.position.y=.3;hand.position.y=.28;body.updateWorldMatrix(true,true);
  const target=body.localToWorld(new Vector3(.18,.38,-.14));const before=body.position.clone();
  const error=solveArm(upper,forearm,hand,target);
  expect(error).toBeLessThan(.015);expect(body.position.equals(before)).toBe(true);
  expect(upper.quaternion.length()).toBeCloseTo(1,6);expect(forearm.quaternion.length()).toBeCloseTo(1,6);
});

it('keeps an unreachable grip finite and reports its remaining distance',()=>{
  const upper=new Bone(),forearm=new Bone(),hand=new Bone();upper.add(forearm);forearm.add(hand);forearm.position.y=.3;hand.position.y=.28;
  const root=new Group();root.add(upper);root.updateWorldMatrix(true,true);
  const error=solveArm(upper,forearm,hand,new Vector3(2,2,2));
  expect(Number.isFinite(error)).toBe(true);expect(error).toBeGreaterThan(2);expect(hand.getWorldPosition(new Vector3()).length()).toBeLessThanOrEqual(.581);
});
