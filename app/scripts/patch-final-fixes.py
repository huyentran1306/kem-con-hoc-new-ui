# 1. buddy.css: P1-3 Bóng thoại trên đầu linh vật
with open('src/themes/buddies/buddy.css', 'r', encoding='utf-8') as f:
    bcss = f.read()

old_greeter_say = """.kb-greeter .kb-say{position:absolute;top:4px;right:calc(100% + 8px);transform-origin:top right;width:max-content;max-width:200px;background:var(--c-surface, #fff) !important;color:var(--c-text, #3A2A33) !important;border:1px solid var(--c-line, #F4DDE7) !important;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:10;opacity:1 !important}
.kb-greeter .kb-say::after{content:"";position:absolute;right:-7px;top:14px;border:7px solid transparent;border-left-color:var(--c-surface, #fff);border-right:0}"""

new_greeter_say = """.kb-greeter .kb-say{position:absolute;bottom:calc(100% + 8px);top:auto;right:-6px;transform-origin:bottom right;width:max-content;max-width:220px;background:var(--c-surface, #fff) !important;color:var(--c-text, #3A2A33) !important;border:1px solid var(--c-line, #F4DDE7) !important;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:10;opacity:1 !important}
.kb-greeter .kb-say::after{content:"";position:absolute;right:22px;bottom:-7px;top:auto;border:7px solid transparent;border-top-color:var(--c-surface, #fff);border-bottom:0}"""

if old_greeter_say in bcss:
    bcss = bcss.replace(old_greeter_say, new_greeter_say)
    print('✓ P1-3: Bóng thoại greeter đặt phía trên linh vật, không che câu chào')
else:
    print('⚠️ P1-3 old_greeter_say not matched')

with open('src/themes/buddies/buddy.css', 'w', encoding='utf-8') as f:
    f.write(bcss)

# 2. CalmCornerModal.jsx: P1-6 & P1-1
with open('src/CalmCornerModal.jsx', 'r', encoding='utf-8') as f:
    ccm = f.read()

old_step_text = """            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--c-text-2)' }}>
              Chọn một ô, app gợi ý việc làm ngay. Bài đang làm vẫn giữ ở <b>Bậc {currentStepIndex + 1}</b>.
            </p>"""

new_step_text = """            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--c-text-2)' }}>
              {currentProblem ? (
                <>Chọn một ô, app gợi ý việc làm ngay. Bài đang làm vẫn giữ ở <b>Bậc {currentStepIndex + 1}</b>.</>
              ) : (
                <>Chọn một lý do, app gợi ý cách đồng hành nhẹ nhàng cùng con.</>
              )}
            </p>"""

if old_step_text in ccm:
    ccm = ccm.replace(old_step_text, new_step_text)
    print('✓ P1-6: Ngoài bài học không hiển thị câu giữ Bậc 1')

old_hint_action = """    if (reason.id === 'not_understood') {
      // Nếu chưa mở gợi ý đồ vật -> mở gợi ý và quay lại bài
      if (onOpenHint) {
        onOpenHint(1)
        onClose()
      } else if (onLowerDifficulty) {
        onLowerDifficulty()
        onClose()
      }
    }"""

new_hint_action = """    if (reason.id === 'not_understood') {
      // Nếu chưa mở gợi ý đồ vật -> mở gợi ý và quay lại bài
      if (onOpenHint) {
        onOpenHint(1)
        onClose()
      } else if (onLowerDifficulty) {
        onLowerDifficulty()
        onClose()
      } else {
        setView('not_understood_guide')
      }
    }"""

if old_hint_action in ccm:
    ccm = ccm.replace(old_hint_action, new_hint_action)
    print('✓ P1-6: Con chưa hiểu ngoài bài học chuyển sang gợi ý chung')

# Thêm view not_understood_guide vào CalmCornerModal
old_view_block = """  // VIEW 1: CHỌN LÝ DO (MẶC ĐỊNH)"""
guide_block = """  // VIEW GỢI Ý CHUNG KHI CON CHƯA HIỂU (NGOÀI BÀI HỌC)
  if (view === 'not_understood_guide') {
    return (
      <div style={modalOverlayStyle} onClick={handleBackdropClick}>
        <div style={sheetCardStyle}>
          <div style={sheetGrabStyle} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--c-text)' }}>Gợi ý khi con chưa hiểu</h3>
            <button className="btn-km-circle" style={{ width: 32, height: 32, fontSize: 13 }} onClick={onClose} aria-label="Đóng">✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2)', border: '1px solid var(--c-line)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🍎 Dùng đồ vật thực tế</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                Lấy kẹo, que tính hoặc cúc áo mô phỏng bài toán. Trẻ tiểu học học tốt nhất qua hình ảnh trực quan.
              </div>
            </div>
            <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2)', border: '1px solid var(--c-line)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🐾 Chia nhỏ thành từng câu hỏi</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                Hỏi dữ kiện ban đầu trước, sau đó hỏi đề bài yêu cầu tìm gì, tránh giảng giải một tràng dài.
              </div>
            </div>
          </div>
          <button type="button" className="btn solid" style={{ width: '100%' }} onClick={() => setView('select_reason')}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // VIEW 1: CHỌN LÝ DO (MẶC ĐỊNH)"""

# Chuẩn hoá các style inline trong guide_block nếu modalOverlayStyle không có sẵn
if "const modalOverlayStyle" not in ccm:
    guide_block = """  // VIEW GỢI Ý CHUNG KHI CON CHƯA HIỂU (NGOÀI BÀI HỌC)
  if (view === 'not_understood_guide') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={handleBackdropClick}
      >
        <div
          style={{
            background: 'var(--c-surface, #fff)',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '16px 20px 28px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--c-line)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--c-text)' }}>Gợi ý khi con chưa hiểu</h3>
            <button className="btn-km-circle" style={{ width: 32, height: 32, fontSize: 13 }} onClick={onClose} aria-label="Đóng">✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2, #F8FAFC)', border: '1px solid var(--c-line, #E2E8F0)', borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🍎 Dùng đồ vật thực tế</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                Lấy kẹo, que tính hoặc cúc áo mô phỏng bài toán. Trẻ tiểu học tiếp thu nhanh nhất qua trực quan sinh động.
              </div>
            </div>
            <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2, #F8FAFC)', border: '1px solid var(--c-line, #E2E8F0)', borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🐾 Chia nhỏ thành từng câu hỏi</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                Hỏi dữ kiện ban đầu trước, sau đó hỏi đề bài yêu cầu tìm gì, tránh giảng giải một tràng dài.
              </div>
            </div>
          </div>
          <button type="button" className="btn solid" style={{ width: '100%', minHeight: 46 }} onClick={() => setView('select_reason')}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // VIEW 1: CHỌN LÝ DO (MẶC ĐỊNH)"""

if old_view_block in ccm:
    ccm = ccm.replace(old_view_block, guide_block)
    print('✓ P1-6: Thêm view gợi ý chung khi con chưa hiểu ngoài bài học')

# P1-1: Mũi tên thu gọn ▾ ▴ trong CalmCornerModal
old_hint_fold = "<span>{isHintFolded ? '▼ Chạm để mở' : '▲ Gấp lại'}</span>"
new_hint_fold = "<span style={{ fontSize: 14, fontWeight: 800 }}>{isHintFolded ? '▾' : '▴'}</span>"
if old_hint_fold in ccm:
    ccm = ccm.replace(old_hint_fold, new_hint_fold)
    print('✓ P1-1: Chuẩn hoá mũi tên gợi ý thu gọn trong CalmCornerModal')

with open('src/CalmCornerModal.jsx', 'w', encoding='utf-8') as f:
    f.write(ccm)

# 3. FamilyMembersSheet.jsx: P1-10
with open('src/FamilyMembersSheet.jsx', 'r', encoding='utf-8') as f:
    fms = f.read()

old_trial_mems = """    const TRIAL_MEMBERS = [
      { id: "mem_mom", name: "Mẹ (Chủ gia đình)", role: "owner", relation_hint: "Mẹ", email: "me.kemcon@example.com", is_active: true },
      { id: "mem_dad", name: "Bố (Người giám hộ)", role: "guardian", relation_hint: "Bố", email: "bo.kemcon@example.com", is_active: true },
    ]"""

new_trial_mems = """    const TRIAL_MEMBERS = [
      { id: "mem_mom", displayName: "Mẹ Lan", name: "Mẹ Lan", role: "owner", relation: "Mẹ", relation_hint: "Mẹ", email: "me.lan@kemconhoc.vn", is_active: true },
      { id: "mem_dad", displayName: "Bố Minh", name: "Bố Minh", role: "guardian", relation: "Bố", relation_hint: "Bố", email: "bo.minh@kemconhoc.vn", is_active: true },
    ]"""

if old_trial_mems in fms:
    fms = fms.replace(old_trial_mems, new_trial_mems)
    print('✓ P1-10: Cập nhật mock data thành viên có tên Mẹ Lan, Bố Minh')

old_avatar_u = "{(m.displayName || m.relation || 'U')[0].toUpperCase()}"
new_avatar_u = "{(m.displayName || m.name || m.relation || (m.role === 'owner' ? 'M' : 'B'))[0].toUpperCase()}"
if old_avatar_u in fms:
    fms = fms.replace(old_avatar_u, new_avatar_u)
    print('✓ P1-10: Avatar hiển thị chữ cái đầu tên hoặc vai trò thay vì U')

old_name_row = "<b style={{ fontSize: 14.5, color: 'var(--c-text)' }}>{m.relation ? `${m.relation} ` : ''}{m.displayName}</b>"
new_name_row = "<b style={{ fontSize: 14.5, color: 'var(--c-text)' }}>{m.displayName || m.name || (m.relation ? `${m.relation}` : (m.role === 'owner' ? 'Chủ gia đình' : 'Thành viên'))}</b>"
if old_name_row in fms:
    fms = fms.replace(old_name_row, new_name_row)
    print('✓ P1-10: Tên thành viên hiển thị đầy đủ không bị rỗng')

with open('src/FamilyMembersSheet.jsx', 'w', encoding='utf-8') as f:
    f.write(fms)

print('✓ Finished updating final fixes')
