// 차 상세 정보 컴포넌트
// - 선택된 차의 "학습 정보"를 자세히 보여주는 표현(presentational) 컴포넌트이다.
// - 상태(state)는 관리하지 않고, 부모에서 선택된 차 객체를 props 로 받는다.
//
// props
//  - selectedTea : 현재 선택된 차 객체. 선택된 차가 없으면 null/undefined 가 들어온다.

function TeaDetail({ selectedTea }) {
  // 선택된 차가 없으면 안내 문구만 보여준다.
  if (!selectedTea) {
    return (
      <div className="tea-detail tea-detail-empty">
        <p>차를 선택하면 학습 정보가 여기에 표시됩니다.</p>
      </div>
    );
  }

  // 선택된 차가 있으면 상세 학습 정보를 항목별로 보여준다.
  return (
    <div className="tea-detail">
      <h2 className="tea-detail-name">{selectedTea.name}</h2>
      <p className="tea-detail-description">{selectedTea.description}</p>

      <dl className="tea-detail-list">
        <div className="tea-detail-item">
          <dt>적정 물 온도</dt>
          <dd>{selectedTea.waterTemp}</dd>
        </div>
        <div className="tea-detail-item">
          <dt>권장 우림 시간</dt>
          <dd>{selectedTea.steepTime}</dd>
        </div>
        <div className="tea-detail-item">
          <dt>맛의 특징</dt>
          <dd>{selectedTea.taste}</dd>
        </div>
        <div className="tea-detail-item">
          <dt>향의 특징</dt>
          <dd>{selectedTea.aroma}</dd>
        </div>
      </dl>

      {/* 초보자를 위한 팁은 따로 강조해서 보여준다. */}
      <div className="tea-detail-tip">
        <strong>초보자 팁</strong>
        <p>{selectedTea.tip}</p>
      </div>
    </div>
  );
}

export default TeaDetail;
