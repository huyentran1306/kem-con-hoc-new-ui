with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Tìm khối render return của Analyze
ret_start = text.find('  return (\n    <>\n      <Header title="AI đang đọc bài…" />')
ret_end = text.find('/* ============================================================', ret_start)

if ret_start != -1 and ret_end != -1:
    new_render = '''  const subjectDetected = detectSubject(editedText || ocrText || S.flow.ocr || '')
  const subjectLabel = subjectDetected === 'tieng_viet' ? 'Tiếng Việt' : 'Toán'

  return (
    <div className="analyze-container-km" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', position: 'relative', paddingBottom: 80 }}>
      {/* 1. TRẠNG THÁI ĐANG ĐỌC (T7 Chờ AI) */}
      {(aiState === 'loading' || aiState === 'cleaning') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-km card-km-ai" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ marginBottom: 12, display: 'inline-block' }} className="mascot-bounce-km">
              <BuddyGreeter size={76} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
              Gấu đang đọc đề bài…
            </h2>
            <p style={{ fontSize: 13, color: 'var(--c-sub, #6E5D4E)', margin: 0 }}>
              Đang làm sạch và phân tích cấu trúc bài tập của {child?.name || 'con'}
            </p>

            <div className="loader" style={{ marginTop: 16 }}>
              {CHECKLIST.map((c, i) => (
                <div key={c} className={`li ${i < done ? 'ok' : ''}`}>
                  <span className="dot">{i < done ? '✓' : i + 1}</span>
                  {c}
                </div>
              ))}
            </div>

            {explainSecs >= 3 && (
              <div style={{ fontSize: 12, color: 'var(--c-sub)', marginTop: 8 }}>
                ⏳ Đã phân tích {explainSecs} giây
              </div>
            )}
          </div>

          {/* Câu hỏi 0: hỏi con ngay */}
          <div className="card-km card-km-note" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)', letterSpacing: '.05em', marginBottom: 4 }}>
              ❓ CÂU HỎI 0 · HỎI CON NGAY
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.45, marginBottom: 4 }}>
              {QUESTION_ZERO[subjectDetected].replace('{parent}', S.parent.toLowerCase())}
            </div>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>
              Hỏi con trong lúc AI đang đọc đề để con rèn thói quen quan sát đề bài trước.
            </span>
          </div>

          {/* Đố vui 5 giây */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>🎲 Đố vui 5 giây</span>
              <button
                type="button"
                className="btn-km-ghost"
                style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => { soundPop(500); setQuizIdx((i) => (i + 1) % WAITING_QUIZZES.length) }}
              >
                Đổi câu 🎲
              </button>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)' }}>
              {WAITING_QUIZZES[quizIdx % WAITING_QUIZZES.length]}
            </div>
          </div>
        </div>
      )}

      {/* 2. TRẠNG THÁI ĐỌC XONG (Review - Đề chỉ hiện 1 lần trong ô sửa được) */}
      {aiState === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
            <BuddyGreeter size={48} />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
                Gấu đọc được đề này!
              </h2>
              <span style={{ fontSize: 12.5, color: 'var(--c-sub)' }}>
                Mẹ xem lại xem số liệu có cần sửa không nhé
              </span>
            </div>
          </div>

          {/* Chip môn học, lớp, dạng bài */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📖 {subjectLabel}
            </span>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              🎒 {child?.grade || 'Lớp 3'}
            </span>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📐 Bài tập
            </span>
          </div>

          {reAskReason && (
            <div className="card-km card-km-note" style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 700 }}>
                ⚠️ Đề có chỗ chưa rõ: {reAskReason}. {S.parent} sửa lại giúp con nhé.
              </span>
            </div>
          )}

          {/* Ô sửa đề bài duy nhất */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', marginBottom: 6 }}>
              NỘI DUNG ĐỀ BÀI (CHẠM ĐỂ CHỈNH SỬA)
            </label>
            <textarea
              className="field"
              rows={5}
              value={editedText}
              onChange={(e) => {
                setEditedText(e.target.value)
                setReAskReason(null)
              }}
              placeholder="Nhập hoặc sửa lại nội dung đề bài..."
              style={{
                width: '100%',
                fontSize: 14.5,
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
                border: '1.5px solid var(--c-line, #EADFCF)',
                borderRadius: 12,
                padding: '10px 12px',
                background: 'var(--c-bg)',
                color: 'var(--c-text)',
                boxSizing: 'border-box',
              }}
            />
            {shotImg && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  className="btn-km-ghost"
                  style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  🔍 Xem lại ảnh gốc chụp
                </button>
              </div>
            )}
          </div>

          {/* Nút dính đáy */}
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
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr',
              gap: 10,
              zIndex: 90,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              className="btn-km btn-km-m btn-km-secondary"
              onClick={() => { soundPop(500); go('snap') }}
            >
              Chụp lại
            </button>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-primary"
              onClick={() => {
                const t = (editedText || '').trim()
                if (!t) { toast('Đề bài đang trống, hãy nhập đề nhé ✏️'); return }
                soundTap()
                patch({ flow: { ...S.flow, ocr: t } })
                startExplain(t, redirectNote)
              }}
            >
              <span>Đúng rồi, soạn bài</span>
              <span>›</span>
            </button>
          </div>
        </div>
      )}

      {/* Cảnh báo phạm vi ngoài luồng (nếu có) */}
      {aiState === 'scope_blocked' && scopeResult && (
        <div className="card-km" style={{ border: '2px solid #EF4444', background: '#FEF2F2' }}>
          <b style={{ fontSize: 15, color: '#991B1B' }}>Ngoài phạm vi bài tập</b>
          <p style={{ fontSize: 13.5, color: '#7F1D1D', margin: '4px 0 12px' }}>{scopeResult.message}</p>
          <button type="button" className="btn-km btn-km-m btn-km-secondary" onClick={() => go('snap')}>
            Chụp lại ảnh khác
          </button>
        </div>
      )}

      {aiState === 'scope_warn' && scopeResult && (
        <div className="card-km" style={{ border: '2px solid #F59E0B', background: '#FFFBEB' }}>
          <b style={{ fontSize: 15, color: '#92400E' }}>Lưu ý về bài tập</b>
          <p style={{ fontSize: 13.5, color: '#78350F', margin: '4px 0 12px' }}>{scopeResult.message}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button type="button" className="btn-km btn-km-m btn-km-secondary" onClick={() => go('snap')}>
              Chụp lại
            </button>
            <button type="button" className="btn-km btn-km-m btn-km-primary" onClick={handleContinueWarn}>
              Vẫn tiếp tục ›
            </button>
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh gốc */}
      {zoomOpen && shotImg && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,10,20,.94)', display: 'flex', flexDirection: 'column' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', gap: 8, padding: '12px 16px', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            {[1, 2, 3].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                style={{ border: '1.5px solid #fff', borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 700, color: '#fff', background: zoom === z ? 'rgba(255,255,255,.28)' : 'transparent' }}
              >
                {z}×
              </button>
            ))}
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              style={{ border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#3B2A45', background: '#fff' }}
            >
              ✕ Đóng
            </button>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 8px 16px' }}
          >
            <img
              src={shotImg}
              alt="Ảnh bài tập phóng to"
              style={{ width: `${zoom * 100}%`, maxWidth: 'none', display: 'block', margin: zoom === 1 ? '0 auto' : 0, borderRadius: 8 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

'''
    text = text[:ret_start] + new_render + text[ret_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated AnalyzeScreen render')
else:
    print('Failed to find AnalyzeScreen return start or end')

