file_path = '/Users/pro/Coding/study-en/ai-gateway-worker/src/teach_back.js'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

target1 = """export function validateTeachBackResult(aiResult, transcript, options = {}) {
  if (!aiResult || typeof aiResult !== 'object') {
    return {
      tieu_chi: [
        { ma: 'du_kien', dat: false, trich: '' },
        { ma: 'phep_tinh', dat: false, trich: '' },
        { ma: 'ket_qua', dat: false, trich: '' },
        { ma: 'vi_sao', dat: false, trich: '' },
      ],
      muc_de_xuat: 'guided',
      cau_hoi_them: 'Con có thể kể lại từng bước con đã làm được không?',
      loi_khen_cho_con: 'Con đã rất cố gắng giải thích cho mẹ nghe!',
      hallucination_detected: false,
    };
  }"""

replacement1 = """export function validateTeachBackResult(aiResult, transcript, options = {}) {
  const xh = options.xungHo || 'mẹ';
  if (!aiResult || typeof aiResult !== 'object') {
    return {
      tieu_chi: [
        { ma: 'du_kien', dat: false, trich: '' },
        { ma: 'phep_tinh', dat: false, trich: '' },
        { ma: 'ket_qua', dat: false, trich: '' },
        { ma: 'vi_sao', dat: false, trich: '' },
      ],
      muc_de_xuat: 'guided',
      cau_hoi_them: 'Con có thể kể lại từng bước con đã làm được không?',
      loi_khen_cho_con: `Con đã rất cố gắng giải thích cho ${xh} nghe!`,
      hallucination_detected: false,
    };
  }"""

assert target1 in c, "target1 not found"
c = c.replace(target1, replacement1, 1)

target2 = "loi_khen_cho_con: aiResult.loi_khen_cho_con || 'Con đã rất tự tin kể lại cách làm cho mẹ!',"
replacement2 = "loi_khen_cho_con: aiResult.loi_khen_cho_con || `Con đã rất tự tin kể lại cách làm cho ${xh}! Luís`,"
# Wait, let's remove any stray chars:
replacement2 = "loi_khen_cho_con: aiResult.loi_khen_cho_con || `Con đã rất tự tin kể lại cách làm cho ${xh}!`, "

assert target2 in c, "target2 not found"
c = c.replace(target2, replacement2, 1)

target3 = """      lop = 'Lớp 3',
      tenCon = 'Mít',
    } = body;"""

replacement3 = """      lop = 'Lớp 3',
      tenCon = 'Mít',
      xungHo = body.xung_ho || body.xungHo || 'mẹ',
    } = body;"""

assert target3 in c, "target3 not found"
c = c.replace(target3, replacement3, 1)

target4 = """    const systemPrompt = `Bạn là trợ lý sư phạm toán tiểu học lắng nghe bé ${tenCon} học ${lop} giảng lại bài toán cho mẹ nghe.
Đề bài:
\"\"\"${problemText}\"\"\"

Các bước bài giải chuẩn:
\"\"\"${standardSteps}\"\"\"

Lời bé kể lại (transcript):
\"\"\"${transcript}\"\"\"

Vòng giảng lại: ${round} (1 hoặc 2).

NHIỆM VỤ:
1. Đánh giá 4 tiêu chí cốt lõi:
   - "du_kien": Nêu đủ dữ kiện của đề bài.
   - "phep_tinh": Chọn đúng phép tính.
   - "ket_qua": Ra đúng kết quả từng bước.
   - "vi_sao": Giải thích được vì sao làm như vậy.
   Mỗi tiêu chí đạt (dat: true) BẮT BUỘC phải trích dẫn đúng câu nguyên văn bé đã nói ("trich"). Nếu bé không nói hoặc nói sai thì dat: false, trich: "".
2. Đề xuất mức hiểu bài:
   - "self": Đạt cả 4 tiêu chí.
   - "hint": Đạt 2 hoặc 3 tiêu chí.
   - "guided": Đạt 0 hoặc 1 tiêu chí.
3. Nếu bé chưa nói được "vi_sao" và round = 1, đưa ra "cau_hoi_them" để mẹ hỏi tiếp (không lộ đáp án).
4. Lời khen ngợi động viên con bằng chính chi tiết con vừa kể ("loi_khen_cho_con")."""

replacement4 = """    const systemPrompt = `Bạn là trợ lý sư phạm toán tiểu học lắng nghe bé ${tenCon} học ${lop} giảng lại bài toán cho ${xungHo} nghe.
Đề bài:
\"\"\"${problemText}\"\"\"

Các bước bài giải chuẩn:
\"\"\"${standardSteps}\"\"\"

Lời bé kể lại (transcript):
\"\"\"${transcript}\"\"\"

Vòng giảng lại: ${round} (1 hoặc 2).

NHIỆM VỤ:
1. Đánh giá 4 tiêu chí cốt lõi:
   - "du_kien": Nêu đủ dữ kiện của đề bài.
   - "phep_tinh": Chọn đúng phép tính.
   - "ket_qua": Ra đúng kết quả từng bước.
   - "vi_sao": Giải thích được vì sao làm như vậy.
   Mỗi tiêu chí đạt (dat: true) BẮT BUỘC phải trích dẫn đúng câu nguyên văn bé đã nói ("trich"). Nếu bé không nói hoặc nói sai thì dat: false, trich: "".
2. Đề xuất mức hiểu bài:
   - "self": Đạt cả 4 tiêu chí.
   - "hint": Đạt 2 hoặc 3 tiêu chí.
   - "guided": Đạt 0 hoặc 1 tiêu chí.
3. Nếu bé chưa nói được "vi_sao" và round = 1, đưa ra "cau_hoi_them" để ${xungHo} hỏi tiếp (không lộ đáp án, ví dụ: 'Con giải thích cho ${xungHo} nghe...').
4. Lời khen ngợi động viên con bằng chính chi tiết con vừa kể ("loi_khen_cho_con")."""

assert target4 in c, "target4 not found"
c = c.replace(target4, replacement4, 1)

target5 = "const validated = validateTeachBackResult(aiResult, transcript, { finalAnswer, problemText });"
replacement5 = "const validated = validateTeachBackResult(aiResult, transcript, { finalAnswer, problemText, xungHo });"

assert target5 in c, "target5 not found"
c = c.replace(target5, replacement5, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated teach_back.js successfully!')
