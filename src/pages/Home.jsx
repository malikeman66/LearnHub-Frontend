import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    instructors: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get("/stats");
        setStats(response.data);
        setStatsError("");
      } catch (err) {
        setStatsError("Unable to load LearnHub statistics.");
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>

      <section className="hero-section">
        <div className="container">

          <div className="row align-items-center min-vh-75">

            <div className="col-lg-7">

              <span className="badge bg-primary mb-3">
                LearnHub LMS
              </span>

              <h1 className="display-4 fw-bold">
                Learn New Skills.
                <br />
                Build Your Future.
              </h1>

              <p className="lead text-muted mt-3">
                LearnHub is a modern Learning Management System
                where students can browse courses, enroll in classes
                and track their learning progress.
              </p>

              <div className="mt-4">

                <Link
                  to="/courses"
                  className="btn btn-primary btn-lg me-2"
                >
                  Browse Courses
                </Link>

                <Link
                  to="/register"
                  className="btn btn-outline-primary btn-lg"
                >
                  Get Started
                </Link>

              </div>

            </div>

            <div className="col-lg-5 mt-5 mt-lg-0">

              <div className="hero-card shadow">

                <div className="text-center">
                  <div className="display-1">🎓</div>

                  <h3 className="fw-bold">
                    LearnHub
                  </h3>

                  <p className="text-muted">
                    Your online learning platform
                  </p>
                </div>

                <hr />

                <div className="row text-center">

                  <div className="col-4">
                    <h4>
                      {statsLoading ? "..." : statsError ? "-" : stats.courses}
                    </h4>
                    <small>Courses</small>
                  </div>

                  <div className="col-4">
                    <h4>
                      {statsLoading ? "..." : statsError ? "-" : stats.students}
                    </h4>
                    <small>Students</small>
                  </div>

                  <div className="col-4">
                    <h4>
                      {statsLoading ? "..." : statsError ? "-" : stats.instructors}
                    </h4>
                    <small>Instructors</small>
                  </div>

                </div>

                {statsError && (
                  <p className="text-danger small text-center mt-3 mb-0" role="alert">
                    {statsError}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      <section className="py-5 bg-light">

        <div className="container">

          <h2 className="text-center fw-bold mb-5">
            Why Choose LearnHub?
          </h2>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="feature-card">
                <div className="fs-1">📚</div>
                <h4>Quality Courses</h4>
                <p>
                  Learn from structured courses created by instructors.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="fs-1">🎯</div>
                <h4>Track Progress</h4>
                <p>
                  Monitor your learning progress through your dashboard.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="fs-1">👨‍🏫</div>
                <h4>Expert Instructors</h4>
                <p>
                  Instructors can create and manage their courses.
                </p>
              </div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;