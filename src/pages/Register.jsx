import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);

      setSuccess(
        "Registration successful. You can now login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed."
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
            Create Account
          </h2>

          <p className="text-center text-muted">
            Join LearnHub today
          </p>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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
                minLength="6"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Account Type
              </label>

              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Student">
                  Student
                </option>

                <option value="Instructor">
                  Instructor
                </option>
              </select>

              <small className="text-muted">
                Admin accounts are created separately for security.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>

          <p className="text-center mt-4 mb-0">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;