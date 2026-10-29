with open('src/TeacherPortal.jsx', 'r', encoding='utf-8') as f:
    tp = f.read()

# 1. P0-7: Nâng zIndex modalBackdrop lên 1000 và thêm safe area bottom
old_backdrop = """  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 54, 33, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
    border: '2px solid #F0DDC2',
  },"""

new_backdrop = """  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 54, 33, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px 16px calc(20px + env(safe-area-inset-bottom, 16px))',
    boxSizing: 'border-box',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
    border: '2px solid #F0DDC2',
    boxSizing: 'border-box',
  },
  statusBadgeExpired: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FCA5A5',
    padding: '3px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },"""

if old_backdrop in tp:
    tp = tp.replace(old_backdrop, new_backdrop)
    print('✓ P0-7: Nâng modalBackdrop lên zIndex: 1000 và chừa safe area bottom')
else:
    print('⚠️ old_backdrop not matched')

# 2. P1-8: Bài quá hạn gắn nhãn Quá hạn và xếp dưới bài còn hạn
old_asg_list = """          {assignments.map((a) => (
            <div key={a.id} className="tp-asg-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={a.status === 'published' ? styles.statusBadgeActive : styles.statusBadgeDraft}>
                    {a.status === 'published' ? 'Đang mở' : a.status === 'closed' ? 'Đã đóng' : 'Bản nháp'}
                  </span>"""

new_asg_list = """          {[...assignments].sort((x, y) => {
            const now = Date.now();
            const xExpired = x.due_at && new Date(x.due_at).getTime() < now;
            const yExpired = y.due_at && new Date(y.due_at).getTime() < now;
            const xRank = x.status === 'published' && !xExpired ? 0 : x.status === 'draft' ? 1 : xExpired ? 2 : 3;
            const yRank = y.status === 'published' && !yExpired ? 0 : y.status === 'draft' ? 1 : yExpired ? 2 : 3;
            return xRank - yRank;
          }).map((a) => {
            const isExpired = a.due_at && new Date(a.due_at).getTime() < Date.now();
            const badgeLabel = a.status === 'closed'
              ? 'Đã đóng'
              : a.status === 'draft'
              ? 'Bản nháp'
              : isExpired
              ? 'Quá hạn'
              : 'Đang mở';
            const badgeStyle = a.status === 'closed'
              ? styles.statusBadgeDraft
              : a.status === 'draft'
              ? styles.statusBadgeDraft
              : isExpired
              ? (styles.statusBadgeExpired || { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800 })
              : styles.statusBadgeActive;
            return (
            <div key={a.id} className="tp-asg-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={badgeStyle}>
                    {badgeLabel}
                  </span>"""

if old_asg_list in tp:
    tp = tp.replace(old_asg_list, new_asg_list)
    # Sửa dấu đóng ngoặc map
    tp = tp.replace("            </div>\n          ))}\n        </div>", "            </div>\n          ); })}\n        </div>")
    print('✓ P1-8: Bài quá hạn gắn nhãn Quá hạn và xếp dưới bài còn hạn')
else:
    print('⚠️ old_asg_list not matched')

with open('src/TeacherPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(tp)

print('✓ Finished updating src/TeacherPortal.jsx')
