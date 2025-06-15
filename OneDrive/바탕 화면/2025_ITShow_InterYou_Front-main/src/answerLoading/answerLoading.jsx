import React, { useState, useEffect } from 'react';
import './answerLoading.css';
import AnswerComplete from '../answerComplete/answerComplete.jsx';

function AnswerLoading() {
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeUp(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (isTimeUp) {
    return <AnswerComplete />;
  }

  return (
    <div className="answer-loading-container">
      <div className="answer-loading-card">
        <div className="answer-loading-title">
          AI가 답변을 분석하는 중이에요!
        </div>
        <img src="/img/220607a93bdb2f1f.gif" alt="로딩 중" className="answer-loading-gif" />
        <div className="answer-loading-wait">
          조금만 기다려주세요!
        </div>
      </div>
    </div>
  );
}

export default AnswerLoading;