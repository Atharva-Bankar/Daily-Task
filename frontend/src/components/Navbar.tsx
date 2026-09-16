import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const { pathname } = useLocation();
  const isWorkspace = pathname === "/";

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        ClientFlow
      </Link>

      {!isWorkspace && <div className="nav-actions">
        <Link to="/login"><button className="login-button">Login</button></Link>
        <Link to="/register"><button className="login-button">Register</button></Link>
      </div>}

    </nav>
  );
}

export default Navbar;
