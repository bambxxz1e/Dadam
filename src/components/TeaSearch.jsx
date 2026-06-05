// 차 검색 입력 컴포넌트
// - 차 이름을 입력해 목록을 필터링하기 위한 input 컴포넌트이다.
// - 검색어 상태(state)는 직접 관리하지 않고, 부모 페이지에서 관리한다. (controlled input)
//
// props
//  - searchText     : 현재 입력된 검색어 (부모가 가진 상태 값)
//  - onSearchChange : 입력이 바뀔 때 실행할 함수 (부모의 상태를 갱신)

function TeaSearch({ searchText, onSearchChange }) {
  return (
    <div className="tea-search">
      <input
        type="text"
        className="tea-search-input"
        placeholder="차 이름으로 검색해보세요 (예: 녹차)"
        // 부모가 가진 검색어 값을 그대로 보여준다.
        value={searchText}
        // 입력이 바뀌면 입력값을 부모에게 전달한다.
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

export default TeaSearch;
