/* ============================================================
   KÈM CON HỌC — THEMED SLOTS FOR 8 THEMES
   Prompt 07 Phần B (Bố cục & thành phần riêng cho từng bộ)
   UI mới 29/10 [khung]: mọi bộ dùng chung hình thẻ "Dấu chân tuần" và CTA lớn
   của thiết kế (Home.dc.html). Mỗi bộ giữ tên gọi, đơn vị đếm và lời nhắn riêng;
   màu đi hết qua biến --k-* (không còn mã hex viết cứng), icon nét lucide thay emoji.
   ============================================================ */
import React from 'react'
import { Camera, ChevronRight } from 'lucide-react'
import { KWeekTracker } from './defaultSlots'

/* Nút chính dùng chung cho 8 bộ: "Phụ huynh nhập đề", icon camera nét trong vòng tròn */
function ThemedStart({ onStart }) {
  return (
    <button
      type="button"
      data-testid="start-photo"
      className="k-start-cta"
      onClick={() => onStart?.('photo')}
    >
      <span className="k-start-ic" aria-hidden="true">
        <Camera size={26} strokeWidth={2} />
      </span>
      <span className="k-start-txt">Phụ huynh nhập đề</span>
      <ChevronRight size={22} strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}

/* ============================================================
   1. BẠN GẤU (BEAR)
   ============================================================ */
export function BearStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount } = tracker
  const displayCount = weekCount || 3
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="bear-tracker"
      title="Dấu chân tuần này"
      count={`${displayCount}/7 tối`}
      note="Gấu nhớ: "
    />
  )
}

export function BearStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

/* ============================================================
   2. KẸO BÔNG (CANDY)
   ============================================================ */
export function CandyStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal, streak } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="candy-tracker"
      title="Lọ kẹo của bé"
      streakText={streak >= 2 ? `${streak} tối` : ''}
      count={`${weekCount}/${weekGoal} viên kẹo`}
      note="Bạn Mây cổ vũ: "
    />
  )
}

/* ============================================================
   3. KHU VƯỜN ĐÊM (GARDEN)
   ============================================================ */
export function GardenStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="garden-tracker"
      title="Cây vườn đêm"
      streakText={weekCount >= weekGoal ? 'Nở hoa' : ''}
      count={`${weekCount}/${weekGoal} lá xanh`}
      note="Đom đóm thắp sáng: "
    />
  )
}

export function GardenStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

/* ============================================================
   4. BẢNG PHẤN (CHALK)
   ============================================================ */
export function ChalkStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="chalk-tracker"
      title="Đếm que phấn tuần này"
      count={`${weekCount}/${weekGoal} que`}
      note="Gờ phấn nhắn: "
    />
  )
}

/* ============================================================
   5. BENTO MỀM (BENTO)
   ============================================================ */
export function BentoStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal, streak } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="bento-tracker"
      title="Mục tiêu tuần"
      streakText={streak >= 2 ? `${streak} ngày liền` : ''}
      count={`${weekCount}/${weekGoal}`}
    />
  )
}

/* ============================================================
   6. CỰC QUANG (AURORA)
   ============================================================ */
export function AuroraStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal, streak } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="aurora-tracker"
      title="Chòm sao học tối"
      streakText={streak >= 2 ? `${streak} tối` : ''}
      count={`${weekCount}/${weekGoal} sao`}
      note="Ánh sáng dẫn đường: "
    />
  )
}

export function AuroraStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

/* ============================================================
   7. STICKER STUDIO (STICKER)
   ============================================================ */
export function StickerStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal, streak } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="sticker-tracker"
      title="Phiếu bấm lỗ 7 tối"
      streakText={streak >= 2 ? `${streak} tối` : ''}
      count={`${weekCount}/${weekGoal} lỗ`}
      note="Lời khen dán sticker: "
    />
  )
}

export function StickerStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

/* ============================================================
   8. SỔ TAY BUỔI TỐI (NOTEBOOK)
   ============================================================ */
export function NotebookStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { weekCount, weekGoal, streak } = tracker
  return (
    <KWeekTracker
      tracker={tracker}
      onOpenReport={onOpenReport}
      className="notebook-tracker"
      title="Nhật ký tuần này"
      streakText={streak >= 2 ? `${streak} tối` : ''}
      count={`${weekCount}/${weekGoal} tối`}
      note="Lời ghi nhớ: "
    />
  )
}

export function NotebookStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

export function BentoStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

export function ChalkStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}

export function CandyStartAction({ onStart }) {
  return <ThemedStart onStart={onStart} />
}
