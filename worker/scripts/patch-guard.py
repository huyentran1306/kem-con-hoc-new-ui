file_path = '/Users/pro/Coding/study-en/ai-gateway-worker/src/guard.js'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

rule_target = """  p3_explain_v3: {
    answer: ['dap_an_cuoi_cho_me', 'cac_bac[].dap_an_cho_me'],
    child: ['cac_bac[].cau_hoi', 'cac_bac[].goi_y.*'],
    allowedFrom: ['problem_text'],
  },"""

rule_replacement = """  p3_explain_v3: {
    answer: ['dap_an_cuoi_cho_me', 'cac_bac[].dap_an_cho_me'],
    child: ['cac_bac[].cau_hoi', 'cac_bac[].goi_y.*'],
    allowedFrom: ['problem_text'],
  },
  p3_fix_steps_v3: {
    answer: ['dap_an_cuoi_cho_me', 'cac_bac[].dap_an_cho_me'],
    child: ['cac_bac[].cau_hoi', 'cac_bac[].goi_y.*'],
    allowedFrom: ['problem_text'],
  },"""

assert rule_target in c, "rule_target not found"
c = c.replace(rule_target, rule_replacement, 1)

c = c.replace(
    'if (promptId === "p3_explain" || promptId === "p3_explain_v2" || promptId === "p3_explain_v3")',
    'if (promptId === "p3_explain" || promptId === "p3_explain_v2" || promptId === "p3_explain_v3" || promptId === "p3_fix_steps_v3")'
)

c = c.replace(
    "(promptId === 'p3_explain_v3' || promptId === 'p3_extra_v3')",
    "(promptId === 'p3_explain_v3' || promptId === 'p3_extra_v3' || promptId === 'p3_fix_steps_v3')"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated guard.js successfully!')
