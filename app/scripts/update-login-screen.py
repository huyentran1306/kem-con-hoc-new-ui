with open('src/Login.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_block = '''            <button className="btn solid" disabled={busy} onClick={submit}>
              {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào app' : 'Tạo gia đình & vào app'}
            </button>

            <p className="notice">
              Dữ liệu được đồng bộ để mọi máy trong nhà cùng xem · mỗi gia đình tài khoản riêng ☁️
            </p>

            {onOpenJoin && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700 }}
                  onClick={onOpenJoin}
                >
                  💌 Bạn có mã mời tham gia gia đình?
                </button>
              </div>
            )}

            <div style={{ marginTop: 14, borderTop: '1px dashed var(--line, #E2E8F0)', paddingTop: 14, textAlign: 'center' }}>
              <button
                type="button"
                className="btn ghost trial-btn"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '2px dashed var(--c-warn-line, #F6A623)',
                  background: 'var(--c-hint1-bg, #FFFBEB)',
                  color: 'var(--c-text, #78350F)',
                  fontWeight: 800,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
                onClick={() => onAuthed(TRIAL_SESSION)}
              >
                <span>✨ Dùng thử không cần tài khoản ➔</span>
              </button>
              <div style={{ fontSize: 11.5, color: 'var(--c-text-2, #8A6A4A)', marginTop: 5 }}>
                Khám phá gia đình mẫu 2 con, 3 bài soạn sẵn, không cần mạng
              </div>
            </div>'''

new_block = '''            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%' }}
                disabled={busy}
                onClick={submit}
              >
                {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào app' : 'Tạo gia đình & vào app'}
              </button>

              {/* Nút Phụ ngay dưới nút Vào app (Prompt 23 P3) */}
              <button
                type="button"
                className="btn-km btn-km-m btn-km-secondary"
                style={{ width: '100%' }}
                onClick={() => onAuthed(TRIAL_SESSION)}
              >
                ✨ Dùng thử không cần tài khoản
              </button>
            </div>

            <p className="notice" style={{ marginTop: 10 }}>
              Dữ liệu được đồng bộ để mọi máy trong nhà cùng xem · mỗi gia đình tài khoản riêng ☁️
            </p>

            {onOpenJoin && (
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ fontSize: 13, color: 'var(--c-primary, #4F46E5)', fontWeight: 700 }}
                  onClick={onOpenJoin}
                >
                  💌 Bạn có mã mời tham gia gia đình?
                </button>
              </div>
            )}'''

if old_block in text:
    text = text.replace(old_block, new_block)
    with open('src/Login.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated Login.jsx with secondary trial button right below main button')
else:
    print('Could not find old_block in Login.jsx')
