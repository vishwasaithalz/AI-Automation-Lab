import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const flow = JSON.parse(readFileSync(new URL('../automation/node-red/netmirror-readonly-check.json', import.meta.url), 'utf8'));
test('Node-RED import is valid and contains only allowlisted nodes', () => {
  assert.ok(Array.isArray(flow) && flow.length >= 7);
  const allowed = new Set(['tab', 'inject', 'function', 'http request', 'debug']);
  assert.ok(flow.every(node => allowed.has(node.type)));
});
test('all check triggers are manual, never scheduled', () => {
  const inject = flow.filter(node => node.type === 'inject');
  assert.equal(inject.length, 3);
  assert.ok(inject.every(n => n.repeat === '' && n.crontab === '' && n.once === false));
});
test('the endpoint workflow is GET-only and does not write files or publish', () => {
  const functions = flow.filter(node => node.type === 'function').map(n => n.func).join('\n');
  assert.ok(functions.includes("msg.method = 'GET'"));
  assert.ok(!flow.some(n => ['file', 'http in', 'http response', 'exec', 'mqtt out', 'tcp out'].includes(n.type)));
  assert.ok(flow.filter(n => n.type === 'inject').every(n => /^https:\/\/netmirror(fit\.ai\.studio|\.fit)\//.test(n.payload)));
});
