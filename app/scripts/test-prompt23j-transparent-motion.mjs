import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  })
  const page = await context.newPage()

  console.log('=== TEST PROMPT 23J: KHUNG TRONG SUỐT & BONG BÓNG KHÔNG ĐÈ THẺ MẸ ===')
  await page.goto('http://127.0.0.1:4173/?mode=trial')
  await page.waitForTimeout(1000)

  // 1. Vào màn Hỏi con từng bước
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('prep')
  })
  await page.waitForTimeout(600)

  // Bấm "Con làm được!" để kích hoạt hiệu ứng xong một bậc (step_done)
  console.log('Bấm "Con làm được!" -> Chụp ngay hiệu ứng hũ mật...')
  const btnDoneStep = await page.$('button:has-text("Con làm được!")')
  if (btnDoneStep) {
    await btnDoneStep.click()
    // Chụp ngay lập tức khi hiệu ứng đang bay (khoảng 300ms sau khi bấm)
    await page.waitForTimeout(300)
    await page.screenshot({ path: 'bang-chung/prompt23h/23j_01_step_done_transparent.png' })
    console.log('1. Đã chụp 23j_01_step_done_transparent.png')
  }

  // 2. Chuyển sang màn Done
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('done')
  })
  await page.waitForTimeout(800)

  // Bấm "Tặng huy hiệu" để kích hoạt sticker bay (fly / badge_given) và bong bóng linh vật
  console.log('Bấm "Tặng huy hiệu" -> Chụp ngay sticker bay và bong bóng linh vật...')
  const btnBadge = await page.$('[data-testid="card-suggested-badge"] button.btn-km-primary')
  if (btnBadge) {
    await btnBadge.click()
    // Chụp ngay khi sticker đang bay (300ms)
    await page.waitForTimeout(350)
    await page.screenshot({ path: 'bang-chung/prompt23h/23j_02_badge_fly_transparent.png' })
    console.log('2. Đã chụp 23j_02_badge_fly_transparent.png (sticker bay trong suốt)')

    // Đợi thêm để bong bóng linh vật hiển thị đầy đủ ngay trên thanh nút đáy (không đè thẻ Dành cho mẹ)
    await page.waitForTimeout(600)
    await page.screenshot({ path: 'bang-chung/prompt23h/23j_03_bubble_above_bottom_bar.png' })
    console.log('3. Đã chụp 23j_03_bubble_above_bottom_bar.png (bong bóng không đè thẻ mẹ)')
  }

  await browser.close()
  console.log('=== TEST PROMPT 23J HOÀN TẤT ===')
}

run().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
