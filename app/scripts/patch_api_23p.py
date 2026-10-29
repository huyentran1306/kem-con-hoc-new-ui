with open('src/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports in src/api.js if needed (for setActivePrompts / setActiveAiConfig)
import_marker = "import { getActiveAiConfig"
if import_marker in content:
    content = content.replace("import { getActiveAiConfig", "import { getActiveAiConfig, setActivePrompts, setActiveAiConfig")
else:
    # check where promptStudio is imported
    idx = content.find("from './promptStudio'")
    if idx != -1:
        line_start = content.rfind("\n", 0, idx)
        old_import = content[line_start:idx + len("from './promptStudio'")]
        print("Existing promptStudio import:", old_import)

# 2. Add explainHeaders in aiExplain
target_demo_call = """        const aiPromise = postAi(
          '/chat',
          {
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: Math.min(Number(aiCfg.max_tokens) || 1400, 1600),
            temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
            model: modelId,
          },
          10000,
          { 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }
        );"""

# Let's inspect before replacing
assert "{ 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }" in content

old_hdr = "{ 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }"
new_hdr = "explainHeaders"

content = content.replace(old_hdr, new_hdr)

# Add explainHeaders definition before demo mode check
target_pre = "  const startedAt = Date.now()\n  const modelId = typeof aiCfg.model === 'string' && aiCfg.model.startsWith('@cf/') ? aiCfg.model : undefined"
replacement_pre = """  const startedAt = Date.now()
  const modelId = typeof aiCfg.model === 'string' && aiCfg.model.startsWith('@cf/') ? aiCfg.model : undefined

  // Đợt 23P: Gửi đầy đủ thông tin phân loại và định danh con để tính khoá lesson_cache chuẩn xác
  const explainHeaders = {
    'X-Prompt-Id': targetPromptId,
    'X-Problem-Text': encodeURIComponent(ocr || ''),
    'X-Family-Id': encodeURIComponent(options.familyId || ''),
    'X-Grade': encodeURIComponent(grade || ''),
    'X-Book-Series': encodeURIComponent(book || ''),
    'X-Subject': encodeURIComponent(classification.mon || 'Toán'),
    'X-Child-Id': encodeURIComponent(child?.id || ''),
    ...(options.bypassCache ? { 'X-Bypass-Cache': '1' } : {}),
  }"""

assert target_pre in content
content = content.replace(target_pre, replacement_pre)

# 3. Add syncPublicConfig in src/api.js
sync_fn = """export async function syncPublicConfig(force = false) {
  const cfg = await loadPublicConfig(force)
  if (!cfg) return null
  try {
    const currentVer = localStorage.getItem('kem-con-hoc:prompt-config-version') || ''
    if (cfg.configVersion && cfg.configVersion !== currentVer) {
      if (cfg.promptStudio && typeof cfg.promptStudio === 'object') {
        setActivePrompts(cfg.promptStudio)
      }
      if (cfg.aiConfig && typeof cfg.aiConfig === 'object') {
        setActiveAiConfig(cfg.aiConfig)
      }
      localStorage.setItem('kem-con-hoc:prompt-config-version', cfg.configVersion)
    }
  } catch (e) {
    console.warn('syncPublicConfig storage error:', e)
  }
  return cfg
}
"""

load_config_marker = "export async function loadPublicConfig(force = false) {"
assert load_config_marker in content

# Insert syncPublicConfig after loadPublicConfig
load_config_end_marker = "return publicConfigCache\n}"
idx_lc = content.find(load_config_end_marker)
assert idx_lc != -1
insert_pos = idx_lc + len(load_config_end_marker)

content = content[:insert_pos] + "\n\n" + sync_fn + content[insert_pos:]

with open('src/api.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated src/api.js successfully')
