with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

scaffold_start = text.find('export function Scaffold() {')
scaffold_end = text.find('/* ============================================================', text.find('export function Scaffold() {') + 50)

if scaffold_start != -1 and scaffold_end != -1:
    # Lấy toàn bộ logic trước `return (` của Scaffold
    ret_idx = text.find('  return (', scaffold_start)
    logic_code = text[scaffold_start:ret_idx]

    new_scaffold = logic_code + '''  const [showMomDrawer, setShowMomDrawer] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)
  const curStep = steps[step] || {}

  // Kiểm tra hoàn thành bài
  if (step >= steps.length) {
    return (
      <div className="card-km" style={{ textAlign: 'center', padding: '32px 16px', margin: '20px 0' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🎉 🐻 🏆</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
          {child.name} đã hoàn thành cả {steps.length} bậc!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--c-sub)', margin: '0 0 20px' }}>
          Tuyệt vời lắm! Mẹ cùng con nhận huy hiệu và tổng kết bài học nhé.
        </p>
        <button
          type="button"
          data-testid="btn-finish-lesson"
          className="btn-km btn-km-l btn-km-primary"
          style={{ width: '100%' }}
          onClick={() => go('done')}
        >
          Hoàn thành bài ›
        </button>
      </div>
    )
  }

  return (
    <div className="scaffold-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 110 }}>
      {/* 1. TOP BAR T4 & TIẾN ĐỘ 4 KHÚC */}
      <TopBarT4
        title="Hỏi con từng bước"
        stepText={`Bước ${step + 1}/${steps.length}`}
        onBack={() => go('explain')}
        onOpenCalm={() => openSheet('calm')}
      />

      <Progress4 total={steps.length} current={step} />

      {/* 2. DẢI ĐỀ RÚT GỌN 1 DÒNG */}
      <div
        className="card-km"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--c-surface)',
          borderRadius: 12,
        }}
      >
        <span style={{ fontSize: 13 }}>📝</span>
        <span
          style={{
            flex: 1,
            whiteSpace: showFullOcr ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 12,
            color: 'var(--c-sub, #6E5D4E)',
          }}
        >
          {problem.ocr}
        </span>
        <button
          type="button"
          onClick={() => setShowFullOcr(!showFullOcr)}
          className="btn-km-ghost"
          style={{
            fontSize: 11.5,
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

      {/* 3. THẺ CÂU HỎI CHÍNH (HERO CARD theo hoi-con-gon-gang.html) */}
      <div
        className="card-km hero-question-km"
        style={{
          padding: '16px 14px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BuddyGreeter size={38} />
            <span style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-sub)' }}>
              BẬC {step + 1}
            </span>
          </div>
          {curStep?.ky_nang && (
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-sub)', background: 'var(--c-bg)', padding: '2px 8px', borderRadius: 999 }}>
              {SKILL_LABELS[curStep.ky_nang] || curStep.ky_nang}
            </span>
          )}
        </div>

        {/* CÂU HỎI CHỮ TO 22-23px */}
        <h2
          style={{
            fontSize: 22,
            lineHeight: 1.35,
            fontWeight: 800,
            color: 'var(--c-text)',
            fontFamily: 'var(--font-head)',
            margin: 0,
          }}
        >
          {microStep?.cau_hoi_nho || curStep.q || curStep.question}
        </h2>

        {/* 2 CHIP: ĐỌC TO & VÌ SAO HỎI */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-km-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
              cursor: 'pointer',
            }}
            onClick={() => speak(microStep?.cau_hoi_nho || curStep.q || curStep.question)}
          >
            <span>🔊</span>
            <span>Đọc to</span>
          </button>

          <button
            type="button"
            className="btn-km-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
              cursor: 'pointer',
            }}
            onClick={() => setShowWhyModal(!showWhyModal)}
          >
            <span>💡</span>
            <span>Vì sao hỏi?</span>
          </button>
        </div>

        {showWhyModal && (curStep.ly_do_cho_me || microStep?.ly_do_cho_me) && (
          <div style={{ background: 'var(--c-bg)', padding: '8px 12px', borderRadius: 10, fontSize: 12.5, color: 'var(--c-sub)', lineHeight: 1.4 }}>
            💡 <b>Mục tiêu sư phạm:</b> {microStep?.ly_do_cho_me || curStep.ly_do_cho_me}
          </div>
        )}

        {/* MIC TRÒN TO: CÁCH TRẢ LỜI CHÍNH */}
        {hasMicSupport && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <button
              type="button"
              className={`mic-round-btn ${voiceState.listening ? 'on' : ''}`}
              onClick={startVoiceListen}
              data-testid="btn-voice-listen"
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: voiceState.listening ? 'var(--c-text)' : 'var(--c-accent, #F6A623)',
                color: voiceState.listening ? 'var(--c-surface)' : 'var(--c-on-accent, #fff)',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              }}
            >
              <i className="fa-solid fa-microphone" />
            </button>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--c-sub)' }}>
              {voiceState.listening ? 'Đang nghe con nói…' : 'Chạm để con trả lời'}
            </span>
          </div>
        )}

        {/* Lời con nói & AI nhận xét */}
        {voiceState.transcript && (
          <div style={{ background: 'var(--c-bg)', padding: '8px 12px', borderRadius: 12, fontSize: 13 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-sub)' }}>CON NÓI:</span>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginTop: 2 }}>"{voiceState.transcript}"</div>
          </div>
        )}

        {voiceState.verdict && !voiceState.loading && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px 12px', borderRadius: 12, fontSize: 13 }}>
            <b style={{ color: '#166534' }}>{voiceState.verdict.danh_gia === 'dung' ? '✓ Đúng rồi' : '⚡ Gợi ý tiếp:'}</b>
            <p style={{ margin: '2px 0 0', color: '#14532D' }}>{voiceState.verdict.nhan_xet_cho_me}</p>
          </div>
        )}

        {/* GỢI Ý NHỎ HIỆN TỪNG CÁI MỘT (gợi ý đã dùng thu gọn 1 dòng) */}
        {stuck >= 1 && (
          <div style={{ borderTop: '1.5px dashed var(--c-line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stuck >= 2 && curStep.hint && (
              <div style={{ fontSize: 11.5, color: 'var(--c-sub)', fontStyle: 'italic' }}>
                ✓ Gợi ý 1: {curStep.hint}
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)' }}>
              GỢI Ý {stuck >= 2 ? '2' : '1'}
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)', margin: 0, lineHeight: 1.4 }}>
              {stuck >= 2 ? (curStep.hint2 || curStep.hint) : curStep.hint}
            </p>
          </div>
        )}
      </div>

      {/* 4. CHỈ MỜI NGHỈ KHI ĐÃ HẾT 2 GỢI Ý MÀ VẪN KẸT (Nằm trong luồng, không đè nút) */}
      {stuck >= 2 && showNudge && (
        <div
          className="card-km"
          style={{
            background: '#FEF3C7',
            border: '1.5px solid #FCD34D',
            padding: '12px 14px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>😮‍💨</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 13.5, color: '#92400E', display: 'block' }}>Nghỉ 1 phút cùng con nhé?</b>
            <span style={{ fontSize: 11.5, color: '#78350F' }}>Con đang cố hết sức rồi, hít thở một chút sẽ sáng dạ hơn!</span>
          </div>
          <button
            type="button"
            className="btn-km btn-km-s btn-km-primary"
            style={{ minHeight: 32, padding: '0 10px', fontSize: 11.5 }}
            onClick={() => { setShowNudge(false); openSheet('calm') }}
          >
            Thở 1p
          </button>
        </div>
      )}

      {/* 5. NGĂN DÀNH CHO MẸ (KÉO LÊN TỪ ĐÁY) */}
      {showMomDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 98,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowMomDrawer(false)}
        >
          <div
            className="sheet-t5-card"
            style={{
              width: '100%',
              background: 'var(--c-surface, #fff)',
              borderRadius: '24px 24px 0 0',
              padding: '16px 18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--c-line)', alignSelf: 'center', marginBottom: 4 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 16, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>🔒 Dành riêng cho mẹ</b>
              <button
                type="button"
                className="sheet-t5-close"
                onClick={() => setShowMomDrawer(false)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--c-bg)', fontSize: 14, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Đáp án đối chiếu: Nút Giữ có vòng chạy */}
            <div style={{ marginTop: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
                ĐÁP ÁN ĐỐI CHIẾU
              </label>
              <HoldBtn
                label={`Giữ 1.5s xem đáp án cho ${S.parent.toLowerCase()}`}
                onHoldComplete={onOpen}
              />
              {unlocked && (
                <div style={{ background: 'var(--c-bg)', padding: '10px 12px', borderRadius: 12, marginTop: 8, fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>
                  ✓ {curStep.answerForParent || curStep.answer || curStep.hint || 'Hoàn thành bước'}
                </div>
              )}
            </div>

            {/* Hỏi Gấu cách giảng */}
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
                HỎI GẤU CÁCH GIẢNG NHANH
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="field"
                  style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--c-line)', background: 'var(--c-bg)' }}
                  placeholder="VD: con chưa học chia hết..."
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-km btn-km-s btn-km-primary"
                  onClick={() => {
                    patch({ parentNoteChat: parentNote.trim() })
                    setShowMomDrawer(false)
                    go('ask')
                  }}
                >
                  Hỏi Gấu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. THANH ĐÁY CỐ ĐỊNH: TAY KÉO MẸ + 2 NÚT 48px */}
      <div
        className="bottom-action-bar-km"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--c-surface, #fff)',
          borderTop: '1px solid var(--c-line, #EADFCF)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 14px rgba(0,0,0,0.06)',
          zIndex: 90,
          padding: '6px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Tay kéo: 🔒 Dành cho mẹ ▲ */}
        <button
          type="button"
          onClick={() => setShowMomDrawer(true)}
          style={{
            alignSelf: 'center',
            background: 'none',
            border: 'none',
            padding: '2px 10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span style={{ width: 28, height: 3, borderRadius: 99, background: 'var(--c-line)' }} />
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--c-sub)' }}>
            🔒 Dành cho mẹ ▲
          </span>
        </button>

        {/* 2 Nút: Phụ 'Chưa nghĩ ra' & Thành công 'Con làm được!' cùng 48px */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 8 }}>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-secondary"
            style={{ minHeight: 48, fontSize: 13 }}
            onClick={stepStuck}
          >
            Chưa nghĩ ra
          </button>

          <button
            type="button"
            className="btn-km btn-km-m btn-km-ok"
            style={{ minHeight: 48, fontSize: 13.5 }}
            onClick={stepOk}
          >
            <span>Con làm được!</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  )
}
'''
    text = text[:scaffold_start] + new_scaffold + '\n' + text[scaffold_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated Scaffold in screens.jsx')
else:
    print('Failed to find Scaffold start or end')
