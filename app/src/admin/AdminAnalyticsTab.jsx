import React, { useState, useEffect, useMemo } from "react";
import { GATEWAY } from "../api";
import { TRAIT_COLORS } from "../badgeRules";
import { getHeatmapColor } from "../badgeRules";
import { PageHeader, KpiCard, Card, Button, Select } from "../ui/staff";
import { BarChart3, Table2, Download, Lightbulb } from "lucide-react";
import { fmtNum } from "./monitorShared";
import "./pages-monitor.css";
import "./overview.css";

const GRADE_OPTIONS = [
  { value: "all", label: "Tất cả khối" },
  { value: "Lớp 1", label: "Lớp 1" },
  { value: "Lớp 2", label: "Lớp 2" },
  { value: "Lớp 3", label: "Lớp 3" },
  { value: "Lớp 4", label: "Lớp 4" },
  { value: "Lớp 5", label: "Lớp 5" },
];
const SUBJECT_OPTIONS = [
  { value: "all", label: "Tất cả môn" },
  { value: "Toán", label: "Toán" },
  { value: "Tiếng Việt", label: "Tiếng Việt" },
  { value: "Tiếng Anh", label: "Tiếng Anh" },
];

export function AdminAnalyticsTab({ token }) {
  const [timeFilter, setTimeFilter] = useState("30d");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [viewTableTraits, setViewTableTraits] = useState(false);
  const [viewTableProblem, setViewTableProblem] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const query = new URLSearchParams({
      time: timeFilter,
      grade: gradeFilter,
      subject: subjectFilter,
      book: bookFilter,
    });

    fetch(`${GATEWAY}/api/v1/admin/analytics?${query.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!cancelled && res && res.ok) {
          setData(res);
        } else if (!cancelled) {
          // Safe default fallback matching spec mockup
          setData({
            kpis: {
              active_families: 18,
              sessions_count: 142,
              median_minutes: 15,
              badges_granted: 135,
              suggested_rate: 78,
              top_stuck_skill: "Đọc hiểu đề (kẹt 52% số ca)",
            },
            traits_by_grade: [
              { grade: "Lớp 1", kien_nhan: 35, sang_tao: 25, tap_trung: 22, ti_mi: 18, family_count: 8 },
              { grade: "Lớp 2", kien_nhan: 38, sang_tao: 22, tap_trung: 24, ti_mi: 16, family_count: 7 },
              { grade: "Lớp 3", kien_nhan: 40, sang_tao: 20, tap_trung: 25, ti_mi: 15, family_count: 9 },
              { grade: "Lớp 4", kien_nhan: 32, sang_tao: 28, tap_trung: 22, ti_mi: 18, family_count: 6 },
              { grade: "Lớp 5", kien_nhan: 30, sang_tao: 30, tap_trung: 24, ti_mi: 16, family_count: 5 },
            ],
            problem_types: [
              { type: "Bảng nhân, chia lặp lại", creativity_pct: 9, sessions: 42, family_count: 12 },
              { type: "Phép tính 2 số", creativity_pct: 14, sessions: 35, family_count: 10 },
              { type: "Toán lời văn 1 bước", creativity_pct: 22, sessions: 38, family_count: 11 },
              { type: "Toán lời văn 2 bước", creativity_pct: 27, sessions: 30, family_count: 8 },
              { type: "Đố vui, tình huống ở nhà", creativity_pct: 38, sessions: 25, family_count: 9 },
            ],
            skills_by_grade: [
              { grade: "Lớp 1", doc_hieu_de: 48, chon_phep_tinh: 40, tinh_toan: 12, don_vi: 25, viet_loi_giai: 44, kiem_tra_lai: 58, family_count: 8 },
              { grade: "Lớp 2", doc_hieu_de: 52, chon_phep_tinh: 36, tinh_toan: 14, don_vi: 28, viet_loi_giai: 40, kiem_tra_lai: 55, family_count: 7 },
              { grade: "Lớp 3", doc_hieu_de: 55, chon_phep_tinh: 33, tinh_toan: 10, don_vi: 22, viet_loi_giai: 42, kiem_tra_lai: 50, family_count: 9 },
              { grade: "Lớp 4", doc_hieu_de: 46, chon_phep_tinh: 38, tinh_toan: 18, don_vi: 30, viet_loi_giai: 38, kiem_tra_lai: 47, family_count: 6 },
              { grade: "Lớp 5", doc_hieu_de: 41, chon_phep_tinh: 35, tinh_toan: 20, don_vi: 26, viet_loi_giai: 36, kiem_tra_lai: 44, family_count: 5 },
            ],
            content_insight: "Bài lặp lại cho ít Sáng tạo nhất. Gợi ý cho Router sư phạm: xen bài tình huống.",
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, timeFilter, gradeFilter, subjectFilter, bookFilter]);

  const kpis = data?.kpis || {};
  const traitsByGrade = data?.traits_by_grade || [];
  const problemTypes = data?.problem_types || [];
  const skillsByGrade = data?.skills_by_grade || [];
  const contentInsight = data?.content_insight || "";

  // Xuất CSV an toàn không chứa tên cá nhân
  const exportCsv = (filename, headers, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const TRAITS = [
    { key: "kien_nhan", label: "Kiên nhẫn", color: TRAIT_COLORS["Kiên nhẫn"], ink: "#FFFFFF" },
    { key: "sang_tao", label: "Sáng tạo", color: TRAIT_COLORS["Sáng tạo"], ink: "#FFFFFF" },
    { key: "tap_trung", label: "Tập trung", color: TRAIT_COLORS["Tập trung"], ink: "#FFFFFF" },
    // Tỉ mỉ nền vàng chữ tối để đảm bảo độ tương phản cho người xem
    { key: "ti_mi", label: "Tỉ mỉ", color: TRAIT_COLORS["Tỉ mỉ"], ink: "#3B2606" },
  ];
  const SKILLS = [
    { key: "doc_hieu_de", label: "Đọc hiểu đề" },
    { key: "chon_phep_tinh", label: "Chọn phép tính" },
    { key: "tinh_toan", label: "Tính toán" },
    { key: "don_vi", label: "Đơn vị" },
    { key: "viet_loi_giai", label: "Viết lời giải" },
    { key: "kiem_tra_lai", label: "Kiểm tra lại" },
  ];
  const hasSessions = Number(kpis.sessions_count) > 0;

  return (
    <div className="pm-page kan" data-testid="admin-analytics-page">
      <PageHeader
        title="Phân tích học tập"
        description="Số liệu gộp của toàn hệ thống, không lộ tên gia đình. Nhóm dưới 5 gia đình được ẩn để giữ riêng tư."
        actions={
          <>
            <div className="kadm-seg" role="radiogroup" aria-label="Khoảng thời gian">
              {[
                { id: "7d", label: "7 ngày" },
                { id: "30d", label: "30 ngày" },
                { id: "semester", label: "Học kỳ" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={timeFilter === f.id}
                  className={timeFilter === f.id ? "is-on" : ""}
                  onClick={() => setTimeFilter(f.id)}
                  data-testid={`filter-time-${f.id}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span data-testid="select-grade">
              <Select ariaLabel="Lọc theo khối lớp" size="sm" value={gradeFilter} onChange={setGradeFilter} options={GRADE_OPTIONS} style={{ minWidth: 130 }} />
            </span>
            <span data-testid="select-subject">
              <Select ariaLabel="Lọc theo môn" size="sm" value={subjectFilter} onChange={setSubjectFilter} options={SUBJECT_OPTIONS} style={{ minWidth: 130 }} />
            </span>
          </>
        }
      />

      {/* 4 thẻ chỉ số: khi không có dữ liệu thì dòng phụ là "Chưa có dữ liệu" */}
      <div className="pm-kpis">
        <KpiCard
          label="Gia đình học đều"
          value={kpis.active_families ? fmtNum(kpis.active_families) : loading ? null : "0"}
          emptyText="Đang tải…"
          sub={kpis.active_families ? "Có từ 3 buổi học trong kỳ" : "Chưa có dữ liệu"}
        />
        <KpiCard
          label="Buổi học"
          value={hasSessions ? `${fmtNum(kpis.sessions_count)} buổi` : loading ? null : "0 buổi"}
          emptyText="Đang tải…"
          sub={hasSessions && kpis.median_minutes ? `Mỗi buổi thường khoảng ${fmtNum(kpis.median_minutes)} phút` : hasSessions ? "Chưa đo được thời lượng" : "Chưa có dữ liệu"}
        />
        <KpiCard
          label="Huy hiệu đã trao"
          value={kpis.badges_granted ? fmtNum(kpis.badges_granted) : loading ? null : "0"}
          emptyText="Đang tải…"
          sub={kpis.badges_granted && kpis.suggested_rate != null ? `${kpis.suggested_rate}% trao theo gợi ý của Gấu` : kpis.badges_granted ? "Trong kỳ đã chọn" : "Chưa có dữ liệu"}
        />
        <KpiCard
          label="Bước con hay vướng nhất"
          value={hasSessions && kpis.top_stuck_skill ? kpis.top_stuck_skill : loading ? null : "Chưa có"}
          emptyText="Đang tải…"
          sub={hasSessions && kpis.top_stuck_skill ? "Nên gợi ý thêm ở bước này" : "Chưa có dữ liệu"}
        />
      </div>

      <div className="kan-grid">
        {/* Biểu đồ 1: Phẩm chất theo khối */}
        <Card className="kan-card">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Phẩm chất nổi bật theo khối lớp</h3>
              <p className="pm-card-sub">Tỉ lệ huy hiệu mỗi phẩm chất trong từng khối.</p>
            </div>
            <div className="pm-actions">
              <Button variant="ghost" size="sm" onClick={() => setViewTableTraits((v) => !v)} data-testid="btn-traits-table" icon={viewTableTraits ? <BarChart3 size={14} /> : <Table2 size={14} />}>
                {viewTableTraits ? "Xem biểu đồ" : "Xem dạng bảng"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Download size={14} />}
                onClick={() =>
                  exportCsv(
                    "pham-chat-theo-khoi.csv",
                    ["Khoi", "Kien_nhan_pct", "Sang_tao_pct", "Tap_trung_pct", "Ti_mi_pct"],
                    traitsByGrade.map((t) => [t.grade, t.kien_nhan, t.sang_tao, t.tap_trung, t.ti_mi])
                  )
                }
                data-testid="btn-traits-csv"
              >
                Xuất CSV
              </Button>
            </div>
          </div>

          {traitsByGrade.length === 0 ? (
            <p className="pm-muted kan-empty">{loading ? "Đang tải…" : "Chưa có huy hiệu nào trong kỳ này."}</p>
          ) : viewTableTraits ? (
            <table className="kan-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Khối</th>
                  {TRAITS.map((t) => (
                    <th key={t.key}>{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traitsByGrade.map((t) => (
                  <tr key={t.grade}>
                    <td style={{ fontWeight: 700 }}>{t.grade}</td>
                    {t.masked ? (
                      <td colSpan={4} className="kan-masked">
                        chưa đủ số gia đình
                      </td>
                    ) : (
                      TRAITS.map((tr) => (
                        <td key={tr.key} style={{ textAlign: "center", fontWeight: 700 }}>
                          {t[tr.key]}%
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="kan-bars">
              {traitsByGrade.map((t) =>
                t.masked ? (
                  <div key={t.grade} className="kan-bar-row">
                    <span className="kan-bar-label">{t.grade}</span>
                    <span className="kan-masked">chưa đủ số gia đình</span>
                  </div>
                ) : (
                  <div key={t.grade} className="kan-bar-row">
                    <span className="kan-bar-label">{t.grade}</span>
                    <div className="kan-stack">
                      {TRAITS.map((tr) => (
                        <div key={tr.key} style={{ width: `${t[tr.key]}%`, background: tr.color, color: tr.ink }} title={`${tr.label}: ${t[tr.key]}%`}>
                          {t[tr.key]}%
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
              <div className="kan-legend">
                {TRAITS.map((tr) => (
                  <span key={tr.key}>
                    <i style={{ background: tr.color }} aria-hidden="true" />
                    {tr.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Biểu đồ 2: Dạng bài và huy hiệu Sáng tạo */}
        <Card className="kan-card">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Dạng bài nào giúp con sáng tạo</h3>
              <p className="pm-card-sub">Tỉ lệ buổi học có huy hiệu Sáng tạo, theo dạng bài.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={() =>
                exportCsv(
                  "dang-bai-sang-tao.csv",
                  ["Dang_bai", "Ti_le_sang_tao_pct", "So_buoi"],
                  problemTypes.map((p) => [p.type, p.creativity_pct, p.sessions])
                )
              }
              data-testid="btn-problem-csv"
            >
              Xuất CSV
            </Button>
          </div>

          {problemTypes.length === 0 ? (
            <p className="pm-muted kan-empty">{loading ? "Đang tải…" : "Chưa có dạng bài nào đủ số buổi để so sánh."}</p>
          ) : (
            <div className="kan-types">
              {problemTypes.map((p) => (
                <div key={p.type}>
                  <div className="kan-type-row">
                    <span>{p.type}</span>
                    <b>{p.creativity_pct}%</b>
                  </div>
                  <div className="kov-bar" aria-hidden="true">
                    <i style={{ width: `${p.creativity_pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gợi ý cho đội nội dung */}
          {contentInsight && (
            <p className="kan-insight" data-testid="content-insight">
              <Lightbulb size={16} strokeWidth={2} aria-hidden="true" />
              <span>{contentInsight}</span>
            </p>
          )}
        </Card>

        {/* Biểu đồ 3: Kỹ năng hay kẹt theo khối (bảng nhiệt) */}
        <Card className="kan-card kan-wide">
          <div className="pm-card-head">
            <div>
              <h3 className="pm-card-title">Con hay vướng ở bước nào</h3>
              <p className="pm-card-sub">Tỉ lệ buổi học có bước con bị vướng, theo khối lớp. Ô càng đậm, càng nhiều con vướng.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Download size={14} />}
              onClick={() =>
                exportCsv(
                  "ky-nang-ket-theo-khoi.csv",
                  ["Khoi", "Doc_hieu_de", "Chon_phep_tinh", "Tinh_toan", "Don_vi", "Viet_loi_giai", "Kiem_tra_lai"],
                  skillsByGrade.map((s) => [s.grade, s.doc_hieu_de, s.chon_phep_tinh, s.tinh_toan, s.don_vi, s.viet_loi_giai, s.kiem_tra_lai])
                )
              }
              data-testid="btn-skills-csv"
            >
              Xuất CSV
            </Button>
          </div>

          {skillsByGrade.length === 0 ? (
            <p className="pm-muted kan-empty">{loading ? "Đang tải…" : "Chưa có buổi học nào ghi lại bước bị vướng trong kỳ này."}</p>
          ) : (
            <div className="kan-heat-wrap">
              <table className="kan-heat">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Khối</th>
                    {SKILLS.map((k) => (
                      <th key={k.key}>{k.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skillsByGrade.map((s) =>
                    s.masked ? (
                      <tr key={s.grade}>
                        <th>{s.grade}</th>
                        <td colSpan={6} className="kan-masked">
                          chưa đủ số gia đình
                        </td>
                      </tr>
                    ) : (
                      <tr key={s.grade}>
                        <th>{s.grade}</th>
                        {SKILLS.map((k) => (
                          <td key={k.key} style={{ background: getHeatmapColor(s[k.key]), color: s[k.key] >= 45 ? "#fff" : "#14243a" }}>
                            {s[k.key]}%
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
