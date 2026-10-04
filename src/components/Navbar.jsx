import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">

        <Link className="navbar-brand fw-bold" to="/">
          LearnHub
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">

          <ul className="navbar-nav me-auto">

            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/courses">
                Courses
              </Link>
            </li>

            {token && user?.role === "Student" && (
              <li className="nav-item">
                <Link className="nav-link" to="/student">
                  Dashboard
                </Link>
              </li>
            )}

            {token && user?.role === "Instructor" && (
              <li className="nav-item">
                <Link className="nav-link" to="/instructor">
                  Dashboard
                </Link>
              </li>
            )}

            {token && user?.role === "Admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Dashboard
                </Link>
              </li>
            )}

          </ul>

          <div className="d-flex align-items-center gap-2">

            {token ? (
              <>
                <span className="text-white small">
                  {user?.name} ({user?.role})
                </span>

                <button
                  className="btn btn-light btn-sm"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-outline-light btn-sm"
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="btn btn-light btn-sm"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;