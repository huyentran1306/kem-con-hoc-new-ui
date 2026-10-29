/* ============================================================
   KÈM CON HỌC — HỘP THÔNG BÁO CỦA CÔ (PHỤ HUYNH)
   - GET  /api/v1/family/announcements           (thông báo + lời nhắc, có cờ kind)
   - POST /api/v1/family/announcements/{id}/read  (mở ra là đã đọc)
   - POST /api/v1/family/announcements/{id}/ack   (cô yêu cầu xác nhận)
   Lời nhắc có ngày vẫn hiện ở thẻ "Cô nhắc"; ở đây hiện mọi thông báo để không bỏ sót.
   ============================================================ */
import { useEffect, useState } from 'react'
import { GATEWAY, getAuthToken, teacherLabel } from './api'
import { announcementStatus } from './teacher/announcementStatus.js'
import { isTrialActive } from './trialData.js'
import { Megaphone, Pin, CheckCircle2, Check } from 'lucide-react'

// Prompt 29A: màn chính chỉ hiện tối đa 2 thông báo CÒN HẠN, chưa ẩn (ghim lên trước).
// Thông báo hết hạn chỉ thấy trong "Xem tất cả", để mờ, có nhãn "Đã qua". Đã ẩn / đã xoá thì không hiện.
const HOME_MAX = 2

function normalize(a) {
  return {
    id: a.id ?? a.announcementId ?? a.announcement_id,
    kind: a.kind || 'notice',
    title: a.title || '',
    body: a.body || a.message || a.content || '',
    teacherName: a.teacher_name || a.teacherName || '',
    className: a.class_name || a.className || '',
    childName: a.child_name || a.childName || '',
    createdAt: a.created_at || a.createdAt || '',
    remindFor: a.remind_for || a.remindFor || '',
    pinned: Boolean(a.pinned),
    requireAck: Boolean(a.require_ack ?? a.requireAck),
    readAt: a.read_at || a.readAt || null,
    ackedAt: a.acked_at || a.ackedAt || a.ack_at || null,
    expires_at: a.expires_at ?? a.expiresAt ?? null,
    hidden_at: a.hidden_at || a.hiddenAt || null,
    deleted_at: a.deleted_at || a.deletedAt || null,
    created_at: a.created_at || a.createdAt || '',
    remind_for: a.remind_for || a.remindFor || '',
  }
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(String(iso).includes('T') || String(iso).endsWith('Z') ? iso : String(iso).replace(' ', 'T') + 'Z')
  if (Number.isNaN(d.getTime())) return ''
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} giờ trước`
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
}

async function post(path, token) {
  try {
    await fetch(`${GATEWAY}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  } catch (e) {}
}

export default function FamilyAnnouncements({ childId, toast }) {
  const [items, setItems] = useState([])
  const [openId, setOpenId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    // Prompt 32 mục 8: Dùng thử không gọi API gia đình (tránh 401)
    if (!token || isTrialActive()) return
    let cancelled = false
    fetch(`${GATEWAY}/api/v1/family/announcements`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const list = d && (d.announcements || d.items || [])
        if (Array.isArray(list)) {
          const norm = list
            .map(normalize)
            .filter((a) => a.id != null)
            .map((a) => ({ ...a, status: announcementStatus(a) }))
            .filter((a) => a.status === 'active' || a.status === 'expired')
          norm.sort((x, y) => (y.pinned - x.pinned) || String(y.createdAt).localeCompare(String(x.createdAt)))
          setItems(norm)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [childId])

  const activeItems = items.filter((a) => a.status === 'active')
  const pastItems = items.filter((a) => a.status === 'expired')
  if (activeItems.length === 0 && !showAll) return null

  const token = getAuthToken()
  const unread = activeItems.filter((a) => !a.readAt).length
  const visible = showAll ? [...activeItems, ...pastItems] : activeItems.slice(0, HOME_MAX)

  const open = (a) => {
    setOpenId(openId === a.id ? null : a.id)
    if (!a.readAt && token) {
      setItems((list) => list.map((x) => (x.id === a.id ? { ...x, readAt: new Date().toISOString() } : x)))
      post(`/api/v1/family/announcements/${a.id}/read`, token)
    }
  }
  const ack = (a) => {
    if (!token) return
    setItems((list) => list.map((x) => (x.id === a.id ? { ...x, ackedAt: new Date().toISOString(), readAt: x.readAt || new Date().toISOString() } : x)))
    post(`/api/v1/family/announcements/${a.id}/ack`, token)
    if (toast) toast('Đã xác nhận với cô ✨')
  }

  // [khung] UI mới (Home.dc.html, khối "Thông báo của cô"): thẻ trắng bo lớn, mỗi thông báo một ô nền mềm,
  // icon nét thay emoji, nút "Xem tất cả" viền nhạt. Logic đọc/xác nhận giữ nguyên.
  return (
    <section className="k-card k-ann" aria-label="Thông báo của cô">
      <div className="k-ann-h">
        <Megaphone className="k-ic-acc" size={20} strokeWidth={2} aria-hidden="true" />
        <h2 className="k-h2" style={{ flex: 1 }}>Thông báo của cô</h2>
        {unread > 0 && <span className="k-chip k-ann-new">{unread} mới</span>}
      </div>

      {visible.map((a) => {
        const isOpen = openId === a.id
        const isPast = a.status === 'expired'
        const needAck = a.requireAck && !a.ackedAt && !isPast
        return (
          <div
            key={a.id}
            data-testid={isPast ? 'ann-past' : 'ann-active'}
            className={`k-soft k-ann-item ${a.readAt ? '' : 'is-unread'} ${isPast ? 'is-past' : ''}`}
          >
            <button
              type="button"
              onClick={() => open(a)}
              aria-expanded={isOpen}
              className="k-ann-btn"
            >
              <span className="k-ann-row">
                {!a.readAt && <span className="k-ann-dot" aria-label="Chưa đọc" />}
                {a.pinned && !isPast && <Pin className="k-ic-acc" size={14} strokeWidth={2.2} aria-label="Cô ghim" />}
                {isPast && <span className="k-ann-past">Đã qua</span>}
                <b className="k-ann-title">
                  {a.title || (a.kind === 'reminder' ? 'Lời nhắc của cô' : 'Thông báo')}
                </b>
                <span className="k-muted k-ann-time">{timeAgo(a.createdAt)}</span>
              </span>
              <span className="k-muted k-ann-from">
                {teacherLabel(a.teacherName)}
                {a.className ? ` · ${a.className}` : ''}
                {a.childName ? ` · ${a.childName}` : ''}
                {a.kind === 'reminder' && a.remindFor ? ` · nhắc cho ${new Date(a.remindFor).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}` : ''}
              </span>
              {!isOpen && a.body && <span className="k-ann-body">{a.body}</span>}
            </button>

            {isOpen && <div className="k-ann-full">{a.body}</div>}

            {needAck && (
              <button type="button" className="k-cta-btn k-ann-ack" onClick={() => ack(a)}>
                <CheckCircle2 size={18} strokeWidth={2.2} aria-hidden="true" /> Đã đọc, xác nhận với cô
              </button>
            )}
            {a.requireAck && a.ackedAt && (
              <div className="k-ann-acked"><Check size={15} strokeWidth={2.6} aria-hidden="true" /> Đã xác nhận với cô</div>
            )}
          </div>
        )
      })}

      {/* Prompt 32 mục 8: luôn có dòng "Xem tất cả" dưới danh sách, kể cả khi chỉ có 1–2 thông báo */}
      {(items.length > 0 || showAll) && (
        <button type="button" className="k-btn2" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Thu gọn' : 'Xem tất cả thông báo của cô'}
        </button>
      )}
    </section>
  )
}
