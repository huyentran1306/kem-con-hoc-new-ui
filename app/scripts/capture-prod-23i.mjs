import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  })
  const page = await context.newPage()

  console.log('Chụp ảnh kiểm thử trực tiếp trên PRODUCTION https://kem-con-hoc-5xf.pages.dev ...')
  await page.goto('https://kem-con-hoc-5xf.pages.dev/?mode=trial')
  await page.waitForTimeout(1500)

  // 1. Mở bài học để vào màn Hỏi con từng bước
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('prep')
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/prod_23i_01_teach_scaffold.png' })
  console.log('1. Đã chụp màn Hỏi con từng bước (Scaffold) trên production.')

  // Bấm Chưa nghĩ ra lần 1 (test A3 & A9)
  const btnStuck = await page.$('button:has-text("Chưa nghĩ ra")')
  if (btnStuck) {
    await btnStuck.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/prod_23i_02_teach_stuck_hint.png' })
    console.log('2. Đã chụp màn Chưa nghĩ ra (A3, A9) trên production.')
  }

  // Chuyển sang màn Done
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('done')
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/prod_23i_03_done_screen.png' })
  console.log('3. Đã chụp màn Xong bài (Done) trên production.')

  // Tặng huy hiệu (test A5)
  const btnBadge = await page.$('[data-testid="card-suggested-badge"] button.btn-km-primary')
  if (btnBadge) {
    await btnBadge.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/prod_23i_04_badge_awarded.png' })
    console.log('4. Đã chụp màn Tặng huy hiệu (A5) trên production.')
  }

  // Kiểm tra bộ Đêm Tuyết (noel)
  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ theme: 'noel' })
    if (window.__kchGo) window.__kchGo('home')
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/prod_23i_05_noel_soft_flat.png' })
  console.log('5. Đã chụp trang chủ Đêm Tuyết nút phẳng mềm trên production.')

  await browser.close()
  console.log('Hoàn thành chụp ảnh production!')
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
