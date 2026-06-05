// 차 종류 선택 및 학습 기능의 "메인 페이지" 컴포넌트
// - 이 페이지에서만 상태(state)를 관리한다. (다른 컴포넌트는 props 만 받음)
// - useState 로 선택된 차 ID 와 검색어를 관리한다.
// - useEffect 로 LocalStorage 와 연동(불러오기/저장)한다.

import { useState, useEffect } from "react";
import teaData from "../data/teaData.js";
import TeaSearch from "../components/TeaSearch.jsx";
import TeaCard from "../components/TeaCard.jsx";
import TeaDetail from "../components/TeaDetail.jsx";

// LocalStorage 에 저장할 때 사용할 key 이름 (한 곳에서 관리하면 오타를 줄일 수 있다.)
const STORAGE_KEY = "selectedTeaId";

function TeaLearningPage() {
  // 1) 선택된 차의 ID 상태. (아무것도 선택되지 않았으면 null)
  const [selectedTeaId, setSelectedTeaId] = useState(null);

  // 2) 검색어 상태. (TeaSearch 입력값과 연결됨)
  const [searchText, setSearchText] = useState("");

  // 3) 첫 렌더링(마운트) 시 한 번만 실행:
  //    LocalStorage 에 저장돼 있던 "마지막으로 선택한 차"를 불러와 복원한다.
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId !== null) {
      // LocalStorage 값은 문자열이므로 숫자로 바꿔서 상태에 넣는다.
      // (초기 1회 복원이므로 effect 안에서 상태를 설정한다.)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTeaId(Number(savedId));
    }
  }, []); // 빈 배열: 처음 한 번만 실행

  // 4) 선택된 차 ID 가 바뀔 때마다 실행:
  //    현재 선택된 차 ID 를 LocalStorage 에 저장한다. (새로고침해도 유지되도록)
  useEffect(() => {
    if (selectedTeaId !== null) {
      localStorage.setItem(STORAGE_KEY, String(selectedTeaId));
    }
  }, [selectedTeaId]); // selectedTeaId 가 바뀔 때마다 실행

  // 카드 클릭 시 선택된 차 ID 를 갱신하는 함수 (자식 TeaCard 에 전달)
  const handleSelectTea = (teaId) => {
    setSelectedTeaId(teaId);
  };

  // 검색어가 바뀔 때 검색어 상태를 갱신하는 함수 (자식 TeaSearch 에 전달)
  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  // 검색어에 따라 차 목록을 필터링한다.
  // - 앞뒤 공백을 제거(trim)하고, 이름에 검색어가 포함된 차만 남긴다.
  const keyword = searchText.trim();
  const filteredTeaList = teaData.filter((tea) => tea.name.includes(keyword));

  // 현재 선택된 차 "객체"를 ID 로 찾는다. (없으면 undefined)
  const selectedTea = teaData.find((tea) => tea.id === selectedTeaId);

  return (
    <div className="tea-learning-page">
      <h1 className="tea-learning-title">차 종류 선택 및 학습</h1>

      {/* 검색 입력 영역 */}
      <TeaSearch searchText={searchText} onSearchChange={handleSearchChange} />

      {/* 본문: 왼쪽 차 목록 + 오른쪽 상세 정보 */}
      <div className="tea-learning-body">
        {/* 차 목록 영역 */}
        <section className="tea-list-section">
          {filteredTeaList.length > 0 ? (
            <div className="tea-list">
              {filteredTeaList.map((tea) => (
                <TeaCard
                  key={tea.id}
                  tea={tea}
                  // 이 카드가 현재 선택된 차인지 비교해서 전달
                  isSelected={tea.id === selectedTeaId}
                  onSelect={handleSelectTea}
                />
              ))}
            </div>
          ) : (
            // 검색 결과가 하나도 없을 때 안내 문구
            <p className="tea-empty-result">검색 결과가 없습니다.</p>
          )}
        </section>

        {/* 상세 정보 영역 */}
        <section className="tea-detail-section">
          <TeaDetail selectedTea={selectedTea} />
        </section>
      </div>
    </div>
  );
}

export default TeaLearningPage;
