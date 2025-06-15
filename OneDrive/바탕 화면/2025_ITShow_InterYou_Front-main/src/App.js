import {Routes, Route } from "react-router-dom";
import './App.css'; // App 컴포넌트의 스타일을 위한 CSS 파일
import MainPage from "./MainPage/Main_Page"; // Main_Page 컴포넌트 가져오기
import Information from './Information/Information_1'; // Information 페이지
import Q1 from './Question/first';
import Q2 from './Question/second';
import Q3 from './Question/third';
import Speak from './Answer/speaking';
import Speak2 from './Answer/speaking2';
import Speak3 from './Answer/speaking3';
import AnswerLoading from './answerLoading/answerLoading';
import AnswerComplete from './answerComplete/answerComplete';
const questionRoutes = [
  { path: '/question', element: <Q1 /> },
  { path: '/question2', element: <Q2 /> },
  { path: '/question3', element: <Q3 /> },
];

const speakingRoutes = [
  { path: '/speaking', element: <Speak /> },
  { path: '/speaking2', element: <Speak2 /> },
  { path: '/speaking3', element: <Speak3 /> },
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/information" element={<Information />} />
      {questionRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      {speakingRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="/answerLoading" element={<AnswerLoading />} />
      <Route path="/answerComplete" element={<AnswerComplete />} />
    </Routes>
  );
}

export default App;