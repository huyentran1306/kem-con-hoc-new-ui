import { useState, useContext } from 'react'
import { AppCtx } from './ctx'
import { familyLogin, familyRegister, teacherLabel } from './api'
import { getTheme } from './themes'
import { TRIAL_SESSION } from './trialData.js'
import { formatClassName, formatTeacherName } from './teacher/format.js'
import { BuddyMascot, resolveBuddyId } from './themes/buddies/buddySvgs'
import { hasBuddyArt } from './themes/buddies/buddyArt.js'
import { AlertCircle, School, Lock, Home as HomeIc, Eye, EyeOff, Sparkles, Mail, Cloud } from 'lucide-react'

export default function LoginScreen({ onAuthed, reauthSession = null, onOpenJoin = null, classJoinBanner = null, initialMode = 'login' }) {
  const { openAdmin, S } = useContext(AppCtx) || {}
  const activeThemeId = S?.theme || (typeof document !== 'undefined' ? document.documentElement.dataset.theme : null) || 'bear'
  const activeTheme = getTheme(activeThemeId)

  // Đợt 15 · 6.6: "Tạo tài khoản" trên dải Dùng thử mở thẳng tab Tạo gia đình mới
  const [mode, setMode] = useState(initialMode === 'register' && !reauthSession ? 'register' : 'login')
  const [name, setName] = useState(reauthSession?.name || '')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    const n = name.trim()
    if (!n || !pass) {
      setErr('Nhập tên gia đình và mật khẩu nhé')
      return
    }
    if (mode === 'register') {
      if (pass.length < 4) {
        setErr('Mật khẩu tối thiểu 4 ký tự')
        return
      }
      if (pass !== pass2) {
        setErr('Mật khẩu nhập lại không khớp')
        return
      }
    }
    setBusy(true)
    setErr('')
    const res = mode === 'login' ? await familyLogin(n, pass) : await familyRegister(n, pass)
    setBusy(false)
    if (!res.ok) {
      setErr(loginErrorText(res, mode))
      return
    }
    onAuthed({ id: res.id, name: n })
  }

  // [khung] UI mới (Main.dc.html / TaoGiaDinh.dc.html): linh vật đất sét trên quyển sách mở, thẻ form trắng bo lớn,
  // ô nhập có icon nét, nút chính viên thuốc CTA, 2 nút phụ viền nhạt. Không đổi luồng, chữ, API.
  const buddyId = resolveBuddyId(activeThemeId)
  return (
    <div className="scroll k-login" style={{ justifyContent: 'center', paddingBottom: 40 }}>
          {classJoinBanner && (
            <div className={`k-login-banner ${classJoinBanner.error ? 'is-err' : ''}`}>
              {classJoinBanner.error ? (
                <div className="k-login-banner-t" style={{ color: 'var(--c-danger-ink, #B4441E)' }}>
                  <AlertCircle size={18} strokeWidth={2.2} aria-hidden="true" /> Mã lớp không còn dùng được
                </div>
              ) : (
                <>
                  <div className="k-login-banner-t">
                    <School className="k-ic-acc" size={18} strokeWidth={2} aria-hidden="true" />
                    <span>Đăng nhập để vào <b>{formatClassName(classJoinBanner.className || classJoinBanner.class_name || classJoinBanner.name) || 'lớp của cô'}</b> của <b>{formatTeacherName(classJoinBanner.teacherName || classJoinBanner.teacher_name, { lower: true })}</b></span>
                  </div>
                  <div className="k-muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                    Đăng nhập xong, mình quay lại đúng màn vào lớp nhé
                  </div>
                </>
              )}
            </div>
          )}

          <div className="k-login-hero">
            <div className="k-login-art" aria-hidden="true">
              <span className="k-book-base" />
              <span className="k-book-page l"><i /><i /></span>
              <span className="k-book-page r"><i /><i /></span>
              <span className="k-login-buddy">
                {hasBuddyArt(buddyId) ? <BuddyMascot buddyId={buddyId} state="idle" size={150} /> : <span style={{ fontSize: 72, lineHeight: 1 }}>{activeTheme.icon}</span>}
              </span>
            </div>
            <h1 className="title k-login-title">Kèm Con Học</h1>
            <p className="k-muted k-login-sub">
              AI không giải bài cho con, chỉ cho bố mẹ cách giảng.
            </p>
          </div>

          <div className="k-card k-login-card">
            {reauthSession && (
              <div className="k-note">
                <Lock size={18} strokeWidth={2} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Nhập lại mật khẩu một lần để bảo vệ dữ liệu gia đình "{reauthSession.name}" với tiêu chuẩn bảo mật mới.
                </span>
              </div>
            )}
            <div className="k-login-modes" role="group" aria-label="Chọn cách vào app">
              <button type="button" className={`k-pill ${mode === 'login' ? 'k-pill-on' : ''}`} aria-pressed={mode === 'login'} onClick={() => { setMode('login'); setErr('') }}>
                Đăng nhập
              </button>
              <button type="button" className={`k-pill ${mode === 'register' ? 'k-pill-on' : ''}`} aria-pressed={mode === 'register'} onClick={() => { setMode('register'); setErr('') }}>
                Tạo gia đình mới
              </button>
            </div>

            <div className="k-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="k-label" htmlFor="login-fam">Tên gia đình</label>
                {mode === 'register' && <span className="k-muted" style={{ fontSize: 12 }}>{name.length}/30</span>}
              </div>
              <div className="k-input">
                <HomeIc className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                <input
                  id="login-fam"
                  className="field"
                  placeholder="VD: Gia đình Na, Nhà Bon…"
                  maxLength={30}
                  value={name}
                  autoComplete="username"
                  onChange={(e) => { setName(e.target.value); if (err) setErr('') }}
                />
              </div>
            </div>

            <div className="k-field">
              <label className="k-label" htmlFor="login-pw">Mật khẩu</label>
              <div className={`k-input k-input-pw ${mode === 'login' && err ? 'is-err' : ''}`}>
                <Lock className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                <input
                  id="login-pw"
                  className="field"
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Tối thiểu 4 ký tự' : 'Nhập mật khẩu'}
                  value={pass}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  onChange={(e) => { setPass(e.target.value); if (err) setErr('') }}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                />
                <button
                  type="button"
                  className="k-icon-btn k-eye"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Hiện/ẩn mật khẩu"
                  title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? <EyeOff size={20} strokeWidth={2} aria-hidden="true" /> : <Eye size={20} strokeWidth={2} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {mode === 'login' && err && <LoginErrorLine text={err} />}

            {mode === 'register' && (
              <div className="k-field">
                <label className="k-label" htmlFor="login-pw2">Nhập lại mật khẩu</label>
                <div className="k-input k-input-pw">
                  <Lock className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                  <input
                    id="login-pw2"
                    className="field"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={pass2}
                    autoComplete="new-password"
                    onChange={(e) => { setPass2(e.target.value); if (err) setErr('') }}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                  <button
                    type="button"
                    className="k-icon-btn k-eye"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Hiện/ẩn mật khẩu"
                    title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff size={20} strokeWidth={2} aria-hidden="true" /> : <Eye size={20} strokeWidth={2} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && err && <LoginErrorLine text={err} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 2 }}>
              <button
                type="button"
                className="k-cta-btn"
                disabled={busy}
                onClick={submit}
              >
                {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào app' : 'Tạo gia đình & vào app'}
              </button>

              {/* 23Z: Dòng đồng bộ chỉ giữ ở Tạo gia đình mới, đặt dưới nút chính */}
              {mode === 'register' && (
                <p className="notice k-muted k-login-sync">
                  <Cloud size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Dữ liệu được đồng bộ để mọi máy trong nhà cùng xem · mỗi gia đình tài khoản riêng</span>
                </p>
              )}

              {/* 23Z: Dòng "hoặc" mảnh */}
              <div className="k-or">
                <span />
                <span className="k-muted">hoặc</span>
                <span />
              </div>

              {/* 23Z: 2 nút phụ cùng 1 hàng, cùng kiểu viền nhẹ, không tô màu */}
              <div className="k-login-alt">
                <button
                  type="button"
                  className="k-btn2"
                  onClick={() => onAuthed(TRIAL_SESSION)}
                >
                  <Sparkles size={18} strokeWidth={2} aria-hidden="true" /> Dùng thử
                </button>
                {onOpenJoin && (
                  <button
                    type="button"
                    className="k-btn2"
                    onClick={onOpenJoin}
                  >
                    <Mail size={18} strokeWidth={2} aria-hidden="true" /> Có mã mời
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
  )
}

// Gói 33 · B2: lỗi đăng nhập là DÒNG CHỮ thông báo, không phải ô trông như nút (không viền nổi, không bóng,
// không con trỏ tay), ngay dưới ô mật khẩu, role="alert". Chưa có gửi mail nên không có "Quên mật khẩu".
export const WRONG_PASSWORD_TEXT = 'Sai mật khẩu rồi, thử lại hoặc liên hệ admin nhé.'

export function loginErrorText(res, mode = 'login') {
  const msg = String(res?.error || '')
  if (res?.network) return msg || 'Không kết nối được máy chủ, kiểm tra mạng rồi thử lại nhé.'
  const wrong = /sai mật khẩu|mật khẩu (không đúng|chưa đúng|sai)|wrong password|invalid password|incorrect password/i.test(msg.normalize('NFC')) || res?.code === 'WRONG_PASSWORD' || res?.code === 'INVALID_PASSWORD'
  if (mode === 'login' && wrong) return WRONG_PASSWORD_TEXT
  return msg || 'Có lỗi xảy ra, thử lại nhé.'
}

function LoginErrorLine({ text }) {
  return (
    <p
      role="alert"
      data-testid="login-error"
      className="k-login-err"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '-4px 2px 0', fontSize: 13.5, lineHeight: 1.45, fontWeight: 700, color: 'var(--c-danger-ink, #B4441E)', background: 'none', border: 'none', boxShadow: 'none', cursor: 'default' }}
    >
      <AlertCircle size={16} strokeWidth={2.2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{text}</span>
    </p>
  )
}
