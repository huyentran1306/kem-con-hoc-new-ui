import re

with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/arithmetic.js", "r") as f:
    content = f.read()

solver_and_reconcile = """
/**
 * solveElementaryProblem(deBai)
 * Bộ giải toán tự động cho các bài toán tiểu học (Lớp 1-3, 1 đến 2 bước)
 * Trích xuất dữ liệu, cấu trúc nhóm và phép tính từ đề bài để kiểm tra đáp số thực tế.
 */
export function solveElementaryProblem(deBai) {
  if (!deBai || typeof deBai !== 'string') return null;
  const text = deBai.toLowerCase().replace(/,/g, ' ');

  // 1. Dạng 2 bước: Phép nhân nhóm + Phép trừ (vd: 4 túi kẹo, mỗi túi 6 viên, cho bạn 7 viên)
  const groupWords = '(?:túi|hộp|gói|bọc|thùng|rổ|đĩa|ngăn|hàng|luống|bó|lọ|bình|bao|can|chuồng|lồng|khay|đoạn|phần)';
  let mGroup = text.match(new RegExp('(\\\\d+)\\\\s*' + groupWords + '\\\\b.*?mỗi\\\\s*' + groupWords + '?\\\\s*(?:có\\\\s*)?(\\\\d+)'));
  let reversed = false;
  if (!mGroup) {
    mGroup = text.match(new RegExp('mỗi\\\\s*' + groupWords + '?\\\\s*(?:có\\\\s*)?(\\\\d+).*?(\\\\d+)\\\\s*' + groupWords + '\\\\b'));
    reversed = true;
  }

  if (mGroup) {
    const g = reversed ? parseInt(mGroup[2], 10) : parseInt(mGroup[1], 10);
    const m = reversed ? parseInt(mGroup[1], 10) : parseInt(mGroup[2], 10);
    const step1Val = g * m;

    // Tìm phép trừ ở bước 2: cho, bớt, ăn, dùng, bán, rụng, tặng, chuyển đi, lấy ra...
    const mSub = text.match(/(?:cho|bớt|ăn|dùng|bán|rụng|tặng|chuyển đi|bớt đi|lấy ra|đã dùng|đã bớt|đã ăn|đã bán)\b.*?(\d+)/);
    if (mSub) {
      const sVal = parseInt(mSub[1], 10);
      const step2Val = step1Val - sVal;
      return {
        steps: [
          { step: 1, expr: `${g} x ${m} = ${step1Val}`, val: step1Val, op: '*' },
          { step: 2, expr: `${step1Val} - ${sVal} = ${step2Val}`, val: step2Val, op: '-' },
        ],
        final: step2Val,
      };
    }

    // Tìm phép cộng ở bước 2: mua thêm, thêm, nhận thêm, cho thêm...
    const mAdd = text.match(/(?:mua thêm|thêm|nhận thêm|cho thêm|được tặng)\b.*?(\d+)/);
    if (mAdd) {
      const aVal = parseInt(mAdd[1], 10);
      const step2Val = step1Val + aVal;
      return {
        steps: [
          { step: 1, expr: `${g} x ${m} = ${step1Val}`, val: step1Val, op: '*' },
          { step: 2, expr: `${step1Val} + ${aVal} = ${step2Val}`, val: step2Val, op: '+' },
        ],
        final: step2Val,
      };
    }

    return {
      steps: [{ step: 1, expr: `${g} x ${m} = ${step1Val}`, val: step1Val, op: '*' }],
      final: step1Val,
    };
  }

  // 2. Dạng 2 bước: Chia đều + Phép trừ (vd: 24 cái kẹo chia đều vào 3 hộp, biếu bà 1 hộp)
  const mDiv = text.match(/(\d+)\s*.*?(?:chia đều|xếp đều|đựng đều|phân đều|chia cho)\s*(?:vào|cho)?\s*(\d+)/);
  if (mDiv) {
    const tot = parseInt(mDiv[1], 10);
    const d = parseInt(mDiv[2], 10);
    if (d > 0) {
      const step1Val = Math.floor(tot / d);
      return {
        steps: [{ step: 1, expr: `${tot} : ${d} = ${step1Val}`, val: step1Val, op: ':' }],
        final: step1Val,
      };
    }
  }

  // 3. Dạng 1 bước với 2 số liệu
  const nums = (text.match(/\\b\\d+\\b/g) || []).map((n) => parseInt(n, 10));
  if (nums.length === 2) {
    const [a, b] = nums;
    if (/(?:thêm|tất cả|cả hai|nhiều hơn|tổng)/.test(text)) {
      return { steps: [{ step: 1, expr: `${a} + ${b} = ${a + b}`, val: a + b, op: '+' }], final: a + b };
    }
    if (/(?:cho|bớt|còn lại|ít hơn|dùng|bán|ăn)/.test(text)) {
      return { steps: [{ step: 1, expr: `${a} - ${b} = ${a - b}`, val: a - b, op: '-' }], final: a - b };
    }
  }

  return null;
}

/**
 * reconcileWorkCheck({ aiResult, childLines, deBai })
 * Đối chiếu kết quả chấm của AI với máy kiểm tra toán học và bộ giải đề tự động
 */
export function reconcileWorkCheck({ aiResult, childLines = [], deBai = "" }) {
  if (!aiResult || typeof aiResult !== "object") return aiResult;

  // 1. Kiểm tra từng dòng của con
  const childChecks = childLines.map((line, idx) => {
    const content = typeof line === "object" ? line.noi_dung : line;
    const res = checkArithmetic(content);
    return { lineIndex: (line && line.so) ? Number(line.so) : idx + 1, ...res, text: content };
  });

  // 2. Tìm đáp số đúng chuẩn xác
  // A) Giải từ đề bài bằng máy tính toán tự động
  const machineSolved = deBai ? solveElementaryProblem(deBai) : null;
  
  // B) Kiểm tra từng biểu thức trong lời giải chuẩn của AI
  const aiSolutionChecks = (aiResult.loi_giai_chuan || []).map((step, idx) => {
    const res = checkArithmetic(step);
    return { stepIndex: idx + 1, ...res, text: step };
  });

  // C) Xác định đáp số đúng cuối cùng
  let expectedFinal = null;
  if (machineSolved && typeof machineSolved.final === "number") {
    expectedFinal = machineSolved.final;
  } else if (aiResult.dap_an_dung_cho_me) {
    const m = String(aiResult.dap_an_dung_cho_me).match(/-?\\d+(?:\\.\\d+)?/);
    if (m) expectedFinal = Number(m[0]);
  } else if (aiSolutionChecks.length > 0) {
    const lastSol = aiSolutionChecks[aiSolutionChecks.length - 1];
    if (lastSol && typeof lastSol.computed === "number") {
      expectedFinal = lastSol.computed;
    }
  }

  // D) Xác định đáp số cuối cùng của con
  let childFinal = null;
  for (let i = childLines.length - 1; i >= 0; i--) {
    const line = childLines[i];
    const text = typeof line === "object" ? (line.noi_dung || "") : String(line || "");
    if (/đáp\\s*số|đs\\s*[:\\.]/i.test(text)) {
      const m = text.match(/-?\\d+(?:\\.\\d+)?/);
      if (m) {
        childFinal = Number(m[0]);
        break;
      }
    }
  }
  if (childFinal === null) {
    const childEqs = childChecks.filter(c => c.isArithmetic && typeof c.right === "number");
    if (childEqs.length > 0) {
      childFinal = childEqs[childEqs.length - 1].right;
    }
  }

  let aiUncertain = 0;
  let overridden = false;
  let reconciled = { ...aiResult };

  // Trường hợp 3: Lời giải của AI có biểu thức sai -> đánh dấu ai_chua_chac
  const hasAiMathError = aiSolutionChecks.some(c => c.status === "sai");
  if (hasAiMathError) {
    aiUncertain = 1;
  }

  // Tìm dòng đầu tiên con tính nhầm toán học thuần túy
  const firstChildMathError = childChecks.find(c => c.status === "sai");

  // Trường hợp P0 (Prompt 23E): Con ra đáp số sai nhưng AI nói đúng hết
  if (expectedFinal !== null && childFinal !== null && childFinal !== expectedFinal) {
    overridden = true;
    reconciled.ket_qua = "co_buoc_sai";
    
    let wrongLine = null;
    let errorType = "chon_phep_tinh";
    let expectedStepVal = expectedFinal;

    const expectedSteps = machineSolved?.steps || [];
    const childEqLines = childChecks.filter(c => c.isArithmetic);

    for (let sIdx = 0; sIdx < childEqLines.length; sIdx++) {
      const cLine = childEqLines[sIdx];
      const expStep = expectedSteps[sIdx];
      
      if (cLine.status === "sai") {
        wrongLine = cLine.lineIndex;
        errorType = "tinh_nham";
        expectedStepVal = cLine.computed;
        break;
      }
      
      if (expStep && cLine.right !== expStep.val) {
        wrongLine = cLine.lineIndex;
        expectedStepVal = expStep.val;
        if (cLine.status === "dung") {
          errorType = "chon_phep_tinh";
        } else {
          errorType = "tinh_nham";
        }
        break;
      }
    }

    if (!wrongLine && childEqLines.length > 0) {
      const lastLine = childEqLines[childEqLines.length - 1];
      wrongLine = lastLine.lineIndex;
      expectedStepVal = expectedFinal;
      errorType = lastLine.status === "dung" ? "chon_phep_tinh" : "tinh_nham";
    }

    reconciled.dong_sai_dau_tien = wrongLine || 2;
    reconciled.loai_loi = errorType;
    reconciled.gia_tri_dung_dong_sai = String(expectedStepVal);
    reconciled.dap_an_dung_cho_me = `${expectedFinal}`;
    
    if (errorType === "chon_phep_tinh") {
      reconciled.giai_thich_cho_me = `Con tính nhẩm đúng phép tính, nhưng đề bài yêu cầu phép tính khác để ra đáp số ${expectedFinal}.`;
      reconciled.cau_hoi_cho_con = {
        muc_1: "Con đọc lại kỹ câu hỏi của đề bài xem số lượng cần tìm tăng lên hay bớt đi nhé?",
        muc_2: "Đề bài hỏi số còn lại sau khi bớt đi, con xem lại phép tính ở bước này nên dùng phép cộng hay phép trừ nhé?",
      };
      reconciled.loi_khen_cu_the = "Con tính nhẩm rất cẩn thận và viết chữ rõ ràng.";
    } else {
      reconciled.giai_thich_cho_me = `Máy kiểm tra phát hiện dòng ${reconciled.dong_sai_dau_tien} có kết quả chưa chính xác (cần ra ${expectedStepVal}).`;
      reconciled.cau_hoi_cho_con = {
        muc_1: `Con tính lại phép tính ở dòng ${reconciled.dong_sai_dau_tien} nhé?`,
        muc_2: "Con dùng que tính hoặc giấy nháp kiểm tra lại phép tính này nhé.",
      };
    }
  } else if (firstChildMathError && reconciled.ket_qua === "dung_het") {
    // Trường hợp con tính nhầm toán học nhưng AI nói đúng
    overridden = true;
    reconciled.ket_qua = "co_buoc_sai";
    reconciled.dong_sai_dau_tien = firstChildMathError.lineIndex;
    reconciled.loai_loi = "tinh_nham";
    reconciled.gia_tri_dung_dong_sai = String(firstChildMathError.left);
    reconciled.giai_thich_cho_me = `Máy kiểm tra phát hiện dòng ${firstChildMathError.lineIndex} có phép tính chưa chính xác (${firstChildMathError.expression}).`;
    reconciled.cau_hoi_cho_con = {
      muc_1: `Con tính lại phép tính ở dòng ${firstChildMathError.lineIndex} nhé?`,
      muc_2: "Con dùng que tính hoặc nháp để kiểm tra lại phép tính này nhé.",
    };
  }

  // Trường hợp AI báo sai ở dòng k nhưng máy kiểm tra thấy dòng k đúng hoàn toàn
  if (reconciled.dong_sai_dau_tien && !overridden) {
    const flaggedCheck = childChecks.find(c => c.lineIndex === reconciled.dong_sai_dau_tien);
    const noOtherMathErrors = !childChecks.some(c => c.status === "sai");

    if (flaggedCheck && (flaggedCheck.status === "dung" || flaggedCheck.status === "khong_kiem_duoc") && noOtherMathErrors) {
      if (reconciled.loai_loi === "chon_phep_tinh") {
        // Hợp lệ, giữ nguyên lỗi logic
      } else {
        overridden = true;
        aiUncertain = 1;
        reconciled.ket_qua = "dung_het";
        reconciled.dong_sai_dau_tien = null;
        reconciled.loai_loi = null;
        reconciled.giai_thich_cho_me = "Máy kiểm tra thấy các phép tính của con đều chính xác.";
      }
    }
  }

  reconciled.machine_json = JSON.stringify({
    childChecks,
    aiSolutionChecks,
    machineSolved,
    expectedFinal,
    childFinal,
    overridden,
  });
  reconciled.ai_uncertain = aiUncertain;

  return reconciled;
}
"""

# Replace from 'export function reconcileWorkCheck' to end of file
idx = content.find("export function reconcileWorkCheck")
if idx != -1:
    content = content[:idx] + solver_and_reconcile.strip() + "\n"
    with open("/Users/pro/Coding/study-en/ai-gateway-worker/src/arithmetic.js", "w") as f:
        f.write(content)
    # Also write to kem-con-hoc
    with open("src/arithmetic.js", "w") as f:
        f.write(content)
    print("Updated arithmetic.js in both worker and kem-con-hoc successfully.")
else:
    print("Could not find reconcileWorkCheck in arithmetic.js")
