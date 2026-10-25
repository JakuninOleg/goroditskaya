import assert from 'node:assert/strict';
import test from 'node:test';
import { projectCoverPoint, leaderPath, depthSourcePoint } from '../src/scripts/iceberg-leaders.ts';

test('An uncropped photo preserves its source coordinates', () => {
  const point=projectCoverPoint({left:20,top:40,width:1000,height:500},{width:1000,height:500},{x:.56,y:.26});
  assert.equal(point.x,580);
  assert.equal(point.y,170);
});
test('A narrow cover frame accounts for the 52% horizontal crop', () => {
  const point=projectCoverPoint({left:0,top:0,width:500,height:500},{width:1000,height:500},{x:.5,y:.5});
  assert.equal(point.x,240);
  assert.equal(point.y,250);
});

const coordinates=path=>path.match(/-?\d+(?:\.\d+)?/g).map(Number);
test('Mobile depth leader starts inside the underwater mass, above the bottom tip',()=>{
  for(const [width,height] of [[375,445],[440,480]]){
    const p=projectCoverPoint({left:0,top:0,width,height},{width:1916,height:821},depthSourcePoint(true));
    assert(p.y>=height*.5&&p.y<=height*.65);
    assert(p.x>width*.35&&p.x<width*.65);
  }
  assert.equal(depthSourcePoint(false).y,.65);
});
test('Desktop callouts reach the panel horizontally without a corner',()=>{
  const values=coordinates(leaderPath({x:300,y:90},{x:580,y:160},'horizontal'));
  assert.deepEqual(values.slice(0,2),[300,90]);
  assert.deepEqual(values.slice(-2),[580,160]);
  assert.equal(values[3],90);
  assert.equal(values[5],160);
  assert(values[2]>300&&values[4]<580);
});
test('Mobile callouts arrive vertically and keep their curve between endpoints',()=>{
  for(const [direction,endY] of [['down',500],['up',300]]){
    const values=coordinates(leaderPath({x:225,y:400},{x:220,y:endY},direction));
    assert.deepEqual(values.slice(-2),[220,endY]);
    assert.equal(values[4],220);
    assert(values[3]>Math.min(400,endY)&&values[3]<Math.max(400,endY));
    assert(values[5]>Math.min(400,endY)&&values[5]<Math.max(400,endY));
  }
});
