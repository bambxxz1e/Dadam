import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(
      (user) => user.username === form.username
    );

    if (exists) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }

    users.push({
      ...form,
      teaRecords: [],
      favoriteTea: [],
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("회원가입 완료!");
    navigate("/login");
  };

  return (
    <div className="login-container">
      <h2>🍃 다담 회원가입</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="username"
          placeholder="아이디"
          value={form.username}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit">
          회원가입
        </button>
      </form>
    </div>
  );
}

export default Register;