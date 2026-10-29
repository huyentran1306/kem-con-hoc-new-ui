const fs = require('fs');

console.log('Cập nhật src/screens.jsx cho Đợt 14...');
let content = fs.readFileSync('src/screens.jsx', 'utf8');

// 1. Thêm import GocChoiChung và gameStorage
if (!content.includes("import GocChoiChung from './games/GocChoiChung'")) {
  content = content.replace(
    "import TeacherReminderBanner from './TeacherReminderBanner.jsx'",
    "import TeacherReminderBanner from './TeacherReminderBanner.jsx'\nimport GocChoiChung from './games/GocChoiChung'\nimport { getDailyLimitMinutes, setDailyLimitMinutes } from './games/gameStorage'"
  );
}

// 2. Chuyển SnapToy cũ thành SnapToyCameraSection và tạo SnapToy mới gọi GocChoiChung
content = content.replace('export function SnapToy() {', 'function SnapToyCameraSection() {');

const newSnapToyCode = `
export function SnapToy() {
  const { S, stats, go, openSheet, patch, session } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const isTrial = Boolean(session?.isTrial)

  return (
    <GocChoiChung
      child={child}
      stats={stats}
      S={S}
      patch={patch}
      go={go}
      openSheet={openSheet}
      isTrial={isTrial}
      SnapToyLegacyComponent={SnapToyCameraSection}
    />
  )
}
`;

if (!content.includes('export function SnapToy()')) {
  // Chèn newSnapToyCode ngay trước Game()
  content = content.replace(
    '/* ============================================================\n   10. TRÒ CHƠI 10 PHÚT',
    newSnapToyCode + '\n/* ============================================================\n   10. TRÒ CHƠI 10 PHÚT'
  );
}

// 3. Thêm Cài đặt "Thời gian chơi chung mỗi ngày" trong Con tôi (Profile)
const gameTimeLimitCardCode = `
        {/* Cài đặt thời gian chơi chung mỗi ngày (Prompt 24 Chặng 1) */}
        <div className="card" data-testid="card-game-time-limit">
          <span className="lbl plum">⏱ Thời gian chơi chung mỗi ngày</span>
          <b style={{ fontSize: 14, color: 'var(--c-text)', display: 'block', margin: '4px 0 2px' }}>
            Tự động dừng khi hết giờ chơi
          </b>
          <span className="sub" style={{ display: 'block', marginBottom: 10 }}>
            Mỗi ngày mẹ và {child.name} chơi cùng tối đa bao nhiêu phút?
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 5, 10, 15].map((mins) => {
              const active = getDailyLimitMinutes(child.id) === mins
              return (
                <button
                  key={mins}
                  type="button"
                  className={\`btn-km btn-km-s btn-km-chip \${active ? 'active' : ''}\`}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    fontWeight: active ? 800 : 600,
                    background: active ? 'var(--c-accent, #F6A623)' : 'var(--c-surface-2)',
                    color: active ? 'var(--c-on-accent, #fff)' : 'var(--c-text)',
                    border: active ? 'none' : '1px solid var(--c-line)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setDailyLimitMinutes(child.id, mins)
                    toast(\`Đã đặt thời gian chơi chung: \${mins} phút/ngày ⏱\`)
                  }}
                >
                  {mins} phút
                </button>
              )
            })}
          </div>
        </div>
`;

if (!content.includes('card-game-time-limit')) {
  content = content.replace(
    '{/* ===== Nhóm 3 · Cài đặt ===== */}\n      <h2 className="pg-section-title">Cài đặt</h2>\n      <div className="pg-grid2">',
    '{/* ===== Nhóm 3 · Cài đặt ===== */}\n      <h2 className="pg-section-title">Cài đặt</h2>\n      <div className="pg-grid2">\n' + gameTimeLimitCardCode
  );
}

fs.writeFileSync('src/screens.jsx', content, 'utf8');
console.log('✅ screens.jsx đã được cập nhật thành công!');
