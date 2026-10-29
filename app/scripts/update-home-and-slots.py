import re

# 1. Update DefaultCheckWorkEntry in defaultSlots.jsx
with open('src/themes/slots/defaultSlots.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_cw_entry = '''export function DefaultCheckWorkEntry({ onStart, childName }) {
  return (
    <div
      className="card check-work-entry-card"
      data-testid="check-work-entry"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        border: 'var(--border-w, 2px) solid var(--c-accent, #7C3AED)',
        background: 'var(--c-surface)',
        borderRadius: 'var(--radius-card, 18px)',
        position: 'relative',
        boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.06))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: 999,
            background: 'var(--c-accent, #7C3AED)',
            color: 'var(--c-on-accent, #fff)',
          }}
        >
          ✨ Mới · AI Chấm vở
        </span>
        <span style={{ fontSize: 20 }}>📝</span>
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '2px 0 4px', color: 'var(--c-text)' }}>
          Chấm vở {childName || 'con'} đã làm
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
          Chụp bài {childName || 'con'} làm xong. AI tìm đúng bước sai đầu tiên và đưa mẹ câu hỏi để con <b>tự sửa</b>, không chữa hộ.
        </p>
      </div>
      {/* Đợt 15 · 6.2: nút phụ, không tranh với "Bắt đầu bài tối nay" */}
      <button
        data-testid="btn-start-check-work"
        className="btn ghost btn-sm"
        style={{
          alignSelf: 'flex-start',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
        onClick={onStart}
      >
        <span>✨</span>
        <span>Chấm vở ngay</span>
      </button>
    </div>
  )
}'''

new_cw_entry = '''export function DefaultCheckWorkEntry({ onStart, childName }) {
  return (
    <div
      className="card-km card-km-action"
      data-testid="check-work-entry"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 900,
            letterSpacing: '.04em',
            padding: '2px 9px',
            borderRadius: 999,
            background: 'var(--c-accent, #F6A623)',
            color: 'var(--c-on-accent, #fff)',
          }}
        >
          📝 AI Chấm vở
        </span>
        <span style={{ fontSize: 18 }}>✨</span>
      </div>
      <div>
        <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '2px 0 4px', color: 'var(--c-text)' }}>
          Chấm vở {childName || 'con'} đã làm
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--c-sub, #6E5D4E)', lineHeight: 1.4 }}>
          Chụp bài làm xong. AI tìm đúng bước sai đầu tiên và đưa mẹ câu hỏi để con <b>tự sửa</b>, không chữa hộ.
        </p>
      </div>
      <button
        type="button"
        data-testid="btn-start-check-work"
        className="btn-km btn-km-m btn-km-secondary"
        style={{
          alignSelf: 'flex-start',
          marginTop: 4,
          padding: '0 16px',
        }}
        onClick={onStart}
      >
        <span>Chấm vở ngay</span>
        <span>›</span>
      </button>
    </div>
  )
}'''

if old_cw_entry in text:
    text = text.replace(old_cw_entry, new_cw_entry)
    with open('src/themes/slots/defaultSlots.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated DefaultCheckWorkEntry')
else:
    print('Could not find old_cw_entry in defaultSlots.jsx')

