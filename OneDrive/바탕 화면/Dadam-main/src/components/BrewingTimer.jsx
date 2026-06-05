import { useEffect, useRef } from 'react';
import { useTea } from '../context/TeaContext';
import './BrewingTimer.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function BrewingTimer() {
  const { state, dispatch, selectedTea, teaList } = useTea();
  const { timeLeft, isRunning, isDone } = state;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, dispatch]);

  const progress = 1 - timeLeft / selectedTea.brewTime;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="brewing-timer">
      <h2 className="timer-title">차 우리기 타이머</h2>

      <div className="tea-selector">
        {teaList.map((tea) => (
          <button
            key={tea.id}
            className={`tea-btn ${selectedTea.id === tea.id ? 'active' : ''}`}
            style={{ '--tea-color': tea.color }}
            onClick={() => dispatch({ type: 'SELECT_TEA', id: tea.id })}
          >
            {tea.name}
          </button>
        ))}
      </div>

      <div className="tea-info">
        <span>🌡️ {selectedTea.temperature}°C</span>
        <span>🍃 {selectedTea.leafAmount}</span>
        <span>💬 {selectedTea.flavor}</span>
      </div>

      <div className="timer-circle-wrap">
        <svg className="timer-svg" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="#e8e0d5"
            strokeWidth="10"
          />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={selectedTea.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="timer-display">
          {isDone ? (
            <span className="timer-done">완료!</span>
          ) : (
            <span className="timer-time">{formatTime(timeLeft)}</span>
          )}
          <span className="timer-label">
            {isDone ? `${selectedTea.name} 준비 완료` : '남은 시간'}
          </span>
        </div>
      </div>

      <div className="timer-controls">
        <button
          className="ctrl-btn reset"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          초기화
        </button>
        <button
          className={`ctrl-btn main ${isRunning ? 'pause' : 'start'}`}
          style={{ '--tea-color': selectedTea.color }}
          onClick={() => dispatch({ type: 'SET_RUNNING', value: !isRunning })}
          disabled={isDone}
        >
          {isRunning ? '일시정지' : '시작'}
        </button>
      </div>

      {isDone && (
        <div className="done-message">
          <p>☕ {selectedTea.name}이(가) 완성되었습니다!</p>
          <p className="done-sub">향: {selectedTea.aroma} · 맛: {selectedTea.flavor}</p>
        </div>
      )}
    </div>
  );
}
