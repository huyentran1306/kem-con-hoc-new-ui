file_path = '/Users/pro/Coding/study-en/ai-gateway-worker/src/v1_routes.js'
with open(file_path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Patch handleProgressReport
prog_target = """  const familyId = session?.family_id || body.family_id || request.headers.get("X-Family-Id");
  const childId = body.child_id || url_param(request, "child_id");
  const childName = body.child_name || "Bé";"""

prog_replacement = """  const familyId = session?.family_id || body.family_id || request.headers.get("X-Family-Id");
  const childId = body.child_id || url_param(request, "child_id");
  const childName = body.child_name || "Bé";
  const xungHo = body.xung_ho || body.xungHo || "bố mẹ";"""

assert prog_target in c, "prog_target not found"
c = c.replace(prog_target, prog_replacement, 1)

sys_target = 'const sysPrompt = "Bạn là chuyên gia sư phạm tiểu học. Hãy viết phân tích tiến bộ của con cho phụ huynh dựa trên đúng các dữ kiện thực tế được cung cấp. Tuyệt đối trung thực, không bịa đặt số liệu. Mọi con số bạn nhắc đến bắt buộc phải có trong dữ kiện.";'
sys_replacement = 'const sysPrompt = `Bạn là chuyên gia sư phạm tiểu học. Hãy viết phân tích tiến bộ của con cho ${xungHo} dựa trên đúng các dữ kiện thực tế được cung cấp. Tuyệt đối trung thực, không bịa đặt số liệu. Mọi con số bạn nhắc đến bắt buộc phải có trong dữ kiện.`;'

assert sys_target in c, "sys_target not found"
c = c.replace(sys_target, sys_replacement, 1)

goi_y_target = """"goi_y_cho_me": [
    "Gợi ý 1 cho mẹ vào tuần tới (dưới 15 từ)",
    "Gợi ý 2 cho mẹ (dưới 15 từ)",
    "Gợi ý 3 cho mẹ (dưới 15 từ)"
  ],"""

goi_y_replacement = """"goi_y_cho_me": [
    "Gợi ý 1 cho ${xungHo} vào tuần tới (dưới 15 từ)",
    "Gợi ý 2 cho ${xungHo} (dưới 15 từ)",
    "Gợi ý 3 cho ${xungHo} (dưới 15 từ)"
  ],"""

assert goi_y_target in c, "goi_y_target not found"
c = c.replace(goi_y_target, goi_y_replacement, 1)

fallback_goi_y_target = '"Đố ngược: mẹ đọc đáp số, con đoán phép tính",'
fallback_goi_y_replacement = '"Đố ngược: ${xungHo} đọc đáp số, con đoán phép tính",'
c = c.replace(fallback_goi_y_target, fallback_goi_y_replacement, 1)

# 2. Patch micro-step with extractFacts, opFromText, buildFallbackMicroStep
micro_helper_code = """const OPS_MICRO = { '+': 'cong', '-': 'tru', '−': 'tru', '–': 'tru', '×': 'nhan', 'x': 'nhan', 'X': 'nhan', '*': 'nhan', ':': 'chia', '÷': 'chia', '/': 'chia' };

function extractMicroFacts(problemText = '') {
  const text = String(problemText || '');
  const facts = [];
  const UNIT_RE = '([a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+(?:\\\\s[a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+)?)';
  const eachRe = new RegExp(`mỗi\\\\s+([a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+)\\\\s+(?:có\\\\s+|được\\\\s+|đựng\\\\s+)?(\\\\d+)\\\\s+${UNIT_RE}`, 'gi');
  let m;
  while ((m = eachRe.exec(text))) {
    facts.push({ kind: 'each', group: m[1], num: m[2], unit: m[3].split(' ')[0] === 'quả' || m[3].split(' ')[0] === 'cái' || m[3].split(' ')[0] === 'con' ? m[3].split(' ').slice(0, 2).join(' ') : m[3].split(' ')[0] });
  }
  const numRe = new RegExp(`(\\\\d+)\\\\s+${UNIT_RE}`, 'gi');
  while ((m = numRe.exec(text))) {
    if (facts.some((f) => f.num === m[1])) continue;
    const unitWords = m[2].split(' ');
    facts.push({ kind: 'count', num: m[1], unit: unitWords[0], thing: unitWords[1] || '' });
  }
  return facts;
}

function opFromMicroText(s = '') {
  const mm = String(s).match(/(\\d+(?:[.,]\\d+)?)\\s*([+\\-−–×xX*:÷/])\\s*(\\d+(?:[.,]\\d+)?)/);
  if (!mm || !OPS_MICRO[mm[2]]) return null;
  return { a: mm[1], op: OPS_MICRO[mm[2]], b: mm[3] };
}

function buildFallbackMicroStep({ problemText, stepQuestion, stepAnswer, skill, microIndex, childName, xungHo }) {
  const facts = extractMicroFacts(problemText);
  const idx = Math.max(0, (Number(microIndex) || 1) - 1);
  const sk = String(skill || '');
  const lowerProb = String(problemText || '').toLowerCase();
  const op = opFromMicroText(stepAnswer) || opFromMicroText(stepQuestion);
  const xh = xungHo || 'mẹ';
  let q = '';
  let why = '';

  if (sk === 'tinh_toan' && op) {
    const n = (x) => Number(String(x).replace(',', '.'));
    if (op.op === 'nhan') {
      q = idx === 0
        ? `${op.a} lấy ${op.b} lần nghĩa là cộng ${op.a} mấy lần?`
        : `Con đếm thêm từng ${op.a}: ${op.a}, ${n(op.a) * 2}… đến lần thứ ${op.b} là mấy?`;
      why = 'Đổi phép nhân thành cộng lặp lại để con tự tính.';
    } else if (op.op === 'chia') {
      q = idx === 0
        ? `${op.b} nhân mấy thì bằng ${op.a}?`
        : `Con chia ${op.a} que tính thành ${op.b} nhóm đều nhau, mỗi nhóm mấy que?`;
      why = 'Dùng bảng nhân để tìm thương.';
    } else if (op.op === 'tru') {
      q = idx === 0
        ? `Từ ${op.a}, con đếm lùi ${op.b} bước thì được số mấy?`
        : `${op.a} bớt đi ${op.b} thì còn nhiều hơn hay ít hơn ${op.a}?`;
      why = 'Đếm lùi giúp con hình dung phép trừ.';
    } else if (op.op === 'cong') {
      q = idx === 0
        ? `Từ ${op.a}, con đếm thêm ${op.b} nữa thì được số mấy?`
        : `Gộp ${op.a} và ${op.b} lại thì nhiều hơn hay ít hơn ${op.a}?`;
      why = 'Đếm thêm giúp con tự tìm tổng.';
    }
  } else if (sk === 'chon_phep_tinh' || sk === 'tinh_toan') {
    const each = facts.find((f) => f.kind === 'each');
    if (each && idx === 0) {
      q = `Các ${each.group} đều có ${each.num} ${each.unit} bằng nhau, mình gộp lại hay bớt đi?`;
      why = 'Nhận ra các nhóm bằng nhau để chọn phép nhân.';
    } else if (/chia đều|chia cho|chia vào|chia thành/.test(lowerProb)) {
      q = 'Chia đều thì mỗi phần nhận bằng nhau, mình làm phép gì?';
      why = 'Gắn "chia đều" với phép chia.';
    } else if (/hết|bớt|cho bạn|bán|ăn|còn lại|mất|tặng/.test(lowerProb)) {
      q = 'Bớt đi thì số còn lại nhiều hơn hay ít hơn lúc đầu?';
      why = 'Gắn hành động "bớt đi" với phép trừ.';
    } else if (/thêm|mua thêm|tất cả|cả hai|gộp/.test(lowerProb)) {
      q = 'Thêm vào thì số mới nhiều hơn hay ít hơn lúc đầu?';
      why = 'Gắn hành động "thêm vào" với phép cộng.';
    }
  }

  if (!q && facts.length) {
    const ordered = [...facts.filter((f) => f.kind === 'each'), ...facts.filter((f) => f.kind !== 'each')];
    const f = ordered[idx % ordered.length];
    if (f.kind === 'each') {
      q = `Mỗi ${f.group} có mấy ${f.unit}?`;
    } else {
      q = `Có mấy ${f.unit}${f.thing ? ' ' + f.thing : ''}?`;
    }
    why = 'Tách một dữ kiện nhỏ trong đề để con nắm chắc trước.';
  }

  if (!q) {
    const bySkill = {
      doc_hieu_de: 'Con chỉ vào con số đầu tiên trong đề, số đó nói về cái gì?',
      doc_hieu: 'Con tìm trong đề câu nói về chuyện này, câu đó viết gì?',
      chon_phep_tinh: 'Ở bước này mình thêm vào hay bớt đi?',
      tinh_toan: 'Con dùng que tính làm thử phép tính này xem được mấy?',
      don_vi: 'Đáp số này đếm cái gì, mình ghi đơn vị là gì?',
      kiem_tra_lai: 'Con thử làm ngược lại xem có ra số ban đầu không?',
    };
    q = bySkill[sk] || 'Con nói to bước con đang làm, mình xem tiếp nhé?';
    why = 'Câu nhỏ theo đúng kỹ năng của bậc này.';
  }

  return {
    cau_hoi_nho: q,
    ly_do_cho_me: why,
    dap_an_cho_me: stepAnswer || 'Số liệu trong đề bài',
    is_fallback: true
  };
}
"""

micro_func_target = "export async function handleMicroStep(request, env, ctx, corsHeaders) {"
assert micro_func_target in c, "handleMicroStep not found"
c = c.replace(micro_func_target, micro_helper_code + "\n" + micro_func_target, 1)

micro_params_target = """    child_speech = "",
    micro_index = 1,
    child_name = "Con",
  } = body;"""

micro_params_replacement = """    child_speech = "",
    micro_index = 1,
    child_name = "Con",
    xung_ho = "",
    xungHo = "",
  } = body;
  const effectiveXungHo = xung_ho || xungHo || "mẹ";"""

assert micro_params_target in c, "micro_params_target not found"
c = c.replace(micro_params_target, micro_params_replacement, 1)

sys_prompt_micro_target = """3. dap_an_cho_me: đáp án ngắn gọn mà mẹ chờ con trả lời cho câu nhỏ này.
4. ly_do_cho_me: giải thích sư phạm ngắn gọn (tối đa 25 từ) vì sao câu nhỏ này giúp con gỡ kẹt."""

sys_prompt_micro_replacement = """3. dap_an_cho_me: đáp án ngắn gọn mà ${effectiveXungHo} chờ con trả lời cho câu nhỏ này.
4. ly_do_cho_me: giải thích sư phạm ngắn gọn (tối đa 25 từ) vì sao câu nhỏ này giúp con gỡ kẹt."""

assert sys_prompt_micro_target in c, "sys_prompt_micro_target not found"
c = c.replace(sys_prompt_micro_target, sys_prompt_micro_replacement, 1)

# Fallback replacement
fallback_target = """  // Fallback an toàn nếu AI lỗi hoặc không parse được
  if (!result || typeof result !== "object" || !result.cau_hoi_nho) {
    const fallbackMap = {
      doc_hieu: `${child_name} tìm trong đề bài xem chữ nào quan trọng nhất nhé?`,
      doi_don_vi: `${child_name} nhìn xem đề bài đang nhắc đến đơn vị gì nào?`,
      chon_phep_tinh: `Để tìm số còn lại, mình làm phép cộng hay phép trừ con nhỉ?`,
      tinh_toan: `${child_name} thử nhẩm hoặc dùng que tính xem sao nhé?`,
      loi_giai: `Câu trả lời của bài này mình bắt đầu bằng chữ gì con nhỉ?`,
    };
    result = {
      cau_hoi_nho: fallbackMap[skill] || `${child_name} đọc lại số đứng ngay trước câu hỏi nhé?`,
      dap_an_cho_me: step_answer || "Số liệu trong đề bài",
      ly_do_cho_me: "Chỉ vào chi tiết nhỏ nhất trong đề để con định hình lại bài toán."
    };
  }"""

fallback_replacement = """  // Fallback an toàn nếu AI lỗi hoặc không parse được
  let isFallback = false;
  if (!result || typeof result !== "object" || !result.cau_hoi_nho) {
    isFallback = true;
    result = buildFallbackMicroStep({
      problemText: problem_text,
      stepQuestion: step_question,
      stepAnswer: step_answer,
      skill,
      microIndex: micro_index,
      childName: child_name,
      xungHo: effectiveXungHo
    });
  } else {
    result.is_fallback = false;
  }"""

assert fallback_target in c, "fallback_target not found"
c = c.replace(fallback_target, fallback_replacement, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated v1_routes.js successfully!')
