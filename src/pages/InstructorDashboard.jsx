import React from "react";
import { useEffect, useState } from "react";

import api from "../services/api";
import formatCoursePrice from "../services/formatCurrency";

function InstructorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonError, setLessonError] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: 0
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    section: "",
    title: "",
    content: "",
    videoUrl: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonEditForm, setLessonEditForm] = useState({
    title: "",
    content: "",
    videoUrl: ""
  });
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLessons = async (courseList = courses) => {
    setLessonsLoading(true);
    setLessonError("");

    try {
      const results = await Promise.allSettled(
        courseList.map((course) =>
          api.get(`/lessons/course/${course._id}`)
        )
      );

      const loadedLessons = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const course = courseList[index];

          loadedLessons.push(
            ...result.value.data.map((lesson) => ({
              ...lesson,
              courseId: course._id,
              courseTitle: course.title
            }))
          );
        }
      });

      setLessons(loadedLessons);

      if (results.some((result) => result.status === "rejected")) {
        setLessonError("Unable to load lessons for one or more courses.");
      }
    } finally {
      setLessonsLoading(false);
    }
  };

  const loadCourses = async () => {
    setError("");

    try {
      const response = await api.get("/courses");

      const ownCourses = response.data.filter(
        (course) =>
          course.instructor?._id === user?.id ||
          course.instructor?._id === user?._id
      );

      setCourses(ownCourses);
      await loadLessons(ownCourses);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load courses."
      );
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseChange = (e) => {
    setCourseForm({
      ...courseForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLessonChange = (e) => {
    setLessonForm({
      ...lessonForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLessonEditChange = (e) => {
    setLessonEditForm({
      ...lessonEditForm,
      [e.target.name]: e.target.value
    });
  };

  const createOrUpdateCourse = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/courses/${editingId}`,
          courseForm
        );

        setMessage("Course updated successfully.");
      } else {
        await api.post("/courses", courseForm);

        setMessage("Course created successfully.");
      }

      setCourseForm({
        title: "",
        description: "",
        category: "",
        price: 0
      });

      setEditingId(null);
      setError("");

      loadCourses();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Course operation failed."
      );
    }
  };

  const editCourse = (course) => {
    setEditingId(course._id);

    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category || "",
      price: course.price || 0
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);

      setMessage("Course deleted successfully.");

      loadCourses();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete course."
      );
    }
  };

  const addLesson = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/lessons", {
        courseId: lessonForm.courseId,
        section: lessonForm.section,
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl
      });

      setMessage("Lesson added successfully.");

      setLessonForm({
        courseId: "",
        section: "",
        title: "",
        content: "",
        videoUrl: ""
      });

      await loadLessons(courses);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to add lesson."
      );
    }
  };

  const editLesson = (lesson) => {
    setEditingLessonId(lesson._id);
    setLessonEditForm({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || ""
    });
    setError("");
    setMessage("");
  };

  const cancelLessonEdit = () => {
    setEditingLessonId(null);
    setLessonEditForm({
      title: "",
      content: "",
      videoUrl: ""
    });
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put(
        `/lessons/${editingLessonId}`,
        lessonEditForm
      );

      setLessons((currentLessons) =>
        currentLessons.map((lesson) =>
          lesson._id === editingLessonId
            ? { ...lesson, ...response.data.lesson }
            : lesson
        )
      );

      setMessage(response.data.message || "Lesson updated successfully.");
      cancelLessonEdit();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update lesson."
      );
    } finally {
      setSavingLesson(false);
    }
  };

  const deleteLesson = async (lesson) => {
    if (!window.confirm(`Delete lesson "${lesson.title}"?`)) {
      return;
    }

    setDeletingLessonId(lesson._id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/lessons/${lesson._id}`);

      setLessons((currentLessons) =>
        currentLessons.filter((item) => item._id !== lesson._id)
      );

      if (editingLessonId === lesson._id) {
        cancelLessonEdit();
      }

      setMessage(response.data.message || "Lesson deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete lesson."
      );
    } finally {
      setDeletingLessonId(null);
    }
  };

  return (
    <div className="container py-5">

      <div className="mb-4">

        <h1 className="fw-bold">
          Instructor Dashboard
        </h1>

        <p className="text-muted">
          Create courses, manage your courses and add lessons.
        </p>

      </div>

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

      <div className="row g-4">

        {/* COURSE FORM */}

        <div className="col-lg-6">

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="fw-bold mb-3">
                {editingId
                  ? "Edit Course"
                  : "Create Course"}
              </h4>

              <form onSubmit={createOrUpdateCourse}>

                <div className="mb-3">
                  <label className="form-label">
                    Course Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={courseForm.title}
                    onChange={handleCourseChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Description
                  </label>

                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    value={courseForm.description}
                    onChange={handleCourseChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    className="form-control"
                    value={courseForm.category}
                    onChange={handleCourseChange}
                    placeholder="Web Development"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Price (PKR)
                  </label>

                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    min="0"
                    value={courseForm.price}
                    onChange={handleCourseChange}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  {editingId
                    ? "Update Course"
                    : "Create Course"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setEditingId(null);

                      setCourseForm({
                        title: "",
                        description: "",
                        category: "",
                        price: 0
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}

              </form>

            </div>

          </div>

        </div>

        {/* LESSON FORM */}

        <div className="col-lg-6">

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="fw-bold mb-3">
                Add Lesson
              </h4>

              <form onSubmit={addLesson}>

                <div className="mb-3">

                  <label className="form-label">
                    Course
                  </label>

                  <select
                    className="form-select"
                    name="courseId"
                    value={lessonForm.courseId}
                    onChange={handleLessonChange}
                    required
                  >

                    <option value="">
                      Select Course
                    </option>

                    {courses.map((course) => (
                      <option
                        key={course._id}
                        value={course._id}
                      >
                        {course.title}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Course Section
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="section"
                    value={lessonForm.section}
                    onChange={handleLessonChange}
                    placeholder="e.g. Foundations"
                  />
                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Lesson Title
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={lessonForm.title}
                    onChange={handleLessonChange}
                    required
                  />

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Lesson Content
                  </label>

                  <textarea
                    className="form-control"
                    name="content"
                    rows="4"
                    value={lessonForm.content}
                    onChange={handleLessonChange}
                    required
                  ></textarea>

                </div>

                <div className="mb-3">

                  <label className="form-label">
                    Video URL
                  </label>

                  <input
                    type="url"
                    className="form-control"
                    name="videoUrl"
                    value={lessonForm.videoUrl}
                    onChange={handleLessonChange}
                    placeholder="https://youtube.com/..."
                  />

                </div>

                <button
                  className="btn btn-success"
                  type="submit"
                >
                  Add Lesson
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

      {/* LESSONS */}

      <div className="mt-5">

        <h3 className="fw-bold mb-3">
          My Lessons
        </h3>

        {lessonError && (
          <div className="alert alert-danger">
            {lessonError}
          </div>
        )}

        {lessonsLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="alert alert-info">
            No lessons have been added to your courses yet.
          </div>
        ) : (
          <div className="list-group">
            {lessons.map((lesson) => (
              <div className="list-group-item" key={lesson._id}>
                {editingLessonId === lesson._id ? (
                  <form onSubmit={saveLesson}>
                    <h5 className="fw-bold mb-1">
                      Edit Lesson
                    </h5>
                    <p className="text-muted">
                      Course: {lesson.courseTitle}
                    </p>

                    <div className="mb-3">
                      <label className="form-label">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={lessonEditForm.title}
                        onChange={handleLessonEditChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Lesson Content
                      </label>
                      <textarea
                        name="content"
                        className="form-control"
                        rows="4"
                        value={lessonEditForm.content}
                        onChange={handleLessonEditChange}
                        required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Video URL
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        className="form-control"
                        value={lessonEditForm.videoUrl}
                        onChange={handleLessonEditChange}
                      />
                    </div>

                    <button
                      className="btn btn-primary btn-sm me-2"
                      type="submit"
                      disabled={savingLesson}
                    >
                      {savingLesson ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={cancelLessonEdit}
                      disabled={savingLesson}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {lesson.title}
                        </h5>
                        <small className="text-muted">
                          {lesson.courseTitle} · {lesson.section || "Course content"}
                        </small>
                      </div>

                      <div className="text-nowrap">
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          type="button"
                          onClick={() => editLesson(lesson)}
                          disabled={deletingLessonId === lesson._id}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          type="button"
                          onClick={() => deleteLesson(lesson)}
                          disabled={deletingLessonId === lesson._id}
                        >
                          {deletingLessonId === lesson._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 mb-2">
                      {lesson.content}
                    </p>

                    {lesson.videoUrl && (
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open lesson video
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* COURSES */}

      <div className="mt-5">

        <h3 className="fw-bold mb-3">
          My Courses
        </h3>

        {courses.length === 0 ? (
          <div className="alert alert-info">
            You have not created any courses yet.
          </div>
        ) : (

          <div className="row g-4">

            {courses.map((course) => (

              <div
                className="col-md-6 col-lg-4"
                key={course._id}
              >

                <div className="card h-100 shadow-sm">

                  <div className="card-body">

                    <span className="badge bg-primary mb-2">
                      {course.category}
                    </span>

                    <h5 className="fw-bold">
                      {course.title}
                    </h5>

                    <p className="text-muted">
                      {course.description}
                    </p>

                    <p>
                      Price:{" "}
                      <strong>
                        {formatCoursePrice(course.price)}
                      </strong>
                    </p>

                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => editCourse(course)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        deleteCourse(course._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default InstructorDashboard;