with open('src/admin/AdminAnalyticsTab.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_flt = """          {/* Thời gian */}
          <div className="flt" role="radiogroup" aria-label="Bộ lọc thời gian">
            {[
              { id: "7d", label: "7 ngày" },
              { id: "30d", label: "30 ngày" },
              { id: "semester", label: "Học kỳ" },
            ].map((f) => (
              <span
                key={f.id}
                className={timeFilter === f.id ? "on" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => setTimeFilter(f.id)}
                data-testid={`filter-time-${f.id}`}
              >
                {f.label}
              </span>
            ))}
          </div>"""

new_flt = """          {/* Thời gian */}
          <div role="radiogroup" aria-label="Bộ lọc thời gian" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[
              { id: "7d", label: "7 ngày" },
              { id: "30d", label: "30 ngày" },
              { id: "semester", label: "Học kỳ" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={timeFilter === f.id ? "on" : ""}
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1.5px solid #F0DDC2",
                  backgroundColor: timeFilter === f.id ? "#4B3621" : "#fff",
                  color: timeFilter === f.id ? "#fff" : "#4B3621",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onClick={() => setTimeFilter(f.id)}
                data-testid={`filter-time-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>"""

assert old_flt in code, 'old_flt not matched'
code = code.replace(old_flt, new_flt, 1)

old_kpis = """      {/* 4 Thẻ chỉ số KPIs */}
      <div className="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        <div>
          <span>GIA ĐÌNH CÓ DỮ LIỆU</span>
          <b>{kpis.active_families || 0}</b>
          <em>từ 3 buổi trong kỳ</em>
        </div>
        <div>
          <span>BUỔI HỌC & THỜI LƯỢNG</span>
          <b>{kpis.sessions_count || 0} buổi</b>
          <em>trung vị {kpis.median_minutes || 15} phút</em>
        </div>
        <div>
          <span>HUY HIỆU ĐÃ TẶNG</span>
          <b>{kpis.badges_granted || 0}</b>
          <em>{kpis.suggested_rate || 78}% theo gợi ý Gấu</em>
        </div>
        <div>
          <span>KỸ NĂNG HAY KẸT NHẤT</span>
          <b style={{ fontSize: 16 }}>{kpis.top_stuck_skill || "Đọc hiểu đề"}</b>
          <em>cần tăng cường trợ giúp</em>
        </div>
      </div>"""

new_kpis = """      {/* 4 Thẻ chỉ số KPIs */}
      <div className="kpis" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        <div style={{ background: "#fff", border: "1.5px solid #F0DDC2", borderRadius: 18, padding: "12px 16px", display: "grid", gap: 2 }}>
          <span style={{ fontSize: 11.5, fontWeight: 900, color: "#8A6A4A" }}>GIA ĐÌNH CÓ DỮ LIỆU</span>
          <b style={{ fontSize: 24, fontWeight: 800, color: "#4B3621" }}>{kpis.active_families || 0}</b>
          <em style={{ fontStyle: "normal", fontSize: 12, color: "#8A6A4A" }}>từ 3 buổi trong kỳ</em>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #F0DDC2", borderRadius: 18, padding: "12px 16px", display: "grid", gap: 2 }}>
          <span style={{ fontSize: 11.5, fontWeight: 900, color: "#8A6A4A" }}>BUỔI HỌC & THỜI LƯỢNG</span>
          <b style={{ fontSize: 24, fontWeight: 800, color: "#4B3621" }}>{kpis.sessions_count || 0} buổi</b>
          <em style={{ fontStyle: "normal", fontSize: 12, color: "#8A6A4A" }}>trung vị {kpis.median_minutes || 15} phút</em>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #F0DDC2", borderRadius: 18, padding: "12px 16px", display: "grid", gap: 2 }}>
          <span style={{ fontSize: 11.5, fontWeight: 900, color: "#8A6A4A" }}>HUY HIỆU ĐÃ TẶNG</span>
          <b style={{ fontSize: 24, fontWeight: 800, color: "#4B3621" }}>{kpis.badges_granted || 0}</b>
          <em style={{ fontStyle: "normal", fontSize: 12, color: "#8A6A4A" }}>{kpis.suggested_rate || 78}% theo gợi ý Gấu</em>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #F0DDC2", borderRadius: 18, padding: "12px 16px", display: "grid", gap: 2 }}>
          <span style={{ fontSize: 11.5, fontWeight: 900, color: "#8A6A4A" }}>KỸ NĂNG HAY KẸT NHẤT</span>
          <b style={{ fontSize: 18, fontWeight: 800, color: "#4B3621" }}>{kpis.top_stuck_skill || "Đọc hiểu đề"}</b>
          <em style={{ fontStyle: "normal", fontSize: 12, color: "#8A6A4A" }}>cần tăng cường trợ giúp</em>
        </div>
      </div>"""

assert old_kpis in code, 'old_kpis not matched'
code = code.replace(old_kpis, new_kpis, 1)

with open('src/admin/AdminAnalyticsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated AdminAnalyticsTab.jsx successfully!')
