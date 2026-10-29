import re

# 1. Update src/ui/KhuonMoi.jsx for Progress4
with open('src/ui/KhuonMoi.jsx', 'r', encoding='utf-8') as f:
    km = f.read()

pattern_prog4 = re.compile(r'export function Progress4\(\{.*?\}\)\s*\{[\s\S]*?return\s*\([\s\S]*?<\/div>\s*\)\s*\}', re.M)
new_prog4 = '''export function Progress4({ currentStep, totalSteps, current, total }) {
  const cur = currentStep ?? ((current !== undefined) ? current + 1 : 1)
  const tot = totalSteps ?? total ?? 4
  return (
    <div className="fprog-4" aria-label={`Bước ${cur} trên ${tot}`}>
      {Array.from({ length: tot }).map((_, i) => {
        const stepNum = i + 1
        const isDone = stepNum < cur
        const isCur = stepNum === cur
        return <i key={i} className={isDone ? 'done' : isCur ? 'cur' : ''} />
      })}
    </div>
  )
}'''

km_updated = pattern_prog4.sub(new_prog4, km, count=1)
if km_updated != km:
    with open('src/ui/KhuonMoi.jsx', 'w', encoding='utf-8') as f:
        f.write(km_updated)
    print('✓ P0-2: Updated Progress4 in src/ui/KhuonMoi.jsx')
else:
    print('⚠️ P0-2: Progress4 regex not matched in src/ui/KhuonMoi.jsx')

# 2. Update src/App.jsx: P0-1 (hide tabs on done), P1-7 (sticker text contrast), P1-9 (addChild same form), P1-5 (TypeProblemSheet)
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# P0-1: Hide tabs on done screen
old_tabs_check = "!['snap', 'analyze', 'explain', 'scaffold', 'checkWork', 'check_work', 'check'].includes(screen)"
new_tabs_check = "!['snap', 'analyze', 'explain', 'prep', 'scaffold', 'done', 'checkWork', 'check_work', 'check'].includes(screen)"
if old_tabs_check in app_code:
    app_code = app_code.replace(old_tabs_check, new_tabs_check)
    print('✓ P0-1: Hide tabs on done screen in src/App.jsx')
else:
    print('ℹ️ P0-1: Tabs condition already updated or different')

# P1-5: TypeProblemSheet empty on real account, placeholder with sample
old_type_sheet = "const [text, setText] = useState(isTrial ? PRELOADED_TRIAL_LESSONS[0].de_bai : PROBLEM.ocr)"
new_type_sheet = "const [text, setText] = useState(isTrial ? PRELOADED_TRIAL_LESSONS[0].de_bai : '')"
if old_type_sheet in app_code:
    app_code = app_code.replace(old_type_sheet, new_type_sheet)
    print('✓ P1-5: Empty problem text for real accounts in src/App.jsx')

# Also update textarea placeholder in TypeProblemSheet
old_ta_ph = 'placeholder="Gõ hoặc dán đề bài của con..."'
new_ta_ph = 'placeholder={isTrial ? "Gõ hoặc dán đề bài của con..." : (PROBLEM.ocr || "Ví dụ: Một đàn vịt có 15 con, bác Ba bán bớt đi 6 con. Hỏi bác Ba còn lại bao nhiêu con vịt?")}'
if old_ta_ph in app_code:
    app_code = app_code.replace(old_ta_ph, new_ta_ph)
    print('✓ P1-5: Updated placeholder in TypeProblemSheet in src/App.jsx')

# P1-7: StickerBookSheet text contrast >= 3
old_stk_trait = "color: unlocked ? stk.color : '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 1.2"
new_stk_trait = "color: unlocked ? stk.color : '#475569', marginTop: 6, textAlign: 'center', lineHeight: 1.2"
if old_stk_trait in app_code:
    app_code = app_code.replace(old_stk_trait, new_stk_trait)

old_stk_unlocked = "color: unlocked ? '#64748B' : '#94A3B8', marginTop: 2"
new_stk_unlocked = "color: unlocked ? '#64748B' : '#64748B', fontWeight: 600, marginTop: 2"
if old_stk_unlocked in app_code:
    app_code = app_code.replace(old_stk_unlocked, new_stk_unlocked)
    print('✓ P1-7: Improved text contrast for locked stickers in src/App.jsx')

# P1-9: AddChildSheet label "Hình đại diện" and compact book chips
old_add_child_avatar = '<span className="lbl plum">Avatar</span>'
new_add_child_avatar = '<span className="lbl plum">Hình đại diện</span>'
if old_add_child_avatar in app_code:
    app_code = app_code.replace(old_add_child_avatar, new_add_child_avatar)

old_add_child_books = '''      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
          {BOOKS.map((x) => (
            <button key={x} className={`opt col ${book === x ? 'on' : ''}`} onClick={() => setBook(x)}>{x}</button>
          ))}
        </div>
      </div>'''

new_add_child_books = '''      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {BOOKS.map((x) => (
            <button
              key={x}
              type="button"
              className={`btn-km btn-km-s ${book === x ? 'btn-km-primary' : 'btn-km-secondary'}`}
              style={{ minHeight: 32, padding: '0 12px', fontSize: 12 }}
              onClick={() => setBook(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>'''

if old_add_child_books in app_code:
    app_code = app_code.replace(old_add_child_books, new_add_child_books)
    print('✓ P1-9: Synchronized AddChildSheet with EditChildSheet in src/App.jsx')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

print('✓ Finished updating src/App.jsx')
