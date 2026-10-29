import json

# 1. Update src/teamPromptsData.json
data_path = '/Users/pro/Coding/kem-con-hoc/src/teamPromptsData.json'
with open(data_path, 'r', encoding='utf-8') as f:
    prompts = json.load(f)

for p in prompts:
    if p.get('id') == 'prompt-23k':
        if not p.get('category'):
            p['category'] = 'socratic'
        if not p.get('targetAi'):
            p['targetAi'] = 'Claude 3.7 Sonnet'
        if not p.get('author'):
            p['author'] = 'Team AI'
        if not p.get('createdAt'):
            p['createdAt'] = '2026-10-27 15:30'

    if p.get('id') == 'prompt-23l':
        if not p.get('category'):
            p['category'] = 'vision_ocr'
        if not p.get('targetAi'):
            p['targetAi'] = 'Cloudflare Workers AI'
        if not p.get('author'):
            p['author'] = 'Team AI'
        if not p.get('createdAt'):
            p['createdAt'] = '2026-10-27 16:50'
        if not p.get('promptDetail'):
            detail_lines = p.get('details', [])
            p['promptDetail'] = '# Prompt 23L · Chấm vở thỉnh thoảng báo "Chưa chấm xong" (tuỳ chọn, sửa nhanh)\n\n' + '\n\n'.join(detail_lines)

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)
print('Updated src/teamPromptsData.json')

# 2. Update src/TeamPromptSyncTab.jsx with defensive safe string handling
tab_path = '/Users/pro/Coding/kem-con-hoc/src/TeamPromptSyncTab.jsx'
with open(tab_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace line 67
code = code.replace(
    'if ((!item.promptDetail || item.promptDetail.length < 100) && fallback?.promptDetail) {',
    'if ((!item.promptDetail || (typeof item.promptDetail === "string" && item.promptDetail.length < 100)) && fallback?.promptDetail) {'
)

# Replace line 120
code = code.replace(
    'if ((!item.promptDetail || item.promptDetail.length < 100) && fallback?.promptDetail) {',
    'if ((!item.promptDetail || (typeof item.promptDetail === "string" && item.promptDetail.length < 100)) && fallback?.promptDetail) {'
)

# Replace line 901
code = code.replace(
    '{item.promptDetail.length} ký tự',
    '{(item.promptDetail || "").length} ký tự'
)

# Replace line 918
code = code.replace(
    '{item.promptDetail}',
    '{item.promptDetail || "(Chưa có nội dung chi tiết)"}'
)

# Replace line 921
code = code.replace(
    '{item.promptDetail.length > 200 && (',
    '{(item.promptDetail || "").length > 200 && ('
)

# Replace copy prompt call
code = code.replace(
    'handleCopyPrompt(item.promptDetail, item.title)',
    'handleCopyPrompt(item.promptDetail || item.summary || "", item.title || "Prompt")'
)

with open(tab_path, 'w', encoding='utf-8') as f:
    f.write(code)
print('Updated src/TeamPromptSyncTab.jsx with safe fallbacks')
