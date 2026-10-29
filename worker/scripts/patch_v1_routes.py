import re

with open('src/v1_routes.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '// 1. PUBLIC CONFIG (GET /api/v1/config/public)'
end_marker = 'return jsonResponse(\n        {\n          ok: true,\n          scopeRules:'

start_idx = content.find(start_marker)
if start_idx == -1:
    print('start_marker not found')
    exit(1)

# Find where the jsonResponse ends
resp_end_marker = '"Cache-Control": "public, max-age=300",\n        }\n      );'
end_idx = content.find(resp_end_marker, start_idx)
if end_idx == -1:
    print('resp_end_marker not found')
    exit(1)

full_old_block = content[start_idx : end_idx + len(resp_end_marker)]

new_block = '''// 1. PUBLIC CONFIG (GET /api/v1/config/public)
  // Đợt 23P: Trả thêm promptStudio (chỉ template/version các prompt app dùng), aiConfig, configVersion
  // ==========================================================
  if (pathname === "/api/v1/config/public" && method === "GET") {
    try {
      const keys = [
        "app_config:scope_rules",
        "app_config:themes",
        "app_config%3Athemes",
        "app_config:calm_threshold",
        "prompt_studio:config",
        "prompt_studio:ai_config",
      ];
      const rows = await env.DB.prepare(`
        SELECT key, value, updated_at FROM _kv_store WHERE key IN (?, ?, ?, ?, ?, ?)
      `).bind(...keys).all();

      const configMap = {};
      const updatedMap = {};
      for (const row of rows.results || []) {
        try {
          configMap[row.key] = JSON.parse(row.value);
        } catch {
          configMap[row.key] = row.value;
        }
        updatedMap[row.key] = row.updated_at || null;
      }

      const themesConfig = configMap["app_config:themes"] || configMap["app_config%3Athemes"] || null;

      // Đợt 23P · Prompt Studio & AI Config công khai cho điện thoại phụ huynh
      const OLD_EXAMPLE_MARKERS = ['"29", "20"', "24 - 5 = 19", "Mẹ cho bạn Na 5 cây"];
      const ALLOWED_PROMPT_KEYS = new Set([
        "p0_scope_text",
        "p1_ocr",
        "p1_ocr_v2",
        "p1_ocr_v3",
        "p2_clean",
        "p3_explain",
        "p3_explain_v2",
        "p3b_parent_note_explain",
        "p4_chat",
        "p4b_parent_note_chat",
        "p5_toy",
        "p6_practice",
        "p7_longitudinal_analysis",
        "p8_calm_phrase",
        "p9_story_wrap",
      ]);

      let publicPromptStudio = null;
      const rawPrompts = configMap["prompt_studio:config"];
      if (rawPrompts && typeof rawPrompts === "object") {
        const cfg = rawPrompts.prompts || rawPrompts;
        publicPromptStudio = {};
        for (const [k, v] of Object.entries(cfg)) {
          if ((ALLOWED_PROMPT_KEYS.has(k) || k.startsWith("p1_")) && v && typeof v === "object") {
            const tpl = v.template;
            if (typeof tpl === "string" && tpl.length >= 20) {
              if (OLD_EXAMPLE_MARKERS.some((m) => tpl.includes(m))) {
                continue;
              }
              publicPromptStudio[k] = {
                template: tpl,
                version: v.version || 1,
              };
            }
          }
        }
      }

      let publicAiConfig = null;
      const rawAi = configMap["prompt_studio:ai_config"];
      if (rawAi && typeof rawAi === "object") {
        publicAiConfig = {
          model: rawAi.model,
          temperature: rawAi.temperature,
          max_tokens: rawAi.max_tokens,
          timeout_ms: rawAi.timeout_ms,
          prompt_version: rawAi.prompt_version,
          pedagogy_routing: Array.isArray(rawAi.pedagogy_routing) ? rawAi.pedagogy_routing : undefined,
        };
      }

      const promptUp = updatedMap["prompt_studio:config"];
      const aiUp = updatedMap["prompt_studio:ai_config"];
      let configVersion = null;
      if (promptUp && aiUp) {
        configVersion = promptUp > aiUp ? promptUp : aiUp;
      } else {
        configVersion = promptUp || aiUp || null;
      }

      return jsonResponse(
        {
          ok: true,
          scopeRules: configMap["app_config:scope_rules"] || null,
          themesConfig,
          calmNudgeThreshold: configMap["app_config:calm_threshold"] || 2,
          seasons: await getPublicSeasons(env).catch(() => null),
          promptStudio: publicPromptStudio,
          aiConfig: publicAiConfig,
          configVersion,
          serverTime: new Date().toISOString(),
        },
        200,
        {
          ...corsHeaders,
          "Cache-Control": "public, max-age=300",
        }
      );'''

content = content[:start_idx] + new_block + content[end_idx + len(resp_end_marker):]

with open('src/v1_routes.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully patched src/v1_routes.js')
