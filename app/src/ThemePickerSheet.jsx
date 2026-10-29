/* ============================================================
   🎨 MÀN CHỌN GIAO DIỆN CẢ NHÀ (THEME PICKER)
   11 thẻ xem trước (nhóm Theo mùa và Thường ngày), xem thử tức thì, tuỳ chỉnh hiệu ứng
   ============================================================ */
import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppCtx } from './ctx'
import { getTheme, applyTheme, SEASONAL_THEMES, REGULAR_THEMES } from './themes'
import { isSeasonalTheme, seasonTag, pickThemePatch } from './seasons/seasonLogic'
import { useSeasonsConfig, getSeasonToday } from './seasons/useSeasonsConfig'
import './seasons/seasons.css'
import { Check, Sparkles, Palette, Gift, X } from 'lucide-react'
import { BuddyMascot, resolveBuddyId } from './themes/buddies/buddySvgs'
import './themePicker.css'
import { CustomThemeDesigner } from './CustomThemeDesigner'
import { decodeThemeCode } from './themes/customThemeCode'

export function ThemePickerSheet({ onClose }) {
  const { S, patch, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const initialTheme = S.theme || 'bear'
  const initialMotion = S.motion || 'full'

  const savedRef = useRef(false)
  const [selectedTheme, setSelectedTheme] = useState(initialTheme)
  const [selectedMotion, setSelectedMotion] = useState(initialMotion)
  const [showDesigner, setShowDesigner] = useState(false)
  const [inputCode, setInputCode] = useState('')
  // Đợt 16: nhóm Theo mùa ở trên nhóm Thường ngày
  const { cfg: seasonCfg } = useSeasonsConfig()
  const seasonToday = getSeasonToday()
  const oldTheme = isSeasonalTheme(initialTheme) ? S.themeBeforeSeason || null : null
  const pickerItems = [
    { kind: 'h', node: <p key="h-season" className="theme-group-h">THEO MÙA</p> },
    ...SEASONAL_THEMES.map((t) => ({ kind: 't', theme: t })),
    {
      kind: 'h',
      node: (
        <p key="n-season" className="theme-group-note">
          Bộ theo mùa dùng được quanh năm. Đến mùa, app chỉ gợi ý một lần, không tự đổi.
        </p>
      ),
    },
    { kind: 'h', node: <p key="h-regular" className="theme-group-h">THƯỜNG NGÀY</p> },
    ...[...REGULAR_THEMES].sort((a, b) => (a.id === 'sky' ? -1 : b.id === 'sky' ? 1 : 0)).map((t) => ({ kind: 't', theme: t })),
  ]

  // Áp dụng thử ngay khi bấm chọn thẻ
  const handlePreview = (themeId) => {
    setSelectedTheme(themeId)
    applyTheme(themeId, selectedMotion)
  }

  const handleMotionChange = (motion) => {
    setSelectedMotion(motion)
    applyTheme(selectedTheme, motion)
  }

  // Xác nhận lưu cho cả nhà
  const handleSave = () => {
    savedRef.current = true
    try {
      localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
    } catch (e) {}
    patch({
      ...pickThemePatch(S, selectedTheme, getSeasonToday(), seasonCfg),
      motion: selectedMotion,
    })
    applyTheme(selectedTheme, selectedMotion)
    toast(`Đã đổi sang giao diện "${getTheme(selectedTheme).name}" cho cả nhà ✨`)
    onClose?.()
  }

  // Huỷ bỏ -> khôi phục theme cũ
  const handleCancel = () => {
    savedRef.current = false
    applyTheme(initialTheme, initialMotion)
    onClose?.()
  }

  // Khôi phục nếu user bấm ngoài sheet đóng lại mà chưa bấm Lưu
  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        applyTheme(initialTheme, initialMotion)
      }
    }
  }, [initialTheme, initialMotion])

  return (
    <div className="theme-picker-pn tp">
      <div className="tp-head">
        <button type="button" className="tp-x" aria-label="Đóng" onClick={handleCancel}><X size={20} aria-hidden="true" /></button>
        <h2 className="title tp-title">Giao diện cả nhà</h2>
        <p className="sub tp-sub">
          Mỗi gia đình một gu. Chọn một bộ, toàn bộ màn hình sẽ đổi ngay cho cả nhà.
        </p>
      </div>

      {/* Tuỳ chọn hiệu ứng chuyển động */}
      <div className="tp-motion">
        <span className="tp-motion-h">
          <Sparkles size={18} aria-hidden="true" /> Hiệu ứng hoạt họa
        </span>
        <div className="tp-motion-opts" role="radiogroup" aria-label="Hiệu ứng hoạt họa">
          {[
            ['full', 'Đầy đủ'],
            ['light', 'Nhẹ'],
            ['off', 'Tắt'],
          ].map(([m, lbl]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={selectedMotion === m}
              className={`tp-mopt ${selectedMotion === m ? 'on' : ''}`}
              onClick={() => handleMotionChange(m)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Lưới bộ giao diện xem trước: Theo mùa ở trên, Thường ngày ở dưới (Bầu Trời đứng đầu nhóm Thường ngày) */}
      <div className="theme-grid tp-grid">
        {pickerItems.map((item) => {
          if (item.kind !== 't') return item.node
          const theme = item.theme
          const sTag = theme.seasonal ? seasonTag(theme.id, seasonToday, seasonCfg) : ''
          const isSelected = selectedTheme === theme.id
          const isCurrentActive = initialTheme === theme.id
          const v = theme.vars

          return (
            <div
              key={theme.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Bộ ${theme.name}`}
              className={`tp-card ${isSelected ? 'on' : ''}`}
              onClick={() => handlePreview(theme.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreview(theme.id) } }}
            >
              {/* Thẻ xem trước màu mini */}
              <div className="tp-prev" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${v['--c-accent']} 30%, ${v['--c-bg']}), ${v['--c-bg']})` }}>
                <div className="tp-prev-ui">
                  <span className="tp-prev-card" style={{ background: v['--c-surface'], borderColor: v['--c-line'] }}>
                    <i style={{ background: v['--c-line'] }} /><i style={{ background: v['--c-line'] }} />
                  </span>
                  <span className="tp-prev-col">
                    <span className="tp-prev-btn" style={{ background: v['--c-btn'], color: v['--c-btn-text'] }}>Nút chính</span>
                    <span className="tp-prev-dots">
                      {theme.swatches.slice(0, 2).map((sw, i) => (
                        <i key={i} style={{ background: sw }} />
                      ))}
                    </span>
                  </span>
                </div>
                <span className="tp-prev-buddy" aria-hidden="true"><BuddyMascot buddyId={resolveBuddyId(theme.id)} state="hello" size={46} /></span>
                {theme.id === 'sky' && <span className="tp-new">Mới</span>}
                {sTag && <span className={`theme-tag tp-stag ${sTag === 'Đang mùa' ? 'good' : ''}`}>{sTag}</span>}
              </div>

              {/* Tên và mô tả theme */}
              <div className="tp-name">
                <b>{theme.name}</b>
                {isCurrentActive && (
                  <span className="tp-using"><Check size={13} strokeWidth={3} aria-hidden="true" />Đang dùng</span>
                )}
                {isSelected && !isCurrentActive && <span className="tp-try">Xem thử</span>}
              </div>
              <p className="tp-desc">{theme.desc}</p>
              {oldTheme === theme.id && <span className="theme-tag">Bộ cũ</span>}
            </div>
          )
        })}

        {/* Thẻ cuối: Tự thiết kế (Prompt 09) */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={selectedTheme === 'custom'}
          className={`tp-card tp-custom ${selectedTheme === 'custom' ? 'on' : ''}`}
          onClick={() => {
            if (S.customTheme) {
              handlePreview('custom')
            } else {
              setShowDesigner(true)
            }
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') { if (S.customTheme) handlePreview('custom'); else setShowDesigner(true) } }}
        >
          <div className="tp-prev tp-prev-custom">
            <Palette size={24} aria-hidden="true" />
            <span>Tự ghép độc bản</span>
          </div>
          <div className="tp-name">
            <b>Tự thiết kế</b>
            {selectedTheme === 'custom' && <Check size={16} strokeWidth={3} aria-hidden="true" />}
          </div>
          <p className="tp-desc">Tự chọn màu, chữ, kiểu nút và bạn đồng hành</p>
          <button
            type="button"
            className="tp-mk"
            onClick={(e) => {
              e.stopPropagation()
              setShowDesigner(true)
            }}
          >
            {S.customTheme ? 'Sửa thiết kế' : '+ Tạo bộ mới'}
          </button>
        </div>
      </div>

      {/* Ô nhập mã chia sẻ XXX-XXX */}
      <div className="tp-code">
        <b className="tp-code-h">
          <Gift size={18} aria-hidden="true" /> Nhập mã bộ giao diện của nhà khác
        </b>
        <input
          type="text"
          className="tp-code-in"
          placeholder="Ví dụ: KX7-M4P"
          aria-label="Nhập mã bộ giao diện của nhà khác"
          value={inputCode}
          maxLength={7}
          onChange={(e) => {
            const val = e.target.value.toUpperCase()
            setInputCode(val)
            const decoded = decodeThemeCode(val)
            if (decoded) {
              patch({ customTheme: decoded })
              setSelectedTheme('custom')
              applyTheme('custom', selectedMotion, decoded)
              toast('Đã tìm thấy bộ giao diện ' + decoded.buddy + '! Bấm Lưu để dùng ✨')
            }
          }}
        />
      </div>

      {/* 23Z: Nút hành động dính đáy, 2 nút chia đôi 50/50, không sinh thanh cuộn ngang. Luôn thấy trên điện thoại. */}
      <div className="sheet-actions-bar tp-actions">
        <button
          type="button"
          className="btn ghost btn-km btn-km-m btn-km-secondary tp-cancel"
          onClick={handleCancel}
        >
          Thôi, giữ nguyên
        </button>
        <button
          type="button"
          className="btn solid btn-km btn-km-m btn-km-primary tp-save"
          onClick={handleSave}
          data-testid="btn-theme-save"
        >
          Dùng cho cả nhà
        </button>
      </div>

      {/* Modal Tự thiết kế */}
      {showDesigner && (
        <CustomThemeDesigner
          childName={child?.name || 'con'}
          currentCustomTheme={S.customTheme}
          onSave={(cfg) => {
            savedRef.current = true
            try {
              localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
            } catch (e) {}
            patch({ theme: 'custom', customTheme: cfg })
            applyTheme('custom', selectedMotion, cfg)
            setSelectedTheme('custom')
            setShowDesigner(false)
            toast('Đã áp dụng bộ giao diện của nhà mình! ✨')
            onClose?.()
          }}
          onCancel={() => setShowDesigner(false)}
        />
      )}
    </div>
  )
}
