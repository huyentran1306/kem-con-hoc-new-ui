with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

explain_start = text.find('export function Explain() {')
explain_end = text.find('/* ============================================================', text.find('export function Explain() {') + 50)

if explain_start != -1 and explain_end != -1:
    new_explain = '''export function Explain() {
  const { S, problem, patch, go, openSheet, toast } = useContext(AppCtx)
  const [showMathList, setShowMathList] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const child = S.children.find((c) => c.id === S.activeId)
  const mathInfo = useMemo(() => problem?.mathVerified || problem?.math_verified || validateAllLessonMath(problem), [problem])
  const stepsCount = Array.isArray(problem.steps) ? problem.steps.length : 4

  const explainText =
    `Đây là dạng bài ${problem.type}. ${problem.summary || ''} ` +
    `${S.parent.toLowerCase()} lưu ý: ${problem.warning || ''} ` +
    `Cách ${gradeLabel(child.grade)} đang học: ${problem.method || ''}.`

  return (
    <div className="explain-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
      {/* TopBar T4 */}
      <TopBarT4
        title={`Gấu đã soạn ${stepsCount} bậc`}
        stepText={`Lớp ${child?.grade || '3'}`}
        onBack={() => go('home')}
        onOpenCalm={() => openSheet('calm')}
      />

      {/* Dải đề rút gọn 1 dòng */}
      <div
        className="card-km"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--c-surface)',
          borderRadius: 14,
        }}
      >
        <span style={{ fontSize: 14 }}>📝</span>
        <span
          style={{
            flex: 1,
            whiteSpace: showFullOcr ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 12.5,
            color: 'var(--c-sub, #6E5D4E)',
            lineHeight: 1.4,
          }}
        >
          {problem.ocr}
        </span>
        <button
          type="button"
          onClick={() => setShowFullOcr(!showFullOcr)}
          className="btn-km-ghost"
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--c-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            padding: 0,
          }}
        >
          {showFullOcr ? 'Thu gọn' : 'Xem đề ›'}
        </button>
      </div>

      {/* Kiểm toán độc lập (nếu có) */}
      {mathInfo && mathInfo.verifiedCount > 0 && (
        <div
          className="card-km card-km-good"
          onClick={() => setShowMathList(!showMathList)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
            <span style={{ color: 'var(--c-good, #2F7D4F)', fontWeight: 900 }}>✓</span>
            <span style={{ color: 'var(--c-text)', fontWeight: 700 }}>
              Đã kiểm lại {mathInfo.verifiedCount} phép tính
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--c-primary)', fontWeight: 800 }}>
            {showMathList ? 'Đóng' : 'Xem'}
          </span>
        </div>
      )}

      {showMathList && mathInfo?.calculations && (
        <div className="card-km" style={{ padding: '10px 12px', background: 'var(--c-surface)' }}>
          {mathInfo.calculations.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
              <b>{c.expr}</b>
              <span style={{ color: 'var(--c-good)', fontWeight: 800 }}>✓ Đúng</span>
            </div>
          ))}
        </div>
      )}

      {/* 4 bậc là danh sách dòng */}
      {Array.isArray(problem.steps) && problem.steps.length > 0 && (
        <div className="card-km" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 14, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
              {problem.steps.length} BẬC CÂU HỎI
            </b>
            <button
              type="button"
              className="btn-km-chip"
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-line)',
                cursor: 'pointer',
              }}
              onClick={() => speak(explainText)}
            >
              🔊 Nghe
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {problem.steps.map((st, i) => {
              const skillName = SKILL_LABELS[st.ky_nang] || st.ky_nang || ''
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 12,
                    background: 'var(--c-bg)',
                    border: '1px solid var(--c-line)',
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--c-primary)',
                      color: 'var(--c-on-primary, #fff)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--c-text)', fontWeight: 600, lineHeight: 1.35 }}>
                    {st.question || st.q}
                  </span>
                  {skillName && (
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--c-sub)',
                        background: 'var(--c-surface)',
                        padding: '2px 7px',
                        borderRadius: 999,
                        border: '1px solid var(--c-line)',
                        flexShrink: 0,
                      }}
                    >
                      {skillName}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mẹ lưu ý (1 dòng) */}
      {problem.warning && (
        <div className="card-km card-km-note" style={{ padding: '10px 14px' }}>
          <span style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.4 }}>
            <b>⚠️ {S.parent} lưu ý:</b> {problem.warning}
          </span>
        </div>
      )}

      {/* Báo Gấu soạn chưa đúng */}
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <button
          type="button"
          onClick={() => openSheet('reportIssue')}
          className="btn-km-ghost"
          style={{ fontSize: 12, color: 'var(--c-sub)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Báo Gấu soạn chưa đúng
        </button>
      </div>

      {/* Nút Lớn 56px dính đáy */}
      <div
        className="bottom-action-bar-km"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 16px',
          background: 'var(--c-surface, #fff)',
          borderTop: '1px solid var(--c-line, #EADFCF)',
          zIndex: 90,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <button
          type="button"
          className="btn-km btn-km-l btn-km-primary"
          style={{ width: '100%' }}
          onClick={() => {
            patch({ flow: { ...S.flow, step: 0, stuck: 0, unlocked: false } })
            go('scaffold')
          }}
        >
          <span>Bắt đầu hỏi con</span>
          <span className="btn-km-arrow">›</span>
        </button>
      </div>
    </div>
  )
}
'''
    text = text[:explain_start] + new_explain + '\n' + text[explain_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated ExplainScreen in screens.jsx')
else:
    print('Failed to find ExplainScreen start or end')
