with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. P1-11: Thêm dòng trước bottom-action-bar-km ở review đề
target_1 = """            )}
          </div>

          {/* Nút dính đáy */}
          <div
            className="bottom-action-bar-km\""""

replacement_1 = """            )}
          </div>

          {/* Dòng tóm tắt trước nút */}
          <div style={{ textAlign: 'center', padding: '6px 12px 14px', color: 'var(--c-sub)', fontSize: 13, fontWeight: 600 }}>
            🐾 Gấu sẽ hỏi {child?.name || 'con'} khoảng 3 bậc gợi mở
          </div>

          {/* Nút dính đáy */}
          <div
            className="bottom-action-bar-km\""""

# 2. P1-13: Xem › cùng dòng
target_2 = """          <span style={{ fontSize: 11.5, color: 'var(--c-primary)', fontWeight: 800 }}>
            {showMathList ? 'Đóng' : 'Xem'}
          </span>
        </div>"""

replacement_2 = """          <span style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>
            {showMathList ? 'Đóng ▲' : 'Xem ›'}
          </span>
        </div>"""

# 3. P1-2: Chấm vở nhãn dòng
target_3 = """          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--c-accent, #F6A623)',
                background: 'var(--c-surface-2, #F1F5F9)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              ✨ Đọc chữ viết tay · {lines.length} dòng
            </span>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Mẹ chạm để sửa chỗ AI đọc nhầm</span>
          </div>"""

replacement_3 = """          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--c-accent-ink, var(--c-accent, #F6A623))',
                  background: 'var(--c-surface-2, #F1F5F9)',
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

# 4. P1-1: Gợi ý mức 2
target_4 = """              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 13, color: 'var(--c-text)' }}>
                  💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
                </b>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>
                  {expandHint2 ? 'Thu gọn ▲' : 'Mở xem ▼'}
                </span>
              </div>"""

replacement_4 = """              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <b style={{ fontSize: 13, color: 'var(--c-text)', flex: 1, minWidth: 0 }}>
                  💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
                </b>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-primary)', flexShrink: 0 }}>
                  {expandHint2 ? '▴' : '▾'}
                </span>
              </div>"""

assert target_1 in txt, 'target_1 not found'
assert target_2 in txt, 'target_2 not found'
assert target_3 in txt, 'target_3 not found'
assert target_4 in txt, 'target_4 not found'

txt = txt.replace(target_1, replacement_1).replace(target_2, replacement_2).replace(target_3, replacement_3).replace(target_4, replacement_4)

with open('src/screens.jsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print('✓ Successfully patched 4 detailed spots in screens.jsx')
