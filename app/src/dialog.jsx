/* ============================================================
   KÈM CON HỌC — HỘP THOẠI TRONG APP (thay alert / confirm / prompt của trình duyệt)
   appAlert('Đã lưu')                         → Promise<void>
   appConfirm('Xoá mục này?', { danger })     → Promise<boolean>
   appPrompt('Lý do?', { type: 'password' })  → Promise<string | null>  (null = bấm Huỷ)
   <DialogHost /> gắn 1 lần ở main.jsx, dùng được ở app phụ huynh, cổng cô giáo và admin.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import { BuddyMascot, resolveBuddyId } from './themes/buddies/buddySvgs'

let pushDialog = null
const queue = []

function open(kind, message, opts = {}) {
  return new Promise((resolve) => {
    const item = { kind, message: String(message ?? ''), opts, resolve, id: Date.now() + Math.random() }
    if (pushDialog) pushDialog(item)
    else queue.push(item)
  })
}

export const appAlert = (message, opts) => open('alert', message, opts)
export const appConfirm = (message, opts) => open('confirm', message, opts)
export const appPrompt = (message, opts) => open('prompt', message, opts)

function currentBuddy() {
  try {
    return resolveBuddyId(localStorage.getItem('kem-con-hoc:theme') || 'bear')
  } catch (e) {
    return 'bear'
  }
}

export function DialogHost() {
  const [items, setItems] = useState([])
  const [value, setValue] = useState('')
  const okRef = useRef(null)
  const cancelRef = useRef(null)
  const inputRef = useRef(null)
  const cur = items[0]

  useEffect(() => {
    pushDialog = (item) => setItems((list) => [...list, item])
    if (queue.length) setItems((list) => [...list, ...queue.splice(0)])
    return () => {
      pushDialog = null
    }
  }, [])

  useEffect(() => {
    if (!cur) return
    setValue(cur.opts.defaultValue || '')
    // Gói 38: hộp xác nhận nguy hiểm (xoá vĩnh viễn) đặt sẵn tiêu điểm vào nút an toàn, tránh lỡ tay bấm Enter là xoá
    const safeFirst = cur.kind === 'confirm' && cur.opts.danger
    const t = setTimeout(() => (cur.kind === 'prompt' ? inputRef.current : safeFirst ? cancelRef.current : okRef.current)?.focus(), 30)
    return () => clearTimeout(t)
  }, [cur?.id])

  if (!cur) return null

  const { kind, message, opts } = cur
  const danger = Boolean(opts.danger)
  const close = (result) => {
    cur.resolve(result)
    setItems((list) => list.slice(1))
  }
  const onOk = () => {
    if (kind === 'confirm') close(true)
    else if (kind === 'prompt') close(value)
    else close(undefined)
  }
  const onCancel = () => close(kind === 'confirm' ? false : kind === 'prompt' ? null : undefined)

  const title = opts.title || (kind === 'confirm' ? (danger ? 'Bạn chắc chứ?' : 'Xác nhận') : kind === 'prompt' ? 'Nhập thông tin' : 'Thông báo')
  const okText = opts.okText || (kind === 'alert' ? 'Đã hiểu' : kind === 'prompt' ? 'Xác nhận' : danger ? 'Xoá' : 'Đồng ý')
  const cancelText = opts.cancelText || 'Huỷ'
  const buddyId = currentBuddy()
  const mood = danger ? 'oops' : kind === 'confirm' ? 'thinking' : kind === 'prompt' ? 'idle' : 'hello'

  const accent = danger ? 'var(--c-danger, #C2410C)' : 'var(--k-cta, var(--c-accent, #D9577F))'
  const onAccent = danger ? '#FFFFFF' : 'var(--k-cta-ink, var(--c-on-accent, #FFFFFF))'

  return (
    <div
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onCancel()
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 30, 50, 0.42)',
        backdropFilter: 'blur(3px)',
        display: 'grid',
        placeItems: 'center',
        padding: 'max(16px, env(safe-area-inset-top, 0px)) 16px max(16px, env(safe-area-inset-bottom, 0px))',
        animation: 'kbDlgFade .18s ease-out',
      }}
    >
      <style>{`
        @keyframes kbDlgFade{from{opacity:0}to{opacity:1}}
        @keyframes kbDlgPop{from{transform:translateY(10px) scale(.96);opacity:0}to{transform:none;opacity:1}}
        @media (prefers-reduced-motion: reduce){.kb-dlg,.kb-dlg *{animation:none!important}}
      `}</style>
      <div
        className="kb-dlg"
        role={kind === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="kb-dlg-title"
        aria-describedby="kb-dlg-msg"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'var(--k-surface, var(--c-surface, #FFFFFF))',
          color: 'var(--k-ink, var(--c-text, #3A2A33))',
          border: 'var(--k-bw, 1.5px) solid var(--k-bc, var(--c-line, #F4DDE7))',
          borderRadius: 28,
          padding: '20px 20px 18px',
          boxShadow: '0 24px 60px rgba(20, 40, 70, 0.28)',
          display: 'grid',
          gap: 12,
          animation: 'kbDlgPop .25s cubic-bezier(.3,1.4,.5,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BuddyMascot buddyId={buddyId} state={mood} size={48} />
          <b id="kb-dlg-title" style={{ fontSize: 19, lineHeight: 1.3, fontFamily: 'var(--font-head)', fontWeight: 800 }}>
            {title}
          </b>
        </div>

        <div id="kb-dlg-msg" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.55, whiteSpace: 'pre-line', color: 'var(--k-muted, var(--c-text, #3A2A33))' }}>
          {message}
        </div>

        {kind === 'prompt' && (
          <input
            id="kb-dlg-input"
            ref={inputRef}
            type={opts.type === 'password' ? 'password' : 'text'}
            value={value}
            placeholder={opts.placeholder || ''}
            autoComplete={opts.type === 'password' ? 'current-password' : 'off'}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onOk()
              }
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 14px',
              borderRadius: 'var(--k-ctl-r, 14px)',
              border: '2px solid var(--k-line, var(--c-line, #F4DDE7))',
              background: 'var(--k-input, var(--c-bg, #FFF7F9))',
              color: 'var(--k-ink, var(--c-text, #3A2A33))',
              fontSize: 15,
              outline: 'none',
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
          {kind !== 'alert' && (
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                minHeight: 48,
                padding: '11px 14px',
                borderRadius: 999,
                border: '2px solid var(--k-line, var(--c-line, #F4DDE7))',
                background: 'var(--k-btn2, var(--c-surface-2, #FDE8EF))',
                color: 'var(--k-btn2-ink, var(--c-text, #3A2A33))',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            ref={okRef}
            type="button"
            onClick={onOk}
            disabled={kind === 'prompt' && opts.required && !value.trim()}
            style={{
              flex: kind === 'alert' ? '0 1 160px' : 1.2,
              minHeight: 50,
              padding: '11px 14px',
              borderRadius: 'var(--k-ctl-r, 999px)',
              border: 'none',
              background: accent,
              color: onAccent,
              boxShadow: danger ? 'none' : 'var(--k-cta-sh, none)',
              fontFamily: 'var(--font-head)',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              opacity: kind === 'prompt' && opts.required && !value.trim() ? 0.5 : 1,
            }}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  )
}
