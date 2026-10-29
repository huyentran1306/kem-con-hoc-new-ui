import re

ok_colors = {
  'bear': {'--c-ok-bg': '#7DBB4C', '--c-ok-text': '#22360F'},
  'candy': {'--c-ok-bg': '#4FC4A9', '--c-ok-text': '#1F3D36'},
  'bento': {'--c-ok-bg': '#1FA06A', '--c-ok-text': '#FFFFFF'},
  'sticker': {'--c-ok-bg': '#2DBE98', '--c-ok-text': '#1B1B2F'},
  'notebook': {'--c-ok-bg': '#6A8A57', '--c-ok-text': '#FFFFFF'},
  'garden': {'--c-ok-bg': '#3FD6A0', '--c-ok-text': '#0F2A24'},
  'aurora': {'--c-ok-bg': '#22C3A6', '--c-ok-text': '#0B1026'},
  'chalk': {'--c-ok-bg': '#93D985', '--c-ok-text': '#22351F'},
  'noel': {'--c-ok-bg': '#1B7343', '--c-ok-text': '#FFFFFF'},
  'tet': {'--c-ok-bg': '#1E7F41', '--c-ok-text': '#FFFFFF'},
  'thieunhi': {'--c-ok-bg': '#169A80', '--c-ok-text': '#FFFFFF'},
}

with open('src/themes.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace font for bear:
# id: 'bear', ... fontHead: "'Mitr', sans-serif" -> "'Be Vietnam Pro', sans-serif"
bear_pos = code.find("id: 'bear'")
if bear_pos != -1:
    bear_part = code[bear_pos:bear_pos+600]
    new_bear_part = bear_part.replace("'Mitr', sans-serif", "'Be Vietnam Pro', sans-serif")
    new_bear_part = new_bear_part.replace("Mitr:wght@500;700", "Be+Vietnam+Pro:wght@500;600;700;800")
    code = code[:bear_pos] + new_bear_part + code[bear_pos+600:]

for theme_id, cols in ok_colors.items():
    bg = cols['--c-ok-bg']
    tx = cols['--c-ok-text']
    idx = code.find(f"id: '{theme_id}'")
    if idx != -1:
        vars_idx = code.find('vars: {', idx)
        if vars_idx != -1 and f"'--c-ok-bg': '{bg}'" not in code[idx:idx+1500]:
            insert_str = f"\n      '--c-ok-bg': '{bg}',\n      '--c-ok-text': '{tx}',"
            pos = vars_idx + len('vars: {')
            code = code[:pos] + insert_str + code[pos:]

with open('src/themes.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Themes updated successfully')
