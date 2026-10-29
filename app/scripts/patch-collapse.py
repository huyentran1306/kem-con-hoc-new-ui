with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'r') as f:
    c = f.read()

target = '''  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ onboarded: true });
  });'''

replacement = '''  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ onboarded: true });
  });
  const collapseTrial = page.locator('.banner-trial-km button[aria-label="Thu gọn"]').first();
  if (await collapseTrial.isVisible()) {
    await collapseTrial.click();
    await page.waitForTimeout(300);
  }'''

if target in c:
    c = c.replace(target, replacement)
    with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'w') as f:
        f.write(c)
    print('Added collapseTrial to test script')
else:
    print('Target not found')
