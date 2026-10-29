with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/dot15_system.js", "r") as f:
    code = f.read()

target = """  if (await tableExists(env.DB, "ai_calls")) {
    try {
      const r = await env.DB.prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failed FROM ai_calls WHERE created_at >= date('now')"
      ).first();
      out.aiCalls = { total: Number(r?.total || 0), failed: Number(r?.failed || 0) };
    } catch (e) {}
  }"""

addition = """  if (await tableExists(env.DB, "ai_calls")) {
    try {
      const r = await env.DB.prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failed FROM ai_calls WHERE created_at >= date('now')"
      ).first();
      out.aiCalls = { total: Number(r?.total || 0), failed: Number(r?.failed || 0) };
    } catch (e) {}
  }
  if (await tableExists(env.DB, "work_checks")) {
    try {
      const r = await env.DB.prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN lines_json IS NOT NULL AND lines_json != '[]' THEN 1 ELSE 0 END) AS ok_count FROM work_checks"
      ).first();
      const tot = Number(r?.total || 0);
      const ok = Number(r?.ok_count || 0);
      const rate = tot > 0 ? Math.round((ok / tot) * 100) : 100;
      out.workChecks = { total: tot, ok: ok, rate };
    } catch (e) {}
  }"""

code = code.replace(target, addition)

with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/dot15_system.js", "w") as f:
    f.write(code)

print("Updated dot15_system.js successfully.")
