import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("로그인 성공!");
    navigate("/home");
  };

  return (
    <div className="login-container">
      <h2>🍵 다담 로그인</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          로그인
        </button>
      </form>

      <p>
        계정이 없으신가요?{" "}
        <span
          onClick={() => navigate("/register")}
          style={{
            color: "#2f4f4f",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          회원가입
        </span>
      </p>
    </div>
  );
}

export default Login;