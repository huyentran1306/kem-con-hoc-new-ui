/* ============================================================
   KÈM CON HỌC — CALM CORNER MODAL (GÓC HẠ HOẢ MỚI)
   Prompt 08: Nhắc đúng lúc, thở cùng con, câu nói hợp bài
   - 1 chạm chọn 4 lý do + Đổi vai 2 phút + Thổi cùng con
   - Tích hợp p8_calm_phrase với fallback tức thì & chặn lộ đáp án
   ============================================================ */

import React, { useState, useEffect, useRef } from 'react'
import {
  CALM_REASONS,
  CALM_MOVEMENT_GAMES,
  FALLBACK_CALM_PHRASES,
  checkAnswerLeakage,
} from './calmCornerData'
import { BlowingMiniGame } from './BlowingMiniGame'
import { Heart, X, HelpCircle, PersonStanding, Wind, Moon, ArrowLeftRight, ArrowRight } from 'lucide-react'
import './calmCorner.css'

// UI mới: icon nét đơn sắc thay emoji trang trí cho 4 ô lý do
const CC_ICONS = { not_understood: HelpCircle, distracted: PersonStanding, frustrated: Wind, late: Moon }
import { soundPop, soundSuccess, soundBreathe } from './audio'
import { aiChat } from './api'
import { renderPrompt } from './promptStudio'
import { swapMe } from './xungHo'
import { CALM_LINES } from './data'

export function CalmCornerModal({
  isOpen,
  onClose,
  currentProblem,
  currentStepIndex = 0,
  child,
  parentName = 'Mẹ',
  themeId = 'bear',
  onLowerDifficulty,
  onOpenHint,
  onSaveAndStop,
  onRecordCalmEvent,
  triggerType = 'manual', // 'manual' | 'nudge'
}) {
  const [view, setView] = useState('breathe') // 'breathe' | 'reasons' | 'move_game' | 'blowing' | 'role_swap' | 'phrase'
  const [selectedReason, setSelectedReason] = useState(null)

  // Move Game state
  const [currentGame, setCurrentGame] = useState(CALM_MOVEMENT_GAMES[0])
  const [moveTimeLeft, setMoveTimeLeft] = useState(120)
  const [isMoveTimerRunning, setIsMoveTimerRunning] = useState(false)

  // Role Swap state
  const [swapTimeLeft, setSwapTimeLeft] = useState(120)
  const [isSwapTimerRunning, setIsSwapTimerRunning] = useState(false)
  const [isHintFolded, setIsHintFolded] = useState(true)
  const [childStars, setChildStars] = useState(null)

  // AI Phrase state
  const [calmPhrase, setCalmPhrase] = useState(null)
  const [isPhraseAi, setIsPhraseAi] = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Reset view when opened
  useEffect(() => {
    if (isOpen) {
      setView('breathe')
      setSelectedReason(null)
      setChildStars(null)
      setIsHintFolded(true)
    }
  }, [isOpen])


  // Hít thở: đổi pha mỗi 4 giây, có tiếng chuông nhẹ theo pha (soundBreathe)
  const [breathPhase, setBreathPhase] = useState('in')
  useEffect(() => {
    if (!isOpen || view !== 'breathe') return undefined
    setBreathPhase('in')
    soundBreathe('in')
    const t = setInterval(() => {
      setBreathPhase((p) => {
        const next = p === 'in' ? 'out' : 'in'
        soundBreathe(next)
        return next
      })
    }, 4000)
    return () => clearInterval(t)
  }, [isOpen, view])

  const steps = currentProblem?.steps || []
  const currentStep = steps[currentStepIndex] || steps[0] || {}

  /* ------------------------------------------------------------
     1. XỬ LÝ CHỌN LÝ DO
     ------------------------------------------------------------ */
  const handleSelectReason = (reason) => {
    soundPop(500)
    setSelectedReason(reason.id)
    onRecordCalmEvent?.({
      trigger: triggerType,
      reason: reason.id,
      action: reason.action,
    })

    if (reason.id === 'not_understood') {
      // Nếu chưa mở gợi ý đồ vật -> mở gợi ý và quay lại bài
      if (onOpenHint) {
        onOpenHint(1)
        onClose()
      } else if (onLowerDifficulty) {
        onLowerDifficulty()
        onClose()
      } else {
        setView('not_understood_guide')
      }
    } else if (reason.id === 'distracted') {
      // Chọn 1 trong 12 trò vận động ngẫu nhiên
      const randomGame = CALM_MOVEMENT_GAMES[Math.floor(Math.random() * CALM_MOVEMENT_GAMES.length)]
      setCurrentGame(randomGame)
      setMoveTimeLeft(120)
      setIsMoveTimerRunning(true)
      setView('move_game')
    } else if (reason.id === 'frustrated') {
      // Chuyển sang Thổi cùng con
      setView('blowing')
    } else if (reason.id === 'late') {
      // Lưu bài và dừng tối nay
      onSaveAndStop?.()
      onClose()
    }
  }

  /* ------------------------------------------------------------
     2. ĐẾM THỜI GIAN VẬN ĐỘNG 2 PHÚT
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!isMoveTimerRunning || moveTimeLeft <= 0) return
    const timer = setInterval(() => {
      setMoveTimeLeft((t) => {
        if (t <= 1) {
          setIsMoveTimerRunning(false)
          soundSuccess()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isMoveTimerRunning, moveTimeLeft])

  /* ------------------------------------------------------------
     3. ĐỔI VAI 2 PHÚT
     ------------------------------------------------------------ */
  const startRoleSwap = () => {
    soundPop(520)
    setView('role_swap')
    setSwapTimeLeft(120)
    setIsSwapTimerRunning(true)
    setIsHintFolded(true)
    setChildStars(null)
  }

  useEffect(() => {
    if (!isSwapTimerRunning || swapTimeLeft <= 0) return
    const timer = setInterval(() => {
      setSwapTimeLeft((t) => {
        if (t <= 1) {
          setIsSwapTimerRunning(false)
          soundSuccess()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isSwapTimerRunning, swapTimeLeft])

  // Lấy câu hỏi của bậc đã xong gần nhất
  const lastFinishedIndex = Math.max(0, currentStepIndex - 1)
  const roleQuestion = steps[lastFinishedIndex]?.q || steps[0]?.q || `Con đố ${parentName.toLowerCase()} làm được bài này nè!`
  const rawAns = steps[lastFinishedIndex]?.a || steps[0]?.a || ''

  // Tạo câu trả lời sai có chủ ý để con sửa
  const makeWrongAnswer = (ans) => {
    const nums = ans.match(/\d+/g)
    if (nums && nums.length > 0) {
      const n = parseInt(nums[0], 10)
      const wrongNum = n > 2 ? n - 1 : n + 2
      return ans.replace(String(n), String(wrongNum))
    }
    return `${parentName} nghĩ là ngược lại chứ nhỉ? (${ans})`
  }
  const intentionalWrongAnswer = makeWrongAnswer(rawAns)

  /* ------------------------------------------------------------
     4. TẢI CÂU NÓI HỢP BÀI (Thư viện mặc định & AI khi yêu cầu)
     ------------------------------------------------------------ */
  const loadCalmPhrase = (reasonId = "frustrated") => {
    // 1. Kiểm tra bộ nhớ lưu 7 ngày theo dạng bài & lý do
    const dangBai = currentProblem?.dang_bai || currentProblem?.type || "toan";
    const cacheKey = `calm_cache_${dangBai}_${reasonId}`;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && cached.expires_at > Date.now() && cached.phrase) {
          setCalmPhrase(cached.phrase);
          setIsPhraseAi(true);
          setView("phrase");
          return;
        }
      }
    } catch (_) {}

    // 2. Không gọi AI mặc định: Dùng thư viện câu có sẵn (32+ câu sư phạm)
    const fallbacks = FALLBACK_CALM_PHRASES[reasonId] || FALLBACK_CALM_PHRASES.frustrated;
    const initialFallback = fallbacks[phraseIdx % fallbacks.length];
    setCalmPhrase(initialFallback);
    setIsPhraseAi(false);
    setView("phrase");
  };

  // Chỉ gọi p8_calm_phrase khi mẹ bấm "Câu khác hợp bài hơn"
  const requestAiCalmPhrase = async (reasonId = selectedReason || "frustrated") => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const promptInput = {
        ten_con: child?.name || "con",
        lop: child?.grade || "Lớp 3",
        xung_ho: parentName,
        dang_bai: currentProblem?.dang_bai || currentProblem?.type || "Toán",
        cau_hoi_bac: currentStep?.q || "Câu hỏi bài tập",
        ly_do: reasonId === "frustrated" ? `${parentName} mệt, bực` : (reasonId === "late" ? "Muộn rồi" : (reasonId === "distracted" ? "Con mất tập trung" : "Con vướng bài")),
      };

      const rendered = renderPrompt("p8_calm_phrase", promptInput);
      const res = await aiChat(rendered, null, child, "calm", [{ role: "user", content: "Gợi ý câu nói" }]);

      if (res) {
        const jsonMatch = res.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const isLeaking = checkAnswerLeakage(parsed.thu_noi, currentProblem, currentStepIndex);
          if (!isLeaking && parsed.thu_noi) {
            setCalmPhrase(parsed);
            setIsPhraseAi(true);
            try {
              const dangBai = currentProblem?.dang_bai || currentProblem?.type || "toan";
              const cacheKey = `calm_cache_${dangBai}_${reasonId}`;
              localStorage.setItem(cacheKey, JSON.stringify({
                phrase: parsed,
                expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
              }));
            } catch (_) {}
          }
        }
      }
    } catch (e) {
      console.warn("requestAiCalmPhrase error:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cc-scrim">
      <div className="card pop cc-pn" role="dialog" aria-modal="true" aria-labelledby="cc-title">
        <div className="cc-grab" aria-hidden="true" />
        {/* ========================================================
            VIEW 0 (mặc định khi bấm nút nổi): HÍT THỞ 4 GIÂY VÀO, 4 GIÂY RA (như bản CalmSheet cũ)
            ======================================================== */}
        {view === 'breathe' && (
          <div className="cc-reasons cc-breathe" data-testid="calm-breathe">
            <div className="cc-head">
              <span className="cc-head-ic" aria-hidden="true"><Wind /></span>
              <h3 id="cc-title">Hít thở cùng mình 30 giây</h3>
              <button className="cc-x" onClick={onClose} aria-label="Đóng">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="cc-breath-wrap">
              <div className={`cc-breath ${breathPhase === 'in' ? 'in' : 'out'}`} aria-live="polite">
                {breathPhase === 'in' ? 'Hít vào…' : 'Thở ra…'}
              </div>
              <span className="cc-breath-sub">Hít 4 giây · thở ra 4 giây</span>
            </div>
            <div className="cc-say no">
              <span className="cc-say-l">Thay vì nói</span>
              <span className="cc-strike">"{CALM_LINES.replace}"</span>
            </div>
            <div className="cc-say yes">
              <span className="cc-say-l">Thử nói</span>
              <span>"{swapMe(CALM_LINES.trySay, parentName.toLowerCase())}"</span>
            </div>
            <button type="button" className="btn-km btn-km-primary cc-cta" onClick={onClose} data-testid="calm-ok">
              Mình ổn rồi
            </button>
            <button type="button" className="cc-row cc-more" onClick={() => setView('reasons')} data-testid="calm-more">
              <HelpCircle aria-hidden="true" />
              <span>Thêm cách khác (con chưa hiểu, mất tập trung, thổi cùng con...)</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW 1: CHỌN LÝ DO (4 Ô CHÍNH + 2 HÀNG PHỤ)
            ======================================================== */}
        {view === 'not_understood_guide' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--c-text)' }}>Gợi ý khi con chưa hiểu</h3>
              <button className="round-btn" style={{ width: 32, height: 32, fontSize: 14 }} onClick={onClose} aria-label="Đóng">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2, #F8FAFC)', border: '1px solid var(--c-line, #E2E8F0)', borderRadius: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🍎 Dùng đồ vật thực tế</div>
                <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                  Lấy kẹo, que tính hoặc cúc áo mô phỏng bài toán. Trẻ tiểu học tiếp thu nhanh nhất qua trực quan sinh động.
                </div>
              </div>
              <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface-2, #F8FAFC)', border: '1px solid var(--c-line, #E2E8F0)', borderRadius: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>🐾 Chia nhỏ thành từng câu hỏi</div>
                <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.45 }}>
                  Hỏi dữ kiện ban đầu trước, sau đó hỏi đề bài yêu cầu tìm gì, tránh giảng giải một tràng dài.
                </div>
              </div>
            </div>
            <button type="button" className="btn solid" style={{ width: '100%', minHeight: 46 }} onClick={() => setView('reasons')}>
              ← Quay lại
            </button>
          </div>
        )}

        {view === 'reasons' && (
          <div className="cc-reasons">
            <div className="cc-head">
              <span className="cc-head-ic" aria-hidden="true"><Heart /></span>
              <h3 id="cc-title">
                Điều gì đang khó, {parentName.toLowerCase()} ơi?
              </h3>
              <button className="cc-x" onClick={onClose} aria-label="Đóng">
                <X aria-hidden="true" />
              </button>
            </div>
            <p className="cc-lead">
              {currentProblem ? (
                <>Chọn một ô, app gợi ý việc làm ngay. Bài đang làm vẫn giữ ở <b>Bậc {currentStepIndex + 1}</b>.</>
              ) : (
                <>Chọn một lý do, app gợi ý cách đồng hành nhẹ nhàng cùng con.</>
              )}
            </p>

            {/* 4 Ô CHÍNH */}
            <div className="cc-tiles">
              {CALM_REASONS.map((r) => {
                const Ic = CC_ICONS[r.id] || HelpCircle
                return (
                  <button key={r.id} type="button" className="cc-tile" onClick={() => handleSelectReason(r)}>
                    <span className="cc-tile-ic" aria-hidden="true"><Ic /></span>
                    <b>{swapMe(r.title, parentName.toLowerCase())}</b>
                    <span>{swapMe(r.desc, parentName.toLowerCase())}</span>
                  </button>
                )
              })}
            </div>

            {/* 2 HÀNG BÊN DƯỚI */}
            <div className="cc-rows">
              <button type="button" className="cc-row" onClick={startRoleSwap}>
                <ArrowLeftRight aria-hidden="true" />
                <span>Đổi vai 2 phút (Cô {child?.name || 'con'} hỏi {parentName.toLowerCase()})</span>
                <ArrowRight aria-hidden="true" />
              </button>

              <button type="button" className="cc-row" onClick={() => setView('blowing')}>
                <Wind aria-hidden="true" />
                <span>Chỉ muốn thở một chút (Thổi cùng con)</span>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              className="btn-km btn-km-primary cc-cta"
              onClick={onClose}
            >
              Quay lại bài đang làm <ArrowRight aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW 2: TRÒ VẬN ĐỘNG 2 PHÚT (MẤT TẬP TRUNG)
            ======================================================== */}
        {view === 'move_game' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 4 }}>{currentGame.emoji}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--c-text)' }}>
              {currentGame.title}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--c-text-2)' }}>
              {swapMe(currentGame.desc, parentName.toLowerCase())}
            </p>

            {/* Đồng hồ đếm ngược 2 phút */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                border: '4px solid var(--c-accent)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--c-text)',
              }}
            >
              {Math.floor(moveTimeLeft / 60)}:{String(moveTimeLeft % 60).padStart(2, '0')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn solid"
                style={{ padding: '12px', fontWeight: 800 }}
                onClick={() => {
                  onClose()
                  soundSuccess()
                }}
              >
                Đã tỉnh táo, quay lại bài thôi! 🚀
              </button>
              <button
                className="btn ghost"
                style={{ padding: '10px', fontSize: 13 }}
                onClick={startRoleSwap}
              >
                Hoặc thử: Đổi vai 2 phút 🎭
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: THỔI CÙNG CON (Web Audio API)
            ======================================================== */}
        {view === 'blowing' && (
          <BlowingMiniGame
            themeId={themeId}
            onFinished={() => loadCalmPhrase('frustrated')}
            onCancel={() => setView('reasons')}
          />
        )}

        {/* ========================================================
            VIEW 4: ĐỔI VAI 2 PHÚT
            ======================================================== */}
        {view === 'role_swap' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-accent)' }}>
                🎭 ĐỔI VAI 2 PHÚT
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-text)' }}>
                ⏱ {Math.floor(swapTimeLeft / 60)}:{String(swapTimeLeft % 60).padStart(2, '0')}
              </span>
            </div>

            {/* Thẻ hướng tới con (chữ to, dễ đọc) */}
            <div
              style={{
                background: 'var(--c-surface-2)',
                borderRadius: 18,
                padding: '16px 14px',
                marginBottom: 12,
                border: '1.5px solid var(--c-line)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>
                Cô {child?.name || 'con'} đọc câu này đố {parentName.toLowerCase()} nhé:
              </span>
              <h4 style={{ fontSize: 17, fontWeight: 800, margin: '6px 0 0', color: 'var(--c-text)', lineHeight: 1.4 }}>
                "{roleQuestion}"
              </h4>
            </div>

            {/* Gợi ý cho mẹ (gấp lại, chạm mới mở) */}
            <div
              style={{
                borderRadius: 14,
                padding: '10px 12px',
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12.5,
                  color: '#92400E',
                }}
                onClick={() => setIsHintFolded(!isHintFolded)}
              >
                <span>💡 Gợi ý câu trả lời sai có chủ ý cho {parentName.toLowerCase()}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{isHintFolded ? '▾' : '▴'}</span>
              </div>
              {!isHintFolded && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#78350F', lineHeight: 1.4 }}>
                  {parentName} thử trả lời: <b>"{intentionalWrongAnswer}"</b> để xem {child?.name} có phát hiện ra chỗ sai và sửa giúp {parentName.toLowerCase()} không nhé!
                </div>
              )}
            </div>

            {/* Con chấm sao cho mẹ */}
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-text)' }}>
                {child?.name || 'Con'} chấm {parentName.toLowerCase()} mấy sao? ⭐
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setChildStars(s)
                      soundPop(500 + s * 100)
                    }}
                    style={{
                      fontSize: 26,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transform: childStars >= s ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.2s ease',
                      opacity: childStars && childStars < s ? 0.4 : 1,
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn solid"
              style={{ width: '100%', padding: '12px', fontWeight: 800 }}
              onClick={() => {
                onClose()
                soundSuccess()
              }}
            >
              Quay lại làm bài gốc ➔
            </button>
          </div>
        )}

        {/* ========================================================
            VIEW 5: CÂU NÓI HỢP BÀI (p8_calm_phrase)
            ======================================================== */}
        {view === 'phrase' && calmPhrase && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-accent)' }}>
                💬 CÂU NÓI DỊU LÒNG
              </span>
              {isPhraseAi && (
                <span style={{ fontSize: 11, color: 'var(--c-text-2)' }}>
                  ✨ Viết riêng cho bậc này
                </span>
              )}
            </div>

            {/* Thay vì nói (gạch ngang) */}
            <div
              style={{
                background: '#FFF1F2',
                border: '1.5px solid #FECDD3',
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#E11D48', textTransform: 'uppercase' }}>
                Thay vì buột miệng nói:
              </span>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#9F1239', textDecoration: 'line-through' }}>
                "{swapMe(calmPhrase.thay_vi_noi, parentName.toLowerCase())}"
              </p>
            </div>

            {/* Thử nói (ấm áp) */}
            <div
              style={{
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                {parentName} thử nói nhẹ nhàng:
              </span>
              <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, color: '#065F46', lineHeight: 1.4 }}>
                "{swapMe(calmPhrase.thu_noi, parentName.toLowerCase())}"
              </p>
            </div>

            {/* Việc làm ngay */}
            {calmPhrase.viec_lam_ngay && (
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', marginBottom: 16 }}>
                💡 <b>Việc làm ngay:</b> {swapMe(calmPhrase.viec_lam_ngay, parentName.toLowerCase())}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  style={{ flex: 1, padding: "10px", fontSize: 13 }}
                  onClick={() => {
                    const nextIdx = phraseIdx + 1;
                    setPhraseIdx(nextIdx);
                    const fallbacks = FALLBACK_CALM_PHRASES[selectedReason || "frustrated"] || FALLBACK_CALM_PHRASES.frustrated;
                    setCalmPhrase(fallbacks[nextIdx % fallbacks.length]);
                    setIsPhraseAi(false);
                  }}
                >
                  🔄 Đổi câu khác
                </button>
                <button
                  className="btn ghost"
                  style={{ flex: 1.2, padding: "10px", fontSize: 13, borderColor: "var(--c-accent)", color: "var(--c-accent)" }}
                  disabled={isAiLoading}
                  onClick={() => requestAiCalmPhrase(selectedReason || "frustrated")}
                >
                  {isAiLoading ? "⏳ Gấu đang nghĩ..." : "✨ Câu khác hợp bài hơn"}
                </button>
              </div>
              <button
                className="btn solid"
                style={{ width: "100%", padding: "12px", fontWeight: 800 }}
                onClick={() => {
                  onClose();
                  soundSuccess();
                }}
              >
                Quay lại bài ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
