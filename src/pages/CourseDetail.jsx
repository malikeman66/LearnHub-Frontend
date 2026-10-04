import React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";
import formatCoursePrice from "../services/formatCurrency";

function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonAccessMessage, setLessonAccessMessage] = useState("");
  const [hasEnrolled, setHasEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [lessonReloadKey, setLessonReloadKey] = useState(0);
  const [updatingLessonId, setUpdatingLessonId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Course could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadLessons = async () => {
      setLessonsLoading(true);
      setLessonAccessMessage("");

      try {
        const response = await api.get(`/lessons/course/${id}`);

        if (!cancelled) {
          let studentEnrollment = null;

          if (user?.role === "Student") {
            const enrollmentsResponse = await api.get("/my-courses");
            studentEnrollment = enrollmentsResponse.data.find(
              (item) => String(item.course?._id) === String(id)
            ) || null;
          }

          if (cancelled) {
            return;
          }

          setLessons(response.data);
          setEnrollment(studentEnrollment);
          setHasEnrolled(
            user?.role !== "Student" || Boolean(studentEnrollment)
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setLessons([]);
        setEnrollment(null);
        setHasEnrolled(false);

        if (err.response?.status === 401) {
          setLessonAccessMessage(
            "Log in and enroll for free to access the lessons."
          );
        } else if (
          err.response?.status === 403 && user?.role === "Student"
        ) {
          setLessonAccessMessage(
            "Enroll for free to unlock the course lessons."
          );
        } else if (err.response?.status === 403) {
          setLessonAccessMessage(
            "You do not have access to this course's lessons."
          );
        } else {
          setLessonAccessMessage(
            "Course lessons could not be loaded. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLessonsLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [id, lessonReloadKey, token, user?.role]);

  const enroll = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (user?.role !== "Student") {
      setError("Only students can enroll in courses.");
      return;
    }

    try {
      const response = await api.post("/enroll", {
        courseId: id
      });

      setMessage("You are enrolled for free. No payment is required.");
      setError("");
      setEnrollment(response.data.enrollment);
      setHasEnrolled(true);
      setLessonReloadKey((key) => key + 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Enrollment failed."
      );
      setMessage("");
    }
  };

  const updateLessonCompletion = async (lessonId, completed) => {
    if (!enrollment) {
      return;
    }

    setUpdatingLessonId(lessonId);
    setError("");

    try {
      const response = await api.put(
        `/enrollments/${enrollment._id}/progress`,
        { lessonId, completed }
      );

      setEnrollment(response.data);
      setMessage(
        completed ? "Lesson marked complete." : "Lesson marked incomplete."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update lesson progress."
      );
    } finally {
      setUpdatingLessonId(null);
    }
  };

  const lessonsBySection = lessons.reduce((sections, lesson) => {
    const section = lesson.section?.trim() || "Course content";
    sections[section] = sections[section] || [];
    sections[section].push(lesson);
    return sections;
  }, {});

  const completedLessonIds = new Set(
    (enrollment?.completedLessons || []).map((lessonId) =>
      String(lessonId?._id || lessonId)
    )
  );
  const completedLessonCount = lessons.filter((lesson) =>
    completedLessonIds.has(String(lesson._id))
  ).length;
  const lessonProgress = lessons.length
    ? Math.round((completedLessonCount / lessons.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row">

        <div className="col-lg-8">

          <span className="badge bg-primary mb-3">
            {course.category || "General"}
          </span>

          <h1 className="fw-bold">
            {course.title}
          </h1>

          <p className="lead text-muted">
            {course.description}
          </p>

          <hr />

          <h3 className="mb-3">
            Course Lessons
          </h3>

          {user?.role === "Student" && hasEnrolled && lessons.length > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <small>Course progress</small>
                <small>{lessonProgress}%</small>
              </div>
              <div
                className="progress"
                role="progressbar"
                aria-label="Course progress"
                aria-valuenow={lessonProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="progress-bar"
                  style={{ width: `${lessonProgress}%` }}
                ></div>
              </div>
              <small className="text-muted">
                {completedLessonCount} of {lessons.length} lessons completed
              </small>
            </div>
          )}

          {lessonAccessMessage ? (
            <div className="alert alert-info">
              {lessonAccessMessage}
            </div>
          ) : lessonsLoading ? (
            <p className="text-muted">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <div className="alert alert-light border">
              No lessons have been added yet.
            </div>
          ) : (
            Object.entries(lessonsBySection).map(([section, sectionLessons]) => (
              <section className="mb-4" key={section}>
                <h4 className="fw-semibold mb-2">
                  {section}
                </h4>

                <div className="list-group">
                  {sectionLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(
                      String(lesson._id)
                    );

                    return (
                      <div
                        className="list-group-item"
                        key={lesson._id}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <h6 className="mb-1">
                              Lesson {index + 1}: {lesson.title}
                            </h6>

                            <p className="mb-1 text-muted">
                              {lesson.content}
                            </p>

                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Watch Lesson
                              </a>
                            )}
                          </div>

                          {user?.role === "Student" && hasEnrolled && (
                            <div className="form-check text-nowrap">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`lesson-complete-${lesson._id}`}
                                checked={isCompleted}
                                disabled={updatingLessonId === lesson._id}
                                onChange={(event) =>
                                  updateLessonCompletion(
                                    lesson._id,
                                    event.target.checked
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`lesson-complete-${lesson._id}`}
                              >
                                {updatingLessonId === lesson._id
                                  ? "Saving..."
                                  : "Complete"}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}

        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">

          <div className="card shadow-sm">

            <div className="card-body">

              <h3 className="fw-bold">
                Free enrollment
              </h3>

              <p className="text-muted">
                Demo price only: {formatCoursePrice(course.price)}. No payment is required.
              </p>

              <p className="text-muted">
                Instructor:{" "}
                {course.instructor?.name || "LearnHub Instructor"}
              </p>

              {user?.role === "Student" ? (
                hasEnrolled ? (
                  <button className="btn btn-success w-100" disabled>
                    Enrolled
                  </button>
                ) : (
                  <button
                    className="btn btn-primary w-100"
                    onClick={enroll}
                  >
                    Enroll for Free
                  </button>
                )
              ) : !token ? (
                <Link
                  to="/login"
                  className="btn btn-primary w-100"
                >
                  Log in to Enroll for Free
                </Link>
              ) : (
                <div className="alert alert-info">
                  Only students can enroll in courses.
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CourseDetail;