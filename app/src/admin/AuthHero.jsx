/**
 * Tiêu đề lớn trên ảnh nền cho màn đăng nhập và màn khoá (kiểu màn khoá Outlook / Windows)
 * - eyebrow: ngày hôm nay theo giờ Việt Nam
 * - title: lời chào (đăng nhập) hoặc giờ hiện tại (màn khoá)
 */
import { useEffect, useState } from 'react'

function vnParts(date = new Date()) {
  try {
    const day = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: 'numeric', month: 'long' }).format(date)
    const time = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
    return { day: day.charAt(0).toUpperCase() + day.slice(1), time }
  } catch (e) {
    const pad = (n) => String(n).padStart(2, '0')
    return { day: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`, time: `${pad(date.getHours())}:${pad(date.getMinutes())}` }
  }
}

function useVnNow() {
  const [now, setNow] = useState(() => vnParts())
  useEffect(() => {
    const h = setInterval(() => setNow(vnParts()), 15 * 1000)
    return () => clearInterval(h)
  }, [])
  return now
}

export function AuthHero({ title, sub, showClock = false }) {
  const now = useVnNow()
  return (
    <div className="kadm-auth-hero">
      <span className="kadm-auth-hero-eyebrow">{now.day}</span>
      <div className={`kadm-auth-hero-title ${showClock ? 'is-clock' : ''}`} aria-hidden={showClock ? 'true' : undefined}>
        {showClock ? now.time : title}
      </div>
      {sub && <p className="kadm-auth-hero-sub">{sub}</p>}
    </div>
  )
}
