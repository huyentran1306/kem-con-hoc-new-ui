# VIỆC CẦN LÀM SAU PHIÊN CLAUDE (cập nhật 26/10/2026) — giao cho Antigravity

> Dán cả file này cho Antigravity. Chủ dự án **đã đồng ý** cho push và deploy production theo đúng các bước dưới.
> Làm đúng thứ tự. **Không sửa code**; bước nào lỗi thì dừng, chép nguyên thông báo lỗi vào báo cáo.

## 0. Bối cảnh
- Code app: `~/Coding/kem-con-hoc`, nhánh `main`, **hơn GitHub 10 commit** (77ae6e6 → 806c096): đợt 15 chặng 0–3, 5, 6 và đợt 16 (giao diện theo mùa). Chi tiết: `BAO_CAO_DOT_15.md`, `BAO_CAO_DOT_16.md`, `bao-cao-15/agents/*.md`.
- Worker: `~/Coding/study-en/ai-gateway-worker` (không dùng git). File đã sửa: `src/index.js`, `src/vision.js`, `src/check_work.js`, `src/safety.js`, `src/admin_stitch_routes.js`, `src/v1_routes.js`, `src/teach_back.js`, `wrangler.jsonc`. File mới: `src/dot15_monitor.js`, `dot15_ai.js`, `dot15_system.js`, `dot15_teacher.js`, `dot16_seasons.js`.
- Bản gốc trước khi sửa: `_backup_truoc_khi_sua_2026-10-25/` (index.js, vision.js gốc) và `_backup_truoc_dot15_2026-10-25/` (bản trước đợt 15).

## Quy tắc
1. **Không** đổi model AI, **không** xoá dữ liệu, **không** chạy migration xoá/sửa bảng.
2. **Không** commit `kem-con-hoc.code-workspace`, `_backup_truoc_cap_nhat_2026-10-25/`, file này.
3. Gọi AI thật ít nhất có thể (quota miễn phí 10.000 neurons/ngày dùng chung với phụ huynh).

---

## 1. Push
```bash
cd ~/Coding/kem-con-hoc
git status -sb          # kỳ vọng: main...origin/main [ahead 10]
git push origin main
```

## 2. Cài gói, build, test
```bash
cd ~/Coding/kem-con-hoc
npm install
npm run build
TZ=Asia/Ho_Chi_Minh npm test
```
- `test-prompt-00-auth`, `test-prompt-03-family-zalo`, `test-e2e-full-flow` gọi máy chủ thật: chỉ lỗi mạng thì ghi lại, không chặn deploy.
- `test-chang-1/2/4/5` và `test-dot14-chang-3` đọc đường dẫn `/Users/pro/...`: chạy được trên Mac thì phải đạt.
- Mọi test khác phải đạt. Lỗi khác → dừng và báo.
- Kiểm công cụ nội bộ không lọt vào bản production (phải **không** in ra gì):
  ```bash
  grep -l "VideFlow\|Team Prompts Sync" dist/assets/*.js
  ```

## 3. Deploy worker (TRƯỚC app)
```bash
cd ~/Coding/study-en/ai-gateway-worker
npx wrangler deploy
```
Kiểm nhanh (không tốn neurons):
```bash
W=https://ai-gateway-worker.trannth1306.workers.dev
curl -s -o /dev/null -w "%{http_code}\n" $W/api/v1/admin/me                      # kỳ vọng 401
curl -s $W/api/v1/config/public | head -c 400; echo                               # kỳ vọng có "seasons"
curl -s $W/api/v1/safety/summary; echo                                            # kỳ vọng "scope":"none" khi không đăng nhập
printf 'abc' > /tmp/not-image.bin
curl -s -F image=@/tmp/not-image.bin -F prompt_id=p1_ocr_v3 $W/vision/analyze; echo   # kỳ vọng 415
curl -s -X POST $W/vision/analyze -H 'Content-Type: application/json' -d '{"prompt_id":"hack","image":"/9j/4AAQ"}'; echo  # kỳ vọng 400
```
Nếu deploy hoặc các lệnh trên lỗi nặng: chép lại các file trong `_backup_truoc_dot15_2026-10-25/` (bỏ đuôi `.before-p15`) về `src/`, deploy lại, rồi báo.

## 4. Deploy app
```bash
cd ~/Coding/kem-con-hoc
npm run build && npx wrangler pages deploy dist --project-name kem-con-hoc --branch main
```

## 5. Kiểm trên https://kem-con-hoc-5xf.pages.dev (chụp ảnh từng mục vào báo cáo)
Dùng tài khoản thử nghiệm của chủ dự án, **không tạo tài khoản mới**.

**Admin** (`/admin`)
- [ ] Chưa đăng nhập: thấy màn đăng nhập. Gõ tay `localStorage['kem-con-hoc:admin-auth']='true'` rồi tải lại: **vẫn** là màn đăng nhập.
- [ ] Đăng nhập bằng email + **mật khẩu riêng** của chủ dự án (không dùng khoá chủ). Ghi lại: đăng nhập được hay không.
- [ ] Thanh bên 3 nhóm phẳng; bấm vài trang thì đường dẫn đổi (`/admin/pham-vi`, `/admin/prompt-studio`…), nút Back của trình duyệt quay đúng trang trước.
- [ ] Không còn nhãn "Stitch", "(Đợt 14)", "(Prompt 10)"; không còn ô chọn kiểu mặc định của trình duyệt; số nào chưa có dữ liệu hiện "·".
- [ ] Network: ghi lại các request còn đi tới `/db/` (chặng 4 chưa làm, chỉ liệt kê, không sửa).

**Cổng cô giáo** (`/teacher`, thử cả điện thoại hoặc cửa sổ 390px)
- [ ] Không còn "Lớp Lớp 3A", "Cô Cô …"; thanh tab dưới 5 mục Lớp · Bài tập · Học sinh · Thông báo · Cô.

**Phụ huynh**
- [ ] Đăng nhập gia đình cũ trên **cửa sổ ẩn danh**: vào thẳng màn chính, **không** bị hỏi "Bước 1/3", tên con giữ nguyên.
- [ ] Gia đình chưa vào lớp: **không** thấy thẻ "Cô Hạnh · Lớp 3A".
- [ ] Dùng thử: ô gõ đề có 3 đề mẫu; gõ đề lạ thì báo "Dùng thử chỉ có 3 đề mẫu".
- [ ] Giảng 1 đề thật: thấy "AI đang soạn bài giảng · N giây"; xong bậc cuối là có nút "Hoàn thành bài".
- [ ] Chấm vở **đúng 1 lần** với ảnh vở thật: kết quả **không** phải "Hỏi còn mấy bút? / 29 / 20"; màn kết quả có "Bước sai đầu tiên: Dòng N" (không còn "Dòng .").
- [ ] Bảng chọn giao diện có nhóm "Theo mùa" (Noel, Tết, Thiếu nhi).

## 6. ĐIỂM DỪNG — chỉ làm khi chủ dự án xác nhận
Worker vẫn nhận khoá chủ cũ đã bị lộ (`kem-con-hoc-admin-secret-2026`, `kem_admin_2026`, token `admin`) vì `ALLOW_LEGACY_MASTER_SECRET` đang là `"true"`.
**Chỉ khi** bước 5 xác nhận chủ dự án đăng nhập admin được bằng mật khẩu riêng, và chủ dự án đồng ý:
```bash
cd ~/Coding/study-en/ai-gateway-worker
# sửa wrangler.jsonc: "ALLOW_LEGACY_MASTER_SECRET": "false"
npx wrangler deploy
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer admin" https://ai-gateway-worker.trannth1306.workers.dev/api/v1/admin/me   # kỳ vọng 401
```
(Sau bước này `scripts/test-e2e-full-flow.mjs` dòng 52 sẽ không đăng nhập được bằng khoá cũ, đó là đúng.)

## 7. Dọn dẹp (khi 1–5 ổn)
- Xoá `~/Coding/kem-con-hoc/_backup_truoc_cap_nhat_2026-10-25/`, `~/Coding/kem-con-hoc/.kit-preview/`, `~/Coding/kem-con-hoc/node_modules/.cache/c6/`.
- Hỏi chủ dự án trước khi xoá `~/Downloads/workspace (2)`.
- Giữ hai thư mục `_backup_…` trong worker thêm vài ngày.

## 8. Còn treo — KHÔNG làm lần này, chỉ liệt kê
- Đợt 15 chặng 4: thay mọi request `/db/*` bằng `/api/v1/admin/*`, rồi hỏi trước khi khoá cổng cũ.
- Chặng 7: chụp đủ mọi trang (admin 1440/1280, cô 1440/390, bố mẹ 390/768/1366) và chạy axe; cập nhật bộ e2e cho 11 bộ giao diện.
- App phụ huynh chưa gửi "bậc vướng" và "luật router đã dùng" lên máy chủ → biểu đồ của cô và số dùng router sẽ hiện "·".
- Kiểm lại ngày Tết 2027–2031 trong `src/seasons`.
- Benchmark model đọc ảnh (cần 10 ảnh thật), thống kê ảnh cũ trên R2 (không xoá).

## Báo cáo cuối
Ghi ngắn: kết quả từng bước 1–5 và 7 (đạt / lỗi + thông báo lỗi), link deploy, kết quả các lệnh curl ở bước 3, ảnh các mục kiểm ở bước 5, danh sách request `/db/` còn lại.
