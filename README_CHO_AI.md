# Kèm Con Học · mã nguồn đầy đủ (bản 29/10/2026)

App giúp bố mẹ kèm con tiểu học học bài buổi tối: phụ huynh nhập đề, app soạn bài, gợi ý hỏi con từng bước (không giải hộ), có trò chơi, báo cáo, nhiều bộ giao diện.

## Cấu trúc

- `app/`: React 18 + Vite, chạy trên Cloudflare Pages (`https://kem-con-hoc-5xf.pages.dev`).
- `worker/`: Cloudflare Worker `ai-gateway-worker` (API `/api/v1/...`, D1, Workers AI). File cấu hình: `worker/wrangler.jsonc`.
  - Trong máy gốc, `worker/` nằm trong repo `study-en`, nên `package.json` của Worker không có trong gói này. Cần `wrangler` để chạy hoặc deploy.
  - Một số test của app đọc file Worker qua đường dẫn `../../study-en/ai-gateway-worker/...`. Muốn các test đó chạy, đặt lại đúng cấu trúc thư mục này.

## Chạy app

```bash
cd app
npm install
npm run dev        # chạy thử
npm run build      # build (chạy lint trước)
npm test           # bộ test, chạy bằng node
```

- **Kết quả test hiện tại:** có sẵn 22 test lỗi từ trước. Lý do: các test này cần mạng hoặc cần thư mục Worker theo đường dẫn ở trên, hoặc kỳ vọng nội dung cũ. Khi sửa code, chỉ cần không có test **mới** bị lỗi.
- **Lint:** ESLint chỉ bật `no-undef` và react-hooks.

## Những file chính

### Màn hình

- `app/src/App.jsx`: khung app, điều hướng, bảng trượt (`SheetView`), toast.
- `app/src/screens.jsx`: phần lớn màn hình: Home, Hỏi con, Hoàn thành (`Done`), Báo cáo, Trò chơi (`SnapToy`, `Game` và 10 trò đồ vật).
- `app/src/ProfileScreen.jsx` và `app/src/ChildSheets.jsx`: màn Con tôi, form Thêm con 3 bước, Sửa hồ sơ con.
- `app/src/games/`: Góc chơi chung (`GocChoiChung.jsx`, Đấu trí, Leo cây, Thám tử), hình đồ vật `toyIcons.jsx`.

### Giao diện

- `app/src/themes.css`, `app/src/themes.js`: 11 bộ giao diện. Màu luôn đọc qua biến `--c-*`, không viết cứng mã màu:
  - `--c-bg`, `--c-surface`, `--c-surface-2`, `--c-line`;
  - `--c-text`, `--c-text-2`;
  - `--c-accent`, `--c-accent-ink`, `--c-on-accent`;
  - `--c-warn-*`, `--c-good-*`, `--c-danger*`.
- Bộ tối: garden, aurora, chalk.
- CSS theo màn: `done.css`, `report.css`, `profile.css`, `games.css`, `hoiCon.css`.

### Tiện ích

- `app/src/dialog.jsx`: `appConfirm` / `appAlert` / `appPrompt`, hộp thoại trong app.
- `app/src/utils.js`: `toast(msg, { undo })` (có nút Hoàn tác) và `buzz()` (rung nhẹ).

### Tài liệu

- `app/PROMPT_ANTIGRAVITY_*.md`: mô tả từng đợt sửa (đợt 34–39 là mới nhất).
- `app/BAO_CAO_DOT_*.md`: báo cáo các đợt.

## Quy ước khi sửa

- Chữ hiển thị bằng tiếng Việt.
- Xưng hô theo người dùng, qua `Ho` / `ho` trong `AppCtx` ("Bố" / "Mẹ"…).
- Nút và vùng chạm ≥ 44px.
- Chữ đạt tương phản ≥ 4,5:1 trên cả bộ sáng lẫn bộ tối.
- Chế độ Dùng thử (`isTrialActive()`, `src/trialData.js`) không gọi máy chủ cho các chức năng cần đăng nhập.
- Không commit `.env`, file `.sql` dữ liệu hay bản sao dữ liệu thật.

## Đã loại khỏi gói này

- `node_modules`, `.git`, `dist`: tự cài hoặc build lại.
- `bang-chung/`, `bao-cao-15/`, `bao-cao-16/`: ảnh bằng chứng, rất nặng.
- `.env`, `.env.production`: chỉ có cờ `VITE_DEV_TOOLS`.
- `backup_production_db.json`, `*.sql` ở thư mục gốc, `export_dot14_local.sql`: dữ liệu thật hoặc dữ liệu xuất ra. File migration và schema vẫn giữ.
- `_backup_*` của Worker, `.wrangler`, `kem-con-hoc-source.zip` cũ.

## Trạng thái

Đợt 39 (tab Trò chơi) đã có trong gói này nhưng **chưa commit / deploy** ở repo gốc. Các đợt 34–38 đã lên production.
