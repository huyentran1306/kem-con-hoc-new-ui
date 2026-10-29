with open('src/games/GocChoiChung.jsx', 'r', encoding='utf-8') as f:
    gc = f.read()

old_token_txt = 'Câu hỏi tạo bằng code từ phần Gấu nhớ, không tốn token. Hết 5 phút thì tự dừng.'
new_token_txt = "Câu hỏi dựa trên chỗ {child?.name || 'con'} hay kẹt. Hết 5 phút thì tự dừng."
if old_token_txt in gc:
    gc = gc.replace(old_token_txt, new_token_txt)
    print('✓ P0-5: Đổi câu kỹ thuật token trong GocChoiChung.jsx')

old_snap_toy_sec = """      {/* Khu "Chụp đồ vật để Gấu nghĩ trò" (Legacy component chuyển xuống dưới) */}
      {SnapToyLegacyComponent && (
        <div style={{ marginTop: 8, borderTop: '1px solid var(--c-line)', paddingTop: 16 }}>"""

new_snap_toy_sec = """      {/* Khu "Chụp đồ vật để Gấu nghĩ trò" (Legacy component chuyển xuống dưới) */}
      {SnapToyLegacyComponent && (
        <div id="sec-snap-toy" style={{ marginTop: 8, borderTop: '1px solid var(--c-line)', paddingTop: 16 }}>"""

if old_snap_toy_sec in gc:
    gc = gc.replace(old_snap_toy_sec, new_snap_toy_sec)
    print('✓ P1-4: Thêm id="sec-snap-toy" để cuộn tới')

with open('src/games/GocChoiChung.jsx', 'w', encoding='utf-8') as f:
    f.write(gc)

# ReportComponents.jsx
with open('src/ReportComponents.jsx', 'r', encoding='utf-8') as f:
    rc = f.read()

old_moc_txt = '🎁 Mốc đổi quà. Đổi quà chỉ đặt lại sổ sticker, lịch sử vẫn giữ nguyên.'
new_moc_txt = '🎁 Mỗi khi đổi quà, bé bắt đầu tích trang sticker mới; lịch sử tiến bộ của con vẫn giữ nguyên.'
if old_moc_txt in rc:
    rc = rc.replace(old_moc_txt, new_moc_txt)
    print('✓ P0-5: Viết lại dòng Mốc đổi quà thành lời phụ huynh hiểu')

with open('src/ReportComponents.jsx', 'w', encoding='utf-8') as f:
    f.write(rc)
