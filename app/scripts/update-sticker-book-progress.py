with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''      {/* 10 Stickers milestone celebration card */}
      {(curStats.stickers >= 10 || list.length >= 10) && ('''

replacement = '''      {/* Thanh tiến độ tới quà (Prompt 23 P3) */}
      <div className="card-km" style={{ padding: '10px 14px', marginBottom: 12, background: 'var(--c-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <b style={{ fontSize: 13, color: 'var(--c-text)' }}>Tiến độ đổi quà chặng này</b>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--c-primary)' }}>
            {Math.min(10, curStats.stickers || list.length || 0)}/10 sticker
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--c-line)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, (curStats.stickers || list.length || 0) * 10)}%`,
              height: '100%',
              background: 'var(--c-accent, #F6A623)',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 10 Stickers milestone celebration card */}
      {(curStats.stickers >= 10 || list.length >= 10) && ('''

if target in text:
    text = text.replace(target, replacement)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Added progress bar to StickerBookSheet')
else:
    print('Could not find target in App.jsx')
