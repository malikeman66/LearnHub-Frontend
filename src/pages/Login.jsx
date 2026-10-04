import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      const role = response.data.user.role;

      if (role === "Admin") {
        navigate("/admin");
      } else if (role === "Instructor") {
        navigate("/instructor");
      } else {
        navigate("/student");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      <div className="card auth-card shadow">

        <div className="card-body p-4 p-md-5">

          <h2 className="fw-bold text-center">
            Login
          </h2>

          <p className="text-center text-muted">
            Login to your LearnHub account
          </p>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="text-center mt-4 mb-0">
            Don't have an account?{" "}
            <Link to="/register">
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;