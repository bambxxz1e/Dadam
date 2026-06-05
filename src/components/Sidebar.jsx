import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        🍵 다담
      </div>

      <nav className="sidebar-menu">
        <Link to="/">홈</Link>
        <Link to="/timer">타이머</Link>
        <Link to="/record">기록장</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;