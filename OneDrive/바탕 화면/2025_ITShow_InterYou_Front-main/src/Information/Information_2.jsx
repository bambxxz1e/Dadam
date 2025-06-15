import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 추가
import './ModalNotification.css';

function Information_2({ onClose }) {

  // 채크 박스 유뮤 확인
  const [agree, setAgreed] = useState(false);
  const checkBoxChange = (e) => {
    setAgreed(e.target.checked);
  };

  // 이름 입력
  const [name, setName] = useState(""); //name은 입력 받는 이름의 상태
  const onChange = (e) => {
    setName(e.target.value); // 입력한 값이 setName e.target.value가 사용자가 타이핑한 이름
  };

  const navigate = useNavigate(); // 추가

  // 테스트 시작하기 버튼
  const testButtonClick = () => {
    if (!agree) {
      alert("촬영 동의에 체크해 주세요.");
      return;
    }
    navigate("/question");
  };

  return (
    <div className="modalOvelay" onClick={onClose}>
      <div className="modalMain" onClick={(e) => e.stopPropagation()}>
        <div className="alltext">
          <div className="textbox1">
            <p id="text1">촬영 동의</p>
            <p id="text2">*</p>
          </div>
          <div className="checkboxRow">
            <span id="text3">
              촬영 중 자신의 모습이 녹화되는 것에 동의합니다.
            </span>
            <input
              id="checkBox"
              type="checkbox"
              checked={agree}
              onChange={checkBoxChange}
            />
          </div>

          <div className="textbox1">
            <p id="text1">이름</p>
            <p id="text2">*</p>
          </div>
          <input
            id="namePlace"
            name="name"
            placeholder="이름 입력"
            onChange={onChange}
            value={name}
          />
          <button className="testStartButton" onClick={testButtonClick}>
            <p id="testStartText">테스트 시작하기</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Information_2;