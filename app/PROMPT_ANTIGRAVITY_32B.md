# Prompt cho Antigravity · Đợt 32B: sửa bộ chặn bắt nhầm câu "nhiều lên hay ít đi"

**Cách dùng:** copy phần "Lời nhắn" gửi Antigravity. Làm được trước hoặc sau 33A, hai phần không đụng nhau.

---

## Lời nhắn

Kiểm kết quả đợt 32 trên production thì thấy lỗi ở bộ chặn lộ đáp án.

- **Hiện tượng:** Admin › An toàn AI ghi "Sửa riêng bậc" cho các câu rất tốt, ví dụ "Bác Ba bán đi 18 quả, số trứng nhiều lên hay ít đi, con làm phép gì?".
- **Nguyên nhân:** đáp án của bậc là "Ít đi". Bộ chặn thấy cụm "ít đi" trong câu hỏi nên coi là lộ. Thật ra đây chỉ là một trong hai lựa chọn đưa cho con.
- **Hậu quả:**
  - Mỗi bậc bị bắt nhầm tốn thêm 1 lần gọi AI để soạn lại bậc đó, ~7 giây.
  - Đây là phần chênh trong số đo lần 1: `ai_ms` 6458 nhưng `total_ms` 13555.
  - Câu tốt có thể bị thay bằng câu kém hơn.

Đã sửa xong code, chưa deploy:

- `ai-gateway-worker/src/guard.js` và `kem-con-hoc/src/guard.js`:
  - thêm hàm `isOfferedChoice`;
  - cụm đáp án đứng cạnh "hay/hoặc" không bị tính là lộ;
  - câu khẳng định như "…nên số trứng ít đi, đúng không?" vẫn bị chặn.
- `ai-gateway-worker/src/index.js`: `timing` có thêm `leak_fix_ms` và `leak_fix_calls`. Trước đây thời gian soạn lại bậc bị chặn không nằm trong số đo nào.
- `kem-con-hoc/scripts/test-28-29-30.mjs`: thêm test `32b`. Chạy `--bundle` phải đạt 26/26.

### Việc cần làm

1. **Deploy Worker.**
   - Kiểm trước: `node -e "import('./src/index.js').then(()=>console.log('ok'))"` phải ra `ok`.
   - Ghi tên bản mới.
2. **Đo lại một đề mới chưa có trong cache**, ví dụ "Bác Ba có 52 quả trứng, bác bán đi 17 quả, sau đó mua thêm 9 quả. Hỏi bác Ba có bao nhiêu quả trứng?".
   - Ghi `timing` lần 1 và lần 2.
   - Lần 1 phải có `leak_fix_calls: 0`, hoặc ít hơn trước, và `total_ms` gần `ai_ms + fix_ms`.
   - Lần 2 phải `cached: true` và dưới 3 giây.
3. **Admin › An toàn AI › Nhật ký bộ chặn:** không còn dòng "Sửa riêng bậc" mới cho câu dạng "… nhiều lên hay ít đi …".
4. **App:**

   ```bash
   npm run build
   node scripts/test-28-29-30.mjs --bundle   # 26/26
   npm test
   ```

5. **Commit và push** cả hai repo. Không commit `.claude-xfer/`.
   - Gợi ý commit message: `fix(32b): bộ chặn không bắt nhầm câu đưa lựa chọn "nhiều lên hay ít đi", timing có leak_fix_ms`

### Báo lại

- Tên bản Worker và `index-*.js`.
- `timing` hai lần soạn đề mới.
- Kết quả test.
