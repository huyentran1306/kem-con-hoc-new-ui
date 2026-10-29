with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

rc_start = text.find("      {/* 6. MÀN HÌNH CÂU HỎI ĐỂ CON TỰ SỬA */\n      step === 'result_child' && gradeResult && (")
if rc_start == -1:
    rc_start = text.find("      {/* 6. MÀN HÌNH CÂU HỎI ĐỂ CON TỰ SỬA */")

rc_end = text.find("      {/* 7. MÀN HÌNH CHỤP LẠI (RETAKE) */", rc_start)

if rc_start != -1 and rc_end != -1:
    new_result_child = '''      {/* 6. MÀN HÌNH CÂU HỎI ĐỂ CON TỰ SỬA (THEO KHUÔN MỚI) */}
      {step === 'result_child' && gradeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
          <TopBarT4
            title={`Để ${childName} tự phát hiện`}
            stepText="Tự sửa lỗi"
            onBack={() => setStep('result_parent')}
            onOpenCalm={() => openSheet('calm')}
          />

          {/* Câu hỏi gợi mở mức 1 */}
          <div
            className="card-km card-km-ai"
            style={{
              padding: '16px 14px',
              background: 'var(--c-surface)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BuddyGreeter size={38} />
                <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--c-primary)' }}>
                  GẤU GỢI Ý CÂU HỎI
                </span>
              </div>
              <button
                type="button"
                className="btn-km-chip"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--c-bg)',
                  border: '1px solid var(--c-line)',
                  cursor: 'pointer',
                }}
                onClick={() => speak(gradeResult.cau_hoi_cho_con?.muc_1)}
              >
                🔊 Đọc to
              </button>
            </div>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.4,
                fontWeight: 800,
                color: 'var(--c-text)',
                fontFamily: 'var(--font-head)',
                margin: '2px 0 0',
              }}
            >
              "{gradeResult.cau_hoi_cho_con?.muc_1 || 'Con đọc lại đề bài nhé. Phép tính này mình làm thế nào nhỉ?'}"
            </p>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>
              Mẹ đọc to câu trên để con tự nhìn lại bài của mình nhé.
            </span>
          </div>

          {/* Gợi ý mức 2 bằng đồ vật/hình vẽ */}
          {gradeResult.cau_hoi_cho_con?.muc_2 && (
            <div
              className="card-km"
              style={{
                padding: '12px 14px',
                background: 'var(--c-surface)',
                borderRadius: 16,
                cursor: 'pointer',
              }}
              onClick={() => setExpandHint2(!expandHint2)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 13, color: 'var(--c-text)' }}>
                  💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
                </b>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>
                  {expandHint2 ? 'Thu gọn ▲' : 'Mở xem ▼'}
                </span>
              </div>
              {expandHint2 && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--c-sub)', lineHeight: 1.4, borderTop: '1px dashed var(--c-line)', paddingTop: 8 }}>
                  {gradeResult.cau_hoi_cho_con.muc_2}
                </div>
              )}
            </div>
          )}

          {/* Triết lý sư phạm nhẹ nhàng */}
          <div
            className="card-km card-km-note"
            style={{
              padding: '10px 14px',
              borderRadius: 14,
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--c-text)', lineHeight: 1.4 }}>
              ✨ <b>Gấu không chấm sẵn đáp án:</b> Để con tự tìm ra và tự sửa thì mới hiểu sâu và nhớ lâu!
            </span>
          </div>

          {/* Nút Lớn dính đáy */}
          <div
            className="bottom-action-bar-km"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 16px',
              background: 'var(--c-surface, #fff)',
              borderTop: '1px solid var(--c-line, #EADFCF)',
              zIndex: 90,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              data-testid="btn-retake-fixed"
              className="btn-km btn-km-l btn-km-primary"
              style={{ width: '100%' }}
              onClick={() => setStep('retake')}
            >
              <span>{childName} sửa xong, chụp lại</span>
              <span className="btn-km-arrow">📷</span>
            </button>
          </div>
        </div>
      )}
'''
    text = text[:rc_start] + new_result_child + '\n' + text[rc_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated result_child in CheckWork')
else:
    print('Could not find result_child start or end')
