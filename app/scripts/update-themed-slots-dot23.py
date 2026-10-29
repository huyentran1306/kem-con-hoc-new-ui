with open('src/themes/slots/themedSlots.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace ThemedHomeStartSlot
old_start_target = """export function ThemedHomeStartSlot({ onStart, themeId = 'bear' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        data-testid="start-photo"
        className="btn"
        style={{
          background: '#F6A623',
          color: '#4B3621',
          padding: '16px 20px',
          fontSize: 17,
          fontWeight: 800,
          borderRadius: 999,
          boxShadow: '0 6px 0 #C47F0E',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
        onClick={() => onStart?.('photo')}
      >
        <span style={{ fontSize: 24 }}>🍯</span>
        <span>BẮT ĐẦU BÀI TỐI NAY VỚI GẤU</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          data-testid="start-type"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#F0DDC2' }}
          onClick={() => onStart?.('type')}
        >
          <InputModeIcon mode="type" size={18} /> Gõ đề bài
        </button>
        <button
          data-testid="start-voice"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#F0DDC2' }}
          onClick={() => onStart?.('voice')}
        >
          <InputModeIcon mode="voice" size={18} /> Đọc đề cho Gấu
        </button>
      </div>
    </div>
  )
}"""

new_start_code = """export function ThemedHomeStartSlot({ onStart, themeId = 'bear' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        type="button"
        data-testid="start-photo"
        className="btn-km btn-km-l btn-km-primary"
        onClick={() => onStart?.('photo')}
      >
        <span className="btn-km-icon">🍯</span>
        <span className="btn-km-text">Bắt đầu bài tối nay</span>
        <span className="btn-km-arrow">›</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          type="button"
          data-testid="start-type"
          className="btn-km btn-km-m btn-km-secondary"
          onClick={() => onStart?.('type')}
        >
          <InputModeIcon mode="type" size={17} /> Gõ đề bài
        </button>
        <button
          type="button"
          data-testid="start-voice"
          className="btn-km btn-km-m btn-km-secondary"
          onClick={() => onStart?.('voice')}
        >
          <InputModeIcon mode="voice" size={17} /> Đọc đề cho Gấu
        </button>
      </div>
    </div>
  )
}"""

if old_start_target in code:
    code = code.replace(old_start_target, new_start_code)
    print("Replaced ThemedHomeStartSlot")
else:
    print("old_start_target not found")

with open('src/themes/slots/themedSlots.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

