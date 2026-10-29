import re

with open('src/ReportComponents.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

new_component_code = '''/**
 * 2. DÒNG XU HƯỚNG KỸ NĂNG HAY KẸT (PROMPT 23 - PHƯƠNG ÁN 1)
 */
export function SubjectAndSkillHeatmap({
  stats = {},
  childName = "Con",
}) {
  const [selectedSubject, setSelectedSubject] = useState("Toán");
  const [activeTip, setActiveTip] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const WEEKS = ["7/9", "14/9", "21/9", "28/9", "5/10", "12/10", "19/10", "26/10"];

  const MATH_DATA = [
    { name: "Đọc hiểu đề", values: [40, 45, 50, 45, 55, 60, 65, 70] },
    { name: "Chọn phép tính", values: [null, 35, 40, 35, null, null, null, null] },
    { name: "Tính toán", values: [null, null, null, null, null, null, null, null] },
    { name: "Đơn vị", values: [null, null, null, null, null, null, null, null] },
    { name: "Viết lời giải", values: [35, 40, 45, 40, 35, 35, 40, 38] },
    { name: "Kiểm tra lại", values: [50, 55, 45, 50, 45, 50, 55, 52] },
  ];

  const VIETNAMESE_DATA = [
    { name: "Đọc hiểu", values: [30, 35, 40, 35, 40, 45, 40, 42] },
    { name: "Từ vựng", values: [20, 15, 20, 25, 20, 15, 20, 18] },
    { name: "Chính tả", values: [25, 30, 25, 20, 25, 20, 25, 22] },
    { name: "Đặt câu", values: [null, null, null, null, null, null, null, null] },
  ];

  const rawData = selectedSubject === "Tiếng Việt" ? VIETNAMESE_DATA : MATH_DATA;

  const totalRealSessions =
    (stats?.sessionsMom || 0) +
    (stats?.sessionsDad || 0) +
    (Array.isArray(stats?.studyLog) ? stats.studyLog.length : 0);

  const isTrial = isTrialActive();

  // Dưới 3 buổi: hiện 'Gấu cần thêm buổi', không vẽ
  if (!isTrial && totalRealSessions < 3) {
    return (
      <div className="card-km" style={{ textAlign: "center", padding: "20px 16px" }} data-testid="subject-skill-heatmap-empty">
        <div style={{ fontSize: 32, marginBottom: 6 }}>📊 🐻</div>
        <b style={{ fontSize: 15, color: "var(--c-text)" }}>Gấu cần thêm {Math.max(1, 3 - totalRealSessions)} buổi học</b>
        <p className="xs" style={{ margin: "6px 0 0", color: "var(--c-sub, #6E5D4E)" }}>
          Sau khi {childName} hoàn thành ít nhất 3 buổi học, Gấu sẽ vẽ dòng xu hướng kỹ năng hay kẹt 8 tuần tại đây.
        </p>
      </div>
    );
  }

  // Tìm tuần gần nhất có bài
  const getLatestIdx = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] != null) return i;
    }
    return -1;
  };

  const processedRows = rawData.map((row) => {
    const li = getLatestIdx(row.values);
    return { ...row, li };
  });

  const hasDataRows = processedRows
    .filter((r) => r.li >= 0)
    .sort((a, b) => b.values[b.li] - a.values[a.li]);

  const noDataRows = processedRows.filter((r) => r.li < 0);

  // Kỹ năng đầu tiên kẹt nhiều nhất
  const topSkill = hasDataRows[0];
  const insightText = topSkill
    ? `${topSkill.name} tuần này kẹt ${topSkill.values[topSkill.li]}%, cao nhất trong 8 tuần, trùng tuần làm nhiều bài dạng mới.`
    : "Hiện tại các kỹ năng đều ổn định.";

  // Hàm vẽ sparkline SVG
  const renderSparkline = (values, li) => {
    const w = 112;
    const h = 34;
    const x = (i) => 4 + (i * (w - 8)) / (values.length - 1);
    const y = (v) => h - 4 - ((Math.max(20, Math.min(80, v)) - 20) / 60) * (h - 8);

    const segs = [];
    let cur = [];
    const gaps = [];
    let prev = null;

    values.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
        return;
      }
      if (prev != null && prev.i !== i - 1) {
        gaps.push([prev, { i, v }]);
      }
      cur.push({ i, v });
      prev = { i, v };
    });
    if (cur.length) segs.push(cur);

    return (
      <svg className="sp-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Xu hướng 8 tuần">
        <line className="base" x1="0" x2={w} y1={y(50)} y2={y(50)} />
        {gaps.map(([p, q], gi) => (
          <path key={`g-${gi}`} className="gap" d={`M${x(p.i)} ${y(p.v)} L${x(q.i)} ${y(q.v)}`} />
        ))}
        {segs.map((s, si) =>
          s.length > 1 ? (
            <path
              key={`s-${si}`}
              className="l"
              d={`M${s.map((p) => `${x(p.i)} ${y(p.v)}`).join(' L')}`}
            />
          ) : null
        )}
        {values.map((v, i) =>
          v == null ? null : (
            <circle
              key={`c-${i}`}
              className={i === li ? 'last' : 'pt'}
              cx={x(i)}
              cy={y(v)}
              r={i === li ? 3.5 : 2.2}
            />
          )
        )}
        {values.map((v, i) => (
          <rect
            key={`h-${i}`}
            className="hit"
            x={x(i) - 7}
            y="0"
            width="14"
            height={h}
            onMouseEnter={() =>
              setActiveTip(`${WEEKS[i]}: ${v == null ? 'chưa có bài' : v + '% buổi kẹt'}`)
            }
            onMouseLeave={() => setActiveTip(null)}
            onClick={() =>
              setActiveTip(`${WEEKS[i]}: ${v == null ? 'chưa có bài' : v + '% buổi kẹt'}`)
            }
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="rc-trend" data-testid="subject-skill-heatmap">
      <div className="rc-h">
        <b>Kỹ năng hay kẹt · {selectedSubject}</b>
        <div style={{ display: "inline-flex", gap: 4 }}>
          {["Toán", "Tiếng Việt"].map((subj) => (
            <button
              key={subj}
              type="button"
              className={`btn-km btn-km-s ${selectedSubject === subj ? 'btn-km-primary' : 'btn-km-secondary'}`}
              style={{ minHeight: 28, padding: "0 10px", fontSize: 11.5 }}
              onClick={() => setSelectedSubject(subj)}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>
      <div className="rc-sub">
        Tỉ lệ buổi có bậc kẹt theo kỹ năng. Càng cao càng hay kẹt. Vạch chấm giữa là mức 50%.
      </div>

      {activeTip && (
        <div
          style={{
            background: "var(--c-text, #1E293B)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 6,
            display: "inline-block",
          }}
        >
          {activeTip}
        </div>
      )}

      {hasDataRows.map((r, k) => {
        const v = r.values[r.li];
        const prevValues = r.values.slice(0, r.li).filter((x) => x != null);
        const pv = prevValues.length ? prevValues[prevValues.length - 1] : null;
        const recent = r.li === WEEKS.length - 1;
        const delta = pv == null ? null : v - pv;

        return (
          <div key={r.name} className={`sk-row ${k === 0 && recent ? 'top' : ''}`}>
            <div className="sk-nm">
              {r.name}
              {!recent && <small>{prevValues.length + 1} tuần có bài</small>}
            </div>
            {renderSparkline(r.values, r.li)}
            <div className="sk-v">
              <b>{v}%</b>
              {!recent ? (
                <span className="ch-delta eq">tuần {WEEKS[r.li]}</span>
              ) : delta == null ? null : delta > 0 ? (
                <span className="ch-delta up">▲ {delta} điểm</span>
              ) : delta < 0 ? (
                <span className="ch-delta down">▼ {-delta} điểm</span>
              ) : (
                <span className="ch-delta eq">giữ nguyên</span>
              )}
            </div>
          </div>
        );
      })}

      {noDataRows.length > 0 && (
        <div className="sk-nod">
          Chưa có bài luyện: <b>{noDataRows.map((r) => r.name).join(', ')}</b>
        </div>
      )}

      <div className="sk-foot">
        <span>Chạm vào đường để xem tuần</span>
        <button
          type="button"
          className="btn-km-ghost"
          style={{ fontSize: 11.5, fontWeight: 800, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Ẩn bảng số liệu ▴" : "Xem dạng bảng ▾"}
        </button>
      </div>

      {showTable && (
        <div style={{ overflowX: "auto", marginTop: 6 }}>
          <table className="tv-table">
            <thead>
              <tr>
                <th>Kỹ năng</th>
                {WEEKS.map((w) => (
                  <th key={w}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawData.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  {r.values.map((v, idx) => (
                    <td key={idx}>{v == null ? '·' : `${v}%`}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Thẻ GẤU THẤY (do code tạo, đồng bộ với dòng đầu tiên) */}
      <div className="card-km card-km-note" style={{ marginTop: 12 }} data-testid="card-bear-insight">
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.05em', color: 'var(--c-primary)', marginBottom: 2 }}>
          GẤU THẤY
        </div>
        <p style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, margin: 0 }}>
          {insightText}
        </p>
      </div>
    </div>
  );
}
'''

start_idx = text.find('export function SubjectAndSkillHeatmap')
end_idx = text.find('export function TraitAiAnalysisCard')

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + new_component_code.strip() + '\n\n' + text[end_idx:]
    
    # Cập nhật modal dữ liệu 2 tuần trong TraitAiAnalysisCard thành bảng 2 cột tuần trước và tuần này
    old_modal_str = '''            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p>• Tổng số buổi học: <b>{analysisResult?.facts?.total_sessions || analysisResult?.sessions_read || totalSessions} buổi</b>{analysisResult?.from_date ? ` (từ ${analysisResult.from_date} đến ${analysisResult.to_date})` : ""}</p>
              <p>• Phẩm chất tuần trước: Kiên nhẫn {analysisResult?.facts?.traits_w1?.["Kiên nhẫn"] ?? 0}, Sáng tạo {analysisResult?.facts?.traits_w1?.["Sáng tạo"] ?? 0}, Tập trung {analysisResult?.facts?.traits_w1?.["Tập trung"] ?? 0}, Tỉ mỉ {analysisResult?.facts?.traits_w1?.["Tỉ mỉ"] ?? 0}</p>
              <p>• Phẩm chất tuần này: Kiên nhẫn {analysisResult?.facts?.traits_w2?.["Kiên nhẫn"] ?? 0}, Sáng tạo {analysisResult?.facts?.traits_w2?.["Sáng tạo"] ?? 0}, Tập trung {analysisResult?.facts?.traits_w2?.["Tập trung"] ?? 0}, Tỉ mỉ {analysisResult?.facts?.traits_w2?.["Tỉ mỉ"] ?? 0}</p>
              {analysisResult?.facts?.top_problem_type && <p>• Bài lặp dạng: {analysisResult.facts.top_problem_type_w2_count}/{analysisResult.facts.total_sessions} bài là {analysisResult.facts.top_problem_type}</p>}
              {analysisResult?.facts?.games_w1 != null && <p>• Trò chơi 5 phút / Con đố mẹ: {analysisResult.facts.games_w2 || 0} lần tuần này (tuần trước {analysisResult.facts.games_w1} lần)</p>}
              {analysisResult?.facts?.avg_mins_w2 != null && <p>• Thời lượng học trung bình: {analysisResult.facts.avg_mins_w2} phút (tuần trước {analysisResult.facts.avg_mins_w1} phút)</p>}
            </div>'''

    new_modal_table = '''            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                Tổng số buổi học: <b>{analysisResult?.facts?.total_sessions || analysisResult?.sessions_read || totalSessions} buổi</b>
                {analysisResult?.from_date ? ` (từ ${analysisResult.from_date} đến ${analysisResult.to_date})` : ""}
              </p>
              
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 10 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--c-line, #EADFCF)", textAlign: "left" }}>
                    <th style={{ padding: "6px 4px" }}>Chỉ số</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Tuần trước</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Tuần này</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Kiên nhẫn", analysisResult?.facts?.traits_w1?.["Kiên nhẫn"] ?? 0, analysisResult?.facts?.traits_w2?.["Kiên nhẫn"] ?? 0],
                    ["Sáng tạo", analysisResult?.facts?.traits_w1?.["Sáng tạo"] ?? 0, analysisResult?.facts?.traits_w2?.["Sáng tạo"] ?? 0],
                    ["Tập trung", analysisResult?.facts?.traits_w1?.["Tập trung"] ?? 0, analysisResult?.facts?.traits_w2?.["Tập trung"] ?? 0],
                    ["Tỉ mỉ", analysisResult?.facts?.traits_w1?.["Tỉ mỉ"] ?? 0, analysisResult?.facts?.traits_w2?.["Tỉ mỉ"] ?? 0],
                    ["Trò chơi 5p", analysisResult?.facts?.games_w1 ?? 0, analysisResult?.facts?.games_w2 ?? 0],
                    ["Thời lượng TB", `${analysisResult?.facts?.avg_mins_w1 ?? 0}p`, `${analysisResult?.facts?.avg_mins_w2 ?? 0}p`],
                  ].map(([label, w1, w2]) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--c-line, #EADFCF)" }}>
                      <td style={{ padding: "5px 4px", fontWeight: 700 }}>{label}</td>
                      <td style={{ padding: "5px 4px", textAlign: "right", color: "var(--c-sub, #6E5D4E)" }}>{w1}</td>
                      <td style={{ padding: "5px 4px", textAlign: "right", fontWeight: 800 }}>{w2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {analysisResult?.facts?.top_problem_type && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--c-sub, #6E5D4E)" }}>
                  • Bài lặp dạng: {analysisResult.facts.top_problem_type_w2_count}/{analysisResult.facts.total_sessions} bài là {analysisResult.facts.top_problem_type}
                </p>
              )}
            </div>'''
    
    if old_modal_str in new_text:
        new_text = new_text.replace(old_modal_str, new_modal_table)
        print('Updated modal table in TraitAiAnalysisCard')
    else:
        print('Could not find old_modal_str, keeping modal as is')

    with open('src/ReportComponents.jsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('Successfully updated ReportComponents.jsx')
else:
    print('Failed to find start or end index')
