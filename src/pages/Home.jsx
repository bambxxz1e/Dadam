import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import './Home.css';
import Sidebar from "../components/Sidebar";
import TeaCard from "../components/TeaCard";
import { teaList } from "../data/teaData.js";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const filteredTea = teaList.filter((tea) =>
    tea.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <>
      <div className="layout">
        <Sidebar />

        <div className="content">

          <div className="top-bar">
            <h2>
              🍃 {currentUser.name}님, 오늘은 어떤 차를 배우실 건가요?
            </h2>

            <button
              className="logout-btn"
              onClick={logout}
            >
              로그아웃
            </button>
          </div>

          <input
            className="search-bar"
            type="text"
            placeholder="차 검색..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <div className="tea-grid">
            {filteredTea.map((tea) => (
              <TeaCard
                key={tea.id}
                tea={tea}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

export default Home;