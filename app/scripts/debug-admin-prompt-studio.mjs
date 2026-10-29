import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  // Thử các viewport khác nhau: 390x844 (mobile), 800x600 (tablet), 1200x800 (desktop)
  const viewports = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'laptop-1024', width: 1024, height: 768 },
    { name: 'desktop-1280', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    
    // Đặt token admin và truy cập
    await page.goto('http://localhost:4175');
    await page.evaluate(() => {
      localStorage.setItem('kem_admin_session', JSON.stringify({ token: 'mock-admin-token', email: 'admin@kemconhoc.vn' }));
    });
    
    // Mở trang Admin
    await page.goto('http://localhost:4175/#/admin');
    await page.waitForTimeout(1000);

    // Chuyển sang subtab Prompt Studio
    await page.evaluate(() => {
      // Tìm nút Prompt Studio hoặc click
      const btns = Array.from(document.querySelectorAll('button, a'));
      const psBtn = btns.find(b => b.innerText && (b.innerText.includes('Prompt Studio') || b.innerText.includes('prompts')));
      if (psBtn) psBtn.click();
    });
    await page.waitForTimeout(800);

    // Kiểm tra cấu trúc DOM và bounding rect
    const info = await page.evaluate(() => {
      const psGrid = document.querySelector('.aip-ps-grid');
      const psRoot = document.querySelector('.aip-ps');
      const side = document.querySelector('.aip-ps-side');
      const editor = document.querySelector('.aip-ps-editor');
      const bench = document.querySelector('.aip-ps-bench');
      const header = document.querySelector('.aip-head, .s-pagehead');
      
      const getB = (el) => el ? {
        x: el.getBoundingClientRect().x,
        y: el.getBoundingClientRect().y,
        w: el.getBoundingClientRect().width,
        h: el.getBoundingClientRect().height,
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
      } : null;

      return {
        bodyScrollW: document.body.scrollWidth,
        windowW: window.innerWidth,
        psRoot: getB(psRoot),
        psGrid: getB(psGrid),
        side: getB(side),
        editor: getB(editor),
        bench: getB(bench),
      };
    });

    console.log(`\n=== VIEWPORT: ${vp.name} ===`);
    console.log(JSON.stringify(info, null, 2));

    await page.screenshot({ path: `bang-chung/prompt-studio-${vp.name}.png` });
    await page.close();
  }

  await browser.close();
}

run().catch(console.error);
