with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'r') as f:
    c = f.read()

# 1. Add context.addInitScript right after context creation
old_init = '''  const page = await context.newPage();

  // Mở app
  await page.goto(APP_URL, { waitUntil: 'networkidle' });'''

new_init = '''  await context.addInitScript(() => {
    try {
      localStorage.setItem('kem-con-hoc:session', JSON.stringify({ id: 'fam_na', name: 'Gia đình bé Na', isTrial: false, role: 'parent' }));
      localStorage.setItem('kem-con-hoc:onboarded', 'true');
    } catch (e) {}
  });

  const page = await context.newPage();

  // Mở app
  await page.goto(APP_URL, { waitUntil: 'networkidle' });'''

if old_init in c:
    c = c.replace(old_init, new_init)
    print('Added context.addInitScript')
else:
    print('WARNING: old_init not found')

# 2. Fix closeSheet in screenshot section
old_ss = '''      // Ảnh 2: Lớp học của con
      await page.evaluate(() => window.__kchGo && window.__kchGo('profile'));
      await page.waitForTimeout(300);
      const cBtn = page.locator('text=Lớp học của con').first();
      if (await cBtn.isVisible()) {
        await cBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(evidenceDir, `${theme}_2_lop_hoc.png`) });
        const closeSheet = page.locator('.sheet-t5-close, button:has-text("✕")').first();
        if (await closeSheet.isVisible()) await closeSheet.click();
        await page.waitForTimeout(200);
      }'''

new_ss = '''      // Ảnh 2: Lớp học của con
      await page.evaluate(() => window.__kchGo && window.__kchGo('profile'));
      await page.waitForTimeout(300);
      const cBtn = page.locator('text=Lớp học của con').first();
      if (await cBtn.isVisible()) {
        await cBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(evidenceDir, `${theme}_2_lop_hoc.png`) });
        await closeOpenSheet();
      }'''

if old_ss in c:
    c = c.replace(old_ss, new_ss)
    print('Fixed screenshot closeSheet')
else:
    print('WARNING: old_ss not found')

with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'w') as f:
    f.write(c)
