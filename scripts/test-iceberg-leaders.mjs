import assert from 'node:assert/strict';
import test from 'node:test';
import { projectCoverPoint } from '../src/scripts/iceberg-leaders.ts';

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
