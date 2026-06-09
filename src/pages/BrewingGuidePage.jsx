import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import brewingData from "../data/brewingData.js";
import { teaList } from "../data/teaData.js";
import BrewingProgress from "../components/BrewingProgress.jsx";
import BrewingStepCard from "../components/BrewingStepCard.jsx";
import StepTimer from "../components/StepTimer.jsx";
import "./BrewingGuidePage.css";

function BrewingGuidePage() {
  const navigate = useNavigate();
  // URL에서 차 id 가져오기
  const { id } = useParams();

  // 해당 차 찾기
  const selectedTea = brewingData.find(
    (tea) => tea.id === Number(id)
  );

  // 해당 차의 우림 시간 찾기
  const selectedTeaBrewTime = teaList.find(
    (tea) => tea.id === Number(id)
  )?.brewTime || 0; // 우림 시간이 없는 경우 0으로 기본값 설정

  // 존재하지 않는 차 접근 시
  if (!selectedTea) {
    return (
      <div className="brewing-guide-page">
        <h1>존재하지 않는 차입니다.</h1>
      </div>
    );
  }

  // 현재 단계
  const [currentStep, setCurrentStep] = useState(0);

  // 단계 데이터
  const steps = selectedTea.steps;
  const totalSteps = steps.length;

  // 마지막 단계 여부
  const isLastStep = currentStep === totalSteps - 1;

  // 이전 단계
  function handlePrevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  // 다음 단계
  function handleNextStep() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  return (
    <div className="brewing-guide-page">

      <div className="guide-header">
        <button
          className="back-button"
          onClick={() => navigate("/home")}
        >
          ← 뒤로가기
        </button>

        <h1 className="brewing-guide-title">
          {selectedTea.name} 우리는 과정 가이드
        </h1>
      </div>

      {/* 차 기본 정보 */}
      <div className="brewing-info">

        <div className="brewing-info-item">
          <span className="brewing-info-label">
            물 온도
          </span>

          <span className="brewing-info-value">
            {selectedTea.temperature}
          </span>
        </div>

        <div className="brewing-info-item">
          <span className="brewing-info-label">
            우림 시간
          </span>

          <span className="brewing-info-value">
            {selectedTea.brewTime}
          </span>
        </div>

        <div className="brewing-info-item">
          <span className="brewing-info-label">
            찻잎 양
          </span>

          <span className="brewing-info-value">
            {selectedTea.leafAmount}
          </span>
        </div>

      </div>

      {/* 진행률 */}
      <BrewingProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* 현재 단계 카드 */}
      <BrewingStepCard
        step={steps[currentStep]}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* 4단계(인덱스 3)일 때 타이머 노출 */}
      {currentStep === 3 && (
        <div className="step-timer-wrapper">
          <h3>⏳ 최적의 맛을 위해 기다려주세요</h3>
          <StepTimer 
            brewTime={Number(selectedTeaBrewTime) || 0} 
            onComplete={() => alert("차 우림이 완료되었습니다!")} 
          />
        </div>
      )}

      {/* 단계 이동 버튼 */}
      <div className="guide-button-group">

        <button
          type="button"
          className="guide-button"
          onClick={handlePrevStep}
          disabled={currentStep === 0}
        >
          이전 단계
        </button>

        <button
          type="button"
          className="guide-button"
          onClick={handleNextStep}
          disabled={isLastStep}
        >
          다음 단계
        </button>

      </div>

      {/* 완료 메시지 */}
      {isLastStep && (
        <p className="guide-complete">
          🎉 차 우리는 과정이 완료되었습니다.
        </p>
      )}

    </div>
  );
}

export default BrewingGuidePage;