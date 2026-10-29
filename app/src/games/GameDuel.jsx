/**
 * ⚔️ TRÒ CHƠI 1: ĐẤU TRÍ HAI ĐẦU BÀN (MÀN 2, 3 THEO BẢN VẼ)
 * Nửa trên xoay 180 độ về mẹ, nửa dưới con, 6s đếm ngược, ván 6 câu, khen cả hai.
 */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { generateChildMathQuestion, generateParentMathQuestion } from './questionGenerator';
import { logGameAnswer, addPlaySeconds, getPlayTimeStatus } from './gameStorage';
import { soundTap, soundSuccess, soundWrong, soundPop } from '../audio';
import { AppCtx } from '../ctx'
import { haiNguoi } from '../xungHo'
import { ChevronLeft, Timer, Lightbulb } from 'lucide-react'
import { ThemeBuddy } from '../themes/buddies/buddySvgs'

export default function GameDuel({ child, stats, onBack, onOpenProfile, isTrial = false }) {
  const { ho = 'bố mẹ', Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const childName = child?.name || 'Bé Na';
  const childGrade = child?.grade || '3';

  // State trạng thái trò chơi
  const [round, setRound] = useState(1); // 1 đến 6
  const [isGameOver, setIsGameOver] = useState(false);
  const [childScore, setChildScore] = useState(0);
  const [parentScore, setParentScore] = useState(0);

  // Câu hỏi hiện tại
  const [childQ, setChildQ] = useState(() => generateChildMathQuestion(childGrade));
  const [parentQ, setParentQ] = useState(() => generateParentMathQuestion());

  // Trạng thái khóa nút của mỗi người trong câu
  const [childLocked, setChildLocked] = useState(false);
  const [parentLocked, setParentLocked] = useState(false);
  const [showAnswerNotice, setShowAnswerNotice] = useState(null); // 'child_win' | 'parent_win' | 'timeout'
  const [timeLeft, setTimeLeft] = useState(6.0); // 6 giây

  const roundStartTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Sinh câu hỏi cho vòng mới
  const nextRound = () => {
    // Cộng thời gian chơi
    addPlaySeconds(child?.id, 6);
    const status = getPlayTimeStatus(child?.id);
    if (status.isTimeLimitReached || round >= 6) {
      setIsGameOver(true);
      return;
    }

    setRound((r) => r + 1);
    setChildQ(generateChildMathQuestion(childGrade));
    setParentQ(generateParentMathQuestion());
    setChildLocked(false);
    setParentLocked(false);
    setShowAnswerNotice(null);
    setTimeLeft(6.0);
    roundStartTimeRef.current = Date.now();
  };

  // Đếm ngược 6 giây
  useEffect(() => {
    if (isGameOver || showAnswerNotice) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.2) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return Math.max(0, +(t - 0.2).toFixed(1));
      });
    }, 200);

    return () => clearInterval(timerRef.current);
  }, [round, isGameOver, showAnswerNotice]);

  const handleTimeout = () => {
    soundWrong();
    setShowAnswerNotice('timeout');
    setTimeout(() => {
      nextRound();
    }, 1200);
  };

  // Con bấm đáp án
  const handleChildAnswer = (opt) => {
    if (childLocked || showAnswerNotice || isGameOver) return;
    const ms = Date.now() - roundStartTimeRef.current;

    if (opt === childQ.correct) {
      soundSuccess();
      setChildScore((s) => s + 1);
      setShowAnswerNotice('child_win');
      logGameAnswer({
        game: 'dau_tri',
        skill: childQ.skill,
        who: 'child',
        correct: true,
        ms,
        childId: child?.id,
        isTrial,
      });
      setTimeout(() => nextRound(), 1000);
    } else {
      soundWrong();
      setChildLocked(true);
      logGameAnswer({
        game: 'dau_tri',
        skill: childQ.skill,
        who: 'child',
        correct: false,
        ms,
        childId: child?.id,
        isTrial,
      });
      if (parentLocked) {
        handleTimeout();
      }
    }
  };

  // Mẹ bấm đáp án
  const handleParentAnswer = (opt) => {
    if (parentLocked || showAnswerNotice || isGameOver) return;
    const ms = Date.now() - roundStartTimeRef.current;

    if (opt === parentQ.correct) {
      soundSuccess();
      setParentScore((s) => s + 1);
      setShowAnswerNotice('parent_win');
      logGameAnswer({
        game: 'dau_tri',
        skill: parentQ.skill,
        who: 'parent',
        correct: true,
        ms,
        childId: child?.id,
        isTrial,
      });
      setTimeout(() => nextRound(), 1000);
    } else {
      soundWrong();
      setParentLocked(true);
      logGameAnswer({
        game: 'dau_tri',
        skill: parentQ.skill,
        who: 'parent',
        correct: false,
        ms,
        childId: child?.id,
        isTrial,
      });
      if (childLocked) {
        handleTimeout();
      }
    }
  };

  const timeStatus = getPlayTimeStatus(child?.id);

  // MÀN HÌNH HẾT VÁN
  if (isGameOver) {
    const isTied = childScore === parentScore;
    const headline = isTied ? `Hoà ${parentScore} : ${childScore}!` : `Tỉ số ${parentScore} : ${childScore}!`;

    return (
      <div className="gd-over" data-testid="screen-duel-gameover">
        {/* TopBar T4 */}
        <div className="gd-over-top">
          <button type="button" className="gd-round" onClick={onBack} aria-label="Về góc chơi">
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="gd-over-tt">
            <b>Hết ván đấu trí</b>
            <span>Góc chơi chung</span>
          </div>
          <span className="gd-chip">
            <Timer aria-hidden="true" />{timeStatus.remainingFormatted}
          </span>
        </div>

        {/* Hero khen cả hai */}
        <div className="gd-hero">
          <span className="gd-hero-buddy" aria-hidden="true"><ThemeBuddy state="cheer" size={92} fallback={null} /></span>
          <h3>{headline}</h3>
          <p>
            {Ho} làm câu khó hơn, {childName} làm câu vừa sức. Cả {haiNguoi(ho, { cap: false })} đều rất nhanh trí!
          </p>
        </div>

        {/* 2 Thẻ số liệu */}
        <div className="gd-stats">
          <div>
            <span>{Ho}</span>
            <b>{parentScore}</b>
            <small>câu 2 phép tính</small>
          </div>
          <div>
            <span>{childName}</span>
            <b>{childScore}</b>
            <small>bảng nhân & chia</small>
          </div>
        </div>

        {/* Thẻ Gấu thấy */}
        <div className="gd-saw">
          <div className="gd-saw-h"><Lightbulb aria-hidden="true" />GẤU THẤY</div>
          <p>
            {childName} phản xạ phép tính rất tự tin! Gấu đã ghi nhận vào sổ học của con.
          </p>
          <span>Đã ghi vào Gấu nhớ ›</span>
        </div>

        {/* Nút hành động */}
        <div className="gd-actions">
          <button
            type="button"
            className="btn-km btn-km-m btn-km-secondary gd-btn2"
            onClick={onBack}
          >
            Về góc chơi
          </button>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-primary gd-cta"
            onClick={() => {
              if (timeStatus.isTimeLimitReached) {
                onBack();
              } else {
                setRound(1);
                setChildScore(0);
                setParentScore(0);
                setIsGameOver(false);
                nextRound();
              }
            }}
          >
            {timeStatus.isTimeLimitReached ? 'Nghỉ thôi' : 'Chơi ván nữa'}
          </button>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG CHƠI (CHIA ĐÔI MÀN HÌNH)
  const timerPct = Math.max(0, Math.min(100, (timeLeft / 6.0) * 100));

  return (
    <div className="gd" data-testid="screen-duel-playing">
      {/* NỬA TRÊN: PHÍA MẸ (XOAY 180 ĐỘ) */}
      <section className="gd-half gd-top" aria-label={`Phần của ${Ho}, xoay ngược cho người ngồi đối diện`}>
        <div className="gd-meta">
          <b className="gd-chip">{Ho} · {parentScore} điểm</b>
          <span className="gd-q">Câu {Math.min(round, 6)}/6</span>
        </div>

        <div className="gd-eq gd-eq-p">{parentQ.equation}</div>

        <div className="gd-opts">
          {parentQ.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-km btn-km-l btn-km-secondary gd-opt gd-opt-p"
              style={{ opacity: parentLocked ? 0.4 : 1 }}
              onClick={() => handleParentAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* DẢI GIỮA: TRỌNG TÀI & THANH THỜI GIAN & TỈ SỐ */}
      <div className="gd-mid">
        <button type="button" className="gd-round" onClick={onBack} title="Về góc chơi" aria-label="Về góc chơi">
          <ChevronLeft aria-hidden="true" />
        </button>
        <span className="gd-ref" aria-hidden="true"><ThemeBuddy state="hello" size={40} fallback={null} /></span>
        <div className="gd-mid-c">
          <div className="gd-mid-row">
            <b className="gd-score">{parentScore} : {childScore}</b>
            <span className="gd-left">còn {timeStatus.remainingFormatted}</span>
          </div>
          {/* Thanh đếm ngược 6s */}
          <div className="gd-bar">
            <div className={timeLeft < 2.0 ? 'low' : ''} style={{ width: `${timerPct}%` }} />
          </div>
        </div>
      </div>

      {/* NỬA DƯỚI: PHÍA CON */}
      <section className="gd-half gd-bot" aria-label={`Phần của ${childName}`}>
        <div className="gd-meta">
          <b className="gd-chip">{childName} · {childScore} điểm</b>
          <span className="gd-q">Câu {Math.min(round, 6)}/6</span>
        </div>

        <div className="gd-eq">{childQ.equation}</div>

        <div className="gd-opts">
          {childQ.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-km btn-km-l btn-km-primary gd-opt"
              style={{ opacity: childLocked ? 0.4 : 1 }}
              onClick={() => handleChildAnswer(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
