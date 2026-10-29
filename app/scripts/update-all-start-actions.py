import re

with open('src/themes/slots/themedSlots.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    name = match.group(1)
    icon_match = re.search(r'<span style={{ fontSize: 24 }}>([^<]+)</span>', match.group(0))
    icon = icon_match.group(1) if icon_match else '🍯'
    
    res = 'export function ' + name + 'StartAction({ onStart }) {\n'
    res += '  return (\n'
    res += '    <div style={{ display: \'flex\', flexDirection: \'column\', gap: 10 }}>\n'
    res += '      <button\n'
    res += '        type="button"\n'
    res += '        data-testid="start-photo"\n'
    res += '        className="btn-km btn-km-l btn-km-primary"\n'
    res += '        onClick={() => onStart?.(\'photo\')}\n'
    res += '      >\n'
    res += '        <span className="btn-km-icon">' + icon + '</span>\n'
    res += '        <span className="btn-km-text">Bắt đầu bài tối nay</span>\n'
    res += '        <span className="btn-km-arrow">›</span>\n'
    res += '      </button>\n\n'
    res += '      <div style={{ display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: 8 }}>\n'
    res += '        <button\n'
    res += '          type="button"\n'
    res += '          data-testid="start-type"\n'
    res += '          className="btn-km btn-km-m btn-km-secondary"\n'
    res += '          onClick={() => onStart?.(\'type\')}\n'
    res += '        >\n'
    res += '          <InputModeIcon mode="type" size={17} /> Gõ đề bài\n'
    res += '        </button>\n'
    res += '        <button\n'
    res += '          type="button"\n'
    res += '          data-testid="start-voice"\n'
    res += '          className="btn-km btn-km-m btn-km-secondary"\n'
    res += '          onClick={() => onStart?.(\'voice\')}\n'
    res += '        >\n'
    res += '          <InputModeIcon mode="voice" size={17} /> Đọc đề cho Gấu\n'
    res += '        </button>\n'
    res += '      </div>\n'
    res += '    </div>\n'
    res += '  )\n'
    res += '}'
    return res

pattern = r'export function (\w+)StartAction\(\{ onStart \}\) \{[\s\S]*?\n\}'
new_content = re.sub(pattern, replacer, content)

with open('src/themes/slots/themedSlots.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated all StartAction components to soft-flat buttons')
