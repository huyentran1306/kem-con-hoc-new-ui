/**
 * Khung kính mờ của cổng giáo viên (29/10/2026, cùng kiểu admin bản dashboard v6):
 * tiêu đề lớn trên ảnh, chọn hình nền, công tắc, nút phân đoạn, hộp QR.
 * Chỉ là phần trình bày; không gọi máy chủ.
 */
import React, { useState } from 'react'
import { Check, Copy, LoaderCircle, QrCode, X } from 'lucide-react'
import { generateQrSvgString } from '../qrCode.js'
import { WALLPAPERS } from './teacherWallpaper.js'

/* Tiêu đề lớn đặt thẳng trên ảnh nền: dòng nhỏ phía trên, tên trang, mô tả, nút bên phải */
export function TeacherHero({ eyebrow, title, desc, actions, children, className = '' }) {
  return (
    <div className={`tg-hero ${className}`}>
      <div className="tg-hero-text">
        {eyebrow ? <span className="tg-hero-eyebrow">{eyebrow}</span> : null}
        {title ? <h1 className="tg-hero-title">{title}</h1> : null}
        {children}
        {desc ? <p className="tg-hero-desc">{desc}</p> : null}
      </div>
      {actions ? <div className="tg-hero-actions">{actions}</div> : null}
    </div>
  )
}

/* Chọn hình nền: 4 ô có chữ, mỗi ô từ 44px */
export function WallpaperPicker({ value, onChange, compact = false }) {
  return (
    <div className={`tg-wallpick ${compact ? 'tg-wallpick-compact' : ''}`} role="radiogroup" aria-label="Hình nền cổng giáo viên">
      {WALLPAPERS.map((w) => {
        const on = w.id === value
        return (
          <button
            key={w.id}
            type="button"
            role="radio"
            aria-checked={on}
            title={w.label}
            className={`tg-wallpick-btn ${on ? 'is-on' : ''}`}
            onClick={() => onChange(w.id)}
          >
            <span className={`tg-wallpick-swatch tg-wall-${w.id}`} aria-hidden="true">
              {on ? <Check size={16} strokeWidth={3} /> : null}
            </span>
            <span className="tg-wallpick-label">{w.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* Công tắc kính: cả hàng là vùng bấm (cao 44px), cùng API với Toggle của bộ quy chuẩn */
export function TToggle({ checked = false, onChange, label = null }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`tg-toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="tg-toggle-track" aria-hidden="true"><span className="tg-toggle-dot" /></span>
      {label ? <span className="tg-toggle-label">{label}</span> : null}
    </button>
  )
}

/* Nút phân đoạn: dải kính, mục đang chọn là viên thuốc xanh ngọc */
export function TSegmented({ options = [], value, onChange, ariaLabel = 'Chọn mục' }) {
  return (
    <div className="tg-seg" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        const on = v === value
        return (
          <button key={v} type="button" role="tab" aria-selected={on} className={`tg-seg-btn ${on ? 'is-on' : ''}`} onClick={() => onChange(v)}>
            {o.icon ? <span className="tg-seg-ic" aria-hidden="true">{o.icon}</span> : null}
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* Đang tải: viên kính nhỏ, chữ luôn đọc được trên mọi hình nền */
export function TLoading({ children }) {
  return (
    <div className="tg-loading" role="status">
      <LoaderCircle size={18} className="tg-spin" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/* Tiêu đề mục nằm giữa các thẻ (trên ảnh): đặt trong viên kính để đủ tương phản */
export function SectionTitle({ children, as: Tag = 'h4' }) {
  return <Tag className="tg-section-title">{children}</Tag>
}

/* Hộp mã QR vào lớp, cùng chức năng hộp cũ (sao chép link, đóng) */
export function TeacherQrModal({ url, title, sub, onClose }) {
  const svgMarkup = generateQrSvgString(url, { size: 240, margin: 4, fgColor: '#14262B' })
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch (e) {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch (err) {}
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tg-modal-backdrop" onClick={onClose}>
      <div className="tg-modal tg-qr" role="dialog" aria-modal="true" aria-labelledby="tg-qr-title" onClick={(e) => e.stopPropagation()}>
        <div className="tg-modal-head">
          <span className="tg-qr-ic" aria-hidden="true"><QrCode size={20} /></span>
          <h3 id="tg-qr-title" className="tg-modal-title">{title || 'Mã QR vào lớp'}</h3>
          <button type="button" className="tg-icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="tg-qr-sub">{sub || 'In hoặc chiếu mã QR trong buổi họp để phụ huynh quét vào lớp'}</p>
        <div className="tg-qr-code" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
        <div className="tg-qr-url">{url}</div>
        <div className="tg-modal-actions">
          <button type="button" className="tg-btn tg-btn-soft" onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Đã sao chép' : 'Sao chép link'}
          </button>
          <button type="button" className="tg-btn tg-btn-main" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}
