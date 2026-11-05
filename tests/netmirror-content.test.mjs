import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeNewsAge,selectUpcoming,safeProviderLabel,contentWarnings} from '../src/guards/netmirror-content.mjs';
const now=new Date('2026-11-05T12:00:00Z');
test('rejects invalid and future news timestamps',()=>{assert.equal(normalizeNewsAge('invalid',now),null);assert.equal(normalizeNewsAge('2030-01-01',now),null);assert.equal(normalizeNewsAge('2026-11-05T10:00:00Z',now),'2h ago')});
test('upcoming only future dated titles',()=>{const r=selectUpcoming([{title:'Dune',releaseDate:'2021-01-01'},{title:'Future',releaseDate:'2026-12-01'},{title:'Undated'},{title:'Already released',releaseDate:'2027-01-01',status:'released'}],now);assert.deepEqual(r.map(x=>x.title),['Future'])});
test('provider label requires evidence',()=>{assert.equal(safeProviderLabel({provider:'Netflix'}),'Availability unverified');assert.equal(safeProviderLabel({provider:'Netflix',providerVerified:true,licenseEvidenceUrl:'https://example.com/evidence'}),'Netflix')});
test('claims flagged without supporting evidence',()=>assert.deepEqual(contentWarnings({badge:'Verified HD',provider:'Netflix'}),['Unsubstantiated verification claim','Provider attribution lacks evidence']));
