import React, { useState, useEffect } from 'react';
import './first.css';
import { useNavigate } from 'react-router-dom';
import Question1 from './title_1.svg';
import Think from './think_1.svg';
function Question() {
  
  const [progress, setProgress] = useState(0); // 0%에서 시작!  
  const [timeLeft, setTimeLeft] = useState(5); // 타이머 초기값
  const navigate = useNavigate();

  useEffect(() => {
    // 진행바 하이라이팅 효과
    const target = 34  ; // 목표 퍼센트 (페이지별로 25, 50, 75, 100 등)
    setTimeout(() => setProgress(target), 100); // 0.1초 후 애니메이션 시작
  }, []);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 0) {
          clearInterval(timerInterval); 
          // navigate('/speaking'); // 타이머 종료 후 페이지 이동 
        }
        return prev > 0 ? prev - 1 : 0; // 타이머 감소
      }); 
    }, 1200);

    return () => {
      clearInterval(timerInterval); // 컴포넌트 언마운트 시 타이머 정리
    };  
  }, [navigate]);

  const circleRadius = 110; // 반지름   
  const circleCircumference = 2 * Math.PI * circleRadius; // 원 둘레
  const dotPercents = [0, 33, 66, 99];

  return (
    <div className="start-container">
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }}
        ></div>
   <div className="progress-dots">
    {dotPercents.map((percent, idx) => (
      <div
        key={idx}
        className={`dot dot${idx + 1} ${progress >= percent ? "dot-filled" : ""}`}
        style={{
          transition: "background 0.7s cubic-bezier(.4,2,.6,1)"
        }}
      />
    ))}
  </div>
      </div>
      <div className="question-box">
        <img src={Question1} alt="질문1" className="question-title" />
        <p className="question-text">맨홀 뚜껑은 왜 원형일까요?</p>
        <p className="timer-text">
          <img src={Think} alt="생각하는 이미지" className="think-image" />
        </p>
      </div>
      <div className="timer-circle">
        <svg className="circle-svg">
          <circle
            className="circle-background1"
            cx="122"
            cy="118"
            r={circleRadius}
          ></circle>
          <circle
            className="circle-progress1" 
            cx="122"
            cy="118"
            r={circleRadius}
            style={{
              strokeDasharray: circleCircumference,
              strokeDashoffset: circleCircumference * (1 + timeLeft / 5),
            }}
          ></circle>
        </svg>
        <span className="timer-number">{timeLeft}</span>
      </div>
    </div>
  );
}

export default Question;