import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAnalyticsConsent, analyticsPermitted } from '../src/lib/analytics-consent.ts';
import { analyticsConsentVersion } from '../src/data/analytics.ts';

test('a fresh explicit grant is accepted and an explicit refusal is preserved',()=>{
  assert.equal(parseAnalyticsConsent(JSON.stringify({version:analyticsConsentVersion,allowed:true})),true);
  assert.equal(parseAnalyticsConsent(JSON.stringify({version:analyticsConsentVersion,allowed:false})),false);
});
test('missing, malformed, stale and non-boolean choices never authorize analytics',()=>{
  for(const raw of [null,'broken','[]','{}',JSON.stringify({version:'2026-10-01',allowed:true}),JSON.stringify({version:analyticsConsentVersion,allowed:'true'})]) assert.equal(parseAnalyticsConsent(raw),null);
});
test('only an explicit grant on the exact production host permits collection',()=>{
  assert.equal(analyticsPermitted('gorodickaya.ru',true),true);
  for(const host of ['goroditskaya.vercel.app','127.0.0.1','gorodickaya.ru.example.com','www.gorodickaya.ru']) assert.equal(analyticsPermitted(host,true),false);
  assert.equal(analyticsPermitted('gorodickaya.ru',false),false);
  assert.equal(analyticsPermitted('gorodickaya.ru',null),false);
});
