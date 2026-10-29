import { chromium } from '@playwright/test'
import { spawn } from 'child_process'

async function run() {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4175', '--strictPort'], { stdio: 'pipe' })
  await new Promise(r => setTimeout(r, 1200))
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  await page.route('**', async (route) => {
    const url = route.request().url()
    if (url.includes('/api/v1/admin/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          admin: { id: 'adm_1', email: 'admin@kemconhoc.vn', name: 'Quản trị viên', role: 'superadmin' }
        })
      })
    }
    if (url.includes('/db/kv/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, value: null })
      })
    }
    if (url.includes('/api/v1/admin/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: {} })
      })
    }
    return route.continue()
  })

  await page.goto('http://localhost:4175/')
  await page.evaluate(() => {
    localStorage.setItem('kem-con-hoc:admin-token', 'adm_mock_token_dot22')
  })
  await page.goto('http://localhost:4175/#admin/giao-dien')
  await page.waitForTimeout(1000)

  const btnMotion = page.locator('[data-testid="btn-tab-motion-preview"]')
  await btnMotion.click()
  await page.waitForTimeout(600)

  console.log('Clicked btnMotion. Checking AdminMotionPreviewTab...')
  const previewTab = page.locator('[data-testid="admin-motion-preview"]')
  console.log('previewTab isVisible:', await previewTab.isVisible())

  // Chụp ảnh bear
  await page.screenshot({ path: 'bang-chung/chuyen-dong/theme-bear.png' })
  console.log('Captured theme-bear.png')

  // Chọn Khu Vườn Đêm
  const chipGarden = page.locator('button:has-text("Khu Vườn Đêm")')
  console.log('chipGarden count:', await chipGarden.count())
  if (await chipGarden.count() > 0) {
    await chipGarden.first().click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/chuyen-dong/theme-garden.png' })
    console.log('Captured theme-garden.png')
  }

  // Chọn Đêm Tuyết
  const chipNoel = page.locator('button:has-text("Đêm Tuyết")')
  console.log('chipNoel count:', await chipNoel.count())
  if (await chipNoel.count() > 0) {
    await chipNoel.first().click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/chuyen-dong/theme-noel.png' })
    console.log('Captured theme-noel.png')
  }

  // Chuyển sang ma trận
  const btnMatrix = page.locator('button:has-text("Lưới tổng thể 6 x 11")')
  console.log('btnMatrix count:', await btnMatrix.count())
  if (await btnMatrix.count() > 0) {
    await btnMatrix.first().click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: 'bang-chung/chuyen-dong/matrix-6x11.png' })
    console.log('Captured matrix-6x11.png')
  }

  await browser.close()
  srv.kill()
}
run().catch(console.error)
