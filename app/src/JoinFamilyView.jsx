import React, { useState, useEffect } from 'react'
import { getPublicInvite, acceptInvite, setAuthToken } from './api'
import { soundSuccess, soundWrong, soundPop } from './audio'
import { Home as HomeIc, Mail, AlertCircle, UserRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react'

export function JoinFamilyView({ inviteCode, onJoined, onCancel, toast, boom }) {
  const [code, setCode] = useState((inviteCode || '').toUpperCase())
  const [inviteInfo, setInviteInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form input
  const [displayName, setDisplayName] = useState('')
  const [relation, setRelation] = useState('Bố')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchInvite = async (c) => {
    if (!c || c.length < 4) return
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await getPublicInvite(c)
      if (res.ok && res.valid) {
        setInviteInfo(res)
        if (res.relationHint) setRelation(res.relationHint)
      } else {
        setInviteInfo(null)
        setErrorMsg(res.error?.message || 'Mã mời không tồn tại hoặc đã hết hạn')
      }
    } catch {
      setErrorMsg('Lỗi kiểm tra mã mời. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (inviteCode) {
      fetchInvite(inviteCode)
    }
  }, [inviteCode])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!displayName.trim()) {
      toast('Vui lòng nhập tên hiển thị của bạn')
      return
    }
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      toast('Mã PIN phải từ 4 đến 6 chữ số')
      return
    }
    if (pin !== pinConfirm) {
      toast('Mã PIN nhập lại không khớp')
      return
    }

    soundPop(550)
    setSubmitting(true)
    try {
      const res = await acceptInvite(code, {
        displayName: displayName.trim(),
        relation,
        pin,
      })

      if (res.ok && res.token) {
        setAuthToken(res.token)
        soundSuccess()
        boom?.()
        toast(`Chào mừng ${relation} ${displayName.trim()} đã vào nhà! 🎉`)
        onJoined?.(res)
      } else {
        soundWrong()
        toast(res.error?.message || 'Không thể gia nhập gia đình')
      }
    } catch {
      toast('Lỗi kết nối khi gia nhập')
    } finally {
      setSubmitting(false)
    }
  }

  // [khung] UI mới (KhaiBao.dc.html / Main.dc.html): nền trời theo bộ, thẻ trắng bo lớn, ô nhập viên thuốc,
  // chip quan hệ dạng viên thuốc, nút chính CTA. Mọi màu đi qua biến --k-* (có fallback --c-* cho bộ tự thiết kế).
  return (
    <div className="k-join">
      <div className="k-sky" aria-hidden="true"><i className="k-puff k-p1" /><i className="k-puff k-p2" /><i className="k-dot k-d1" /><i className="k-dot k-d2" /></div>
      <div className="k-card k-join-card pop">
        <div style={{ textAlign: 'center', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span className="k-join-ic" aria-hidden="true"><HomeIc size={30} strokeWidth={2} /></span>
          <h2 className="k-h1" style={{ fontSize: 24 }}>
            Tham gia gia đình
          </h2>
          <p className="k-muted" style={{ margin: 0 }}>
            Cùng người thân theo dõi và hướng dẫn các con học tập mỗi ngày
          </p>
        </div>

        {/* Chưa có thông tin mã mời -> Ô nhập mã */}
        {!inviteInfo && (
          <div style={{ marginBottom: 12 }}>
            <label className="k-label" htmlFor="join-code" style={{ display: 'block', marginBottom: 6 }}>
              Nhập mã mời 6 ký tự:
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div className="k-input" style={{ flex: 1, minWidth: 0, padding: '0 14px' }}>
                <Mail className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                <input
                  id="join-code"
                  className="field field-code"
                  placeholder="Ví dụ: X5N9AP"
                  value={code}
                  maxLength={8}
                  onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                  style={{
                    fontFamily: code ? 'monospace' : 'inherit',
                    fontSize: code ? 18 : 15,
                    fontWeight: code ? 800 : 600,
                    letterSpacing: code ? 3 : 0,
                    textTransform: 'uppercase',
                  }}
                />
              </div>
              <button
                type="button"
                className="k-cta-btn"
                style={{ width: 'auto', minWidth: 104, minHeight: 54, padding: '0 16px', fontSize: 16, flexShrink: 0, whiteSpace: 'nowrap' }}
                disabled={loading || code.length < 4}
                onClick={() => fetchInvite(code)}
              >
                {loading ? '…' : 'Kiểm tra'}
              </button>
            </div>
            {errorMsg && (
              <p role="alert" className="k-login-err" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6, margin: '8px 0 0', fontSize: 13.5, fontWeight: 700, color: 'var(--c-danger-ink, #B4441E)' }}>
                <AlertCircle size={16} strokeWidth={2.2} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>
        )}

        {/* Đã xác thực mã mời -> Form điền thông tin */}
        {inviteInfo && (
          <div>
            <div className="k-join-ok">
              <Mail size={24} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.4 }}>
                <b>{inviteInfo.inviterName}</b> mời bạn tham gia cùng gia đình <b>{inviteInfo.familyName}</b>!
                <div style={{ fontSize: 12.5, marginTop: 2 }}>
                  Vai trò: <b>{inviteInfo.role === 'guardian' ? 'Kèm con (Chụp & Giảng bài)' : 'Chỉ xem (Xem báo cáo)'}</b>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="k-field">
                <label className="k-label" htmlFor="join-name">
                  Tên hiển thị của bạn:
                </label>
                <div className="k-input">
                  <UserRound className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                  <input
                    id="join-name"
                    className="field"
                    placeholder="Ví dụ: Tuấn, Lan, Ngoại..."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="k-field">
                <span className="k-label">
                  Quan hệ với con:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Bố', 'Mẹ', 'Bà', 'Ông', 'Cô/Chú', 'Gia sư', 'Khác'].map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      className={`k-pill ${relation === rel ? 'k-pill-on' : ''}`}
                      aria-pressed={relation === rel}
                      onClick={() => setRelation(rel)}
                      style={{ padding: '0 14px', fontSize: 14 }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="k-field">
                <label className="k-label" htmlFor="join-pin">
                  Mã PIN cá nhân (4 - 6 số):
                </label>
                <div className="k-input">
                  <Lock className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                  <input
                    id="join-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    className="field"
                    placeholder="Nhập 4 - 6 chữ số"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="k-field">
                <label className="k-label" htmlFor="join-pin2">
                  Xác nhận mã PIN:
                </label>
                <div className="k-input">
                  <Lock className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
                  <input
                    id="join-pin2"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    className="field"
                    placeholder="Nhập lại mã PIN"
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="k-cta-btn"
                disabled={submitting}
                style={{ marginTop: 4 }}
              >
                {submitting ? 'Đang vào nhà…' : 'Vào nhà cùng con'}
                {!submitting && <ArrowRight size={20} strokeWidth={2.4} aria-hidden="true" />}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="k-btn2"
            onClick={onCancel}
          >
            <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" /> Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  )
}
