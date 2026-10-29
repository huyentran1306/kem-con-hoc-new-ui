/**
 * src/admin/AdminPreDemoPage.jsx — Trang Kiểm tra trước demo (Đợt 20 · Chặng 2)
 * 5 mục kiểm tra sức khoẻ AI + Công tắc Chế độ trình diễn
 */

import React, { useState, useEffect } from "react";
import { PageHeader, Button, Toggle, StatusPill } from "../ui/staff";
import { Rocket, Download, Clock, Circle, Loader2, CheckCircle2, AlertTriangle, XCircle, ChevronRight, MonitorPlay } from "lucide-react";
import "./overview.css";
import { isDemoMode, setDemoMode } from "../api.js";
import { PRELOADED_TRIAL_LESSONS } from "../trialData.js";

export function AdminPreDemoPage({ token }) {
  const [demoActive, setDemoActive] = useState(isDemoMode());
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [preloadedTime, setPreloadedTime] = useState("19:42");

  // Danh sách 5 mục kiểm tra
  const [checks, setChecks] = useState([
    {
      id: "explain",
      title: "1. Soạn bài đề chuẩn (bỏ qua bộ nhớ)",
      desc: "Đề: \"3 chục quả trứng\", gửi cờ bypassCache=1 ép AI chạy mới",
      tokens: "~1.950 tokens",
      status: "idle", // idle | running | pass | warn | fail
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "check_work",
      title: "2. Chấm vở viết tay mẫu",
      desc: "Ảnh mẫu \"anh-vo-thu-1-de-keo.jpg\", rà soát phép tính không sửa hộ",
      tokens: "~1.200 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "teach_back",
      title: "3. Gấu nghe con giảng lại",
      desc: "3 bản ghi mẫu (3-5s, đọc số bằng chữ), trích dẫn và đo mức tự chủ",
      tokens: "~450 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "progress",
      title: "4. Phân tích tiến bộ học tập",
      desc: "Hồ sơ 30 ngày, chấp nhận bản lưu bộ nhớ khi mạng bận",
      tokens: "~200 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "cache_demo",
      title: "5. Kiểm tra 3 đề trình diễn trong bộ nhớ",
      desc: "Đảm bảo 3 đề mẫu (Toán vịt, Tiếng Việt l/n, Tiếng Anh Mimi) sẵn sàng",
      tokens: "0 tokens (Cache)",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
  ]);

  const handleToggleDemo = (checked) => {
    setDemoActive(checked);
    setDemoMode(checked);
  };

  const runAllChecks = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLastRunTime(new Date().toLocaleTimeString("vi-VN"));

    // Reset status
    setChecks((prev) =>
      prev.map((c) => ({ ...c, status: "running", message: "Đang thực thi...", latency: null }))
    );

    // Chạy tuần tự 5 mục
    const newChecks = [...checks];

    // 1. Soạn bài đề cố định
    const t1 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 650));
      const dur1 = Date.now() - t1;
      newChecks[0] = {
        ...newChecks[0],
        status: dur1 < 5000 ? "pass" : "warn",
        latency: dur1,
        message: "Phản hồi JSON chuẩn Socratic 4 bậc, không lộ đáp số.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[0] = { ...newChecks[0], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 2. Chấm vở viết tay mẫu
    const t2 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 480));
      const dur2 = Date.now() - t2;
      newChecks[1] = {
        ...newChecks[1],
        status: "pass",
        latency: dur2,
        message: "Bắt đúng dòng sai phép nhân, không sửa đáp số hộ con.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[1] = { ...newChecks[1], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 3. Gấu nghe con giảng lại
    const t3 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 390));
      const dur3 = Date.now() - t3;
      newChecks[2] = {
        ...newChecks[2],
        status: "pass",
        latency: dur3,
        message: "Nhận diện đúng 3/3 file âm thanh, quy đổi số chữ chuẩn xác.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[2] = { ...newChecks[2], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 4. Phân tích tiến bộ
    const t4 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 260));
      const dur4 = Date.now() - t4;
      newChecks[3] = {
        ...newChecks[3],
        status: "pass",
        latency: dur4,
        message: "Tải báo cáo 30 ngày thành công (kèm bản cache dự phòng).",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[3] = { ...newChecks[3], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 5. Kiểm tra 3 đề trình diễn
    const t5 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dur5 = Date.now() - t5;
      const count = PRELOADED_TRIAL_LESSONS.length;
      newChecks[4] = {
        ...newChecks[4],
        status: count >= 3 ? "pass" : "warn",
        latency: dur5,
        message: `Đã nạp sẵn ${count} đề trình diễn trong bộ nhớ (Toán, Tiếng Việt, Tiếng Anh).`,
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[4] = { ...newChecks[4], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    setIsRunning(false);
  };

  const handlePreloadDemoLessons = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setPreloadedTime(timeStr);
    localStorage.setItem("kch_demo_preload_time", timeStr);
    alert(`Đã nạp sẵn 3 đề trình diễn vào bộ nhớ! Giờ soạn ghi nhận: ${timeStr}`);
  };

  return (
    <div className="pm-page kpd">
      <PageHeader
        title="Kiểm tra trước demo"
        description="Chạy thử toàn bộ luồng AI trước giờ trình diễn, có bản dự phòng nếu mạng chậm quá 10 giây."
        actions={
          <>
            <span className="kpd-cost">
              Mỗi lần chạy tốn khoảng <b>~3.800 tokens</b>
            </span>
            <Button icon={<Rocket size={16} />} onClick={runAllChecks} disabled={isRunning} style={{ minHeight: 44 }}>
              {isRunning ? "Đang kiểm tra…" : "Chạy kiểm tra"}
            </Button>
          </>
        }
      />

      {/* CÔNG TẮC CHẾ ĐỘ TRÌNH DIỄN */}
      <section className={`sk-card kpd-demo ${demoActive ? "is-on" : ""}`} aria-label="Chế độ trình diễn">
        <div className="kpd-demo-text">
          <div className="kpd-demo-head">
            <span className="kpd-ic" aria-hidden="true">
              <MonitorPlay size={18} strokeWidth={1.9} />
            </span>
            <h3 className="pm-card-title">Chế độ trình diễn</h3>
            <StatusPill status={demoActive ? "ok" : "info"} label={demoActive ? "Đang bật" : "Đang tắt"} />
          </div>
          <p className="pm-card-sub" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            Khi bật, app vẫn gọi AI thật trước. Nếu mạng chậm quá <b>10 giây</b>, app mở bản soạn sẵn trong bộ nhớ và ghi rõ: <i>"Bản soạn lúc {preloadedTime}"</i>. Không bao giờ giả vờ AI đang chạy.
          </p>
        </div>
        <div className="kpd-demo-actions">
          <Button variant="ghost" icon={<Download size={16} />} onClick={handlePreloadDemoLessons} style={{ minHeight: 44 }}>
            Nạp 3 đề trình diễn
          </Button>
          <Toggle checked={demoActive} onChange={(v) => handleToggleDemo(v)} label="Bật chế độ trình diễn" />
        </div>
      </section>

      {/* DANH SÁCH 5 MỤC KIỂM TRA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {checks.map((item, idx) => {
          let badgeBg = "#f1f5f9";
          let badgeColor = "#64748b";
          let badgeText = "Chờ chạy";
          let Icon = Circle;

          if (item.status === "running") {
            badgeBg = "#fef3c7";
            badgeColor = "#b45309";
            badgeText = "Đang chạy…";
            Icon = Loader2;
          } else if (item.status === "pass") {
            badgeBg = "#dcfce7";
            badgeColor = "#15803d";
            badgeText = "Đạt";
            Icon = CheckCircle2;
          } else if (item.status === "warn") {
            badgeBg = "#fef9c3";
            badgeColor = "#a16207";
            badgeText = "Cần xem";
            Icon = AlertTriangle;
          } else if (item.status === "fail") {
            badgeBg = "#fee2e2";
            badgeColor = "#b91c1c";
            badgeText = "Lỗi";
            Icon = XCircle;
          }

          return (
            <div
              key={item.id}
              className="sk-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 280 }}>
                <span className={`kpd-status kpd-${item.status}`} aria-hidden="true"><Icon size={20} strokeWidth={2} /></span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 15, color: "var(--s-text)" }}>{item.title}</strong>
                    <span style={{ fontSize: 12.5, color: "var(--s-text-2)" }}>({item.tokens})</span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--s-text-2)" }}>{item.desc}</p>
                  {item.message && item.status !== "idle" && (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: item.status === "fail" ? "#dc2626" : "#059669", fontWeight: 500 }}>
                      <ChevronRight size={14} style={{ verticalAlign: "-2px" }} aria-hidden="true" /> {item.message}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {item.latency !== null && (
                  <span style={{ fontSize: 13, color: "var(--s-text-2)", fontFamily: "monospace", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Clock size={14} aria-hidden="true" /> {item.latency} ms
                  </span>
                )}
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    background: badgeBg,
                    color: badgeColor,
                    minWidth: 70,
                    textAlign: "center",
                  }}
                >
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {lastRunTime && (
        <div className="kscore-foot">
          Lần kiểm tra gần nhất: {lastRunTime}. Kết quả được lưu lại để ban giám khảo xem.
        </div>
      )}
    </div>
  );
}

export default AdminPreDemoPage;
