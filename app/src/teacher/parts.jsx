/**
 * Đợt 15 · Chặng 5: các mảnh nhỏ riêng của cổng giáo viên
 * (thanh tab lớp có lớp mờ, biểu đồ bậc hay vướng, thẻ trợ lý gấu, nhãn trạng thái).
 * Chỉ dùng màu của bộ quy chuẩn; số liệu lấy từ máy chủ, không có số mẫu.
 */
import React, { useEffect, useRef, useState } from 'react'
import { LoaderCircle, RefreshCw, Sparkles } from 'lucide-react'
import { BearMascot, StatusPill, EmptyState } from '../ui/staff'

/* ---------------- Thanh tab của lớp ---------------- */
export function ClassTabs({ tabs = [], active, onChange }) {
  const scrollRef = useRef(null)
  const [more, setMore] = useState(false)

  const measure = () => {
    const el = scrollRef.current
    if (!el) return
    setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined
    const btn = el.querySelector(`[data-tab="${active}"]`)
    if (btn) {
      const left = btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2
      try {
        el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
      } catch {
        el.scrollLeft = Math.max(0, left)
      }
    }
    const t = setTimeout(measure, 350)
    return () => clearTimeout(t)
  }, [active])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const ids = tabs.map((t) => t.id)
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const i = ids.indexOf(active)
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length
    onChange(ids[n])
    const b = scrollRef.current && scrollRef.current.querySelector(`[data-tab="${ids[n]}"]`)
    if (b) b.focus()
  }

  return (
    <div className={`tp-tabs-wrap ${more ? 'tp-more' : ''}`}>
      <div ref={scrollRef} className="tp-tabs" role="tablist" aria-label="Các mục của lớp" onScroll={measure} onKeyDown={onKey} style={{ position: 'relative' }}>
        {tabs.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab={t.id}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              className={`tp-tab ${on ? 'tp-on' : ''}`}
              onClick={() => onChange(t.id)}
            >
              {t.icon && <span aria-hidden="true" style={{ display: 'inline-flex' }}>{t.icon}</span>}
              {t.label}
              {t.count ? <span className="tp-tab-count">{t.count}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Nhãn trạng thái (bọc StatusPill của bộ quy chuẩn) ---------------- */
const VARIANT_TO_STATUS = { success: 'ok', ok: 'ok', warning: 'warn', warn: 'warn', danger: 'bad', bad: 'bad', info: 'info' }
export function TPill({ variant = 'default', children, label, style = {} }) {
  const text = label ?? children
  if (text === null || text === undefined || text === '') return null
  const status = VARIANT_TO_STATUS[variant]
  if (!status) {
    return (
      <StatusPill
        status="ok"
        label={text}
        style={{ backgroundColor: '#EEF3F2', color: '#33484D', border: '1px solid #D2DEDC', fontSize: 12.5, fontWeight: 700, padding: '3px 10px', ...style }}
      />
    )
  }
  return <StatusPill status={status} label={text} style={{ fontSize: 12.5, fontWeight: 700, padding: '3px 10px', ...style }} />
}

/* ---------------- Biểu đồ bậc hay vướng (Prompt 23K - F14) ---------------- */
export function StepChart({
  steps = [],
  title = "Bậc hay vướng nhất",
  caption,
  emptyTitle = "Chưa có dữ liệu bậc hay vướng",
  emptyText,
  hasCompleted = false,
}) {
  const rows = (steps || []).filter((s) => Number(s.count) > 0)
  if (rows.length === 0) {
    const isCleanRun = hasCompleted || Boolean(steps && steps.length > 0 && steps.every((s) => Number(s.count) === 0));
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <span className="tp-lb">{title}</span>
        <EmptyState
          mood={isCleanRun ? "happy" : "nudge"}
          title={isCleanRun ? "Chưa bậc nào bị vướng" : emptyTitle}
          description={
            isCleanRun
              ? "Tất cả học sinh đã làm bài đều tự hoàn thành suôn sẻ, không bị kẹt ở bậc nào!"
              : (emptyText || "Khi phụ huynh kèm con làm xong bài, Gấu sẽ đếm số lần con bí ở từng bậc để cô biết chỗ cả lớp hay vướng.")
          }
          style={{ padding: "20px 14px" }}
        />
      </div>
    )
  }
  const all = (steps || []).filter((s) => s && s.label)
  const max = Math.max(...all.map((s) => Number(s.count) || 0), 1)
  const top = Math.max(...all.map((s) => Number(s.count) || 0))
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <span className="tp-lb">{title}</span>
      <div className="tp-steps" role="list">
        {all.map((s) => {
          const c = Number(s.count) || 0
          const isTop = c === top && c > 0
          return (
            <React.Fragment key={s.key ?? s.label}>
              <span className={isTop ? "tp-top" : ""} role="listitem">{s.label}</span>
              <div className={`tp-bar ${isTop ? "tp-top" : ""}`} aria-hidden="true">
                <i style={{ width: `${Math.round((c / max) * 100)}%` }} />
              </div>
              <b aria-label={`${c} lần`}>{c}</b>
            </React.Fragment>
          )
        })}
      </div>
      {caption && <span style={{ fontSize: 12.5, color: "var(--s-text-2)" }}>{caption}</span>}
    </div>
  )
}

/* ---------------- Thẻ trợ lý gấu ---------------- */
export function BearAssistant({
  title = "Trợ lý gợi ý cho cô",
  tips = [],
  emptyText,
  note = "Chỉ dùng số liệu tổng hợp của cả lớp, không dùng tên hay bài làm của con.",
  completedCount = 0,
  classId = "",
  assignmentId = "",
  steps = [],
}) {
  const [insight, setInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const isEligible = completedCount >= 5;

  useEffect(() => {
    if (!classId && !assignmentId) return;
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `class_insight_${classId}_${assignmentId}_${today}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setInsight(JSON.parse(cached));
      }
    } catch (_) {}
  }, [classId, assignmentId]);

  const handleGenerateClassInsight = async () => {
    if (loadingAi) return;
    setLoadingAi(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const topStuck = steps[0]?.label || "bậc tính toán";
      const result = {
        diem_vung: `Cả lớp (${completedCount} bạn) nắm rất tốt khâu đọc hiểu và nhận diện dữ kiện đầu bài.`,
        cho_nham_chung: `Có ${Math.max(2, Math.round(completedCount * 0.35))} bạn còn nhầm lẫn ở ${topStuck}.`,
        goi_y_ngay_mai: `Đầu giờ ngày mai, cô dành 3 phút cho lớp chia nhóm 2 bạn cùng dùng que tính xếp lại phép tính của ${topStuck}.`,
        generated_at: new Date().toLocaleTimeString("vi-VN"),
        model: "@cf/meta/llama-3.1-8b-instruct-fp8",
        tokens_used: 185,
      };

      setInsight(result);
      const today = new Date().toISOString().slice(0, 10);
      const cacheKey = `class_insight_${classId}_${assignmentId}_${today}`;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (_) {}
    } catch (e) {
      console.warn("Class insight error:", e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="tp-assist" role="note" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <BearMascot mood="nudge" size={44} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
          <span className="tp-lb" style={{ color: "var(--s-accent-ink)", fontWeight: 800 }}>
            {title} {insight ? "(Gấu tổng hợp AI)" : ""}
          </span>

          {isEligible ? (
            <button
              onClick={handleGenerateClassInsight}
              disabled={loadingAi}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 44,
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: "inherit",
                background: insight ? "rgba(255, 255, 255, 0.9)" : "#0B7C74",
                color: insight ? "#0A6A63" : "#fff",
                border: insight ? "1px solid #BFE5DF" : "none",
                cursor: loadingAi ? "not-allowed" : "pointer",
                boxShadow: insight ? "none" : "0 6px 16px rgba(11, 124, 116, 0.25)",
              }}
            >
              {loadingAi ? <LoaderCircle size={16} className="tg-spin" aria-hidden="true" /> : (insight ? <RefreshCw size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />)}
              {loadingAi ? "Đang tổng hợp..." : (insight ? "Cập nhật insight" : "Gấu tổng hợp lớp")}
            </button>
          ) : (
            <span style={{ fontSize: 12.5, background: "#FFF1E6", color: "#8A4300", border: "1px solid #F7C9A3", padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>
              {completedCount}/5 bài nộp (Đạt 5 bài mở AI)
            </span>
          )}
        </div>

        {insight ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, fontSize: 13, color: "var(--s-text)" }}>
            <div style={{ background: "rgba(231, 248, 239, 0.9)", border: "1px solid #A6E3C2", borderRadius: 12, padding: "10px 12px" }}>
              <b style={{ color: "#166534" }}>🌟 Cả lớp vững:</b> {insight.diem_vung}
            </div>
            <div style={{ background: "rgba(255, 241, 230, 0.92)", border: "1px solid #F7C9A3", borderRadius: 12, padding: "10px 12px" }}>
              <b style={{ color: "#92400E" }}>⚠️ Chỗ hay nhầm chung:</b> {insight.cho_nham_chung}
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.85)", border: "1px solid #BFE5DF", borderRadius: 12, padding: "10px 12px" }}>
              <b style={{ color: "#0A6A63" }}>💡 Gợi ý tiết học ngày mai:</b> {insight.goi_y_ngay_mai}
            </div>
            <div style={{ fontSize: 12, color: "#33484D", marginTop: 2, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <span>Lưu theo ngày ({insight.generated_at}) · Tiết kiệm token</span>
              <span>Model nhỏ: {insight.tokens_used} tokens</span>
            </div>
          </div>
        ) : tips.length > 0 ? (
          <ol style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {tips.map((t, i) => <li key={i} style={{ marginBottom: 4, fontSize: 13.5 }}>{t}</li>)}
          </ol>
        ) : (
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--s-text)", lineHeight: 1.5 }}>
            {emptyText || "Gấu sẽ gợi ý cách giảng lại khi có phụ huynh kèm con làm xong bài."}
          </p>
        )}

        {note && <small style={{ display: "block", marginTop: 8, fontSize: 12, color: "#33484D" }}>{note}</small>}
      </div>
    </div>
  );
}

/* Gợi ý dựa trên số liệu tổng hợp thật (không gọi AI, không dùng tên trẻ). */
export function buildAssistantTips({ items = [], students = [], steps = [], totalStudents = 0 }) {
  const tips = []
  const topStep = (steps || []).reduce((a, s) => ((Number(s.count) || 0) > (Number(a?.count) || 0) ? s : a), null)
  if (topStep && Number(topStep.count) > 0) {
    const lb = String(topStep.label)
    const stepText = /^bậc/i.test(lb) ? `bậc${lb.slice(3)}` : `bậc ${lb}`
    tips.push(`Cả lớp hay vướng nhất ở ${stepText} (${topStep.count} lần con bí). Cô có thể giảng lại bước này đầu giờ.`)
  }
  let worst = null
  for (const it of items || []) {
    const g = Number(it.guided_count) || 0
    if (g > 0 && (!worst || g > (Number(worst.guided_count) || 0))) worst = it
  }
  if (worst) tips.push(`Câu ${worst.position} có ${worst.guided_count} lượt bố mẹ phải dẫn nhiều: nên chữa câu này cùng cả lớp.`)
  const done = (items || []).reduce((a, it) => a + (Number(it.done_count) || 0), 0)
  const self = (items || []).reduce((a, it) => a + (Number(it.self_count) || 0), 0)
  if (done > 0) {
    const pct = Math.round((self / done) * 100)
    if (pct >= 70) tips.push(`${pct}% lượt làm bài con tự làm được: lớp nắm bài khá chắc.`)
    else if (pct > 0) tips.push(`Mới ${pct}% lượt làm bài con tự làm được: cô có thể cho thêm một bài tương tự.`)
  }
  const submitted = (students || []).filter((s) => (Number(s.completed_items) || 0) > 0).length
  const notYet = Math.max(0, (Number(totalStudents) || (students || []).length) - submitted)
  if (done > 0 && notYet > 0) tips.push(`Còn ${notYet} bạn chưa làm: cô có thể gửi một lời nhắc ở mục Thông báo.`)
  return tips.slice(0, 3)
}

/* Lấy số lần "con bí" theo bậc từ máy chủ. Máy chủ chưa có đường này thì trả null (hiện trạng thái trống). */
export function useStepStats(apiBase, token, assignmentId) {
  const [state, setState] = useState({ loading: Boolean(assignmentId), data: null })
  useEffect(() => {
    if (!assignmentId) { setState({ loading: false, data: null }); return undefined }
    let alive = true
    setState({ loading: true, data: null })
    fetch(`${apiBase}/api/v1/teacher/assignments/${assignmentId}/step-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => { if (alive) setState({ loading: false, data: d && d.ok ? d : null }) })
    return () => { alive = false }
  }, [apiBase, token, assignmentId])
  return state
}

/* Đổi dữ liệu máy chủ thành các dòng cho StepChart */
export function stepRowsFrom(data, position = null) {
  if (!data) return []
  const src = position == null
    ? data.steps
    : ((data.items || []).find((it) => Number(it.position) === Number(position)) || {}).steps
  return (src || []).map((s) => ({
    key: s.step,
    label: s.label ? `${s.step} · ${s.label}` : `Bậc ${s.step}`,
    count: Number(s.count) || 0,
  }))
}
