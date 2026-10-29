with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    sc = f.read()

# ----------------------------------------------------
# Phần 2 · Màn Onboarding (khai báo hồ sơ lần đầu)
# ----------------------------------------------------
old_onb_theme = """      <div className="card">
        <span className="lbl plum">🎨 Giao diện con thích (tuỳ chọn)</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 13.5 }}>
            Đang chọn: <b>{getTheme(S.theme || 'candy').name}</b>
          </span>
          <button className="btn ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openSheet('themePicker')}>
            Đổi giao diện
          </button>
        </div>
      </div>"""

new_onb_theme = """      <div className="card">
        <span className="lbl plum">🎨 Giao diện con thích (tuỳ chọn)</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11.5, color: 'var(--c-text-2, #64748B)', fontWeight: 600 }}>Đang chọn</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 16 }}>{getTheme(S.theme || 'candy').icon || '✨'}</span>
              <span>{getTheme(S.theme || 'candy').name}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn ghost"
            style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0, height: 'auto', minHeight: 36, whiteSpace: 'nowrap' }}
            onClick={() => openSheet('themePicker')}
          >
            Đổi giao diện
          </button>
        </div>
      </div>"""

old_onb_invite = """      <button className="big-card sky" onClick={() => openSheet('invite')}>
        <span className="lbl sky">Không phải một mình</span>
        <b>{S.partner ? '✓ Đã mời bố cùng kèm con' : '+ Mời bố cùng kèm con'}</b>
        <span className="sub">Gửi link app cho bố, chia ca kèm, người trực ca sẽ thấy lời nhắc khi mở app buổi tối</span>
      </button>"""

new_onb_invite = """      <button
        type="button"
        className="big-card sky"
        onClick={() => openSheet('invite')}
        style={{ textAlign: 'left', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
      >
        <span className="lbl sky">Không phải một mình</span>
        <b style={{ display: 'block', fontSize: 15, margin: '2px 0 4px' }}>
          {S.partner ? (typeof S.partner === 'string' ? `✓ Đã mời ${S.partner}` : '✓ Đã gửi lời mời') : '+ Mời người thân cùng kèm con'}
        </b>
        <span className="sub" style={{ display: 'block', fontSize: 12.5, lineHeight: 1.45, color: 'var(--c-text-2)' }}>
          Gửi link cho bố, mẹ, ông bà hay gia sư. Chia ca kèm, người trực ca sẽ thấy lời nhắc khi mở app buổi tối.
        </span>
      </button>"""

if old_onb_theme in sc:
    sc = sc.replace(old_onb_theme, new_onb_theme)
    print('✓ Phần 2-1: Giao diện con thích 2 dòng & linh vật nhỏ')
else:
    print('⚠️ Phần 2-1 not matched')

if old_onb_invite in sc:
    sc = sc.replace(old_onb_invite, new_onb_invite)
    print('✓ Phần 2-2: Không viết cứng chữ bố ở màn Onboarding')
else:
    print('⚠️ Phần 2-2 not matched')

# ----------------------------------------------------
# P1-6: "Làm tiếp bài hôm qua" -> "Làm tiếp bài đang dở"
# ----------------------------------------------------
old_resume_text = '<b style={{ color: \'var(--c-text)\', fontSize: 14.5, display: \'block\' }}>📖 Làm tiếp bài hôm qua</b>'
new_resume_text = '<b style={{ color: \'var(--c-text)\', fontSize: 14.5, display: \'block\' }}>📖 Làm tiếp bài đang dở</b>'
if old_resume_text in sc:
    sc = sc.replace(old_resume_text, new_resume_text)
    print('✓ P1-6: Sửa "Làm tiếp bài hôm qua" thành "Làm tiếp bài đang dở"')

# ----------------------------------------------------
# P1-4: Chụp đồ chơi ở màn chính cuộn thẳng tới phần Chụp đồ vật quanh nhà
# ----------------------------------------------------
old_toy_btn = """      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => go('toy')}
      >"""

new_toy_btn = """      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => {
          go('toy')
          setTimeout(() => {
            const el = document.getElementById('sec-snap-toy')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 150)
        }}
      >"""

if old_toy_btn in sc:
    sc = sc.replace(old_toy_btn, new_toy_btn)
    print('✓ P1-4: Bấm Chụp đồ chơi cuộn thẳng tới phần Chụp đồ vật quanh nhà')

# ----------------------------------------------------
# P1-12: Màn Chụp bài tập rút gọn chữ
# ----------------------------------------------------
old_cam_hint = '📸 Chữ viết tay nhỏ? Chụp bằng camera của máy (nét hơn)'
new_cam_hint = '📸 Chữ nhỏ? Dùng camera của máy cho nét hơn'
if old_cam_hint in sc:
    sc = sc.replace(old_cam_hint, new_cam_hint)
    print('✓ P1-12: Rút gọn dòng camera tránh rớt chữ "hơn)"')

# ----------------------------------------------------
# P1-5: Màn Chụp - Nút "Đọc đề" bật micro ngay
# ----------------------------------------------------
old_doc_de_btn = """<button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13, borderColor: 'var(--plum)', color: 'var(--plum-deep)', background: 'var(--plum-tint)' }} onClick={() => openSheet('typeProblem')}>🎙️ Đọc đề</button>"""
new_doc_de_btn = """<button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13, borderColor: 'var(--plum)', color: 'var(--plum-deep)', background: 'var(--plum-tint)' }} onClick={() => openSheet('typeProblem', { mode: 'voice', autoMic: true })}>🎙️ Đọc đề</button>"""
if old_doc_de_btn in sc:
    sc = sc.replace(old_doc_de_btn, new_doc_de_btn)
    print('✓ P1-5: Nút Đọc đề ở màn chụp kích hoạt autoMic')

# ----------------------------------------------------
# P1-11: "Gấu đọc được đề này" - Thay "📐 Bài tập" bằng dạng bài & thêm dòng 3 bậc
# ----------------------------------------------------
old_chip_baitap = """            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📐 Bài tập
            </span>"""

new_chip_baitap = """            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📐 {problem?.dang_bai || problem?.type || 'Toán có lời văn'}
            </span>"""

if old_chip_baitap in sc:
    sc = sc.replace(old_chip_baitap, new_chip_baitap)
    print('✓ P1-11: Thay nhãn Bài tập bằng dạng bài')

old_review_bottom = """          {/* Nút dính đáy */}
          <div
            className="bottom-action-bar-km" """

new_review_bottom = """          {/* Dòng tóm tắt trước nút */}
          <div style={{ textAlign: 'center', padding: '6px 12px 100px', color: 'var(--c-sub)', fontSize: 13, fontWeight: 600 }}>
            🐾 Gấu sẽ hỏi {child?.name || 'con'} khoảng 3 bậc gợi mở
          </div>

          {/* Nút dính đáy */}
          <div
            className="bottom-action-bar-km" """

if old_review_bottom in sc:
    sc = sc.replace(old_review_bottom, new_review_bottom)
    print('✓ P1-11: Thêm dòng "Gấu sẽ hỏi con khoảng 3 bậc"')

# ----------------------------------------------------
# P1-13: Màn "Gấu đã soạn" - Đưa "Xem ›" lên cùng dòng với "Đã kiểm lại"
# ----------------------------------------------------
old_math_box = """        <div
          onClick={() => setShowMathList(!showMathList)}
          className="card-km card-km-soft"
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
        </div>"""

new_math_box = """        <div
          onClick={() => setShowMathList(!showMathList)}
          className="card-km card-km-soft"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            cursor: 'pointer',
            flexWrap: 'nowrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, minWidth: 0 }}>
            <span style={{ color: 'var(--c-good, #2F7D4F)', fontWeight: 900, flexShrink: 0 }}>✓</span>
            <span style={{ color: 'var(--c-text)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Đã kiểm lại {mathInfo.verifiedCount} phép tính
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
            {showMathList ? 'Đóng ▲' : 'Xem ›'}
          </span>
        </div>"""

if old_math_box in sc:
    sc = sc.replace(old_math_box, new_math_box)
    print('✓ P1-13: Đưa Xem › lên cùng dòng căn phải')

# ----------------------------------------------------
# P0-4: Báo cáo khung "Ai kèm" - chỉ cân sức khi chênh dưới 20%
# ----------------------------------------------------
old_aikem_comment = """      <span className="sub">
        Mẹ {momSessions} ca ({momPct}%) · Bố {dadSessions} ca ({dadPct}%) →{' '}
        {totalSessions === 0
          ? <b>tuần này chưa ghi nhận ca học nào.</b>
          : dadSessions === 0
          ? <b>gợi ý: thử giao 1-2 ca cho bố để mẹ nghỉ ngơi nhé.</b>
          : momSessions === 0
          ? <b>tuần này bố đảm nhiệm hết, cảm ơn bố nhiều!</b>
          : <b>hai người cân sức rồi, giữ nếp nhé!</b>}
      </span>"""

new_aikem_comment = """      <span className="sub">
        Mẹ {momSessions} ca ({momPct}%) · Bố {dadSessions} ca ({dadPct}%) →{' '}
        {totalSessions === 0
          ? <b>tuần này chưa ghi nhận ca học nào.</b>
          : dadSessions === 0
          ? <b>gợi ý: thử giao 1 ca cho bố để mẹ nghỉ ngơi nhé.</b>
          : momSessions === 0
          ? <b>gợi ý: thử giao 1 ca cho mẹ cùng kèm con nhé.</b>
          : Math.abs(momPct - dadPct) <= 20
          ? <b>hai người cân sức rồi, giữ nếp nhé!</b>
          : momPct > dadPct
          ? <b>gợi ý: thử giao thêm 1 ca cho bố để cân bằng nhé.</b>
          : <b>gợi ý: thử giao thêm 1 ca cho mẹ để cân bằng nhé.</b>}
      </span>"""

if old_aikem_comment in sc:
    sc = sc.replace(old_aikem_comment, new_aikem_comment)
    print('✓ P0-4: Báo cáo Ai kèm chỉ nói cân sức khi chênh <= 20%')

# ----------------------------------------------------
# P0-5: Báo cáo bỏ chữ "mốc dữ liệu"
# ----------------------------------------------------
old_sub_report = '<p className="sub">{totalSessions} ca · mẹ kèm {momSessions} ca, bố kèm {dadSessions} ca · {stickerHistory.length} mốc dữ liệu phẩm chất</p>'
new_sub_report = '<p className="sub">{totalSessions} ca · mẹ kèm {momSessions} ca, bố kèm {dadSessions} ca · {stickerHistory.length} lần ghi nhận phẩm chất</p>'
if old_sub_report in sc:
    sc = sc.replace(old_sub_report, new_sub_report)
    print('✓ P0-5: Bỏ chữ "mốc dữ liệu phẩm chất" ở Báo cáo')

# ----------------------------------------------------
# P0-6: "Những gì Gấu nhớ về Bé Na" - Tiêu đề 1 dòng, Switch bên phải, trạng thái dưới
# ----------------------------------------------------
old_bear_memory = """      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🧠 🐻</span>
          <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Những gì Gấu nhớ về {child.name}</b>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          <span>{memoryEnabled ? 'Đang bật' : 'Tắt'}</span>
          <input
            type="checkbox"
            checked={memoryEnabled}
            onChange={(e) => {
              const updated = S.children.map((c) => (c.id === child.id ? { ...c, bearMemory: e.target.checked } : c))
              patch({ children: updated })
              toast(e.target.checked ? `Đã bật ghi nhớ cho ${child.name}` : `Đã tắt ghi nhớ cho ${child.name}`)
            }}
            style={{ width: 18, height: 18, accentColor: 'var(--c-accent)' }}
          />
        </label>
      </div>"""

new_bear_memory = """      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🧠 🐻</span>
          <b style={{ fontSize: 15, color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Những gì Gấu nhớ về {child.name}
          </b>
        </div>
        <Switch
          on={memoryEnabled}
          onChange={(val) => {
            const nextVal = typeof val === 'boolean' ? val : !memoryEnabled
            const updated = S.children.map((c) => (c.id === child.id ? { ...c, bearMemory: nextVal } : c))
            patch({ children: updated })
            toast(nextVal ? `Đã bật ghi nhớ cho ${child.name}` : `Đã tắt ghi nhớ cho ${child.name}`)
          }}
          label={`Ghi nhớ về ${child.name}`}
        />
      </div>
      <div style={{ fontSize: 12, color: memoryEnabled ? 'var(--c-accent-ink, #059669)' : 'var(--c-text-2, #64748B)', fontWeight: 600, marginBottom: 8 }}>
        Trạng thái: {memoryEnabled ? 'Đang bật' : 'Đang tắt'}
      </div>"""

if old_bear_memory in sc:
    sc = sc.replace(old_bear_memory, new_bear_memory)
    print('✓ P0-6: Những gì Gấu nhớ tiêu đề 1 dòng, Switch bên phải, trạng thái dưới')

# ----------------------------------------------------
# P0-8: "8 bộ phong cách" -> "11 bộ phong cách"
# ----------------------------------------------------
old_8bo = "Đang dùng: <b>{getTheme(S.theme || 'candy').name}</b> · 8 bộ phong cách đổi 1 chạm"
new_8bo = "Đang dùng: <b>{getTheme(S.theme || 'candy').name}</b> · 11 bộ phong cách đổi 1 chạm"
if old_8bo in sc:
    sc = sc.replace(old_8bo, new_8bo)
    print('✓ P0-8: Đổi 8 bộ thành 11 bộ phong cách đổi 1 chạm')

# ----------------------------------------------------
# P1-2: Chấm vở nhãn "Đọc chữ viết tay · 3 dòng" để 1 dòng, câu Mẹ chạm... xuống dòng riêng
# ----------------------------------------------------
old_chip_lines = """          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--c-accent-ink)',
                background: 'var(--c-surface-2)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              ✨ Đọc chữ viết tay · {lines.length} dòng
            </span>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Mẹ chạm để sửa chỗ AI đọc nhầm</span>
          </div>"""

new_chip_lines = """          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--c-accent-ink)',
                  background: 'var(--c-surface-2)',
                  padding: '4px 10px',
                  borderRadius: 999,
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                }}
              >
                ✨ Đọc chữ viết tay · {lines.length} dòng
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Mẹ chạm để sửa chỗ AI đọc nhầm</span>
          </div>"""

if old_chip_lines in sc:
    sc = sc.replace(old_chip_lines, new_chip_lines)
    print('✓ P1-2: Chấm vở nhãn 1 dòng, dòng hướng dẫn xuống dưới')

# ----------------------------------------------------
# P1-4: Chụp đồ chơi - Bỏ nút "‹" cạnh tiêu đề Chơi gì với đồ trong nhà, đổi "Bài" -> "Bộ bài"
# ----------------------------------------------------
old_toy_hdr = '<Header title="Chơi gì với đồ trong nhà?" back="home" />'
new_toy_hdr = '<Header title="Chơi gì với đồ trong nhà?" />'
if old_toy_hdr in sc:
    sc = sc.replace(old_toy_hdr, new_toy_hdr)
    print('✓ P1-4: Bỏ nút "‹" trong Chơi gì với đồ trong nhà')

old_toy_card = "n: 'Bài',\n    e: '🃏',"
new_toy_card = "n: 'Bộ bài',\n    e: '🃏',"
if old_toy_card in sc:
    sc = sc.replace(old_toy_card, new_toy_card)
    print('✓ P1-4: Đổi đồ vật Bài thành Bộ bài')

# ----------------------------------------------------
# P1-1: Dòng mở thêm - một kiểu dùng chung (mũi tên ▾ bên phải, chữ co giãn, bấm cả dòng)
# ----------------------------------------------------
old_hint2_bar = """        <div
          onClick={() => setExpandHint2(!expandHint2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--c-surface)',
            border: '1.5px solid var(--c-line)',
            borderRadius: 14,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-sub)' }}>
            💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>
            {expandHint2 ? 'Thu gọn ▲' : 'Mở xem ▼'}
          </span>
        </div>"""

new_hint2_bar = """        <div
          onClick={() => setExpandHint2(!expandHint2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '10px 14px',
            background: 'var(--c-surface)',
            border: '1.5px solid var(--c-line)',
            borderRadius: 14,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-sub)', flex: 1, minWidth: 0 }}>
            💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
          </span>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-primary)', flexShrink: 0 }}>
            {expandHint2 ? '▴' : '▾'}
          </span>
        </div>"""

if old_hint2_bar in sc:
    sc = sc.replace(old_hint2_bar, new_hint2_bar)
    print('✓ P1-1: Dòng mở thêm chuẩn hoá mũi tên ▾')

with open('src/screens.jsx', 'w', encoding='utf-8') as f:
    f.write(sc)

print('✓ Finished updating src/screens.jsx')
