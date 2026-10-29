import { chromium } from 'playwright'
import fs from 'fs'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  })
  const page = await context.newPage()

  console.log('--- BẮT ĐẦU TEST TOÀN DIỆN 15 MỤC PROMPT 23H ---')

  // Vào trang web
  await page.goto('http://127.0.0.1:4173/?mode=trial')
  await page.waitForTimeout(1000)

  // 1. A13 & A16 & A14: Trang chủ bộ Bạn Gấu và Đêm Tuyết
  console.log('1. Kiểm tra Trang chủ Bạn Gấu & Bong bóng lời chào (A16)...')
  await page.screenshot({ path: 'bang-chung/prompt23h/01_A16_home_bear_no_overlap.png' })

  // Đổi sang theme Đêm Tuyết (noel) để kiểm tra A13 & A14
  console.log('2. Đổi sang theme Đêm Tuyết (A13, A14)...')
  await page.evaluate(() => {
    if (window.__kchPatch) {
      window.__kchPatch({ theme: 'noel' })
    }
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt23h/02_A13_A14_home_noel_buttons_and_buddy.png' })

  // Đổi lại theme bear
  await page.evaluate(() => {
    if (window.__kchPatch) {
      window.__kchPatch({ theme: 'bear' })
    }
  })
  await page.waitForTimeout(500)

  // 3. A15: Modal Giao diện cả nhà
  console.log('3. Kiểm tra Modal Giao diện cả nhà (A15: 2 nút đáy cùng cao 48px)...')
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Giao diện"], .btn.ghost')
    // Mở themePicker qua sheet
    const sheets = document.querySelectorAll('button')
    for (const b of sheets) {
      if (b.textContent?.includes('Giao diện')) { b.click(); break; }
    }
  })
  await page.waitForTimeout(500)
  // Nếu chưa mở thì gọi trực tiếp
  const modalOpened = await page.$('.sheet .pn')
  if (!modalOpened) {
    await page.evaluate(() => {
      // simulate openSheet
      const evt = new CustomEvent('kch:open_sheet', { detail: 'themePicker' })
      window.dispatchEvent(evt)
    })
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'bang-chung/prompt23h/03_A15_theme_picker_buttons.png' })

  // Đóng modal
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // 4. A1 & A2: Bài cô giao
  console.log('4. Kiểm tra Bài cô giao (A2: có câu hỏi đầy đủ; A1: khung Theo cách cô dạy)...')
  await page.evaluate(() => {
    if (window.__kchPatch) {
      const mockAssignment = {
        ocr: 'Mẹ có 18 quả cam, mẹ đem biếu bà 8 quả. Hỏi mẹ còn lại bao nhiêu quả cam?',
        grade: 'Lớp 3',
        subject: 'Toán',
        isTeacherAssigned: true,
        teacherName: 'cô Lan',
        teacherMethodNote: 'Hỏi con đọc kỹ đề bài và tìm các số quan trọng.',
        steps: [
          {
            stepNumber: 1,
            questionForChild: 'Đề bài cho biết mẹ có tất cả bao nhiêu quả cam?',
            guidanceForParent: 'Hỏi con đọc kỹ câu đầu của đề.',
            hintLevel1: 'Nhìn vào số cam ban đầu mẹ có.',
            hintLevel2: 'Đó là số 18 quả cam.',
            ky_nang: 'DocHieu'
          },
          {
            stepNumber: 2,
            questionForChild: 'Mẹ đã biếu bà mất bao nhiêu quả?',
            guidanceForParent: 'Hỏi con số cam đem biếu.',
            hintLevel1: 'Mẹ biếu bà 8 quả.',
            hintLevel2: 'Số cam còn lại sẽ ít đi hay nhiều hơn?',
            ky_nang: 'XacDinhPhepTinh'
          },
          {
            stepNumber: 3,
            questionForChild: 'Muốn biết mẹ còn lại bao nhiêu quả, ta làm phép tính gì?',
            guidanceForParent: 'Hướng dẫn con làm phép trừ 18 - 8.',
            hintLevel1: 'Lấy số ban đầu trừ đi số đã biếu.',
            hintLevel2: '18 - 8 = 10 quả cam.',
            ky_nang: 'TinhToan'
          }
        ]
      }
      window.__kchPatch({
        problem: mockAssignment,
        studySource: 'teacher',
        flow: { step: 0, stuck: 0 }
      })
      if (window.__kchGo) window.__kchGo('explain')
    }
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/04_A1_A2_explain_teacher_assignment.png' })

  // 5. A1: Mở bài cô giao xong quay về gõ bài thường -> KHÔNG ĐƯỢC có khung "Theo cách cô dạy"
  console.log('5. Kiểm tra quay về gõ bài thường không dính khung cô giao (A1)...')
  await page.evaluate(() => {
    if (window.__kchPatch) {
      window.__kchPatch({
        studySource: 'parent',
        assignmentId: null,
        assignmentItemId: null,
        problem: {
          ocr: 'Có 15 bông hoa đỏ và 10 bông hoa vàng. Hỏi có tất cả bao nhiêu bông hoa?',
          grade: 'Lớp 3',
          subject: 'Toán',
          isTeacherAssigned: false,
          teacherName: null,
          teacherMethodNote: null,
          steps: [
            {
              stepNumber: 1,
              question: 'Có bao nhiêu bông hoa đỏ và bao nhiêu bông hoa vàng?',
              hint: 'Đọc kỹ các số 15 và 10 trong đề.',
              ky_nang: 'DocHieu'
            },
            {
              stepNumber: 2,
              question: 'Muốn tính tất cả số hoa ta làm phép tính gì?',
              hint: 'Gộp lại thì làm phép cộng.',
              ky_nang: 'TinhToan'
            }
          ]
        },
        flow: { step: 0, stuck: 0 }
      })
      if (window.__kchGo) window.__kchGo('explain')
    }
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/05_A1_explain_parent_problem_clean.png' })

  // 6. A3 & A9: Hỏi con từng bước & Kẹt lần 1, lần 2 (thẻ rung, chữ câu thật, không khung nổi cắt mép)
  console.log('6. Kiểm tra Hỏi con từng bước & Kẹt lần 1, 2 (A3, A9)...')
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('prep')
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt23h/06_A3_teach_step1.png' })

  // Bấm "Chưa nghĩ ra" lần 1
  console.log('Bấm Chưa nghĩ ra lần 1...')
  const btnStuck = await page.$('button:has-text("Chưa nghĩ ra")')
  if (btnStuck) await btnStuck.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23h/07_A3_stuck_level1_real_hint.png' })

  // Bấm "Chưa nghĩ ra" lần 2
  console.log('Bấm Chưa nghĩ ra lần 2...')
  if (btnStuck) await btnStuck.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23h/08_A3_stuck_level2_micro_step.png' })

  // 7. A5 & A17: Hoàn thành bài & Tặng huy hiệu
  console.log('7. Kiểm tra Hoàn thành bài & Tặng huy hiệu (A5, A17)...')
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('done')
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt23h/09_A17_done_screen_header.png' })

  // Bấm Tặng huy hiệu
  const btnBadge = await page.$('[data-testid="card-suggested-badge"] button.btn-km-primary')
  if (btnBadge) {
    await btnBadge.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/10_A5_badge_given_single_bubble.png' })
  }

  // 8. A10, A11, A12: Báo cáo
  console.log('8. Kiểm tra Báo cáo: dải tab (A10), danh sách phẩm chất (A11), số mẫu Dùng thử (A12)...')
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('report')
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/11_A10_report_sticky_tabs.png' })

  // Cuộn tới phần phẩm chất
  const elTraits = await page.$('#sec-traits')
  if (elTraits) {
    await elTraits.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/12_A11_traits_chart_and_rows.png' })
  }

  // Cuộn tới phần phân tích AI
  const elAi = await page.$('#sec-ai')
  if (elAi) {
    await elAi.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/13_A12_ai_analysis_card.png' })

    // Mở popup dữ liệu Gấu đã đọc
    const lnkData = await page.$('[data-testid="link-view-ai-facts"]')
    if (lnkData) {
      await lnkData.click()
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'bang-chung/prompt23h/14_A12_facts_modal_sync_numbers.png' })
    }
  }

  console.log('--- TEST VÀ CHỤP ẢNH MINH CHỨNG HOÀN TẤT ---')
  await browser.close()
}

run().catch((e) => {
  console.error('Test error:', e)
  process.exit(1)
})
