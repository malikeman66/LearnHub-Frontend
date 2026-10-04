import React from "react";
import { Link } from "react-router-dom";
import formatCoursePrice from "../services/formatCurrency";

function CourseCard({ course }) {
  return (
    <div className="card h-100 shadow-sm">

      <div className="card-body d-flex flex-column">

        <span className="badge bg-primary align-self-start mb-2">
          {course.category || "General"}
        </span>

        <h5 className="card-title">
          {course.title}
        </h5>

        <p className="card-text text-muted">
          {course.description?.length > 120
            ? course.description.substring(0, 120) + "..."
            : course.description}
        </p>

        <div className="mt-auto mb-3">
          <p className="fw-bold mb-1">
            Free enrollment
          </p>
          <small className="text-muted">
            Demo price only: {formatCoursePrice(course.price)}
          </small>
        </div>

        <Link
          to={`/courses/${course._id}`}
          className="btn btn-primary"
        >
          View Course
        </Link>

      </div>
    </div>
  );
}

export default CourseCard;