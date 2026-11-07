// Read-only public deployment check. No credentials or private endpoints.
const targets = [
  ['SentinelPulse', 'https://karma-sentinelpulse.vercel.app/'],
  ['SERPMatrix', 'https://karma-serpmatrix.vercel.app/'],
  ['CloudHardener', 'https://karma-cloudhardener.vercel.app/'],
  ['ApexVitals', 'https://karma-apexvitals.vercel.app/'],
];
let failed = 0;
for (const [name, url] of targets) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { Accept: 'text/html' },
    });
    const body = await response.text();
    const expected = '<title>' + name + ' | KARMA Engineering Lab</title>';
    const html = response.status === 200 && body.includes(expected)
      && body.includes('id="result"') && body.includes('id="status"');
    console.log(name + ': HTTP ' + response.status + ', expected HTML ' + (html ? 'YES' : 'NO')
      + ', final host ' + new URL(response.url).hostname);
    if (!html) failed++;
  } catch (error) {
    failed++;
    console.error(name + ': unreachable: ' + String(error.message ?? error));
  }
}
console.log('KARMA website probe: ' + (targets.length - failed) + '/' + targets.length + ' verified');
if (failed) process.exitCode = 1;
