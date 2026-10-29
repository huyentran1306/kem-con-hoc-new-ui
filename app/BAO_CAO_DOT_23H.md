# BÁO CÁO KẾT QUẢ TRIỂN KHAI PROMPT 23H (ĐỢT 13B · PHẦN CÒN LẠI SAU 23E)

- **Thời gian hoàn thành:** 27/10/2026 10:38
- **Production URL:** [https://kem-con-hoc-5xf.pages.dev](https://kem-con-hoc-5xf.pages.dev)
- **Production Build:** `index-B-YQxoTj.js` (CSS: `index--bxIAjSk.css`)
- **Bộ dữ liệu kiểm tra:** Lớp 3A Thử nghiệm (6DVEUJ), Bé Na, 11 bộ giao diện (Bạn Gấu, Đêm Tuyết, Xuân Sum Vầy, Cầu Vồng 1/6...)

---

## 1. Kết quả thực hiện 15 mục (P0 -> P1 -> P2)

| Mã | Mức | Hạng mục | Hiện trạng trước khi sửa | Đã xử lý & Hoàn thành |
|---|---|---|---|---|
| **A1** | **P0** | **Kèm bài thường dính khung cô giáo** | Sau khi mở bài cô giao, gõ bài thường vẫn hiện khung "Theo cách cô dạy · Cô cô". | Xóa sạch state bài cô giáo (`isTeacherAssigned`, `teacherName`, `teacherMethodNote`, `assignmentId`, `studySource`) khi gõ/đọc/chụp bài mới. Sửa regex `TEACHER_PREFIX` bắt đúng danh xưng đơn lẻ, không bao giờ lặp "Cô cô". |
| **A2** | **P0** | **Bài cô giao mất câu hỏi** | Màn Trước khi giảng và Hỏi con chỉ có số bậc, câu hỏi trống trơn do dữ liệu lưu `questionForChild`. | Viết hàm `normalizeLesson(lessonData, meta)` chuẩn hóa toàn bộ trường câu hỏi (`question`, `questionForChild`, `q`), lời giải, gợi ý dùng chung cho bài thường, bài cô giao và Dùng thử. Mọi bậc đều có câu hỏi đầy đủ. |
| **A3** | **P0** | **Hiệu ứng kẹt dùng chữ mẫu** | Bấm "Chưa nghĩ ra" hiện khung nổi ở mép phải với câu mẫu ("Mẹ dùng mất bao nhiêu quả?"). | Bỏ khung nổi cắt mép; lấy đúng chữ câu hỏi & gợi ý thật của bậc đang học. Hiệu ứng rung thẻ (`wob 0.6s`) và gợi ý trượt ra chạy trực tiếp trên thẻ câu hỏi theo đúng bản vẽ `chuyen-dong-theo-bo.html`. |
| **A5** | **P1** | **Xong bài: Toast và bong bóng đè nhau** | Bấm Tặng huy hiệu hiện cả bong bóng linh vật và toast đen chồng lên nhau đè thẻ Dành cho mẹ. | Chỉ giữ 1 thông báo duy nhất qua bong bóng linh vật (`buddyReact`), bỏ toast đen chồng đè thẻ mẹ. |
| **A8** | **P1** | **AI đọc đề: Màn trắng 2s** | Sau "Đúng rồi, soạn bài" có ~2 giây màn hình trắng tinh trước khi vào Trước khi giảng. | Bổ sung trạng thái `aiState === 'done'` vào khối hiển thị màn chờ (linh vật nhún, checklist 4 dấu ✓) cho đến khi màn Trước khi giảng đã sẵn sàng. Không còn khung hình trắng. |
| **A10** | **P1** | **Báo cáo: Dải tab tràn ngang** | Tab "Gấu phân tích" bị cắt thành "Gấu phân", tab đầu bị cắt thành "i này". | Chuyển layout sang CSS Grid `repeat(4, 1fr)` chia đều 100% bề ngang ở 390px. Rút gọn nhãn: `"Tuần này · Phẩm chất · Môn học · Phân tích"`, không cuộn ngang. |
| **A11** | **P1** | **Báo cáo: Danh sách phẩm chất lộn xộn** | Dòng "▼ -2" đỏ lạc chỗ, biểu đồ cột số nhỏ thiếu chú giải. | Mỗi phẩm chất 1 dòng cùng hàng (chấm màu, tên, số tuần này, ▲/▼ so tuần trước kèm chữ "điểm"). Biểu đồ cột có chú giải 4 màu và nhãn số tuần gần nhất to rõ (11.5px, đậm 900). |
| **A13** | **P1** | **Bộ theo mùa: Trang chủ kiểu cũ** | Đêm Tuyết, Xuân Sum Vầy, Cầu Vồng 1/6 dùng nút to ~100px chữ HOA kèm 3 nút con bên trong. | Chuẩn hóa `SeasonStart` dùng đúng khuôn T3: nút chính Lớn 56px chữ thường ("Bắt đầu bài tối nay"), 2 nút phụ 44px ("Gõ đề bài" và "Đọc đề cho AI") phẳng mềm. |
| **A17** | **P1** | **Bài cô giao: Hũ mật đè tiêu đề** | Màn "Na đã hoàn thành cả 3 bậc!" bị thẻ hũ mật đè lên tiêu đề, số bậc hardcode 3/4. | Lấy tổng số bậc từ bài thật `steps.length` (`3/3`, không ghi `/4`); tăng padding và dời vị trí để hiệu ứng không che tiêu đề hoàn thành. |
| **A9** | **P2** | **Bong bóng linh vật mờ** | Bong bóng "Để Gấu chẻ nhỏ câu hỏi..." chữ xám trên nền trắng mờ khó đọc. | Chữ `--c-text`, nền `--c-surface` đặc (`opacity: 1 !important`), viền 1px `var(--c-line)`, hiện đủ 1.5s. |
| **A12** | **P2** | **Báo cáo Dùng thử: Số mẫu mâu thuẫn** | Thẻ ghi 24p/15p, 0/3; popup ghi Thời lượng TB 0p/0p, Trò chơi 5p 0/0. | Dùng chung 1 bộ số mẫu `sampleFacts` cho cả thẻ và popup (Thời lượng TB: 24p tuần này / 15p tuần trước; Trò chơi 5p: 0 tuần này / 3 tuần trước). |
| **A14** | **P2** | **Bộ theo mùa: Bong bóng đè nút chọn con** | Bong bóng Người Tuyết / Bé Lân che nút Bé Tít; khung hình đầu trong suốt. | Đặt bong bóng sang trái/dưới lời chào (`right: calc(100% + 8px)`), không che hàng nút chọn con; nền đặc ngay từ khung đầu. |
| **A15** | **P2** | **Giao diện cả nhà: Nút xuống 2 dòng** | Nút "Thôi, giữ nguyên" bị ngắt thành 2 dòng, lệch chiều cao với nút chính. | Cả 2 nút cùng cao 48px kiểu Phẳng mềm (`btn-km-m`), `whiteSpace: nowrap`, chữ 1 dòng cân đối. |
| **A16** | **P2** | **Trang chủ: Bong bóng che ô chọn con** | Bong bóng chào của bạn Gấu che hàng Bé Na, Bé Tít 2-3 giây. | Đồng bộ với A14: bong bóng chĩa sang trái về phía lời chào, không đè lên hàng chọn con `seg-km`. |
| **A19** | **P2** | **Cổng giáo viên: "Đang tải..." trơ trọi** | Tab Bài tập, Thông báo, Lời nhắc hiện chữ "Đang tải..." vài giây khi đổi tab. | Thay thế bằng component `TeacherCardSkeleton` mô phỏng bố cục thật kèm hiệu ứng pulse mượt mà. |

---

## 2. Minh chứng kiểm thử (390px)

Tất cả ảnh chụp kiểm thử tự động lưu tại `bang-chung/prompt23h/`:
1. `01_A16_home_bear_no_overlap.png` - Trang chủ Bạn Gấu: bong bóng không đè ô chọn con.
2. `02_A13_A14_home_noel_buttons_and_buddy.png` - Trang chủ Đêm Tuyết: nút chính 56px chữ thường, 2 nút phụ 44px, bong bóng Người Tuyết không che ô chọn con.
3. `03_A15_theme_picker_buttons.png` - Modal Giao diện cả nhà: 2 nút cùng cao 48px, chữ 1 dòng.
4. `04_A1_A2_explain_teacher_assignment.png` - Bài cô giao: có khung "Theo cách cô dạy", hiện câu hỏi đầy đủ ở mọi bậc.
5. `05_A1_explain_parent_problem_clean.png` - Bài mẹ tự gõ sau khi mở bài cô giao: sạch state, không có khung "Theo cách cô dạy".
6. `06_A3_teach_step1.png` - Hỏi con từng bước: thẻ câu hỏi hiển thị câu hỏi thật.
7. `07_A3_stuck_level1_real_hint.png` - Bấm Chưa nghĩ ra lần 1: thẻ rung nhẹ, gợi ý 1 trượt ra.
8. `08_A3_stuck_level2_micro_step.png` - Bấm Chưa nghĩ ra lần 2: gợi ý 2 trượt ra, dùng câu và gợi ý thật của bài.
9. `09_A17_done_screen_header.png` - Màn hoàn thành bài: tiêu đề đứng thoáng, không bị hũ mật che.
10. `10_A5_badge_given_single_bubble.png` - Tặng huy hiệu: 1 bong bóng duy nhất từ linh vật, không đè thẻ mẹ.
11. `11_A10_report_sticky_tabs.png` - Báo cáo: dải 4 tab chia đều 100% bề ngang không cuộn ngang.
12. `12_A11_traits_chart_and_rows.png` - Phẩm chất: 1 hàng ngang mỗi phẩm chất, chú giải 4 màu trên biểu đồ.
13. `13_A12_ai_analysis_card.png` - Thẻ phân tích AI Dùng thử.
14. `14_A12_facts_modal_sync_numbers.png` - Popup "Dữ liệu Gấu đã đọc": đồng bộ số liệu 24p/15p và 0/3.

---

## 3. Cập nhật Team Prompts
- Đã bổ sung Prompt 23H vào cuối file `src/teamPromptsData.json` theo đúng thứ tự thời gian.
