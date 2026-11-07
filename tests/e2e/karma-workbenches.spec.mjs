import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const sites = [
  ['SentinelPulse', 'https://karma-sentinelpulse.vercel.app/'],
  ['SERPMatrix', 'https://karma-serpmatrix.vercel.app/'],
  ['CloudHardener', 'https://karma-cloudhardener.vercel.app/'],
  ['ApexVitals', 'https://karma-apexvitals.vercel.app/'],
  ['ZeroAuth', 'https://karma-zeroauth.vercel.app/'],
  ['SpectraUI', 'https://karma-spectra-ui.vercel.app/'],
];

test.setTimeout(75000);

for (const [name, url] of sites) {
  test(name + ' desktop and mobile render, with screenshots', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await mkdir('e2e-artifacts/screenshots', { recursive: true });
    await page.screenshot({ path: 'e2e-artifacts/screenshots/' + name + '-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'e2e-artifacts/screenshots/' + name + '-mobile.png', fullPage: true });
    expect(errors, 'Uncaught browser-side exceptions').toEqual([]);
  });
}

test('SentinelPulse detects a signature and generates a new CSP nonce', async ({ page }) => {
  await page.goto(sites[0][1]);
  await page.locator('#payload').fill('<script>alert(1)</script>');
  await page.locator('#inspect').click();
  await expect(page.locator('#status')).toContainText('BLOCKED');
  await expect(page.locator('#result')).toContainText('script_tag');
  await page.locator('#nonce').click();
  await expect(page.locator('#result')).toContainText('nonce-');
  await page.locator('#reset').click();
  await expect(page.locator('#status')).toContainText('RESET');
});

test('SERPMatrix audits HTML and generates escaped XML', async ({ page }) => {
  await page.goto(sites[1][1]);
  await page.locator('#audit').click();
  await expect(page.locator('#result')).toContainText('images_without_dimensions');
  await page.locator('#urlinput').fill('https://example.org/?a=1&b=2');
  await page.locator('#sitemap').click();
  await expect(page.locator('#result')).toContainText('&amp;');
});

test('CloudHardener flags risky Kubernetes policy without network access', async ({ page }) => {
  await page.goto(sites[2][1]);
  await page.locator('#insecure').click();
  await page.locator('#analyze').click();
  await expect(page.locator('#status')).toContainText('FINDINGS');
  await expect(page.locator('#result')).toContainText('privileged');
});

test('ApexVitals measures route glyphs and generates real gzip download', async ({ page }) => {
  await page.goto(sites[3][1]);
  await page.locator('#inspect').click();
  await expect(page.locator('#result')).toContainText('glyphCount');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#compress').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('route.html.gz');
  await expect(page.locator('#status')).toContainText('GZIP GENERATED');
});

test('ZeroAuth reports actual WebAuthn browser capability', async ({ page }) => {
  await page.goto(sites[4][1]);
  await page.locator('#check').click();
  await expect(page.locator('#result')).toContainText('secureContext');
  await expect(page.locator('#result')).toContainText('webAuthn');
});

test('ZeroAuth registers and verifies a virtual WebAuthn ES256 authenticator', async ({ page }) => {
  await page.goto(sites[4][1]);
  const session = await page.context().newCDPSession(page);
  await session.send('WebAuthn.enable', { enableUI: false });
  await session.send('WebAuthn.addVirtualAuthenticator', { options: {
    protocol: 'ctap2',
    transport: 'internal',
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
    automaticPresenceSimulation: true
  } });
  await page.locator('#register').click();
  await expect(page.locator('#status')).toContainText('REGISTERED', { timeout: 30000 });
  await page.locator('#login').click();
  await expect(page.locator('#status')).toContainText('SIGNATURE VERIFIED', { timeout: 30000 });
  await expect(page.locator('#result')).toContainText('"verified": true');
  await session.detach();
});

test('Spectra UI computes real contrast and operates keyboard tabs, modal and table', async ({ page }) => {
  await page.goto(sites[5][1]);
  await expect(page.locator('#ratio')).toContainText(':1');
  await page.locator('#fg').fill('#000000');
  await page.locator('#bg').fill('#ffffff');
  await expect(page.locator('#ratio')).toContainText('21.00:1');
  await expect(page.locator('#grades')).toContainText('AAA normal PASS');
  await page.locator('#tab-actions').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-data')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#pane-data')).toBeVisible();
  await page.getByRole('button', { name: 'Project' }).click();
  await expect(page.locator('th').first()).toHaveAttribute('aria-sort', 'ascending');
  await page.locator('#tab-actions').click();
  await page.locator('#modal-open').click();
  await expect(page.locator('#dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#dialog')).not.toBeVisible();
});
