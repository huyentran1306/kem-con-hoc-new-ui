# 1. khuon-moi.css
with open('/Users/pro/Coding/kem-con-hoc/src/themes/khuon-moi.css', 'r') as f:
    km = f.read()

km = km.replace('.ch-delta.up { color: #B4462F; }', '.ch-delta.up { color: var(--c-danger-ink, #B4462F); }')
km = km.replace('.ch-delta.down { color: #2F7D4F; }', '.ch-delta.down { color: var(--c-good-fg, #2F7D4F); }')

with open('/Users/pro/Coding/kem-con-hoc/src/themes/khuon-moi.css', 'w') as f:
    f.write(km)
print('Patched khuon-moi.css for ch-delta contrast')

# 2. test-prompt23o-all.mjs
with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'r') as f:
    tp = f.read()

target = '''  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['camera']
  });
  const page = await context.newPage();

  const evidenceDir = path.join(process.cwd(), 'bang-chung/prompt23o');
  fs.mkdirSync(evidenceDir, { recursive: true });

  await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(1000);

  // Vào thẳng chế độ Dùng thử nếu đang ở trang Login
  const trialBtn = page.locator('text=Dùng thử không cần tài khoản').first();
  if (await trialBtn.isVisible()) {
    await trialBtn.click();
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ onboarded: true });
  });
  const collapseTrial = page.locator('.banner-trial-km button[aria-label="Thu gọn"]').first();
  if (await collapseTrial.isVisible()) {
    await collapseTrial.click();
    await page.waitForTimeout(300);
  }'''

replacement = '''  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['camera']
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem('kem-con-hoc:session', JSON.stringify({ id: 'fam_na', name: 'Gia đình bé Na', role: 'parent', isTrial: false }));
      localStorage.setItem('kem-con-hoc:onboarded', 'true');
    } catch (e) {}
  });

  const page = await context.newPage();

  const evidenceDir = path.join(process.cwd(), 'bang-chung/prompt23o');
  fs.mkdirSync(evidenceDir, { recursive: true });

  await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ onboarded: true });
  });'''

if target in tp:
    tp = tp.replace(target, replacement)
    with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'w') as f:
        f.write(tp)
    print('Patched test-prompt23o-all.mjs with addInitScript and removed trial mode')
else:
    print('WARNING: target not found in test-prompt23o-all.mjs')
