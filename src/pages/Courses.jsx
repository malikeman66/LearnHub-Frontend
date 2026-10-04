import React from "react";
import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import api from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses");

      setCourses(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const categories = [
    ...new Set(
      courses
        .map((course) => course.category?.trim())
        .filter(Boolean)
    )
  ].sort((first, second) => first.localeCompare(second));

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !normalizedSearch ||
      course.title?.toLowerCase().includes(normalizedSearch) ||
      course.description?.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const showAllCourses = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  return (
    <div className="container py-5">

      <div className="text-center mb-5">

        <h1 className="fw-bold">
          Available Courses
        </h1>

        <p className="text-muted">
          Explore our courses and start learning.
        </p>

      </div>

      <div className="row g-3 align-items-end mb-4">
        <div className="col-md-7">
          <label htmlFor="course-search" className="form-label">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            className="form-control"
            placeholder="Search by title or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="course-category" className="form-label">
            Category
          </label>
          <select
            id="course-category"
            className="form-select"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={showAllCourses}
          >
            Show all courses
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="alert alert-info">
          No courses are available yet.
        </div>
      )}

      {!loading && !error && courses.length > 0 && filteredCourses.length === 0 && (
        <div className="alert alert-info">
          No courses match your search or selected category. Try another filter or show all courses.
        </div>
      )}

      <div className="row g-4">

        {filteredCourses.map((course) => (
          <div
            className="col-md-6 col-lg-4"
            key={course._id}
          >
            <CourseCard course={course} />
          </div>
        ))}

      </div>

    </div>
  );
}

export default Courses;