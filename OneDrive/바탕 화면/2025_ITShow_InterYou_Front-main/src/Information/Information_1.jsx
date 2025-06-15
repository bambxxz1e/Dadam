import { useState } from "react";
import './Information.css';
import Information2 from "./Information_2";
function Information_1() {
  const[showModal, setShowModal] = useState(false); // showModal이 모달창 열려 있는지 확인 여부

  const StartClick = () => {
    setShowModal(true);
  };

  const closeModal = () =>{
    setShowModal(false);
  }

  return (
    <main>
      <img
        className="headPhone_img"
        src="/img/info_headphone.png"
        alt="info_headphone"
      />
      <img
        className="mic_img"
        src="/img/info_mike.png"
        alt="info_mike"
      />
      <div className="box1">
        <h1 className="mainText">당신의 순발력을 테스트 해보세요!</h1>
        <div className="box2">
          <div className="Text1">
            <div className="num1_cir">
              <p id="num1">1</p>
            </div>
            <p id="Text1_t">
              <b>5초</b> 동안 답변을 생각하세요!
            </p>
          </div>

          <div className="Text2">
            <div className="num2_cir">
              <p id="num2">2</p>
            </div>
            <p id="Text2_t">
              <b>10초</b> 동안 카메라를 보고, 마이크로 대답하세요!
            </p>
          </div>

          <div className="Text3">
            <div className="num3_cir">
              <p id="num3">3</p>
            </div>
            <p id="Text3_t">
              AI가 <b>답변 내용</b>을 분석해서 점수를 매깁니다!
            </p>
          </div>
        </div>
      </div>
      <button className="startButton" onClick={StartClick}>
        <p id="startText">시작하기 &gt;</p>
      </button>
      {showModal && <Information2 onClose={closeModal}/>}
   </main>
   );
}

export default Information_1;