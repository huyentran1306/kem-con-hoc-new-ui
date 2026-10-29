with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = "function TypeProblemSheet({ initialMode, autoMic = false }) {"
end_marker = "/* ---------- SỔ DÁN STICKER CỦA BÉ ---------- */"

start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_comp = '''function TypeProblemSheet({ initialMode, autoMic = false }) {
  const { S, patch, go, closeSheet, toast, session } = useContext(AppCtx)
  const isTrial = Boolean(session?.isTrial)
  const [text, setText] = useState(isTrial ? PRELOADED_TRIAL_LESSONS[0].de_bai : PROBLEM.ocr)
  const save = () => {
    patch({ flow: { ...S.flow, ocr: text.trim() || PROBLEM.ocr } })
    closeSheet()
    toast('Đã nhận đề, AI đang đọc…')
    go('analyze')
  }

  const handleVoiceInput = (speechText) => {
    soundSuccess()
    setText((prev) => (prev ? prev + ' ' + speechText : speechText))
    toast('🎙️ Đã nhận diện: "' + speechText + '"')
  }

  return (
    <Sheet>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--c-text)' }}>Đề bài hôm nay</h3>
        <button className="btn-km-circle" style={{ width: 32, height: 32, fontSize: 13 }} onClick={closeSheet} aria-label="Đóng">✕</button>
      </div>

      {/* 1. Ô nhập lên đầu */}
      <textarea
        className="ta big"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'var(--c-bg)',
          border: '1.5px solid var(--c-line)',
          borderRadius: 14,
          padding: 12,
          fontSize: 14.5,
          fontFamily: 'inherit',
          color: 'var(--c-text)',
          minHeight: 110,
          resize: 'none',
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Gõ hoặc dán đề bài của con..."
      />

      {/* 2. Đề mẫu thành 3 chip Toán, Tiếng Việt, Tiếng Anh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', margin: '4px 0 8px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)' }}>Thử đề mẫu:</span>
        <button
          type="button"
          className={`btn-km btn-km-s btn-km-chip ${text === PRELOADED_TRIAL_LESSONS[0].de_bai ? 'active' : ''}`}
          onClick={() => {
            setActiveTrialLesson(PRELOADED_TRIAL_LESSONS[0].id)
            setText(PRELOADED_TRIAL_LESSONS[0].de_bai)
          }}
        >
          Toán
        </button>
        <button
          type="button"
          className={`btn-km btn-km-s btn-km-chip ${text === PRELOADED_TRIAL_LESSONS[1].de_bai ? 'active' : ''}`}
          onClick={() => {
            setActiveTrialLesson(PRELOADED_TRIAL_LESSONS[1].id)
            setText(PRELOADED_TRIAL_LESSONS[1].de_bai)
          }}
        >
          Tiếng Việt
        </button>
        <button
          type="button"
          className={`btn-km btn-km-s btn-km-chip ${text === PRELOADED_TRIAL_LESSONS[2].de_bai ? 'active' : ''}`}
          onClick={() => {
            setActiveTrialLesson(PRELOADED_TRIAL_LESSONS[2].id)
            setText(PRELOADED_TRIAL_LESSONS[2].de_bai)
          }}
        >
          Tiếng Anh
        </button>
      </div>

      {/* 3. Nút Đọc cho Gấu nghe */}
      <div style={{ marginBottom: 12 }}>
        <VoiceInputBtn onResult={handleVoiceInput} placeholder="🎙 Đọc cho Gấu nghe" autoStart={autoMic} />
      </div>

      {/* 4. Nút dính đáy Lớn 56px */}
      <div style={{ margin: '8px -20px -20px', padding: '12px 18px 20px', background: 'var(--c-surface)', borderTop: '1px solid var(--c-line)' }}>
        <button
          type="button"
          className="btn-km btn-km-l btn-km-primary"
          onClick={save}
          data-testid="btn-submit-type-problem"
        >
          <span className="btn-km-icon">🔎</span>
          <span className="btn-km-text">Gấu đọc đề này</span>
          <span className="btn-km-arrow">›</span>
        </button>
      </div>
    </Sheet>
  )
}

'''
    code = code[:start_idx] + new_comp + code[end_idx:]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print('TypeProblemSheet updated successfully in App.jsx')
else:
    print('Markers not found')
