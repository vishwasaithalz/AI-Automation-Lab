import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_CONFIG = resolve(ROOT, 'config/karma-automation-v2.json');

export function auditAutomation(config) {
  const checks = [];
  const check = (name, ok, explanation) => checks.push({ name, passed: Boolean(ok), explanation });
  const policy = config.policy || {};
  const blocked = [
    'auto_install', 'execute_third_party_code', 'auto_publish', 'auto_deploy',
    'auto_merge', 'auto_delete', 'auto_spend', 'cloud_memory'
  ];
  check('review-only operation', config.status === 'review_only' && policy.dry_run === true,
    'Must remain a reviewed dry-run, not an unattended executor.');
  check('external effects gated', blocked.every(key => policy[key] === false),
    'Installation, execution, deployment, publication, expenses and deletion must be disabled.');
  const requiredApprovals = [
    'install', 'execute-third-party-code', 'write-production', 'deploy',
    'publish', 'send-messages', 'delete', 'expense', 'enable-cloud-memory'
  ];
  check('explicit owner approvals', requiredApprovals.every(k => (policy.explicit_approval_for || []).includes(k)),
    'No future workflow can silently bypass owner approval.');
  check('schedule preservation', policy.preserve_existing_schedules === true &&
    (config.orchestrators || []).every(o => !['add_new_schedule', 'create_new_schedule', 'enable_new_schedule'].includes(o.schedule_policy)),
    'Existing automation and Buffer schedules stay unchanged.');
  check('release and posting holds', policy.music_release === 'assets_only_no_publish' &&
    policy.social_delivery === 'existing_buffer_only_post_only_after_owner_approval',
    'Music publication and new social scheduling are disabled.');
  const candidates = config.candidates || [];
  const ids = candidates.map(c => c.id);
  check('registry uniquely identified', ids.length >= 11 && new Set(ids).size === ids.length,
    'Every source project has exactly one selection record.');
  check('source, license and decision present', candidates.every(c =>
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(c.repo || '') &&
    typeof c.license === 'string' && Boolean(c.license) &&
    ['select','conditional','optional','reference','alternate','exclude'].includes(c.decision)),
    'Repository entries must be traceable and explicitly classified.');
  check('unlicensed materials not selected for execution',
    candidates.filter(c => /NO_LICENSE_DETECTED|PER_SKILL_REVIEW/.test(c.license))
      .every(c => c.decision === 'reference' || c.decision === 'exclude'),
    'Unreviewed or unlicensed third-party code must not be adopted.');
  const workflows = config.workstreams || [];
  const owners = new Set((config.orchestrators || []).map(x => x.id).concat(['local-windows','human']));
  check('workstream owners and outputs', workflows.length >= 7 &&
    workflows.every(w => owners.has(w.owner) && Array.isArray(w.outputs) && w.outputs.length > 0),
    'Every workflow has a responsible executor and auditable output.');
  check('no external workflow actions', workflows.every(w =>
    w.external_action === 'none' || w.external_action === 'no_new_scheduler' ||
    w.external_action === 'no_new_schedule_or_post' ||
    w.external_action === 'no_unattended_install'),
    'A review branch must not execute cloud changes or publishing.');
  const passed = checks.every(x => x.passed);
  return {
    schema_version: 2, audit_scope: 'local configuration and policy only',
    generated_at_utc: new Date().toISOString(),
    passed, checks, candidate_count: candidates.length,
    workstream_count: workflows.length,
    not_verified: ['third-party binaries', 'website functionality', 'production deployment', 'scheduled post approval', 'music export fidelity'],
    next_action: passed ? 'Review individual tools, permissions and build receipts before activation' : 'Fix failed configuration gates'
  };
}

if (process.argv[1] && process.argv[1].endsWith('karma-automation-audit.mjs')) {
  const config = JSON.parse(readFileSync(DEFAULT_CONFIG, 'utf8'));
  const result = auditAutomation(config);
  const index = process.argv.indexOf('--out');
  if (index >= 0) {
    if (!process.argv[index + 1]) throw new Error('--out requires a destination');
    const destination = resolve(process.argv[index + 1]);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, JSON.stringify(result, null, 2) + '\n', 'utf8');
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.passed) process.exitCode = 1;
}
