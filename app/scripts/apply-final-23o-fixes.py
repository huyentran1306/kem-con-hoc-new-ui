import re

# 1. ReportComponents.jsx
with open('/Users/pro/Coding/kem-con-hoc/src/ReportComponents.jsx', 'r') as f:
    rc = f.read()

rc = rc.replace('color: "#166534"', 'color: "var(--c-good-fg, #166534)"')
rc = rc.replace('color: "#991B1B"', 'color: "var(--c-danger-ink, #991B1B)"')
rc = rc.replace('gap: 2, height: 32', 'gap: 6, height: 32')
rc = rc.replace('color: "#92400E", margin: "4px 0 8px"', 'color: "var(--c-accent-ink, var(--c-text-2))", margin: "4px 0 8px"')
rc = rc.replace('color: "#2563EB",', 'color: "var(--c-accent-ink, var(--c-accent))",')

with open('/Users/pro/Coding/kem-con-hoc/src/ReportComponents.jsx', 'w') as f:
    f.write(rc)
print('Patched ReportComponents.jsx')

# 2. screens.jsx (Lịch chia ca)
with open('/Users/pro/Coding/kem-con-hoc/src/screens.jsx', 'r') as f:
    sc = f.read()

old_lich = '''                    background: isDad ? 'var(--c-primary-light, #EFF6FF)' : 'var(--c-surface-2, #FDF2F8)',
                    border: isDad ? '1.5px solid var(--c-primary, #3B82F6)' : '1.5px solid #F472B6',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  title={`Ca ${d.day}: ${d.owner} (Chạm để đổi)`}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)' }}>{d.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: isDad ? 'var(--c-primary, #1D4ED8)' : 'var(--c-accent-ink, #BE185D)' }}>{d.owner}</span>'''

new_lich = '''                    background: 'var(--c-surface-2)',
                    border: isDad ? '1.5px solid var(--c-accent)' : '1.5px solid var(--c-line)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  title={`Ca ${d.day}: ${d.owner} (Chạm để đổi)`}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-text-2)' }}>{d.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: isDad ? 'var(--c-accent-ink, var(--c-accent))' : 'var(--c-text)' }}>{d.owner}</span>'''

if old_lich in sc:
    sc = sc.replace(old_lich, new_lich)
    with open('/Users/pro/Coding/kem-con-hoc/src/screens.jsx', 'w') as f:
        f.write(sc)
    print('Patched screens.jsx Lịch chia ca')
else:
    print('WARNING: old_lich not found in screens.jsx')

# 3. FamilyClassSheet.jsx
with open('/Users/pro/Coding/kem-con-hoc/src/FamilyClassSheet.jsx', 'r') as f:
    fcs = f.read()

# Update navTabActive
old_nta = '''  navTabActive: {
    backgroundColor: 'var(--c-text)',
    color: 'var(--c-surface, #FFFFFF)',
    borderColor: 'var(--c-text)',
  },'''

new_nta = '''  navTabActive: {
    backgroundColor: 'var(--c-accent)',
    color: 'var(--c-on-accent, #FFFFFF)',
    borderColor: 'var(--c-accent)',
  },'''

if old_nta in fcs:
    fcs = fcs.replace(old_nta, new_nta)
    print('Replaced navTabActive in FamilyClassSheet.jsx')
else:
    print('navTabActive already updated or not found')

# Update btnPrimary
old_bp = '''  btnPrimary: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: 999,
    backgroundColor: '#F6A623',
    color: 'var(--c-text)',
    border: 'none',
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 0 #C47F0E',
    textAlign: 'center',
  },'''

new_bp = '''  btnPrimary: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: 999,
    backgroundColor: 'var(--c-accent)',
    color: 'var(--c-on-accent, #FFFFFF)',
    border: 'none',
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: 'none',
    textAlign: 'center',
  },'''

if old_bp in fcs:
    fcs = fcs.replace(old_bp, new_bp)
    print('Replaced btnPrimary in FamilyClassSheet.jsx')
else:
    print('btnPrimary already updated or not found')

fcs = fcs.replace("'#9A5B00'", "'var(--c-accent-ink, var(--c-text))'")

with open('/Users/pro/Coding/kem-con-hoc/src/FamilyClassSheet.jsx', 'w') as f:
    f.write(fcs)
print('Patched FamilyClassSheet.jsx')

# 4. themedSlots.jsx
with open('/Users/pro/Coding/kem-con-hoc/src/themes/slots/themedSlots.jsx', 'r') as f:
    ts = f.read()

ts = re.sub(r"borderTop:\s*'1px dashed ([^']+)',\s*paddingTop:\s*(\d+)", r"borderTop: '1px dashed \1', paddingTop: \2, marginTop: 10", ts)
ts = re.sub(r"borderTop:\s*'2px dashed ([^']+)',\s*paddingTop:\s*(\d+)", r"borderTop: '2px dashed \1', paddingTop: \2, marginTop: 10", ts)

with open('/Users/pro/Coding/kem-con-hoc/src/themes/slots/themedSlots.jsx', 'w') as f:
    f.write(ts)
print('Patched themedSlots.jsx')

# 5. test-prompt23o-all.mjs
with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'r') as f:
    tp = f.read()

tp = tp.replace("page.goto('http://127.0.0.1:4173/?mode=trial')", "page.goto('http://127.0.0.1:4173/')")

with open('/Users/pro/Coding/kem-con-hoc/scripts/test-prompt23o-all.mjs', 'w') as f:
    f.write(tp)
print('Patched test-prompt23o-all.mjs')
