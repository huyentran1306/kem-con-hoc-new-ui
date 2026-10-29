with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Hide tabs during focused study screens
tabs_target = '''          {S.onboarded && (
            <nav className="tabs">'''

tabs_replacement = '''          {S.onboarded && !['snap', 'analyze', 'explain', 'scaffold', 'checkWork', 'check_work', 'check'].includes(screen) && (
            <nav className="tabs">'''

if tabs_target in code:
    code = code.replace(tabs_target, tabs_replacement, 1)

# 2. Remove floating calm-fab button
calm_marker = "onClick={() => openSheet('calm')}"
calm_btn_idx = code.find(calm_marker)
if calm_btn_idx != -1:
    btn_start = code.rfind('{S.onboarded && (', 0, calm_btn_idx)
    btn_end = code.find(')}', calm_btn_idx)
    if btn_start != -1 and btn_end != -1:
        code = code[:btn_start] + "{/* Prompt 23: Nút 😮‍💨 chuyển lên top bar 36px của mọi màn, bỏ nút nổi đè góc dưới */}" + code[btn_end + 2:]

# 3. Update trial-top-banner to slim 32px banner
trial_banner_marker = 'className="trial-top-banner"'
t_idx = code.find(trial_banner_marker)
if t_idx != -1:
    div_start = code.rfind('{session?.isTrial && !trialCollapsed && (', 0, t_idx)
    div_end = code.find('          )}', t_idx)
    if div_start != -1 and div_end != -1:
        new_banner = '''{session?.isTrial && !trialCollapsed && (
            <div className="banner-trial-km" role="region" aria-label="Chế độ dùng thử">
              <span>✨ <b>Đang dùng thử</b> · Không lưu đám mây</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className="btn-km btn-km-s btn-km-primary"
                  style={{ height: 26, fontSize: 11.5, padding: '0 8px' }}
                  onClick={() => {
                    setSession(null)
                    removeAuthToken()
                    try { localStorage.removeItem('kem-con-hoc:session') } catch (e) {}
                    setLoginMode('register')
                  }}
                >
                  Tạo tài khoản
                </button>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 13, cursor: 'pointer', padding: '0 4px' }}
                  onClick={() => setTrialCollapsed(true)}
                  title="Thu gọn"
                  aria-label="Thu gọn"
                >
                  ✕
                </button>
              </div>
            </div>
          )}'''
        code = code[:div_start] + new_banner + code[div_end + 12:]

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('App.jsx updated successfully')
