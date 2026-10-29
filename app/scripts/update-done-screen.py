with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

done_ret_start = text.find('  return (\n    <>\n      <Header title="Xong bài rồi! 🎉" back="home" />')
done_end = text.find('/* ============================================================', done_ret_start)

if done_ret_start != -1 and done_end != -1:
    new_done_render = '''  return (
    <div className="done-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
      {/* TopBar T4 */}
      <TopBarT4
        title="Xong bài rồi! 🎉"
        stepText="Hoàn thành"
        onBack={() => go('home')}
        onOpenCalm={() => openSheet('calm')}
      />

      {/* 1. PHẦN CHO CON */}
      <div
        className="card-km"
        style={{
          padding: '18px 16px',
          background: 'var(--c-surface)',
          borderRadius: 22,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
        data-testid="done-section-kid"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          PHẦN CHO CON
        </span>

        <div className="mascot-bounce-km">
          <ThemeBuddy state={S.flow?.teachBack ? 'love' : 'cheer'} size={80} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
          {S.flow?.teachBack ? `Thương ${child.name} ghê! 💕` : `Hoan hô ${child.name}! 🎉`}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--c-sub)', margin: 0 }}>
          Con đã xuất sắc vượt qua các bậc bài tập tối nay!
        </p>

        {/* CHỌN VÀ TẶNG HUY HIỆU Ở MỘT CHỖ DUY NHẤT */}
        <div
          style={{
            width: '100%',
            background: 'var(--c-bg)',
            border: '1px solid var(--c-line)',
            borderRadius: 16,
            padding: '12px 14px',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
          data-testid="card-suggested-badge"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)' }}>
              HUY HIỆU NỖ LỰC
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--c-sub)' }}>
              Đã có {stats.stickers}/10 ⭐
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: currentBadgeInfo.color,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {currentBadgeInfo.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 14.5, color: 'var(--c-text)', display: 'block' }}>
                {currentBadgeInfo.name} ({currentBadgeInfo.trait})
              </b>
              <p style={{ fontSize: 12, color: 'var(--c-sub)', margin: '2px 0 0', lineHeight: 1.35 }}>
                {currentReason}
              </p>
            </div>
          </div>

          {/* 4 Chip chọn nhanh phẩm chất khác */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {['Kiên nhẫn', 'Sáng tạo', 'Tập trung', 'Tỉ mỉ'].map((tr) => {
              const active = currentTrait === tr
              const info = TRAIT_BADGE_INFO[tr]
              return (
                <button
                  key={tr}
                  type="button"
                  className={`btn-km btn-km-s ${active ? 'btn-km-primary' : 'btn-km-secondary'}`}
                  style={{ minHeight: 30, padding: '0 4px', fontSize: 11, fontWeight: 800 }}
                  onClick={() => {
                    soundPop(450)
                    setPickedTrait(tr)
                  }}
                  data-testid={`btn-pick-trait-${tr}`}
                >
                  {info.icon} {tr}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="btn-km btn-km-m btn-km-ok"
            style={{ width: '100%', minHeight: 46, fontSize: 14 }}
            onClick={() => {
              const found = AVAILABLE_STICKERS.find((s) => s.id === currentBadgeInfo.stickerId || s.trait === currentTrait) || currentBadgeInfo
              pickSticker({
                ...found,
                id: currentBadgeInfo.stickerId,
                n: currentBadgeInfo.name,
                trait: currentBadgeInfo.trait,
                color: currentBadgeInfo.color,
                source: isSuggested ? 'goi_y' : 'chon_khac',
                reason: currentReason,
              })
            }}
            data-testid="btn-grant-suggested-badge"
          >
            <span>Tặng huy hiệu {currentBadgeInfo.name}</span>
            <span>⭐</span>
          </button>
        </div>
      </div>

      {/* 2. PHẦN CHO MẸ */}
      <div
        className="card-km"
        style={{
          padding: '16px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
        data-testid="done-section-parent"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          DÀNH CHO {S.parent.toUpperCase()}
        </span>

        {/* Tự chấm nhanh: nút gạt 3 mục */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text)', display: 'block', marginBottom: 6 }}>
            Mức độ tự chủ của con hôm nay:
          </label>
          <div className="seg-km" style={{ width: '100%', height: 36 }}>
            {[
              { v: 'ok', label: 'Tự làm được' },
              { v: 'hint', label: 'Cần gợi ý' },
              { v: 'guided', label: 'Cần hướng dẫn' },
            ].map((opt) => {
              const active = (S.flow.teachBack || result) === opt.v
              return (
                <button
                  key={opt.v}
                  type="button"
                  className={`seg-km-item ${active ? 'active' : ''}`}
                  style={{ height: 32, fontSize: 12 }}
                  onClick={() => pickTeachBack(opt.v)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Góp ý của Gấu: 1 dòng mở được */}
        {coachAdviceEnabled && coachAdviceList.length > 0 && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              padding: '10px 12px',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setIsCoachOpen(!isCoachOpen)}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                🐻 Gấu góp ý cách kèm ({coachAdviceList.length} ý)
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                {isCoachOpen ? 'Thu gọn ▲' : 'Xem ngay ▼'}
              </span>
            </div>
            {isCoachOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {coachAdviceList.map((adv, idx) => (
                  <div key={idx} style={{ fontSize: 12.5, color: '#78350F', lineHeight: 1.35 }}>
                    <b>{adv.icon} {adv.action}:</b> {adv.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. PHẦN LÀM TIẾP */}
      <div
        className="card-km"
        style={{
          padding: '16px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
        data-testid="done-section-next"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          LÀM TIẾP
        </span>

        {/* Bài anh em */}
        {(() => {
          const bro = adaptiveBrother || problem.brotherProblem || problem.bai_anh_em
          if (!bro) return null
          const deText = bro.de || bro.text || ''
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-line)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>🎯 Bài anh em (5 phút)</b>
                <span style={{ fontSize: 12, color: 'var(--c-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {deText}
                </span>
              </div>
              <button
                type="button"
                className="btn-km btn-km-s btn-km-primary"
                onClick={() => {
                  patch({
                    problem: {
                      text: deText,
                      steps: [
                        { question: 'Con đọc kỹ đề bài mới nhé?', answer: 'Đọc kỹ đề', praise: 'Giỏi lắm!' },
                        { question: 'Bài này mình cần làm phép tính gì con nhỉ?', answer: bro.dap_an_cho_me || 'Phép tính', praise: 'Đúng hướng rồi!' },
                        { question: 'Con tính ra kết quả là bao nhiêu?', answer: bro.dap_an_cho_me || 'Đáp số', praise: 'Xuất sắc!' },
                      ],
                      brotherProblem: null,
                    },
                    flow: { step: 0, stuck: 0, unlocked: false },
                  })
                  go('explain')
                }}
              >
                Làm thử ›
              </button>
            </div>
          )
        })()}

        {/* Chấm vở */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-line)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>📝 Chấm vở con đã viết</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Chụp vở để AI tìm bước sai cho con tự sửa</span>
          </div>
          <button
            type="button"
            className="btn-km btn-km-s btn-km-secondary"
            onClick={() => {
              patch({
                checkWorkInit: {
                  sessionId: S.sessionId || `sess_${Date.now()}`,
                  problemText: problem?.ocr || problem?.text || '',
                },
              })
              go('check')
            }}
          >
            Chấm vở ›
          </button>
        </div>

        {/* Con giảng lại */}
        {!S.flow?.teachBack && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>🎓 Con dạy lại mẹ</b>
              <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Lắng nghe con giảng lại bài vừa giải</span>
            </div>
            <button
              type="button"
              className="btn-km btn-km-s btn-km-secondary"
              onClick={() => openSheet('teachBack')}
            >
              Nghe con ›
            </button>
          </div>
        )}
      </div>

      {/* Nút dính đáy: Lưu & về trang chủ */}
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
          onClick={saveResult}
        >
          Lưu & về trang chủ
        </button>
      </div>
    </div>
  )
}
'''
    text = text[:done_ret_start] + new_done_render + text[done_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated DoneScreen in screens.jsx')
else:
    print('Failed to find DoneScreen start or end')
