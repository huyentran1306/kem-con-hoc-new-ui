with open('src/CalmCornerModal.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Xoá đoạn duplicate thừa nếu có trước if (!isOpen)
marker = "  // VIEW GỢI Ý CHUNG KHI CON CHƯA HIỂU (NGOÀI BÀI HỌC)"
if marker in code:
    parts = code.split(marker)
    # Lấy phần đầu trước marker, và phần cuối sau // VIEW 1: CHỌN LÝ DO
    end_marker = "  // VIEW 1: CHỌN LÝ DO (MẶC ĐỊNH)\n"
    if end_marker in parts[1]:
        rest = parts[1].split(end_marker)[1]
        code = parts[0] + rest
    print('Cleaned temporary marker')

# Đặt view not_understood_guide ngay sau view === 'reasons'
target_spot = "{view === 'reasons' && ("
guide_jsx = """{view === 'not_understood_guide' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--c-text)' }}>Gợi ý khi con chưa hiểu</h3>
              <button className="round-btn" style={{ width: 32, height: 32, fontSize: 14 }} onClick={onClose} aria-label="Đóng">✕</button>
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
            <button type="button" className="btn solid" style={{ width: '100%', minHeight: 46 }} onClick={() => setView('reasons')}>
              ← Quay lại
            </button>
          </div>
        )}

        {view === 'reasons' && ("""

if target_spot in code and "view === 'not_understood_guide'" not in code:
    code = code.replace(target_spot, guide_jsx, 1)
    print('✓ Embedded not_understood_guide view in CalmCornerModal')

with open('src/CalmCornerModal.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('✓ Done clean-calm-modal')
