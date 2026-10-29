import fs from 'fs';
import { buddyInnerSVG } from '../src/themes/buddies/buddyArt.js';

const THEME_CONFIGS = {
  tet: { bg1: '#FFE6D5', bg2: '#D9251B', border: '#FFD700', buddyId: 'lion' },
  bear: { bg1: '#FFEBB8', bg2: '#F6A623', border: '#FFFFFF', buddyId: 'bear' },
  noel: { bg1: '#E0F2FE', bg2: '#1E3A8A', border: '#93C5FD', buddyId: 'snowman' },
  candy: { bg1: '#FCE7F3', bg2: '#EC4899', border: '#FFFFFF', buddyId: 'unicorn' },
  sticker: { bg1: '#FEF08A', bg2: '#F59E0B', border: '#1E293B', buddyId: 'unicorn' },
  aurora: { bg1: '#1E1B4B', bg2: '#4338CA', border: '#818CF8', buddyId: 'dragon' },
  notebook: { bg1: '#FEF9C3', bg2: '#D97706', border: '#78350F', buddyId: 'cat' },
  chalk: { bg1: '#064E3B', bg2: '#022C22', border: '#34D399', buddyId: 'star' },
  garden: { bg1: '#064E3B', bg2: '#065F46', border: '#6EE7B7', buddyId: 'sprout' },
  thieunhi: { bg1: '#E0F2FE', bg2: '#0284C7', border: '#BAE6FD', buddyId: 'kite' },
  bento: { bg1: '#FFFFFF', bg2: '#F1F5F9', border: '#E2E8F0', buddyId: 'onigiri' }
};

function generateFavicon(themeId) {
  const conf = THEME_CONFIGS[themeId] || THEME_CONFIGS.bear;
  const buddyId = conf.buddyId;
  const inner = buddyInnerSVG(buddyId, 'idle');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="favBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${conf.bg1}"/>
      <stop offset="100%" stop-color="${conf.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#favBg)"/>
  <rect x="2" y="2" width="96" height="96" rx="22" fill="none" stroke="${conf.border}" stroke-width="2.5" stroke-opacity="0.4"/>
  <g transform="translate(0, 2)">
    <svg viewBox="-8 -10 116 116" width="100" height="100" overflow="visible">
      ${inner}
    </svg>
  </g>
</svg>`;
}

const tetSvg = generateFavicon('tet');
fs.writeFileSync('scripts/tet-favicon.svg', tetSvg);

import('playwright').then(async ({ chromium }) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <div style='background:#18181b; padding:24px; display:inline-flex; gap:16px; align-items:center;'>
      <!-- 16px tab size simulation -->
      <img src='data:image/svg+xml,${encodeURIComponent(tetSvg)}' width='20' height='20' />
      <!-- 32px retina tab size simulation -->
      <img src='data:image/svg+xml,${encodeURIComponent(tetSvg)}' width='36' height='36' />
      <!-- 64px dock/pwa size simulation -->
      <img src='data:image/svg+xml,${encodeURIComponent(tetSvg)}' width='64' height='64' />
      <!-- 128px high res -->
      <img src='data:image/svg+xml,${encodeURIComponent(tetSvg)}' width='128' height='128' />
    </div>
  `);
  await page.screenshot({ path: '/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee/tet-favicon-preview2.png' });
  await browser.close();
  console.log('Saved preview2!');
});
