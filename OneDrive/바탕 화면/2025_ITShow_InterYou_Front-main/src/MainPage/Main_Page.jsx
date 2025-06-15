import React from "react";
import { useNavigate } from "react-router-dom"; // 추가
import "./Main_Page.css"; 
import name from "./main_logo.png"; 

const Main_Page = () => {
  const navigate = useNavigate(); // 추가

  return (
    <div className="main-container">
      <div className="main-content">
        <h1 className="main-title">
          <img src={name} alt="로고" className="title" />
        </h1>
        <p className="main-description">당신의 순발력을 테스트해보세요!</p>
        <button
          className="start-button"
          onMouseOver={(e) => e.target.classList.add("hover")}
          onMouseOut={(e) => e.target.classList.remove("hover")}
          onClick={() => navigate("/information")} // 추가
        >
          시작하기 &gt;
        </button>
      </div>
    </div>
  );
};

export default Main_Page;