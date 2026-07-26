import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Rock<span>TheIT</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Explore</Link>
        {user && <Link to="/dashboard">My Learning</Link>}
        {user && <Link to="/certificates">Certificates</Link>}
        {user && (user.role === "instructor" || user.role === "admin") && (
          <Link to="/instructor">Instructor</Link>
        )}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register" className="btn-primary">Sign up</Link>}
        {user && (
          <button
            className="btn-outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
