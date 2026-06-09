import { useState, useEffect, useRef } from 'react';
import './BrewingTimer.css';

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StepTimer({ brewTime, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(brewTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // 시간 포맷팅 (00:00)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      if (onComplete) onComplete(); // 완료 시 콜백 실행
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, onComplete]);

  // 원형 게이지 계산
  const strokeDashoffset = CIRCUMFERENCE * (timeLeft / brewTime);

  return (
    <div className="step-timer-container">
      <div className="timer-circle-wrap small"> {/* 사이즈 조절을 위한 클래스 */}
        <svg className="timer-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#e8e0d5" strokeWidth="12" />
          <circle
            cx="100" cy="100" r={RADIUS} fill="none" stroke="#6b8e23" // 포인트 컬러
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button 
          className={`ctrl-btn ${isRunning ? 'pause' : 'start'}`}
          onClick={() => setIsRunning(!isRunning)}
          disabled={timeLeft === 0}
        >
          {isRunning ? '일시정지' : '타이머 시작'}
        </button>
        <button className="ctrl-btn reset" onClick={() => { setTimeLeft(brewTime); setIsRunning(false); }}>
          리셋
        </button>
      </div>
    </div>
  );
}