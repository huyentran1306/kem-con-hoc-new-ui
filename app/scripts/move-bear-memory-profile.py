with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Tìm lời gọi ở đầu trang Con
call_top = '''      {/* ===== Nhóm 1 · Con ===== */}
      <h2 className="pg-section-title">Con</h2>
      {/* ĐỢT 22 · CHẶNG 0: MỤC RIÊNG NHỮNG GÌ GẤU NHỚ VỀ CON */}
      <BearMemorySection child={child} S={S} stats={stats} patch={patch} toast={toast} />'''

call_top_cleaned = '''      {/* ===== Nhóm 1 · Con ===== */}
      <h2 className="pg-section-title">Con</h2>'''

# Vị trí nhóm 4 Riêng tư và an toàn
target_sec = '''      {/* ===== Nhóm 4 · Riêng tư và an toàn ===== */}
      <h2 className="pg-section-title">Riêng tư và an toàn</h2>'''

target_sec_with_memory = '''      {/* ===== Nhóm 4 · Những gì Gấu nhớ & Riêng tư ===== */}
      <h2 className="pg-section-title">Những gì Gấu nhớ & Riêng tư</h2>
      <BearMemorySection child={child} S={S} stats={stats} patch={patch} toast={toast} />'''

if call_top in text and target_sec in text:
    text = text.replace(call_top, call_top_cleaned)
    text = text.replace(target_sec, target_sec_with_memory)
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Moved BearMemorySection to bottom section of Profile')
else:
    print('Could not find markers to move BearMemorySection')
