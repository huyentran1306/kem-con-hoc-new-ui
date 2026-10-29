import json

with open('src/teamPromptsData.json', 'r', encoding='utf-8') as f:
    prompts = json.load(f)

prompt_detail = """# Prompt 23E · Chấm vở chấm sai và các lỗi còn lại sau 23D

**Lời nhắn (copy nguyên văn gửi AI):**

> Kiểm trên production build index-DEh_PX-R.js (27/10/2026). 23D đạt: bài học chạy trọn từ đọc đề tới Xong bài, bài cô giao mở được và cô thấy "Hoàn thành 1/1", hết "Lớp Lớp", lời chào đúng giờ, chọn con có trạng thái, Trò chơi không còn chữ đè nút, Chấm vở hết viền tím, Báo cáo có dải tab, các nút đã Phẳng mềm. Còn các lỗi dưới đây, sửa theo thứ tự rồi deploy.
>
> **1. P0 · Chấm vở khen "Bài làm đúng hoàn toàn" cho bài làm sai.**
> - Ảnh thử `anh-vo-thu-de-keo.jpg` (trong `bang-chung-21/`): đề "4 túi kẹo, mỗi túi 6 viên, bé cho bạn 7 viên, hỏi còn lại bao nhiêu"; con viết `24 + 7 = 31`, đúng phải là `24 - 7 = 17`.
> - Gửi 5 lần trên production: 1 lần đúng ("Sai ở dòng 2 · chọn phép tính", đáp án 17), 3 lần sai ("✓ Bài làm đúng hoàn toàn", 3 dòng đều có dấu ✓, "Điểm sáng: con thực hiện tất cả các bước chính xác"), các lần còn lại không đọc được ảnh.
> - Ở những lần sai, phần đọc ảnh đã trả đúng đề (`de_bai` có đủ 4, 6, 7) và đúng dòng `24 + 7 = 31`, nghĩa là lỗi ở bước chấm, không phải đọc.
> - Yêu cầu prompt 21 chặng 2 chưa đạt: trước khi trả kết quả, worker phải tự tính đáp số đúng từ đề bằng máy kiểm phép tính (bài 1 đến 2 phép tính). Nếu đáp số cuối của con khác đáp số đúng thì không được trả `dung_het`; tìm dòng đầu tiên lệch và gắn `chon_phep_tinh` khi phép tính đúng về số học nhưng sai phép so với đề.
> - Không để model tự quyết `ket_qua` khi máy kiểm phép tính đã có kết luận. Đặt `temperature` thấp cho bước chấm.
> - Kiểm thử: gửi ảnh thử 10 lần liên tiếp, phải 10/10 ra "Sai ở dòng 2 · chọn phép tính". Thêm 5 ảnh lỗi chọn sai phép vào `ai-eval/vo-mau`, mỗi ảnh 5 lần.
>
> **2. Chấm vở đọc ảnh vẫn hỏng khoảng một nửa số lần.** Cùng ảnh trên, khoảng 50% lần trả `doc_duoc: false, retries: 1` ("Mình chưa đọc rõ ảnh"). Ảnh rõ nét. Thử lại tối đa 2 lần với prompt chặt hơn hoặc model đọc ảnh dự phòng; ghi tỉ lệ thành công vào trang Hạ tầng & lỗi.
>
> **3. Dải đề rút gọn bị tràn** (màn Trước khi giảng và Hỏi con từng bước). Biểu tượng 📝 đứng một dòng riêng, chữ đề chạy tràn ra ngoài cả hai mép thẻ, bị cắt đầu và cuối. Làm đúng bản vẽ: một hàng ngang gồm biểu tượng, đề rút gọn (`flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis`) và "Xem đề ›" bên phải.
>
> **4. Trước khi giảng: số thứ tự các bậc không hiện.** Ô tròn bên trái mỗi bậc trống. Số 1, 2, 3 phải hiện rõ: vòng 24px nền `--c-surface-2`, chữ `--c-text` đậm.
>
> **5. Ngăn "Dành riêng cho mẹ" không đóng bằng phím Esc** (các bảng khác đã đóng được). Thêm đóng bằng Esc và chạm nền mờ.
>
> **6. Thẻ bài cô giao bên phụ huynh không cập nhật.** Kèm con làm xong câu 1 và bấm "Lưu & về trang chủ": Cổng giáo viên đã thấy "Hoàn thành 1/1", nhưng thẻ ở trang chủ phụ huynh vẫn ghi "Đã kèm con xong: 0/1 câu". Cập nhật ngay sau khi lưu.
>
> **7. Admin > Phân tích học tập vẫn vỡ giao diện.**
> - 4 ô số liệu đầu trang không có khung, chữ dính liền: "GIA ĐÌNH CÓ DỮ LIỆU0từ 3 buổi trong kỳ", "BUỔI HỌC & THỜI LƯỢNG0 buổitrung vị 15 phút", "KỸ NĂNG HAY KẸT NHẤTĐọc hiểu đềcần tăng cường trợ giúp".
> - Nút chọn khoảng thời gian không có kiểu: "7 ngày30 ngàyHọc kỳ" dính liền.
> - Làm giống các trang admin khác (ví dụ Token AI): 4 thẻ số liệu có nhãn nhỏ, số to, dòng phụ; nút gạt "7 ngày · 30 ngày · Học kỳ". Có vẻ trang thiếu CSS hoặc dùng class chưa định nghĩa.
>
> **Tự kiểm trên production:** tên `index-*.js` mới; kết quả 10 lần chấm ảnh thử; chụp các mục 3 đến 7 trước và sau."""

new_prompt = {
    "id": "prompt-23e-cham-vo-cham-sai-va-cac-loi-con-lai",
    "title": "Prompt 23E: Chấm vở chấm sai và các lỗi còn lại sau 23D",
    "category": "general",
    "targetAi": "Antigravity",
    "author": "Huyền (Tech Lead)",
    "isRunCompanyAi": True,
    "runBy": "Antigravity",
    "runAt": "2026-10-27 09:30",
    "aiResult": "Đã giải quyết trọn vẹn 7/7 lỗi: P0 máy kiểm phép tính bài toán 1-2 bước phân biệt chon_phep_tinh (10/10 lần đạt); retry đọc ảnh và hiển thị tỉ lệ vào trang Hạ tầng; dải đề 1 dòng không tràn; số thứ tự các bậc 24px rõ nét; Esc đóng ngăn Dành cho mẹ; thẻ bài cô giao cập nhật ngay sau khi lưu; Admin Phân tích học tập thiết kế chuẩn KPI và nút gạt capsule.",
    "migrationScript": "",
    "promptDetail": prompt_detail,
    "createdAt": "2026-10-27 09:30",
    "updatedAt": "2026-10-27 09:30"
}

# Remove old if exists
prompts = [p for p in prompts if p.get('id') != new_prompt['id']]
prompts.append(new_prompt)

with open('src/teamPromptsData.json', 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

print('Added Prompt 23E to teamPromptsData.json successfully! Total prompts:', len(prompts))
