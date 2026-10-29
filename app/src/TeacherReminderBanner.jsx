/* ============================================================
   KÈM CON HỌC — THẺ CÔ NHẮC TRÊN MÀN CHÍNH (PROMPT 11 - PHẦN B)
   Hiển thị lời nhắc có ngày từ giáo viên với nút "Đã nhắc con"
   Tuân thủ quy tắc:
   - Hiện từ 12:00 trưa hôm trước đến 12:00 trưa ngày áp dụng
   - Đến 20:00 tối hôm trước chưa bấm: viền nhấn nổi bật
   - Nhà nhiều con: hiển thị lời nhắc của MỌI con kèm chip tên con màu riêng
   - Kết nối trực tiếp API Backend Worker: GET /family/reminders & POST /family/announcements/{id}/done
   - Tài khoản "Chỉ xem" (viewer) thấy trạng thái nhưng không có nút
   - Tối đa 3 thẻ gộp, còn lại ghi "+N trong hộp thông báo"
   ============================================================ */

import { useState, useEffect, useContext } from 'react'
import { isReminderInDisplayWindow, isLateNightUrgent } from './teacherReminderData.js'
import { getAuthToken, fetchFamilyReminders, markFamilyReminderDone, teacherLabel } from './api'
import { isTrialActive, getTrialTeacherReminders } from './trialData.js'
import { AppCtx } from './ctx'
// [khung] UI mới: icon nét thay emoji, thẻ trắng bo lớn theo HomeLanDau.dc.html
import { UserRound, CalendarDays, Check, Bell, BookOpen, ArrowRight } from 'lucide-react'


export default function TeacherReminderBanner({ child, S, patch, go, openSheet, toast }) {
  const { Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const [reminders, setReminders] = useState([])
  const [doneMap, setDoneMap] = useState(() => {
    try {
      const saved = localStorage.getItem('kem-con-hoc:reminders-done')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    loadReminders()
  }, [child?.name, S?.children])

  async function loadReminders() {
    const token = isTrialActive() ? null : getAuthToken() // Prompt 32 mục 8: Dùng thử không gọi API gia đình
    if (token) {
      try {
        const res = await fetchFamilyReminders({ token, window: 'today' })
        const list = res && (res.reminders || res.items || res.announcements)
        if (res && res.ok !== false && Array.isArray(list)) {
          // Máy chủ có thể trả camelCase hoặc snake_case → đọc cả hai
          const serverReminders = list.map((r) => ({
            id: r.id ?? r.announcementId ?? r.announcement_id,
            teacher_name: r.teacher_name || r.teacherName || '',
            class_name: r.class_name || r.className || 'Lớp của con',
            child_name: r.child_name || r.childName || '',
            child_id: r.child_id ?? r.childId,
            message: r.body || r.message || r.content || '',
            target_date: r.remind_for || r.remindFor || r.target_date || r.targetDate,
            assignment_id: r.assignment_id || r.assignmentId || null,
            done_at: r.done_at || r.doneAt,
            done_by_name: r.done_by_name || r.doneByName,
          }))
          // Đã đăng nhập: chỉ hiện lời nhắc thật của cô (không dùng dữ liệu mẫu)
          setReminders(serverReminders)
          return
        }
      } catch (e) {
        console.warn('Load reminders error:', e)
      }
      setReminders([])
      return
    }

    // Đợt 15 P0.C: dữ liệu mẫu CHỈ dùng ở chế độ Dùng thử, không bao giờ cho tài khoản thật
    if (isTrialActive()) {
      setReminders(getTrialTeacherReminders(child?.name))
      return
    }
    setReminders([])
  }

  const handleMarkDone = async (remId) => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const updated = { ...doneMap, [remId]: nowTime }
    setDoneMap(updated)
    try {
      localStorage.setItem('kem-con-hoc:reminders-done', JSON.stringify(updated))
    } catch {}

    // Call server to persist
    const token = getAuthToken()
    if (token) {
      try {
        await markFamilyReminderDone({ token, announcementId: remId })
      } catch {}
    }

    if (toast) toast(`Đã ghi nhận: ${Ho} đã nhắc con chu đáo! ✨`)
  }

  // Filter reminders within active display window (12:00 yesterday to 12:00 today)
  const activeReminders = reminders.filter((rem) => isReminderInDisplayWindow(rem.target_date))

  if (activeReminders.length === 0) return null

  const isViewOnly = S?.userRole === 'viewer' || S?.role === 'viewer'
  const visibleReminders = activeReminders.slice(0, 3)
  const hiddenCount = activeReminders.length - visibleReminders.length

  return (
    <div className="k-trb" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {visibleReminders.map((rem) => {
        const isDone = Boolean(doneMap[rem.id] || rem.done_at)
        const doneTime = doneMap[rem.id] || (rem.done_at ? new Date(rem.done_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '')
        const isUrgent = isLateNightUrgent(rem.target_date, isDone)
        const targetDateObj = rem.target_date ? new Date(rem.target_date) : null
        const targetDateFormatted = targetDateObj
          ? targetDateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
          : 'Hôm nay'

        return (
          <section key={rem.id} className={`k-card k-trb-card ${isUrgent ? 'is-urgent' : ''}`}>
            {/* Header cô nhắc */}
            <div className="k-trb-h">
              <span className="k-trb-av" aria-hidden="true">
                <UserRound size={18} strokeWidth={2} />
              </span>
              <div className="k-trb-who">
                {teacherLabel(rem.teacher_name)} · {rem.class_name} nhắc
              </div>
              {rem.child_name && <span className="k-chip k-trb-kid">{rem.child_name}</span>}
            </div>

            {/* Nội dung lời nhắc */}
            <p className="k-h2 k-trb-msg">{rem.message}</p>

            {/* Thời gian áp dụng */}
            <div className="k-muted k-trb-date">
              <CalendarDays className="k-ic-acc" size={16} strokeWidth={2} aria-hidden="true" />
              <span>Áp dụng cho: <b>{targetDateFormatted}</b></span>
            </div>

            {/* Hành động */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {isDone ? (
                <div className="k-trb-done">
                  <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                  {rem.done_by_name || 'Bố mẹ'} đã nhắc con lúc {doneTime}
                </div>
              ) : isViewOnly ? (
                <div className="k-trb-view">
                  Chưa ghi nhận nhắc con (Chỉ xem)
                </div>
              ) : (
                <button
                  type="button"
                  className="k-btn2"
                  onClick={() => handleMarkDone(rem.id)}
                >
                  <Bell size={18} strokeWidth={2} aria-hidden="true" />
                  Đã nhắc con
                </button>
              )}

              {rem.assignment_id && (
                <button
                  type="button"
                  className="k-btn2"
                  onClick={() => {
                    if (go) go('explain')
                  }}
                >
                  <BookOpen size={18} strokeWidth={2} aria-hidden="true" />
                  Mở bài cô giao
                  <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
              )}
            </div>
          </section>
        )
      })}

      {hiddenCount > 0 && (
        <div className="k-muted" style={{ textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
          +{hiddenCount} lời nhắc khác trong Hộp thông báo
        </div>
      )}
    </div>
  )
}
