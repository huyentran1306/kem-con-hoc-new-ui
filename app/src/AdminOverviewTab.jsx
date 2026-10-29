/**
 * TỔNG QUAN ADMIN · Đợt 15 chặng 3, bố cục kính mờ theo mẫu v6 (29/10/2026)
 * Số liệu thật từ D1 (GET /api/v1/admin/overview-stats, dự phòng /overview).
 * Không có dữ liệu thì KpiCard hiện "·", bảng hiện trạng thái trống có gấu.
 */
import React, { useCallback, useEffect, useState } from 'react'
import { PageHeader, Button, Segmented, Toggle, DataTable, StatusPill, Banner } from './ui/staff'
import { Users, UserCheck, Flag, Info, RefreshCw } from 'lucide-react'
import { getJson, fmtDateTime, fmtNum, gradeLabel, minutesLabel, ratingInfo, validatorInfo } from './admin/monitorShared'
import './admin/pages-monitor.css'
import './admin/overview.css'

const RANGES = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
]
const RANGE_TEXT = { today: 'hôm nay', '7d': '7 ngày qua', '30d': '30 ngày qua' }
// Mốc tốc độ trả lời mong muốn cho 95% lượt (theo mẫu bảng quản trị v6)
const P95_TARGET_MS = 15000
// Dưới số buổi này thì tỉ lệ "con tự làm được" còn ít mẫu, nhắc phụ huynh chấm thêm
const SMALL_SAMPLE = 20
const TABLE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'has', label: 'Có đề bài' },
  { id: 'none', label: 'Chưa nhập đề' },
]

/** Chuẩn hoá dữ liệu từ endpoint cũ /overview: bỏ các số mặc định không có thật. */
function fromLegacy(d) {
  const m = d.metrics || {}
  const ai = d.aiHealth || {}
  const hasCalls = Number(ai.totalCalls24h || 0) > 0
  return {
    metrics: {
      totalFamilies: m.totalFamilies ?? null,
      activeFamilies: m.activeFamilies ?? null,
      totalStudents: m.totalStudents ?? null,
      activeStudents: null,
      totalSessions: m.totalSessions ?? null,
      avgMinutes: null, // bản cũ tự gán 60 giây cho buổi chưa kết thúc nên không dùng
      activeSessionsNow: m.activeSessionsNow ?? null,
      selfRelianceRate: m.selfRelianceRate ?? null,
      ratedSessions: null,
    },
    subjects: (d.subjects || []).filter((s) => s && s.subject),
    aiHealth: {
      totalCalls24h: ai.totalCalls24h ?? 0,
      medianLatencyMs: hasCalls ? ai.medianLatencyMs ?? null : null,
      p95LatencyMs: hasCalls ? ai.p95LatencyMs ?? null : null,
      blockedLeaks: ai.blockedLeaks ?? null,
      leakedCount: ai.leakedCount ?? null,
    },
    pendingTasks: d.pendingTasks || {},
    recentSessions: (d.recentSessions || []).map((s) => ({ ...s, duration_seconds: null })),
  }
}

const secText = (ms) => (ms === null || ms === undefined ? null : `${fmtNum(ms / 1000, 1)} giây`)

export function AdminOverviewTab({ token, onNavigateTab }) {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [tableFilter, setTableFilter] = useState('all')

  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true)
      let r = await getJson(`/api/v1/admin/overview-stats?range=${range}`)
      let next = null
      if (r.ok) next = r.data
      else {
        const legacy = await getJson(`/api/v1/admin/overview?range=${range}`)
        if (legacy.ok) next = fromLegacy(legacy.data)
        else r = legacy
      }
      if (next) {
        setData(next)
        setError('')
        setUpdatedAt(new Date())
      } else {
        setError(r.data?.error?.message || 'Chưa tải được số liệu tổng quan. Thử tải lại sau ít phút.')
      }
      if (showLoading) setLoading(false)
    },
    [range]
  )

  useEffect(() => {
    load(true)
  }, [load])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const h = setInterval(() => load(false), 30000)
    return () => clearInterval(h)
  }, [autoRefresh, load])

  const m = data?.metrics || {}
  const ai = data?.aiHealth || {}
  const tasks = data?.pendingTasks || {}
  const subjects = data?.subjects || []
  const recent = data?.recentSessions || []
  const subjectTotal = subjects.reduce((a, s) => a + Number(s.count || 0), 0)
  const liveNow = Number(m.activeSessionsNow || 0)
  const firstLoad = loading && !data
  const dash = firstLoad ? '…' : '·'

  const selfRate = m.selfRelianceRate != null ? Number(m.selfRelianceRate) : null
  const famPct = m.activeFamilies != null && Number(m.totalFamilies) > 0 ? Math.min(100, Math.round((Number(m.activeFamilies) / Number(m.totalFamilies)) * 100)) : null
  const pendingT = tasks.pendingTeachers != null ? Number(tasks.pendingTeachers) : null
  const reportsN = tasks.contentReports != null ? Number(tasks.contentReports) : null
  const taskTotal = (pendingT || 0) + (reportsN || 0)
  const p95Slow = ai.p95LatencyMs != null && Number(ai.p95LatencyMs) > P95_TARGET_MS
  const shown = recent.filter((s) => (tableFilter === 'has' ? Boolean(s.problem_text) : tableFilter === 'none' ? !s.problem_text : true))

  const columns = [
    {
      key: 'family_name',
      title: 'Gia đình',
      render: (v, s) => (
        <div className="kov-fam">
          <span className="kov-fam-ic" aria-hidden="true">
            <Users size={16} strokeWidth={1.9} />
          </span>
          <span>
            <span className="pm-strong" style={{ display: 'block' }}>{v || 'Chưa đặt tên'}{s.child_name ? `, ${s.child_name}` : ''}</span>
            <span className="pm-muted">{fmtDateTime(s.started_at)}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      title: 'Môn & lớp',
      render: (v, s) => [v, gradeLabel(s.grade)].filter(Boolean).join(' · ') || '·',
    },
    {
      key: 'problem_text',
      title: 'Đề bài',
      render: (v) => (v ? <span className="pm-ellipsis" title={v}>{v}</span> : <span className="pm-muted">Chưa nhập đề</span>),
    },
    { key: 'duration_seconds', title: 'Thời lượng', render: (v) => minutesLabel(v) },
    {
      key: 'rating',
      title: 'Tự đánh giá',
      render: (_, s) => {
        const r = ratingInfo(s)
        return <StatusPill status={r.status} label={r.label} />
      },
    },
    {
      key: 'validator',
      title: 'Kiểm định',
      render: (_, s) => {
        const v = validatorInfo(s)
        return <StatusPill status={v.status} label={v.label} />
      },
    },
  ]

  return (
    <div className="pm-page kov">
      <PageHeader
        title="Tổng quan"
        description={`Tình hình các gia đình, buổi học và chất lượng AI trong ${RANGE_TEXT[range]}.`}
        actions={
          <>
            <Segmented options={RANGES} value={range} onChange={setRange} />
            <Button variant="ghost" size="sm" onClick={() => load(true)} disabled={loading} icon={<RefreshCw size={14} strokeWidth={2.2} aria-hidden="true" />}>
              {loading ? 'Đang tải…' : 'Tải lại'}
            </Button>
          </>
        }
      />

      {error && <Banner type="bad" message={error} actionText="Thử lại" onAction={() => load(true)} />}

      <div className="kov-grid">
        {/* Chỉ số chính + 4 ô số */}
        <section className="sk-card kov-hero kov-span-8" aria-label="Chỉ số chính">
          <div className="kov-hero-main">
            <div className="kov-ring" style={{ '--p': selfRate ?? 0 }} role="img" aria-label={selfRate != null ? `${selfRate}% con tự làm được` : 'Chưa có buổi nào được đánh giá'}>
              <div className="kov-ring-inner">
                <b>{selfRate != null ? `${selfRate}%` : dash}</b>
                <small>con tự làm được</small>
              </div>
            </div>
            <div className="kov-hero-text">
              <div className="kov-eyebrow">Chỉ số chính</div>
              <div className="kov-hero-title">Con tự giải được bài sau khi bố mẹ kèm theo gợi ý của AI</div>
              {m.ratedSessions != null && Number(m.ratedSessions) > 0 && Number(m.ratedSessions) < SMALL_SAMPLE && (
                <div className="kov-note">
                  <Info size={15} strokeWidth={2} aria-hidden="true" />
                  <span>
                    Mới có <b>{fmtNum(m.ratedSessions)} buổi</b> được đánh giá, mẫu còn nhỏ. Nên nhắc phụ huynh chấm sau buổi học.
                  </span>
                </div>
              )}
              {m.ratedSessions != null && Number(m.ratedSessions) >= SMALL_SAMPLE && (
                <div className="kov-hero-sub">Tính trên {fmtNum(m.ratedSessions)} buổi có đánh giá, {RANGE_TEXT[range]}.</div>
              )}
              {selfRate == null && !firstLoad && <div className="kov-hero-sub">Chưa có buổi nào được phụ huynh đánh giá trong {RANGE_TEXT[range]}.</div>}
            </div>
          </div>
          <div className="kov-minis">
            <div className="kov-mini">
              <div className="kov-k">Gia đình hoạt động</div>
              <div className="kov-v">
                {m.activeFamilies != null ? fmtNum(m.activeFamilies) : dash}
                {m.totalFamilies != null && <small> / {fmtNum(m.totalFamilies)}</small>}
              </div>
              {famPct != null ? (
                <div className="kov-bar" aria-hidden="true">
                  <i style={{ width: `${famPct}%` }} />
                </div>
              ) : (
                <div className="kov-h">Có buổi học {RANGE_TEXT[range]}</div>
              )}
            </div>
            <div className="kov-mini">
              <div className="kov-k">Buổi học</div>
              <div className="kov-v">{m.totalSessions != null ? fmtNum(m.totalSessions) : dash}</div>
              {Array.isArray(m.sessionsByDay) && m.sessionsByDay.length > 1 ? (
                <Sparkline values={m.sessionsByDay.map((d) => Number(d?.count ?? d) || 0)} />
              ) : (
                <div className="kov-h">{liveNow > 0 ? `${fmtNum(liveNow)} buổi đang học` : `Trong ${RANGE_TEXT[range]}`}</div>
              )}
            </div>
            <div className="kov-mini">
              <div className="kov-k">Thời lượng trung bình</div>
              <div className="kov-v">
                {m.avgMinutes != null ? fmtNum(m.avgMinutes, 1) : dash}
                {m.avgMinutes != null && <small> phút</small>}
              </div>
              <div className="kov-h">{m.avgMinutes != null ? 'Cho mỗi buổi học' : 'Chưa đo được thời lượng'}</div>
            </div>
            <div className="kov-mini">
              <div className="kov-k">Học sinh</div>
              <div className="kov-v">{(m.totalStudents ?? m.activeStudents) != null ? fmtNum(m.totalStudents ?? m.activeStudents) : dash}</div>
              <div className="kov-h">{(m.totalStudents ?? m.activeStudents) == null && !firstLoad ? 'Chưa có dữ liệu' : m.activeStudents != null ? `${fmtNum(m.activeStudents)} bạn có buổi học` : 'Tổng hồ sơ con'}</div>
            </div>
          </div>
        </section>

        {/* Việc cần xử lý */}
        <section className="sk-card kov-inbox kov-span-4" aria-label="Cần bạn xử lý">
          <div className="kov-card-head">
            <div>
              <h3 className="pm-card-title">Cần bạn xử lý</h3>
              <p className="pm-card-sub">Bấm vào từng mục để xem chi tiết.</p>
            </div>
            {taskTotal > 0 && <span className="kov-count">{taskTotal}</span>}
          </div>
          <button type="button" className={`kov-task ${pendingT ? '' : 'is-done'}`} onClick={() => onNavigateTab && onNavigateTab('teachers')}>
            <span className="kov-task-ic" aria-hidden="true">
              <UserCheck size={18} strokeWidth={1.9} />
            </span>
            <span className="kov-task-text">
              <b>{pendingT ? `${fmtNum(pendingT)} giáo viên chờ duyệt` : 'Giáo viên chờ duyệt'}</b>
              <span>Kiểm tra trường học và liên hệ</span>
            </span>
            <span className="kov-go">{pendingT ? 'Duyệt' : pendingT === 0 ? 'Không có' : '·'}</span>
          </button>
          <button type="button" className={`kov-task ${reportsN ? '' : 'is-done'}`} onClick={() => onNavigateTab && onNavigateTab('teachers')}>
            <span className="kov-task-ic" aria-hidden="true">
              <Flag size={18} strokeWidth={1.9} />
            </span>
            <span className="kov-task-text">
              <b>{reportsN ? `${fmtNum(reportsN)} nội dung bị phụ huynh báo` : 'Nội dung bị phụ huynh báo'}</b>
              <span>Phụ huynh thấy bài giảng chưa đúng</span>
            </span>
            <span className="kov-go">{reportsN ? 'Xem' : reportsN === 0 ? 'Không có' : '·'}</span>
          </button>
          <div className="kov-live">
            <span className={`kov-live-dot ${liveNow > 0 ? 'is-on' : ''}`} aria-hidden="true" />
            {liveNow > 0 ? `${fmtNum(liveNow)} buổi học đang diễn ra` : 'Hiện chưa có buổi học nào đang diễn ra'}
          </div>
        </section>

        {/* Chất lượng AI */}
        <section className="sk-card kov-span-8" aria-label="Chất lượng AI">
          <div className="kov-card-head">
            <div>
              <h3 className="pm-card-title">Chất lượng AI</h3>
              <p className="pm-card-sub">Tốc độ trả lời tính trên {fmtNum(ai.totalCalls24h) || 0} lượt hỏi AI trong 24 giờ qua.</p>
            </div>
            {ai.p95LatencyMs != null && <StatusPill status={p95Slow ? 'warn' : 'ok'} label={p95Slow ? 'Có lúc trả lời chậm' : 'Tốc độ ổn'} />}
          </div>
          <div className="kov-metrics">
            <div className="kov-metric">
              <div className="kov-k">Thường mất khoảng</div>
              <div className="kov-v">{secText(ai.medianLatencyMs) || '·'}</div>
              <div className="kov-h">Một nửa số lượt trả lời nhanh hơn mức này</div>
            </div>
            <div className="kov-metric">
              <div className="kov-k">95% lượt trả lời xong trong</div>
              <div className={`kov-v ${p95Slow ? 'is-warn' : ''}`}>{secText(ai.p95LatencyMs) || '·'}</div>
              <div className="kov-h">Chỉ 5% lượt chậm hơn mức này. Mục tiêu dưới {P95_TARGET_MS / 1000} giây</div>
            </div>
            <div className="kov-metric">
              <div className="kov-k">Lần AI suýt nói đáp án, đã chặn</div>
              <div className="kov-v">{ai.blockedLeaks != null ? fmtNum(ai.blockedLeaks) : <span className="kov-muted">Chưa ghi nhận</span>}</div>
            </div>
            <div className="kov-metric">
              <div className="kov-k">Buổi lỡ lộ đáp án</div>
              <div className={`kov-v ${Number(ai.leakedCount) > 0 ? 'is-bad' : ''}`}>{ai.leakedCount != null ? fmtNum(ai.leakedCount) : <span className="kov-muted">Chưa ghi nhận</span>}</div>
            </div>
          </div>
        </section>

        {/* Tỉ trọng môn */}
        <section className="sk-card kov-span-4" aria-label="Tỉ trọng môn học">
          <div className="kov-card-head">
            <div>
              <h3 className="pm-card-title">Tỉ trọng môn học</h3>
              <p className="pm-card-sub">Số buổi theo môn, {RANGE_TEXT[range]}.</p>
            </div>
          </div>
          {subjects.length === 0 ? (
            <p className="pm-muted" style={{ margin: 0 }}>{firstLoad ? 'Đang tải…' : 'Chưa có buổi học nào trong kỳ này.'}</p>
          ) : (
            subjects.slice(0, 5).map((s) => {
              const p = subjectTotal > 0 ? Math.round((Number(s.count) / subjectTotal) * 100) : 0
              return (
                <div className="kov-subject" key={s.subject}>
                  <div className="kov-subject-row">
                    <b>{s.subject}</b>
                    <span>
                      {fmtNum(s.count)} buổi · {p}%
                    </span>
                  </div>
                  <div className="kov-bar" aria-hidden="true">
                    <i style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </section>

        {/* Buổi học mới nhất */}
        <section className="sk-card kov-span-12" aria-label="Buổi học mới nhất">
          <div className="kov-card-head">
            <div>
              <h3 className="pm-card-title">Buổi học mới nhất</h3>
              <p className="pm-card-sub">
                10 buổi gần đây nhất của tất cả gia đình{updatedAt ? `, cập nhật lúc ${updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}.
              </p>
            </div>
            <div className="kov-tools">
              <div className="kov-filter" role="group" aria-label="Lọc buổi học">
                {TABLE_FILTERS.map((f) => (
                  <button key={f.id} type="button" className={tableFilter === f.id ? 'is-on' : ''} aria-pressed={tableFilter === f.id} onClick={() => setTableFilter(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
              <span title="Khi bật, danh sách tự tải buổi học mới mỗi 30 giây, không cần bấm Tải lại">
                <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Tự cập nhật mỗi 30 giây" />
              </span>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={shown}
            loading={firstLoad}
            emptyTitle={recent.length ? 'Không có buổi nào khớp bộ lọc' : 'Chưa có buổi học nào'}
            emptyDescription={recent.length ? 'Chọn "Tất cả" để xem lại toàn bộ.' : 'Khi phụ huynh bắt đầu kèm con trên app, buổi học sẽ hiện ở đây trong vòng 30 giây.'}
          />
          {recent.length > 0 && <div className="kov-foot">Hiển thị {fmtNum(shown.length)} / {fmtNum(recent.length)} buổi</div>}
        </section>
      </div>
    </div>
  )
}

/** Đường xu hướng nhỏ, chỉ vẽ khi máy chủ trả chuỗi số theo ngày */
function Sparkline({ values }) {
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? 120 / (values.length - 1) : 120
  const pts = values.map((v, i) => `${Math.round(i * step)},${Math.round(32 - (v / max) * 28)}`).join(' ')
  return (
    <svg className="kov-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="#13A89E" strokeWidth="2" points={pts} />
    </svg>
  )
}

export default AdminOverviewTab
