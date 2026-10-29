import re

# 1. Update EditChildSheet in src/App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

old_books_section = '''      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
          {BOOKS.map((x) => (
            <button key={x} type="button" className={`opt col ${book === x ? 'on' : ''}`} onClick={() => setBook(x)}>{x}</button>
          ))}
        </div>
      </div>'''

new_books_section = '''      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {BOOKS.map((x) => (
            <button
              key={x}
              type="button"
              className={`btn-km btn-km-s ${book === x ? 'btn-km-primary' : 'btn-km-secondary'}`}
              style={{ minHeight: 32, padding: '0 12px', fontSize: 12 }}
              onClick={() => setBook(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>'''

if old_books_section in app_text:
    app_text = app_text.replace(old_books_section, new_books_section)
    print('Updated BOOKS section to horizontal chips in App.jsx')

# Loại bỏ hai thẻ xoá dữ liệu trong EditChildSheet
old_clear_section = '''      {/* ĐỢT 19 · CHẶNG 5: NHỮNG GÌ GẤU NHỚ - LỊCH SỬ HUY HIỆU */}
      <div className="card" style={{ border: '1.5px dashed #F59E0B', background: '#FFFBEB' }}>
        <b style={{ fontSize: 13.5, color: '#B45309' }}>Những gì Gấu nhớ · Lịch sử huy hiệu</b>
        <p style={{ fontSize: 12, color: '#92400E', margin: '3px 0 8px' }}>
          Lịch sử huy hiệu: <b>{childBadges.length} huy hiệu</b> {childBadges.length > 0 ? `từ ${earliestDate}` : ''}.
        </p>
        <button
          type="button"
          id="btn-clear-child-badges"
          className="btn ghost btn-sm"
          onClick={handleClearBadgeHistory}
          style={{ color: '#D97706', borderColor: '#FCD34D' }}
        >
          🗑 Xoá lịch sử huy hiệu của {child?.name || 'bé'}
        </button>
      </div>

      <div className="card" style={{ border: '1.5px dashed #FCA5A5', background: '#FEF2F2' }}>
        <b style={{ fontSize: 13.5, color: '#991B1B' }}>Xoá lịch sử học của {child?.name || 'bé'}</b>
        <p style={{ fontSize: 12, color: '#7F1D1D', margin: '3px 0 8px' }}>
          Xoá các sự kiện học tập và hồ sơ hay kẹt/đã vững của riêng bé này trên hệ thống.
        </p>
        <button
          type="button"
          id="btn-clear-child-history"
          className="btn ghost btn-sm danger"
          onClick={handleClearHistory}
          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
        >
          🗑 Xoá lịch sử học của bé
        </button>
      </div>'''

if old_clear_section in app_text:
    app_text = app_text.replace(old_clear_section, '')
    print('Removed clear history cards from EditChildSheet')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_text)

# 2. Update Profile in src/screens.jsx
with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    screens_text = f.read()

# Đổi ô tích checkbox "Nhận lời khuyên cách kèm" thành Switch
old_coach_checkbox = '''      {/* Đợt 20 · Chặng 4: Nhận lời khuyên cách kèm */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐻</span>
          <div>
            <b style={{ fontSize: 14 }}>Nhận lời khuyên cách kèm</b>
            <div className="sub" style={{ fontSize: 12 }}>Gấu phân tích nhịp học và góp ý sư phạm sau mỗi bài</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={child.receiveCoachAdvice !== false}
          onChange={(e) => {
            const updatedChildren = S.children.map(c => c.id === child.id ? { ...c, receiveCoachAdvice: e.target.checked } : c)
            patch({ children: updatedChildren })
            toast(e.target.checked ? "Đã bật lời khuyên cách kèm" : "Đã tắt lời khuyên cách kèm")
          }}
          style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#F59E0B" }}
        />
      </div>'''

new_coach_switch = '''      {/* Nhận lời khuyên cách kèm (công tắc switch) */}
      <div className="card-km" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", marginBottom: 12, background: 'var(--c-surface)' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐻</span>
          <div>
            <b style={{ fontSize: 14, color: 'var(--c-text)' }}>Nhận lời khuyên cách kèm</b>
            <div style={{ fontSize: 12, color: 'var(--c-sub)' }}>Gấu góp ý sư phạm sau mỗi bài học</div>
          </div>
        </div>
        <Switch
          on={child.receiveCoachAdvice !== false}
          onChange={(val) => {
            const updatedChildren = S.children.map(c => c.id === child.id ? { ...c, receiveCoachAdvice: val } : c)
            patch({ children: updatedChildren })
            toast(val ? "Đã bật lời khuyên cách kèm" : "Đã tắt lời khuyên cách kèm")
          }}
          label="Nhận lời khuyên cách kèm"
        />
      </div>'''

if old_coach_checkbox in screens_text:
    screens_text = screens_text.replace(old_coach_checkbox, new_coach_switch)
    print('Updated coach advice to Switch in Profile')

# Đổi Lịch trực ca thành hàng 5 ô ngày bấm
old_schedule_card = '''        <div className="card sky pg-span">
          <span className="lbl sky">Lịch chia ca T2 đến T6</span>
          {schedule.map((d, i) => (
            <div className="row" key={d.day}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <b style={{ width: 28 }}>{d.day}</b>
                <span className={`pill ${d.owner === 'Bố' ? 'b' : 'p'}`}>{d.owner}</span>
              </div>
              <Switch
                on={d.owner === 'Bố'}
                onChange={() => toggleOwner(i)}
                label={`Ca ${d.day}: đổi người trực (đang là ${d.owner})`}
              />
            </div>
          ))}
          <span className="sub">Người trực ca sẽ thấy lời nhắc khi mở app buổi tối · bấm công tắc để đổi mẹ hoặc bố</span>
        </div>'''

new_schedule_card = '''        <div className="card-km pg-span" style={{ padding: '14px 16px', background: 'var(--c-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 14, color: 'var(--c-text)' }}>Lịch chia ca T2 đến T6</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Chạm vào ô để đổi Bố hoặc Mẹ</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
            {schedule.slice(0, 5).map((d, i) => {
              const isDad = d.owner === 'Bố'
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleOwner(i)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 12,
                    background: isDad ? 'var(--c-primary-light, #EFF6FF)' : 'var(--c-surface-2, #FDF2F8)',
                    border: isDad ? '1.5px solid var(--c-primary, #3B82F6)' : '1.5px solid #F472B6',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  title={`Ca ${d.day}: ${d.owner} (Chạm để đổi)`}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)' }}>{d.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: isDad ? '#1D4ED8' : '#BE185D' }}>{d.owner}</span>
                </button>
              )
            })}
          </div>
        </div>'''

if old_schedule_card in screens_text:
    screens_text = screens_text.replace(old_schedule_card, new_schedule_card)
    print('Updated schedule to 5-cell row in Profile')

with open('src/screens.jsx', 'w', encoding='utf-8') as f:
    f.write(screens_text)
