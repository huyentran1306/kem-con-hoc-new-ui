const WORKER_URL = "https://ai-gateway-worker.trannth1306.workers.dev";

const deBai = "4 túi kẹo, mỗi túi 6 viên, bé cho bạn 7 viên, hỏi còn lại bao nhiêu";
const cacDong = [
  { so_thu_tu: 1, noi_dung: "4 x 6 = 24" },
  { so_thu_tu: 2, noi_dung: "24 + 7 = 31" }
];

async function runTest(i) {
  const checkId = `chk_test_prompt23e_2lines_${Date.now()}_${i}`;
  const res = await fetch(`${WORKER_URL}/api/v1/ai/check-work/${checkId}/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      de_bai: deBai,
      cac_dong: cacDong,
      lop: "Lớp 3",
      xung_ho: "Mẹ",
      ten_con: "Bé Na"
    })
  });

  const data = await res.json();
  const ketQua = data.ket_qua;
  const loaiLoi = data.loai_loi;
  const dongSai = data.dong_sai_dau_tien;
  const passed = ketQua === "co_buoc_sai" && loaiLoi === "chon_phep_tinh" && dongSai === 2;

  console.log(`Lần ${i + 1}/5: ket_qua="${ketQua}", loai_loi="${loaiLoi}", dong_sai=${dongSai} -> ${passed ? "PASS ✓" : "FAIL ✗"}`);
  return passed;
}

async function main() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TRƯỜNG HỢP 2 DÒNG (DÒNG SAI = 2) ===");
  let passCount = 0;
  for (let i = 0; i < 5; i++) {
    const ok = await runTest(i);
    if (ok) passCount++;
  }
  console.log(`=== KẾT QUẢ: ${passCount}/5 ĐẠT CHUẨN ===`);
  if (passCount !== 5) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Lỗi:", err);
  process.exit(1);
});
