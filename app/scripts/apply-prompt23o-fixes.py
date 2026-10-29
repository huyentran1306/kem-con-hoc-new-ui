import re
import os

BASE = "/Users/pro/Coding/kem-con-hoc"

def patch_file(rel_path, patches):
    full_path = os.path.join(BASE, rel_path)
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = content
    for old, new in patches:
        if old not in modified:
            print(f"[WARN] Target not found in {rel_path}:\n{old[:100]}...")
        else:
            modified = modified.replace(old, new, 1)
            print(f"[OK] Patched in {rel_path}")
            
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(modified)

# 1. GocChoiChung.jsx (A1)
patch_file("src/games/GocChoiChung.jsx", [
    (
        "borderTop: '1px dashed var(--c-line)'",
        "borderTop: '1px solid var(--c-line)'"
    )
])

# 2. screens.jsx (A2, A4, A5, B1, B4, B5, C1, C2)
patch_file("src/screens.jsx", [
    # B1: GỢI Ý NHỎ
    (
        "<b style={{ color: 'var(--c-accent-2, var(--c-accent))', fontWeight: 900 }}>GỢI Ý NHỎ {stuck >= 2 ? '2/2' : '1/2'}</b>",
        "<b style={{ color: 'var(--c-accent-ink, var(--c-text))', fontWeight: 900 }}>GỢI Ý NHỎ {stuck >= 2 ? '2/2' : '1/2'}</b>"
    ),
    # A2: Camera text contrast
    (
        """<b style={{ fontSize: 16, color: 'var(--c-text)', marginBottom: 6 }}>Chụp đồ vật quanh nhà</b>
            <p className="xs" style={{ color: 'var(--c-text-2)', maxWidth: 280, margin: 0, lineHeight: 1.45 }}>""",
        """<b style={{ fontSize: 16, color: '#FFF4E6', marginBottom: 6 }}>Chụp đồ vật quanh nhà</b>
            <p className="xs" style={{ color: 'rgba(255,244,230,.82)', maxWidth: 280, margin: 0, lineHeight: 1.45 }}>"""
    ),
    # A4: Button text
    (
        "📷 Bật máy ảnh chụp",
        "📷 Bật máy ảnh"
    ),
    # A4: Placeholder
    (
        'placeholder="Gõ tên: cây bút, thước, que kem..."',
        'placeholder="Gõ tên đồ vật"'
    ),
    # A5: opt-grid margin
    (
        '<div className="opt-grid">',
        '<div className="opt-grid" style={{ marginBottom: 16 }}>'
    ),
    # B5: facts-grid text contrast
    (
        """        <div className="facts-grid two-cols">
          <div>
            <span>Phép tính sai đã bắt</span>
            <b>{isTrialActive() ? 3 : (safety?.dot18_safety?.phep_tinh_sai_da_bat ?? 0)}</b>
            <em>trước khi tới mẹ</em>
          </div>
          <div>
            <span>Bậc bộ chặn sửa lại</span>
            <b>{isTrialActive() ? 2 : (safety?.dot18_safety?.bac_bo_chan_sua_lai ?? blocked)}</b>
            <em>sửa đúng bậc học</em>
          </div>
          <div>
            <span>Câu nhỏ hơn đã tạo</span>
            <b>{isTrialActive() ? 5 : (safety?.dot18_safety?.cau_nho_hon_da_tao ?? 0)}</b>
            <em>chia nhỏ khi con kẹt</em>
          </div>
          <div>
            <span>Lần Gấu nghe con</span>
            <b>{isTrialActive() ? 8 : (safety?.dot18_safety?.so_lan_gau_nghe_con ?? 0)}</b>
            <em>lắng nghe con trả lời</em>
          </div>
        </div>""",
        """        <div className="facts-grid two-cols">
          <div>
            <span style={{ color: 'var(--c-text)' }}>Phép tính sai đã bắt</span>
            <b>{isTrialActive() ? 3 : (safety?.dot18_safety?.phep_tinh_sai_da_bat ?? 0)}</b>
            <em style={{ color: 'var(--c-text)' }}>trước khi tới mẹ</em>
          </div>
          <div>
            <span style={{ color: 'var(--c-text)' }}>Bậc bộ chặn sửa lại</span>
            <b>{isTrialActive() ? 2 : (safety?.dot18_safety?.bac_bo_chan_sua_lai ?? blocked)}</b>
            <em style={{ color: 'var(--c-text)' }}>sửa đúng bậc học</em>
          </div>
          <div>
            <span style={{ color: 'var(--c-text)' }}>Câu nhỏ hơn đã tạo</span>
            <b>{isTrialActive() ? 5 : (safety?.dot18_safety?.cau_nho_hon_da_tao ?? 0)}</b>
            <em style={{ color: 'var(--c-text)' }}>chia nhỏ khi con kẹt</em>
          </div>
          <div>
            <span style={{ color: 'var(--c-text)' }}>Lần Gấu nghe con</span>
            <b>{isTrialActive() ? 8 : (safety?.dot18_safety?.so_lan_gau_nghe_con ?? 0)}</b>
            <em style={{ color: 'var(--c-text)' }}>lắng nghe con trả lời</em>
          </div>
        </div>"""
    ),
    # C2: switch-row padding
    (
        '<div className="switch-row" style={{ borderTop: ' + "'1px dashed var(--c-line)', paddingTop: 8 }}>",
        '<div className="switch-row" style={{ borderTop: ' + "'1px dashed var(--c-line)', padding: '12px 14px 8px 14px' }}>"
    ),
    # B4: Cách giảng con hợp default styles
    (
        """  const defaultStyles = [
    { id: 'style_1', type: 'style', label: 'Dùng đồ vật thật trong nhà khi con kẹt', icon: '🧸', tag: 'Cách giảng hợp', color: '#7C3AED' },
    { id: 'style_2', type: 'style', label: 'Vẽ sơ đồ đoạn thẳng cho toán lời văn', icon: '🎨', tag: 'Cách giảng hợp', color: '#7C3AED' },
    { id: 'style_3', type: 'style', label: 'Giữ buổi học dưới 15 phút, giải lao 5 phút', icon: '⏰', tag: 'Cách giảng hợp', color: '#7C3AED' },
  ]""",
        """  const defaultStyles = [
    { id: 'style_1', type: 'style', label: 'Dùng đồ vật thật trong nhà khi con kẹt', icon: '🧸', tag: 'Cách giảng hợp', color: 'var(--c-accent-ink, #7C3AED)' },
    { id: 'style_2', type: 'style', label: 'Vẽ sơ đồ đoạn thẳng cho toán lời văn', icon: '🎨', tag: 'Cách giảng hợp', color: 'var(--c-accent-ink, #7C3AED)' },
    { id: 'style_3', type: 'style', label: 'Giữ buổi học dưới 15 phút, giải lao 5 phút', icon: '⏰', tag: 'Cách giảng hợp', color: 'var(--c-accent-ink, #7C3AED)' },
  ]"""
    ),
    # B4: Cách giảng con hợp tag render
    (
        '<span style={{ fontSize: 11, fontWeight: 800, color: item.color, display: ' + "'block' }}>",
        '<span style={{ fontSize: 11, fontWeight: 800, color: item.type === ' + "'style' ? 'var(--c-accent-ink)' : (item.color || 'var(--c-text)'), display: 'block' }}>"
    ),
    # B4: Lịch chia ca (Mẹ)
    (
        "<span style={{ fontSize: 13, fontWeight: 900, color: isDad ? '#1D4ED8' : '#BE185D' }}>{d.owner}</span>",
        "<span style={{ fontSize: 13, fontWeight: 900, color: isDad ? 'var(--c-primary, #1D4ED8)' : 'var(--c-accent-ink, #BE185D)' }}>{d.owner}</span>"
    ),
    # C1: Chấm vở margin
    (
        """      {/* 1. MÀN HÌNH CHỤP ẢNH VỞ */}
      {step === 'capture' && (
        <>
          <Header title={`Chụp vở của ${childName}`} back="home" />

          <div
            className="card"
            style={{
              padding: 16,""",
        """      {/* 1. MÀN HÌNH CHỤP ẢNH VỞ */}
      {step === 'capture' && (
        <>
          <Header title={`Chụp vở của ${childName}`} back="home" />

          <div
            className="card"
            style={{
              marginTop: 12,
              padding: 16,"""
    )
])

# 3. GameDetective.jsx (B2)
patch_file("src/games/GameDetective.jsx", [
    (
        "<div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-accent)', letterSpacing: '0.05em', marginBottom: 2 }}>",
        "<div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-accent-ink, var(--c-text))', letterSpacing: '0.05em', marginBottom: 2 }}>"
    ),
    (
        "<span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-accent)', marginTop: 2 }}>",
        "<span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-accent-ink, var(--c-text))', marginTop: 2 }}>"
    )
])

# 4. FamilyMembersSheet.jsx (B4)
patch_file("src/FamilyMembersSheet.jsx", [
    (
        '<b style={{ fontSize: 14.5, color: ' + "'#1E293B' }}>{m.relation ? `${m.relation} ` : ''}{m.displayName}</b>",
        '<b style={{ fontSize: 14.5, color: ' + "'var(--c-text)' }}>{m.relation ? `${m.relation} ` : ''}{m.displayName}</b>"
    ),
    (
        '<div style={{ fontSize: 12, color: ' + "'#64748B' }}>",
        '<div style={{ fontSize: 12, color: ' + "'var(--c-text-2)' }}>"
    )
])

# 5. ThemePickerSheet.jsx (B4)
patch_file("src/ThemePickerSheet.jsx", [
    (
        "background: 'linear-gradient(135deg, #FFF8EC, #EDE9FE)',",
        "background: 'var(--c-surface-2)',"
    )
])

# 6. ReportComponents.jsx (B4)
patch_file("src/ReportComponents.jsx", [
    (
        '<p className="xs" style={{ margin: "4px 0 0", color: "#64748B" }}>',
        '<p className="xs" style={{ margin: "4px 0 0", color: "var(--c-text-2)" }}>'
    ),
    (
        '<div className="card" style={{ border: "1.5px dashed #CBD5E1", background: "#F8FAFC" }} data-testid="trait-ai-not-enough">',
        '<div className="card" style={{ border: "1.5px dashed var(--c-line)", background: "var(--c-surface-2)" }} data-testid="trait-ai-not-enough">'
    ),
    (
        '<p className="xs" style={{ color: "#64748B", margin: "6px 0" }}>',
        '<p className="xs" style={{ color: "var(--c-text-2)", margin: "6px 0" }}>'
    )
])

# 7. styles.css (B5)
patch_file("src/styles.css", [
    (
        """.facts-grid span {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--c-text-2);
  text-transform: uppercase;
}
.facts-grid b {
  font-size: 14px;
  font-weight: 800;
  color: var(--c-text);
  line-height: 1.25;
}
.facts-grid em {
  font-style: normal;
  font-size: 11.5px;
  color: var(--c-text-2);
}""",
        """.facts-grid span {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--c-text);
  text-transform: uppercase;
}
.facts-grid b {
  font-size: 14px;
  font-weight: 800;
  color: var(--c-text);
  line-height: 1.25;
}
.facts-grid em {
  font-style: normal;
  font-size: 11.5px;
  color: var(--c-text);
  opacity: 0.88;
}"""
    )
])

# 8. themes.css (B3 - Sticker Studio & B4 - dark themes)
with open(os.path.join(BASE, "src/themes.css"), "r", encoding="utf-8") as f:
    tcss = f.read()

# Add Sticker Studio card color overrides
sticker_extra = """
/* Prompt 23O - B3: Sticker Studio card text contrast */
[data-theme="sticker"] .card.plum,
[data-theme="sticker"] .big-card.plum,
[data-theme="sticker"] .card.sky,
[data-theme="sticker"] .big-card.sky {
  color: #FFFFFF !important;
}
[data-theme="sticker"] .card.plum .sub,
[data-theme="sticker"] .big-card.plum .sub,
[data-theme="sticker"] .card.sky .sub,
[data-theme="sticker"] .big-card.sky .sub {
  color: rgba(255, 255, 255, 0.85) !important;
}
[data-theme="sticker"] .card.plum .lbl,
[data-theme="sticker"] .big-card.plum .lbl,
[data-theme="sticker"] .card.sky .lbl,
[data-theme="sticker"] .big-card.sky .lbl {
  color: #FFFFFF !important;
}
"""
if "Prompt 23O - B3" not in tcss:
    tcss += sticker_extra
    with open(os.path.join(BASE, "src/themes.css"), "w", encoding="utf-8") as f:
        f.write(tcss)
    print("[OK] Appended B3 rules to themes.css")

print("All prompt 23O patches processed.")
