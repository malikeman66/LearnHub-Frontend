import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      const response = await api.get("/my-courses");

      setCourses(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="container py-5">

      <div className="mb-4">
        <h1 className="fw-bold">
          Student Dashboard
        </h1>

        <p className="text-muted">
          View your enrolled courses and learning progress.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="alert alert-info">
          You have not enrolled in any courses yet.
        </div>
      ) : (
        <div className="row g-4">

          {courses.map((enrollment) => {

            const course = enrollment.course;

            return (
              <div
                className="col-md-6 col-lg-4"
                key={enrollment._id}
              >

                <div className="card h-100 shadow-sm">

                  <div className="card-body">

                    <span className="badge bg-primary mb-2">
                      {course?.category || "General"}
                    </span>

                    <h5 className="fw-bold">
                      {course?.title}
                    </h5>

                    <p className="text-muted">
                      {course?.description}
                    </p>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between">
                        <small>Progress</small>
                        <small>
                          {enrollment.progress}%
                        </small>
                      </div>

                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${enrollment.progress}%`
                          }}
                        ></div>
                      </div>

                      <small className="text-muted">
                        {enrollment.totalLessonCount > 0
                          ? `${enrollment.completedLessonCount} of ${enrollment.totalLessonCount} lessons completed`
                          : "No lessons have been added yet."}
                      </small>
                    </div>

                    <Link
                      to={`/courses/${course?._id}`}
                      className="btn btn-outline-primary mt-3"
                    >
                      Continue Learning
                    </Link>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default StudentDashboard;