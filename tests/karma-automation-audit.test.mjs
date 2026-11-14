import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditAutomation } from '../src/karma-automation-audit.mjs';

const canonical = JSON.parse(readFileSync(
  new URL('../config/karma-automation-v2.json', import.meta.url), 'utf8'
));
const clone = () => JSON.parse(JSON.stringify(canonical));

test('the staged configuration satisfies every safety gate', () => {
  const result = auditAutomation(canonical);
  assert.equal(result.passed, true, JSON.stringify(result.checks.filter(c => !c.passed)));
  assert.ok(result.candidate_count >= 11);
  assert.ok(result.workstream_count >= 7);
});
test('a publishing switch is rejected', () => {
  const config = clone();
  config.policy.auto_publish = true;
  assert.equal(auditAutomation(config).passed, false);
});
test('unauthorized scheduling is rejected', () => {
  const config = clone();
  config.policy.preserve_existing_schedules = false;
  assert.equal(auditAutomation(config).passed, false);
});
test('missing owner approval is rejected', () => {
  const config = clone();
  config.policy.explicit_approval_for = config.policy.explicit_approval_for.filter(x => x !== 'publish');
  assert.equal(auditAutomation(config).passed, false);
});
test('unlicensed materials cannot be selected as a tool', () => {
  const config = clone();
  config.candidates.find(c => c.id === 'faceless-content').decision = 'select';
  assert.equal(auditAutomation(config).passed, false);
});
test('duplicate tool ids are rejected', () => {
  const config = clone();
  config.candidates[1].id = config.candidates[0].id;
  assert.equal(auditAutomation(config).passed, false);
});
