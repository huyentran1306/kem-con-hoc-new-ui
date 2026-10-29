/* ============================================================
   KÈM CON HỌC — LINH VẬT ĐẤT SÉT (UI mới 29/10, theo Mascot.dc.html)
   Vẽ bằng khối CSS (gradient + bóng trong) trên khung 200x200, co giãn theo size.
   Mặt (.kc-face) đổi theo trạng thái qua lớp st-* của .kbuddy (CSS ở buddy.css):
   idle | hello | reading | thinking | cheer | love | surprised | oops | sleepy.
   Mã màu hex ở đây là màu của hình minh hoạ đất sét (được phép theo brief).
   ============================================================ */
import React from 'react'

/* [left, top, width, height, style bổ sung] trong hệ toạ độ 200x200 */
const P = (l, t, w, h, s = {}) => ({ left: l, top: t, width: w, height: h, ...s })
const R50 = { borderRadius: '50%' }
const tri = 'polygon(50% 0, 100% 100%, 0 100%)'

const BODIES = {
  cloud: {
    parts: [
      P(16, 96, 170, 74, { borderRadius: 37, background: 'linear-gradient(180deg, #FFFFFF, #D6E8F7)' }),
      P(22, 74, 76, 76, { ...R50, background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #DCEBF7)' }),
      P(62, 34, 98, 98, { ...R50, background: 'radial-gradient(circle at 40% 30%, #FFFFFF, #DCEBF7)' }),
      P(118, 72, 66, 66, { ...R50, background: 'radial-gradient(circle at 40% 35%, #FFFFFF, #DCEBF7)' }),
    ],
    face: { l: 62, t: 104, e: [8, 57], b: [[-8], [66]] },
  },
  bear: {
    parts: [
      P(16, 12, 66, 66, { ...R50, background: 'radial-gradient(circle at 35% 30%, #F4BC84 0%, #D2844A 62%, #A9632E 100%)' }),
      P(33, 29, 32, 32, { ...R50, background: '#F2C9A0' }),
      P(118, 12, 66, 66, { ...R50, background: 'radial-gradient(circle at 35% 30%, #F4BC84 0%, #D2844A 62%, #A9632E 100%)' }),
      P(135, 29, 32, 32, { ...R50, background: '#F2C9A0' }),
      P(14, 38, 172, 152, { borderRadius: '50% 50% 48% 48%', background: 'radial-gradient(circle at 34% 26%, #F8C895 0%, #DC8E4E 52%, #B46830 100%)', boxShadow: 'inset -12px -16px 26px rgba(110,55,15,0.32)' }),
      P(57, 108, 86, 64, { ...R50, background: 'radial-gradient(circle at 42% 30%, #FFF6EA 0%, #F0D3B0 100%)' }),
      P(86, 116, 28, 19, { ...R50, background: 'radial-gradient(circle at 38% 30%, #6B4634, #2B1A12 70%)' }),
    ],
    face: { l: 60, t: 90, e: [2, 63], b: [[-22, 28], [80, 28]], m: 46 },
  },
  unicorn: {
    parts: [
      P(86, 0, 30, 62, { clipPath: tri, background: 'repeating-linear-gradient(160deg, #FFE27A 0 9px, #F5B82E 9px 14px)' }),
      P(40, 30, 30, 40, { clipPath: tri, background: '#F3E9FF' }),
      P(130, 30, 30, 40, { clipPath: tri, background: '#F3E9FF' }),
      P(22, 48, 156, 144, { ...R50, background: 'radial-gradient(circle at 36% 28%, #FFFFFF 0%, #F1E8FF 60%, #D9C8F7 100%)', boxShadow: 'inset -10px -14px 22px rgba(120,90,180,0.22)' }),
      P(14, 44, 52, 52, { ...R50, background: 'radial-gradient(circle at 40% 35%, #FFB3D0, #E66FA0)' }),
      P(44, 30, 46, 46, { ...R50, background: 'radial-gradient(circle at 40% 35%, #C8B5FF, #8E72E6)' }),
      P(10, 86, 40, 40, { ...R50, background: 'radial-gradient(circle at 40% 35%, #A9E5FF, #5BB8E8)' }),
      P(62, 126, 76, 52, { ...R50, background: 'radial-gradient(circle at 42% 30%, #FFF5FB, #F6D8EA)' }),
    ],
    face: { l: 60, t: 102, e: [4, 61], b: [[-16], [74]], m: 40 },
  },
  onigiri: {
    parts: [
      P(14, 22, 172, 166, { clipPath: 'polygon(50% 0, 62% 6%, 100% 78%, 96% 96%, 86% 100%, 14% 100%, 4% 96%, 0 78%, 38% 6%)', background: 'radial-gradient(circle at 42% 34%, #FFFFFF 0%, #F4F1EA 60%, #DCD6C8 100%)' }),
      P(52, 136, 96, 52, { borderRadius: '8px 8px 4px 4px', background: 'linear-gradient(180deg, #2E4A3A, #17291F)' }),
    ],
    face: { l: 60, t: 96, e: [6, 59], b: [[-12], [70]] },
  },
  cat: {
    parts: [
      P(22, 14, 56, 66, { clipPath: 'polygon(0 0, 100% 60%, 20% 100%)', background: 'linear-gradient(160deg, #C98A5A, #8A5230)' }),
      P(122, 14, 56, 66, { clipPath: 'polygon(100% 0, 80% 100%, 0 60%)', background: 'linear-gradient(200deg, #C98A5A, #8A5230)' }),
      P(18, 42, 164, 148, { borderRadius: '50% 50% 46% 46%', background: 'radial-gradient(circle at 36% 28%, #E0A878 0%, #B97845 55%, #8A5230 100%)', boxShadow: 'inset -10px -14px 22px rgba(90,45,15,0.30)' }),
      P(64, 116, 72, 54, { ...R50, background: 'radial-gradient(circle at 42% 30%, #FFF4E6, #F1D7B8)' }),
      P(92, 120, 16, 11, { borderRadius: '50% 50% 60% 60%', background: '#E77A8C' }),
      P(20, 130, 44, 2, { background: 'rgba(60,30,10,0.45)', transform: 'rotate(6deg)' }),
      P(136, 130, 44, 2, { background: 'rgba(60,30,10,0.45)', transform: 'rotate(-6deg)' }),
    ],
    face: { l: 60, t: 92, e: [2, 63], b: [[-18, 26], [76, 26]], m: 44 },
  },
  sprout: {
    parts: [
      P(97, 18, 6, 40, { borderRadius: 3, background: '#4FA562' }),
      P(48, 4, 56, 34, { borderRadius: '50% 50% 50% 0', background: 'linear-gradient(160deg, #A8EBA0, #4FB566)', transform: 'rotate(-18deg)' }),
      P(100, 0, 60, 36, { borderRadius: '50% 50% 0 50%', background: 'linear-gradient(200deg, #A8EBA0, #4FB566)', transform: 'rotate(14deg)' }),
      P(30, 48, 140, 146, { borderRadius: '50% 50% 46% 46% / 56% 56% 44% 44%', background: 'radial-gradient(circle at 36% 28%, #C9F2B4 0%, #7FCF7A 55%, #3E9E5A 100%)', boxShadow: 'inset -10px -14px 22px rgba(20,80,40,0.28)' }),
    ],
    face: { l: 60, t: 108, e: [6, 59], b: [[-10], [68]] },
  },
  dragon: {
    parts: [
      P(56, 14, 22, 40, { clipPath: tri, background: 'linear-gradient(180deg, #FFE27A, #E9A800)', transform: 'rotate(-14deg)' }),
      P(122, 14, 22, 40, { clipPath: tri, background: 'linear-gradient(180deg, #FFE27A, #E9A800)', transform: 'rotate(14deg)' }),
      P(90, 22, 20, 24, { clipPath: tri, background: '#5EEAD4' }),
      P(22, 40, 156, 152, { ...R50, background: 'radial-gradient(circle at 34% 26%, #B7A9FF 0%, #7C6CF2 55%, #4F3FCC 100%)', boxShadow: 'inset -12px -16px 24px rgba(30,20,90,0.35)' }),
      P(60, 122, 80, 58, { ...R50, background: 'radial-gradient(circle at 42% 30%, #E9FFFB, #A7F3E4)' }),
      P(84, 128, 7, 6, { ...R50, background: '#2B1A12' }),
      P(108, 128, 7, 6, { ...R50, background: '#2B1A12' }),
    ],
    face: { l: 60, t: 94, e: [2, 63], b: [[-20, 30], [78, 30]], m: 50 },
  },
  star: {
    parts: [
      P(6, 6, 188, 188, { clipPath: 'polygon(50% 2%, 62% 36%, 98% 37%, 69% 58%, 79% 93%, 50% 72%, 21% 93%, 31% 58%, 2% 37%, 38% 36%)', background: 'radial-gradient(circle at 42% 34%, #FFF1A8 0%, #FFD34D 55%, #EBA900 100%)' }),
    ],
    face: { l: 60, t: 96, e: [8, 57], b: [[-4], [62]] },
  },
  snowman: {
    parts: [
      P(30, 92, 140, 104, { borderRadius: '50% 50% 46% 46%', background: 'radial-gradient(circle at 38% 28%, #FFFFFF 0%, #E9F1F8 60%, #C9D9E6 100%)' }),
      P(46, 6, 108, 102, { ...R50, background: 'radial-gradient(circle at 38% 28%, #FFFFFF 0%, #EDF3F9 60%, #CDDCE8 100%)' }),
      P(40, 96, 120, 22, { borderRadius: 11, background: 'linear-gradient(180deg, #E8485F, #B8213A)' }),
      P(118, 108, 22, 46, { borderRadius: 8, background: 'linear-gradient(180deg, #D6334A, #A81C33)', transform: 'rotate(-10deg)' }),
      P(92, 62, 30, 12, { clipPath: 'polygon(0 0, 100% 50%, 0 100%)', background: '#F28C28' }),
      P(96, 136, 9, 9, { ...R50, background: '#2B3A4A' }),
      P(96, 160, 9, 9, { ...R50, background: '#2B3A4A' }),
    ],
    face: { l: 60, t: 42, e: [10, 55], b: [[-2, 26], [60, 26]], m: 38 },
  },
  lion: {
    parts: [
      P(88, 2, 24, 30, { borderRadius: '50% 50% 4px 4px', background: 'linear-gradient(180deg, #FFE27A, #E9A800)' }),
      P(10, 24, 180, 170, { ...R50, background: 'repeating-conic-gradient(from 0deg, #FFD24A 0 10deg, #F5A900 10deg 20deg)' }),
      P(24, 38, 152, 144, { ...R50, background: 'radial-gradient(circle at 36% 28%, #FF7A62 0%, #E2322A 55%, #A8141E 100%)', boxShadow: 'inset -10px -14px 22px rgba(90,0,10,0.35)' }),
      P(46, 74, 40, 40, { ...R50, background: '#FFFFFF' }),
      P(114, 74, 40, 40, { ...R50, background: '#FFFFFF' }),
      P(66, 132, 68, 30, { borderRadius: '0 0 34px 34px', background: '#FFF1C2', border: '3px solid #FFD24A', boxSizing: 'border-box' }),
      P(86, 112, 28, 16, { ...R50, background: '#FFD24A' }),
    ],
    /* Bé Lân: mắt to riêng (con ngươi là .kc-e để đổi biểu cảm), không vẽ miệng/má */
    face: { l: 58, t: 84, e: [0, 66], ew: 18, eh: 22, noMouth: true, b: [] },
  },
  kite: {
    parts: [
      P(30, 4, 140, 164, { clipPath: 'polygon(50% 0, 100% 42%, 50% 100%, 0 42%)', background: 'conic-gradient(from 0deg at 50% 42%, #FF5E7E 0 90deg, #FF9F1C 90deg 180deg, #2F62E0 180deg 270deg, #22B573 270deg 360deg)' }),
      P(99, 4, 2, 164, { background: 'rgba(255,255,255,0.7)' }),
      P(30, 72, 140, 2, { background: 'rgba(255,255,255,0.7)' }),
      P(96, 166, 8, 30, { borderLeft: '3px dashed #FF9F1C' }),
      P(86, 176, 14, 10, { clipPath: 'polygon(0 0, 100% 50%, 0 100%)', background: '#FF5E7E' }),
      P(102, 186, 14, 10, { clipPath: 'polygon(100% 0, 0 50%, 100% 100%)', background: '#2F62E0' }),
      P(66, 56, 68, 44, { borderRadius: 22, background: 'rgba(255,255,255,0.85)' }),
    ],
    face: { l: 60, t: 62, e: [14, 51], b: [[2, 18], [58, 18]], m: 18 },
  },
}

export const CLAY_BUDDY_IDS = Object.keys(BODIES)
export function hasClayBuddy(id) {
  return Boolean(BODIES[id])
}

/** Thân + mặt đất sét. Kích thước ô = size×size; đặt trong .kbuddy để nhận chuyển động theo trạng thái. */
export function ClayBody({ buddyId, size }) {
  const b = BODIES[buddyId]
  if (!b) return null
  const f = b.face
  const ew = f.ew ? { width: f.ew, height: f.eh } : null
  return (
    <span className="kc-scale" style={{ transform: `scale(${size / 200})` }}>
      <span className="bd-root kc-body">
        {b.parts.map((s, i) => (
          <i key={i} className="kc-part" style={s} />
        ))}
        <span className={`kc-face ${f.noMouth ? 'kc-nomouth' : ''}`} style={{ left: f.l, top: f.t }}>
          {f.e.map((x, i) => (
            <i key={`e${i}`} className="kc-e eye blink" style={{ left: x, ...(ew || {}) }} />
          ))}
          {f.b.map(([x, y], i) => (
            <i key={`b${i}`} className="kc-b" style={{ left: x, ...(y !== undefined ? { top: y } : {}) }} />
          ))}
          {!f.noMouth && <i className="kc-m" style={f.m !== undefined ? { top: f.m } : undefined} />}
        </span>
      </span>
    </span>
  )
}
