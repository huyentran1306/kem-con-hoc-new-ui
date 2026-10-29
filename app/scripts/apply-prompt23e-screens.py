import re

with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update TeacherAssignmentBanner
old_banner_effect = """  useEffect(() => {
    const token = getAuthToken()
    if (!token) return
    fetch(`${GATEWAY}/api/v1/family/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.assignments) && data.assignments.length > 0) {
          const first = data.assignments[0]
          setAssignment(first)
          fetch(`${GATEWAY}/api/v1/family/assignments/${first.assignment_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(d => {
              if (d.ok && d.items) setItems(d.items)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [child?.id])"""

new_banner_effect = """  const loadAssignments = useCallback(() => {
    const token = getAuthToken()
    if (!token) return
    fetch(`${GATEWAY}/api/v1/family/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.assignments) && data.assignments.length > 0) {
          const first = data.assignments[0]
          setAssignment(first)
          fetch(`${GATEWAY}/api/v1/family/assignments/${first.assignment_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(d => {
              if (d.ok && d.items) setItems(d.items)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [child?.id])

  useEffect(() => {
    loadAssignments()
    const handleUpdate = () => {
      loadAssignments()
      // Tải lại lần 2 sau 400ms để đảm bảo D1 đã ghi xong
      setTimeout(loadAssignments, 400)
    }
    window.addEventListener('kem_assignment_updated', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      window.removeEventListener('kem_assignment_updated', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [loadAssignments])"""

if old_banner_effect in code:
    code = code.replace(old_banner_effect, new_banner_effect, 1)
    print("1. TeacherAssignmentBanner updated")

# 2. Update Explain (Trước khi giảng) dải đề
old_explain_ocr = """      {/* Dải đề rút gọn 1 dòng */}
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
      </div>"""

new_explain_ocr = """      {/* Dải đề rút gọn 1 dòng */}
      <div
        className="card-km"
        data-testid="compact-problem-strip-explain"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--c-surface)',
          borderRadius: 14,
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>📝</span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
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
            flexShrink: 0,
            padding: 0,
          }}
        >
          {showFullOcr ? 'Thu gọn' : 'Xem đề ›'}
        </button>
      </div>"""

if old_explain_ocr in code:
    code = code.replace(old_explain_ocr, new_explain_ocr, 1)
    print("2. Explain dải đề updated")

# 3. Update Explain steps circle number (Mục 4: vòng 24px nền --c-surface-2, chữ --c-text đậm)
old_step_circle = """                  <span
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
                  </span>"""

new_step_circle = """                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--c-surface-2, #EADFCF)',
                      color: 'var(--c-text, #2D2319)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12.5,
                      fontWeight: 800,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>"""

if old_step_circle in code:
    code = code.replace(old_step_circle, new_step_circle, 1)
    print("3. Explain step circle updated")

# 4. Update Scaffold dải đề (Mục 3)
old_scaffold_ocr = """      {/* 2. DẢI ĐỀ RÚT GỌN 1 DÒNG */}
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
      </div>"""

new_scaffold_ocr = """      {/* 2. DẢI ĐỀ RÚT GỌN 1 DÒNG */}
      <div
        className="card-km"
        data-testid="compact-problem-strip-scaffold"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--c-surface)',
          borderRadius: 12,
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>📝</span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
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
            flexShrink: 0,
            padding: 0,
          }}
        >
          {showFullOcr ? 'Thu gọn' : 'Xem đề ›'}
        </button>
      </div>"""

assert old_scaffold_ocr in code, 'old_scaffold_ocr not matched'
code = code.replace(old_scaffold_ocr, new_scaffold_ocr, 1)
print("4. Scaffold dải đề updated")

# 5. Update Scaffold Esc key listener for showMomDrawer (Mục 5)
old_mom_state = """  const [showMomDrawer, setShowMomDrawer] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)
  const curStep = steps[step] || {}"""

new_mom_state = """  const [showMomDrawer, setShowMomDrawer] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)
  const curStep = steps[step] || {}

  useEffect(() => {
    if (!showMomDrawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowMomDrawer(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showMomDrawer])"""

assert old_mom_state in code, 'old_mom_state not matched'
code = code.replace(old_mom_state, new_mom_state, 1)
print("5. Scaffold showMomDrawer Esc listener updated")

# Update mom drawer backdrop data-testid
old_mom_backdrop = """      {/* 5. NGĂN DÀNH CHO MẸ (KÉO LÊN TỪ ĐÁY) */}
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
        >"""

new_mom_backdrop = """      {/* 5. NGĂN DÀNH CHO MẸ (KÉO LÊN TỪ ĐÁY) */}
      {showMomDrawer && (
        <div
          data-testid="mom-drawer-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 98,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowMomDrawer(false)}
        >"""

assert old_mom_backdrop in code, 'old_mom_backdrop not matched'
code = code.replace(old_mom_backdrop, new_mom_backdrop, 1)
print("5b. Scaffold showMomDrawer backdrop updated")

# 6. Update Done saveResult event dispatch (Mục 6)
old_done_update = """    if (S.assignmentItemId || problem?.isTeacherAssigned) {
      const sessId = S.currentSessionId || S.flow?.sessionId || S.flow?.id
      if (sessId) {
        updateSession(sessId, {
          completed: 1,
          endedAt: new Date().toISOString(),
          stuckCount: S.flow?.stuck || 0,
          teachBackRating: S.flow?.teachBack || 'self'
        }).catch(() => {})
      }
    }"""

new_done_update = """    if (S.assignmentItemId || problem?.isTeacherAssigned) {
      const sessId = S.currentSessionId || S.flow?.sessionId || S.flow?.id
      if (sessId) {
        updateSession(sessId, {
          completed: 1,
          endedAt: new Date().toISOString(),
          stuckCount: S.flow?.stuck || 0,
          teachBackRating: S.flow?.teachBack || 'self'
        }).then(() => {
          try {
            window.dispatchEvent(new CustomEvent('kem_assignment_updated'))
          } catch {}
        }).catch(() => {})
      }
      try {
        window.dispatchEvent(new CustomEvent('kem_assignment_updated'))
      } catch {}
    }"""

assert old_done_update in code, 'old_done_update not matched'
code = code.replace(old_done_update, new_done_update, 1)
print("6. Done saveResult dispatch event updated")

with open('src/screens.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('All changes in src/screens.jsx applied successfully!')
