import { chromium } from '@playwright/test'
import { spawn } from 'child_process'

async function run() {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4175', '--strictPort'], { stdio: 'pipe' })
  await new Promise(r => setTimeout(r, 1200))
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  await page.goto('http://localhost:4175/')
  await page.evaluate(() => {
    const trialSession = {
      id: 'fam_trial',
      name: 'Gia đình Dùng Thử',
      role: 'owner',
      isTrial: true,
      token: 'trial_offline_token',
    }
    localStorage.setItem('kem-con-hoc:session', JSON.stringify(trialSession))
    localStorage.setItem('kem-con-hoc:auth', JSON.stringify({ token: 'trial_offline_token', session: trialSession }))
    
    // Set S.screen or fam state
    const trialState = {
      onboarded: true,
      parent: 'Mẹ',
      tone: 'Nhẹ nhàng',
      theme: 'bear',
      children: [{ id: 'na', name: 'Na', emoji: '🦄', grade: 'Lớp 3', book: 'Kết nối tri thức' }],
      childIndex: 0,
    }
    localStorage.setItem('kem-con-hoc:fam:fam_trial', JSON.stringify(trialState))
    localStorage.setItem('kem-con-hoc:v1', JSON.stringify(trialState))
  })

  await page.goto('http://localhost:4175/')
  await page.waitForTimeout(1000)

  const text = await page.evaluate(() => document.body.innerText)
  console.log('--- MOBILE PAGE TEXT ---')
  console.log(text.slice(0, 800))

  await page.screenshot({ path: 'bang-chung/chuyen-dong/debug-mobile.png' })
  await browser.close()
  srv.kill()
}
run().catch(console.error)
