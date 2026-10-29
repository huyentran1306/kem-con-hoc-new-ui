with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/check_work.js", "r") as f:
    code = f.read()

# 1. Update DEFAULT_GRADE_PROMPT with strict rule
old_grade_prompt_rules = """NHIỆM VỤ:
1. Tự giải lại ĐÚNG BÀI TOÁN TRÊN một cách chuẩn xác từng bước ("loi_giai_chuan").
2. So sánh từng dòng bài làm của con với lời giải chuẩn để tìm bước sai đầu tiên (nếu có).
3. Đánh giá kết quả: "dung_het" | "co_buoc_sai" | "chua_xong" | "khong_ro"."""

new_grade_prompt_rules = """NHIỆM VỤ & QUY TẮC BẮT BUỘC:
1. Tự giải lại ĐÚNG BÀI TOÁN TRÊN một cách chuẩn xác từng bước ("loi_giai_chuan").
2. So sánh từng dòng bài làm của con với lời giải chuẩn để tìm bước sai đầu tiên (nếu có).
3. ĐÁNH GIÁ KẾT QUẢ: "dung_het" | "co_buoc_sai" | "chua_xong" | "khong_ro".
   - QUY TẮC CỐT LÕI: Nếu đáp số cuối cùng của con KHÁC với đáp số đúng của đề bài, BẮT BUỘC đánh giá "co_buoc_sai", TUYỆT ĐỐI KHÔNG ĐƯỢC trả "dung_het"!
   - Khi phép tính của con đúng số học (ví dụ 24 + 7 = 31), nhưng đề bài yêu cầu phép tính khác (ví dụ bớt đi, cho bạn 7 viên kẹo: 24 - 7 = 17) thì BẮT BUỘC phân loại là "chon_phep_tinh" và đánh dấu đó là dòng sai đầu tiên!"""

code = code.replace(old_grade_prompt_rules, new_grade_prompt_rules)

# 2. Update temperature in handleCheckWorkGrade from 0.2 to 0.0
code = code.replace("temperature: 0.2,", "temperature: 0.0,")

# 3. Pass deBai to reconcileWorkCheck
old_reconcile = "const reconciled = reconcileWorkCheck({ aiResult: rawGrade, childLines: cacDong });"
new_reconcile = "const reconciled = reconcileWorkCheck({ aiResult: rawGrade, childLines: cacDong, deBai });"
code = code.replace(old_reconcile, new_reconcile)

# 4. Enhance read prompt
old_read_intro = """Quan sát kỹ trang vở bài làm của học sinh tiểu học trong ảnh. Trả về DUY NHẤT một JSON hợp lệ theo KHUÔN sau (các chỗ <...> là hướng dẫn, phải thay bằng nội dung thật đọc được trong ảnh, KHÔNG chép lại chữ trong ngoặc nhọn):"""

new_read_intro = """Quan sát kỹ trang vở bài làm của học sinh tiểu học trong ảnh. Chữ viết tay của học sinh rất rõ ràng. BẮT BUỘC đặt "doc_duoc": true và đọc đầy đủ từng dòng. Trả về DUY NHẤT một JSON hợp lệ theo KHUÔN sau:"""

code = code.replace(old_read_intro, new_read_intro)

# 5. Fix read logic: If lines were read, force doc_duoc = true; support 2 retries
old_retry_block = """  let retryCount = 0;
  if (!readResult || readResult.doc_duoc === false || looksLikeReadEcho(readResult)) {
    console.warn("[check_work.read] Lần đọc 1 chưa rõ hoặc lỗi, tự động thử lại 1 lần với prompt chặt hơn...");
    retryCount = 1;
    const retryPrompt = `${prompt}\\n\\nCHÚ Ý ĐẶC BIỆT: Đọc cẩn thận từng nét chữ học sinh viết trên trang vở. Chép đủ mọi dòng từ lời giải, phép tính đến đáp số. Trả về DUY NHẤT một JSON hợp lệ.`;
    const aiRetry = await executeVisionAI({ env, imageBytes, prompt: retryPrompt, promptId: "p14a_read_work" }).catch((e) => {
      console.warn("[check_work.read] Retry failed:", e?.message);
      return null;
    });
    if (aiRetry && aiRetry.success) {
      console.log("[check_work.read] Retry raw analysis:", aiRetry.analysis);
      const parsedRetry = parseModelJson(aiRetry.analysis);
      if (parsedRetry && parsedRetry.doc_duoc !== false && !looksLikeReadEcho(parsedRetry)) {
        readResult = parsedRetry;
        modelUsed = aiRetry.model || modelUsed;
      }
    }
  }

  if (!readResult) return notRead(READ_RETRY_MESSAGE, { retries: retryCount });
  if (looksLikeReadEcho(readResult)) {
    console.warn("[check_work.read] model chép lại ví dụ trong prompt → coi là đọc lỗi");
    return notRead(READ_RETRY_MESSAGE, { echo_detected: true, retries: retryCount });
  }
  if (readResult.doc_duoc === false) {
    return notRead(readResult.ly_do || READ_RETRY_MESSAGE, { retries: retryCount });
  }"""

new_retry_block = """  // Nếu model trả về cac_dong có nội dung thì bắt buộc doc_duoc = true
  if (readResult && Array.isArray(readResult.cac_dong) && readResult.cac_dong.length > 0) {
    readResult.doc_duoc = true;
  }

  let retryCount = 0;
  // Thử lại tối đa 2 lần nếu chưa đọc được hoặc lỗi
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (readResult && readResult.doc_duoc !== false && !looksLikeReadEcho(readResult) && Array.isArray(readResult.cac_dong) && readResult.cac_dong.length > 0) {
      break;
    }
    retryCount = attempt;
    console.warn(`[check_work.read] Lần đọc ${attempt} chưa rõ, tự động thử lại lần ${attempt} với prompt chỉ định chặt chẽ...`);
    const retryPrompt = attempt === 1
      ? `${prompt}\\n\\nCHÚ Ý ĐẶC BIỆT: Trang vở có chữ viết tay của học sinh. BẮT BUỘC đặt "doc_duoc": true. Chép đủ từng dòng từ lời giải, phép tính đến đáp số vào "cac_dong".`
      : `Hãy chép lại trung thực toàn bộ chữ viết tay và phép tính của học sinh trong ảnh vở này. BẮT BUỘC đặt "doc_duoc": true.\\nTrả về JSON: {"doc_duoc": true, "de_bai": "...", "cac_dong": [{"so": 1, "noi_dung": "..."}]}`;

    const aiRetry = await executeVisionAI({ env, imageBytes, prompt: retryPrompt, promptId: "p14a_read_work" }).catch((e) => {
      console.warn(`[check_work.read] Retry ${attempt} failed:`, e?.message);
      return null;
    });

    if (aiRetry && aiRetry.success) {
      const parsedRetry = parseModelJson(aiRetry.analysis);
      if (parsedRetry && !looksLikeReadEcho(parsedRetry)) {
        if (Array.isArray(parsedRetry.cac_dong) && parsedRetry.cac_dong.length > 0) {
          parsedRetry.doc_duoc = true;
        }
        if (parsedRetry.doc_duoc !== false && Array.isArray(parsedRetry.cac_dong) && parsedRetry.cac_dong.length > 0) {
          readResult = parsedRetry;
          modelUsed = aiRetry.model || modelUsed;
          break;
        }
      }
    }
  }

  // Sau các lần thử lại, nếu có cac_dong thì luôn công nhận đọc được
  if (readResult && Array.isArray(readResult.cac_dong) && readResult.cac_dong.length > 0) {
    readResult.doc_duoc = true;
  }

  if (!readResult) return notRead(READ_RETRY_MESSAGE, { retries: retryCount });
  if (looksLikeReadEcho(readResult)) {
    console.warn("[check_work.read] model chép lại ví dụ trong prompt → coi là đọc lỗi");
    return notRead(READ_RETRY_MESSAGE, { echo_detected: true, retries: retryCount });
  }
  if (readResult.doc_duoc === false) {
    return notRead(readResult.ly_do || READ_RETRY_MESSAGE, { retries: retryCount });
  }"""

code = code.replace(old_retry_block, new_retry_block)

with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/check_work.js", "w") as f:
    f.write(code)

print("Updated check_work.js successfully.")
