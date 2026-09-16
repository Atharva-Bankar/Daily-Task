import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isWorkspace = pathname === "/";

  function handleLogout() {
    sessionStorage.removeItem("clientflow-user");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">C</span>
        ClientFlow
      </Link>

      {isWorkspace ? (
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Log out <span>→</span>
        </button>
      ) : (
        <div className="nav-actions" style={{ display: "flex", gap: "10px" }}>
          <Link to="/login"><button type="button" className="login-button">Login</button></Link>
          <Link to="/register"><button type="button" className="login-button">Register</button></Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
