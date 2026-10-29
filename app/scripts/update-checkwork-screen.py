with open('src/screens.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

rp_start = text.find("      {step === 'result_parent' && gradeResult && (")
rp_end = text.find("      {/* 6. MÀN HÌNH CÂU HỎI ĐỂ CON TỰ SỬA */", rp_start)

if rp_start != -1 and rp_end != -1:
    new_result_parent = '''      {step === 'result_parent' && gradeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
          <TopBarT4
            title="Kết quả chấm vở"
            stepText="Chỉ mẹ thấy"
            onBack={() => setStep('capture')}
            onOpenCalm={() => openSheet('calm')}
          />

          {/* T6: Tóm tắt 1 dòng trên cùng */}
          <div
            className="card-km"
            style={{
              padding: '10px 14px',
              background: 'var(--c-surface)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--c-text)' }}>
              {gradeResult.ket_qua === 'dung_het' ? (
                <span style={{ color: 'var(--c-good, #2F7D4F)' }}>✓ Bài làm đúng hoàn toàn</span>
              ) : (
                <span>
                  Sai ở dòng {gradeResult.dong_sai_dau_tien || 1} ·{' '}
                  <span style={{ color: '#B4462F' }}>
                    {gradeResult.loai_loi === 'chon_phep_tinh' ? 'chọn phép tính' : gradeResult.loai_loi === 'tinh_nham' ? 'tính nhẩm' : gradeResult.loai_loi || 'cần sửa'}
                  </span>
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>{lines.length} dòng</span>
          </div>

          {/* Vở bài làm có đánh dấu theo T6 */}
          <div
            className="card-km"
            style={{
              padding: '12px 14px',
              background: 'var(--c-surface)',
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {lines.map((ln, idx) => {
              const lineNum = ln.so || idx + 1
              const isWrongLine = lineNum === gradeResult.dong_sai_dau_tien
              const isCorrectLine = gradeResult.ket_qua === 'dung_het' || (gradeResult.dong_sai_dau_tien && lineNum < gradeResult.dong_sai_dau_tien)

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: isWrongLine ? '#FEF3C7' : isCorrectLine ? '#F0FDF4' : 'var(--c-bg)',
                    border: isWrongLine ? '1px solid #FCD34D' : isCorrectLine ? '1px solid #BBF7D0' : '1px solid var(--c-line)',
                    fontSize: 13.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', width: 16 }}>
                      {lineNum}
                    </span>
                    <span style={{ color: 'var(--c-text)', fontWeight: isWrongLine ? 700 : 500 }}>
                      {ln.noi_dung}
                    </span>
                  </div>

                  {isCorrectLine && (
                    <span style={{ color: '#16A34A', fontWeight: 900, fontSize: 14 }}>✓</span>
                  )}
                  {isWrongLine && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#92400E', background: '#FDE68A', padding: '2px 8px', borderRadius: 999 }}>
                      {gradeResult.loai_loi === 'chon_phep_tinh' ? 'Chọn phép tính' : 'Tính nhẩm'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Điểm sáng nền xanh nhạt */}
          {gradeResult.loi_khen_cu_the && (
            <div
              className="card-km card-km-good"
              style={{
                padding: '12px 14px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 16,
              }}
            >
              <b style={{ color: '#065F46', fontSize: 13, display: 'block', marginBottom: 2 }}>
                🌟 Điểm sáng để khen {childName}
              </b>
              <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.4 }}>
                {gradeResult.loi_khen_cu_the}
              </div>
            </div>
          )}

          {/* Đáp án đối chiếu cho mẹ: Nút Giữ có vòng chạy */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
              ĐÁP ÁN ĐỐI CHIẾU (CHỈ MẸ)
            </label>
            <HoldBtn
              label="Giữ 1.5s xem đáp án chuẩn"
              onHoldComplete={() => setIsHoldingAnswer(true)}
            />
            {isHoldingAnswer && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '10px 12px', borderRadius: 12, marginTop: 8, fontSize: 14, fontWeight: 800, color: '#92400E' }}>
                ✓ {gradeResult.dap_an_dung_cho_me || '19 cây bút'}
              </div>
            )}
          </div>

          {/* Nút Lớn dính đáy: Hỏi Na tự sửa (56px) */}
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
            {gradeResult.ket_qua === 'dung_het' ? (
              <button
                type="button"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%' }}
                onClick={() => go('home')}
              >
                Hoàn thành · Về trang chủ
              </button>
            ) : (
              <button
                type="button"
                data-testid="btn-view-child-question"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%' }}
                onClick={() => setStep('result_child')}
              >
                <span>Hỏi {childName} tự sửa</span>
                <span className="btn-km-arrow">›</span>
              </button>
            )}
          </div>
        </div>
      )}
'''
    text = text[:rp_start] + new_result_parent + '\n' + text[rp_end:]
    with open('src/screens.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Updated result_parent in CheckWork')
else:
    print('Could not find result_parent in CheckWork')
