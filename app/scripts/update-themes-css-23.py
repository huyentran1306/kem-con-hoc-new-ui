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

with open('src/themes.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace font in bear
bear_pos = css.find('[data-theme="bear"]')
if bear_pos != -1:
    bear_part = css[bear_pos:bear_pos+1500]
    new_bear_part = bear_part.replace("--font-head: 'Mitr', sans-serif;", "--font-head: 'Be Vietnam Pro', sans-serif;")
    new_bear_part = new_bear_part.replace("--font-hand: 'Mitr', sans-serif;", "--font-hand: 'Be Vietnam Pro', sans-serif;")
    css = css[:bear_pos] + new_bear_part + css[bear_pos+1500:]

for theme_id, cols in ok_colors.items():
    bg = cols['--c-ok-bg']
    tx = cols['--c-ok-text']
    idx = css.find(f'[data-theme="{theme_id}"]')
    if idx != -1:
        if f"--c-ok-bg: {bg};" not in css[idx:idx+1500]:
            insert_str = f"\n  --c-ok-bg: {bg};\n  --c-ok-text: {tx};"
            bracket_pos = css.find('{', idx)
            css = css[:bracket_pos+1] + insert_str + css[bracket_pos+1:]

with open('src/themes.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('themes.css updated with ok-bg, ok-text, and bear font')
