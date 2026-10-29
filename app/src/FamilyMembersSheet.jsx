import { isTrialActive } from "./trialData.js"
import { appConfirm } from './dialog'
import React, { useState, useEffect } from 'react'
import {
  getFamilyMembers,
  createFamilyInvite,
  getFamilyInvites,
  revokeFamilyInvite,
  updateFamilyMember,
  deleteFamilyMember,
  createDeviceCode,
} from './api'
import { soundPop, soundSuccess, soundWrong } from './audio'
import { X, Star, Settings, Plus, Pencil, Eye, MessageCircle, Copy, Smartphone } from 'lucide-react'
import './familySheets.css'

export function FamilyMembersSheet({ onClose, toast, currentUser, familyName }) {
  const [tab, setTab] = useState('members') // 'members' | 'invite' | 'device'
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  // Form mời
  const [inviteRole, setInviteRole] = useState('guardian')
  const [relationHint, setRelationHint] = useState('Bố')
  const [createdInvite, setCreatedInvite] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  // Form mã thiết bị
  const [deviceCode, setDeviceCode] = useState(null)
  const [deviceLoading, setDeviceLoading] = useState(false)

  const isOwner = currentUser?.role === 'owner'
  const isGuardian = currentUser?.role === 'guardian'
  const canInvite = isOwner || isGuardian

  const loadData = async () => {
    setLoading(true)
    const TRIAL_MEMBERS = [
      { id: "mem_mom", displayName: "Mẹ Lan", name: "Mẹ Lan", role: "owner", relation: "Mẹ", relation_hint: "Mẹ", email: "me.lan@kemconhoc.vn", is_active: true },
      { id: "mem_dad", displayName: "Bố Minh", name: "Bố Minh", role: "guardian", relation: "Bố", relation_hint: "Bố", email: "bo.minh@kemconhoc.vn", is_active: true },
    ]
    try {
      if (isTrialActive()) {
        setMembers(TRIAL_MEMBERS)
        setInvites([])
        setLoading(false)
        return
      }
      const [mRes, iRes] = await Promise.all([getFamilyMembers(), getFamilyInvites()])
      if (mRes && mRes.ok && mRes.members && mRes.members.length > 0) {
        setMembers(mRes.members)
      } else if (isTrialActive()) {
        setMembers(TRIAL_MEMBERS)
      } else {
        setMembers(mRes?.members || [])
      }
      if (iRes && iRes.ok) setInvites(iRes.invites || [])
    } catch (e) {
      if (isTrialActive()) {
        setMembers(TRIAL_MEMBERS)
      }
      console.warn('load members/invites failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateInvite = async () => {
    soundPop(550)
    setInviteLoading(true)
    try {
      const res = await createFamilyInvite({ role: inviteRole, relationHint })
      if (res.ok) {
        soundSuccess()
        setCreatedInvite(res.invite)
        toast('Đã tạo mã mời thành công! 🎉')
        loadData()
      } else {
        soundWrong()
        toast(res.error?.message || 'Không tạo được mã mời')
      }
    } catch (e) {
      toast('Lỗi kết nối khi tạo mã mời')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRevokeInvite = async (code) => {
    if (!(await appConfirm(`Mã mời ${code} sẽ không dùng được nữa.`, { title: 'Thu hồi mã mời?', okText: 'Thu hồi' }))) return
    try {
      const res = await revokeFamilyInvite(code)
      if (res.ok) {
        toast(`Đã thu hồi mã mời ${code}`)
        loadData()
      }
    } catch {
      toast('Lỗi khi thu hồi mã mời')
    }
  }

  const handleChangeRole = async (memberId, currentRole) => {
    const newRole = currentRole === 'guardian' ? 'viewer' : 'guardian'
    const roleName = newRole === 'guardian' ? 'Kèm con' : 'Chỉ xem'
    if (!(await appConfirm(`Đổi vai trò thành viên này sang "${roleName}"?`, { okText: 'Đổi vai trò' }))) return
    try {
      const res = await updateFamilyMember(memberId, { role: newRole })
      if (res.ok) {
        toast(`Đã chuyển sang vai trò ${roleName}`)
        loadData()
      }
    } catch {
      toast('Lỗi cập nhật vai trò')
    }
  }

  const handleDeleteMember = async (memberId, name) => {
    if (!(await appConfirm(`Xoá thành viên "${name}" khỏi gia đình?`, { danger: true }))) return
    try {
      const res = await deleteFamilyMember(memberId)
      if (res.ok) {
        toast(`Đã xoá thành viên ${name}`)
        loadData()
      } else {
        toast(res.error?.message || 'Không xoá được thành viên')
      }
    } catch {
      toast('Lỗi khi xoá thành viên')
    }
  }

  const handleCreateDeviceCode = async () => {
    soundPop(600)
    setDeviceLoading(true)
    try {
      const res = await createDeviceCode()
      if (res.ok) {
        soundSuccess()
        setDeviceCode(res)
        toast('Mã đăng nhập máy mới có hiệu lực trong 15 phút! ⏱️')
      } else {
        toast(res.error?.message || 'Không tạo được mã đăng nhập máy mới')
      }
    } catch {
      toast('Lỗi tạo mã đăng nhập máy mới')
    } finally {
      setDeviceLoading(false)
    }
  }

  const getJoinUrl = (code) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/join/${code}`
  }

  const handleShareZalo = async (code) => {
    const joinUrl = getJoinUrl(code)
    const text = `${familyName || 'Gia đình'} mời bạn cùng kèm con trên app Kèm Con Học! Nhập mã [${code}] hoặc bấm vào link để vào nhà:`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lời mời Kèm Con Học', text, url: joinUrl })
        toast('Đã mở bảng chia sẻ! 📲')
        return
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('share error:', err)
      }
    }
    // Fallback mở Zalo Web share
    window.open(`https://zalo.me/share?url=${encodeURIComponent(joinUrl)}&title=${encodeURIComponent(text)}`, '_blank')
    toast('Đã mở chia sẻ Zalo 📲')
  }

  const handleCopy = async (txt, label = 'link') => {
    try {
      await navigator.clipboard.writeText(txt)
      toast(`Đã sao chép ${label}! 📋`)
    } catch {
      toast('Vui lòng chọn và sao chép thủ công')
    }
  }

  const roleBadge = (role) => {
    if (role === 'owner') return <span className="fm-badge owner">Chủ nhà</span>
    if (role === 'guardian') return <span className="fm-badge guard">Kèm con</span>
    return <span className="fm-badge">Chỉ xem</span>
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet fm-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-t5-card pn fm" role="dialog" aria-modal="true" aria-labelledby="fm-title">
        <div className="sheet-t5-grab fm-grab" />
        <div className="fm-head">
          <h3 id="fm-title">Thành viên gia đình</h3>
          <button className="fm-x" onClick={onClose} aria-label="Đóng"><X size={20} aria-hidden="true" /></button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="fm-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'members'} className={tab === 'members' ? 'on' : ''} onClick={() => setTab('members')}>
            Thành viên ({members.length})
          </button>
          {canInvite && (
            <button role="tab" aria-selected={tab === 'invite'} className={tab === 'invite' ? 'on' : ''} onClick={() => setTab('invite')}>
              Mời người thân
            </button>
          )}
          <button role="tab" aria-selected={tab === 'device'} className={tab === 'device' ? 'on' : ''} onClick={() => setTab('device')}>
            Máy khác
          </button>
        </div>

        {/* 1. TAB DANH SÁCH THÀNH VIÊN */}
        {tab === 'members' && (
          <div className="fm-sec">
            <p className="sub fm-sub">
              Các thành viên dùng chung dữ liệu học của các con. Mọi buổi học đều ghi công chính xác ai kèm.
            </p>

            {loading ? (
              <div className="fm-loading">Đang tải danh sách thành viên…</div>
            ) : (
              <div className="fm-list">
                {members.map((m) => {
                  const isSelf = m.id === currentUser?.id
                  return (
                    <div key={m.id} className={`fm-mem ${isSelf ? 'self' : ''}`}>
                      <div className={`fm-av ${m.role === 'owner' ? 'owner' : m.role === 'guardian' ? 'guard' : ''}`} aria-hidden="true">
                        {(m.displayName || m.name || m.relation || (m.role === 'owner' ? 'M' : 'B'))[0].toUpperCase()}
                      </div>
                      <div className="fm-mem-tx">
                        <div className="fm-mem-n">
                          <b>{m.displayName || m.name || (m.relation ? `${m.relation}` : (m.role === 'owner' ? 'Chủ gia đình' : 'Thành viên'))}</b>
                          {isSelf && <span className="fm-you">(Bạn)</span>}
                          {roleBadge(m.role)}
                        </div>
                        <div className="fm-mem-s">
                          {m.sessionsWeek > 0 ? (
                            <span className="fm-good"><Star size={13} aria-hidden="true" /> Đã kèm {m.sessionsWeek} buổi tuần này</span>
                          ) : (
                            <span>Chưa có buổi kèm nào tuần này</span>
                          )}
                        </div>
                      </div>

                      {/* Thao tác của Chủ nhà */}
                      {isOwner && !isSelf && (
                        <div className="fm-acts">
                          <button className="fm-ib" title="Đổi vai trò" aria-label="Đổi vai trò" onClick={() => handleChangeRole(m.id, m.role)}>
                            <Settings size={18} aria-hidden="true" />
                          </button>
                          <button className="fm-ib danger" title="Xoá thành viên" aria-label="Xoá thành viên" onClick={() => handleDeleteMember(m.id, m.displayName)}>
                            <X size={18} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {canInvite && (
              <button type="button" className="fm-btn2 fm-invite" onClick={() => setTab('invite')}>
                <Plus size={18} aria-hidden="true" /> Mời người thân cùng kèm con
              </button>
            )}

            {/* Danh sách mã mời đang chờ */}
            {invites.length > 0 && (
              <div className="fm-inv">
                <b className="fm-lbl">
                  Mã mời đang chờ người thân vào ({invites.length}):
                </b>
                <div className="fm-list">
                  {invites.map((inv) => (
                    <div key={inv.code} className="fm-inv-row">
                      <div>
                        <div className="fm-inv-c">
                          <span className="fm-code-s">{inv.code}</span>
                          <span className="fm-mut">
                            ({inv.relationHint ? `Gợi ý: ${inv.relationHint} · ` : ''}{inv.role === 'guardian' ? 'Kèm con' : 'Chỉ xem'})
                          </span>
                        </div>
                        <div className="fm-mut">
                          Hết hạn: {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="fm-acts">
                        <button className="fm-mini" onClick={() => handleShareZalo(inv.code)}>Gửi Zalo</button>
                        <button className="fm-mini danger" onClick={() => handleRevokeInvite(inv.code)}>Thu hồi</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. TAB MỜI NGƯỜI THÂN */}
        {tab === 'invite' && (
          <div className="fm-sec">
            {!createdInvite ? (
              <div className="fm-sec">
                <p className="sub fm-sub">
                  Tạo mã mời 6 chữ số để gửi cho Bố, Ông Bà hoặc Gia sư cùng kèm con.
                </p>

                <div className="fm-card">
                  <label className="fm-lbl">
                    1. Người được mời sẽ đóng vai trò gì?
                  </label>
                  <div className="fm-roles">
                    <button
                      type="button"
                      className={`fm-role ${inviteRole === 'guardian' ? 'on' : ''}`}
                      aria-pressed={inviteRole === 'guardian'}
                      onClick={() => setInviteRole('guardian')}
                      disabled={!isOwner}
                    >
                      <Pencil size={18} aria-hidden="true" />
                      Kèm con
                      <span>Chụp bài, cùng giảng bài</span>
                    </button>
                    <button
                      type="button"
                      className={`fm-role ${inviteRole === 'viewer' ? 'on' : ''}`}
                      aria-pressed={inviteRole === 'viewer'}
                      onClick={() => setInviteRole('viewer')}
                    >
                      <Eye size={18} aria-hidden="true" />
                      Chỉ xem
                      <span>Xem báo cáo, tiến độ</span>
                    </button>
                  </div>

                  <label className="fm-lbl">
                    2. Quan hệ với con (Gợi ý)
                  </label>
                  <div className="fm-rels">
                    {['Bố', 'Mẹ', 'Bà', 'Ông', 'Cô/Chú', 'Gia sư', 'Khác'].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        className={`fm-rel ${relationHint === rel ? 'on' : ''}`}
                        aria-pressed={relationHint === rel}
                        onClick={() => setRelationHint(rel)}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn solid fm-cta"
                    disabled={inviteLoading}
                    onClick={handleCreateInvite}
                  >
                    {inviteLoading ? 'Đang tạo mã…' : 'Tạo mã mời 6 chữ số'}
                  </button>
                </div>
              </div>
            ) : (
              /* Đã tạo mã mời xong */
              <div className="fm-sec fm-center">
                <div className="fm-codebox">
                  <span className="fm-cap">
                    Mã mời tham gia gia đình (Hạn 72 giờ)
                  </span>
                  <div className="fm-code">
                    {createdInvite.code}
                  </div>
                  <p className="fm-mut">
                    Dành cho: <b>{createdInvite.relationHint || 'Người thân'}</b> ({createdInvite.role === 'guardian' ? 'Kèm con' : 'Chỉ xem'})
                  </p>
                </div>

                <div className="fm-btns">
                  <button className="btn solid fm-cta" onClick={() => handleShareZalo(createdInvite.code)}>
                    <MessageCircle size={20} aria-hidden="true" /> Gửi qua Zalo ngay
                  </button>
                  <button className="fm-btn2" onClick={() => handleCopy(getJoinUrl(createdInvite.code), 'link mời')}>
                    <Copy size={18} aria-hidden="true" /> Sao chép link tham gia
                  </button>
                  <button className="fm-btn2" onClick={() => setCreatedInvite(null)}>
                    Tạo thêm mã khác
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TAB ĐĂNG NHẬP MÁY KHÁC */}
        {tab === 'device' && (
          <div className="fm-sec">
            <p className="sub fm-sub">
              Khi bạn hoặc người thân muốn đăng nhập app trên điện thoại/máy tính mới mà <b>không cần nhập mật khẩu chung</b> của gia đình.
            </p>

            <div className="fm-card fm-center">
              {!deviceCode ? (
                <div className="fm-sec fm-center">
                  <span className="fm-big-ic" aria-hidden="true"><Smartphone size={28} /></span>
                  <b className="fm-t">
                    Mã đăng nhập thiết bị mới
                  </b>
                  <p className="fm-mut">
                    Mã này gắn với tài khoản của bạn, có hiệu lực trong <b>15 phút</b>. Trên máy mới, bạn chỉ cần nhập mã này kèm mã PIN cá nhân là vào được ngay.
                  </p>
                  <button
                    className="btn solid fm-cta"
                    disabled={deviceLoading}
                    onClick={handleCreateDeviceCode}
                  >
                    {deviceLoading ? 'Đang tạo mã…' : 'Lấy mã đăng nhập máy mới'}
                  </button>
                </div>
              ) : (
                <div className="fm-sec fm-center">
                  <span className="fm-cap">
                    Mã máy mới (Có hiệu lực 15 phút)
                  </span>
                  <div className="fm-code">
                    {deviceCode.code}
                  </div>
                  <p className="fm-mut">
                    Mở app trên máy mới → Chọn <b>"Đăng nhập máy mới"</b> → Nhập mã trên và mã PIN cá nhân của bạn.
                  </p>
                  <button className="fm-btn2" onClick={() => handleCopy(deviceCode.code, 'mã máy mới')}>
                    <Copy size={18} aria-hidden="true" /> Sao chép mã
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
