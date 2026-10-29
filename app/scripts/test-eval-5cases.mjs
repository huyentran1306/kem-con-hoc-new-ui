import fs from 'fs';

const WORKER_URL = "https://ai-gateway-worker.trannth1306.workers.dev";
const data = JSON.parse(fs.readFileSync('ai-eval/vo-mau/index.json', 'utf8'));
const cases = data.filter(d => ['vo_21', 'vo_22', 'vo_23', 'vo_24', 'vo_25'].includes(d.id));

async function runEval() {
  console.log(`=== BẮT ĐẦU CHẠY 5 BÀI MẪU CHỌN SAI PHÉP (${cases.length} bài, mỗi bài 1 lần) ===`);
  let pass = 0;
  for (const c of cases) {
    const cacDong = c.child_lines.map((l, idx) => ({ so_thu_tu: idx + 1, noi_dung: l }));
    const checkId = `chk_eval_${c.id}_${Date.now()}`;
    const res = await fetch(`${WORKER_URL}/api/v1/ai/check-work/${checkId}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        de_bai: c.problem,
        cac_dong: cacDong,
        lop: c.grade || "Lớp 3",
        xung_ho: "Mẹ",
        ten_con: "Bé Na"
      })
    });
    const d = await res.json();
    const ok = d.ket_qua === "co_buoc_sai" && d.loai_loi === "chon_phep_tinh";
    console.log(`- ${c.id}: ${c.name} -> ket_qua=${d.ket_qua}, loai_loi=${d.loai_loi}, dong_sai=${d.dong_sai_dau_tien} [${ok ? "PASS" : "FAIL"}]`);
    if (ok) pass++;
  }
  console.log(`=== TỔNG KẾT: ${pass}/${cases.length} ĐẠT YÊU CẦU ===`);
  if (pass !== cases.length) process.exit(1);
}

runEval().catch(e => {
  console.error(e);
  process.exit(1);
});
