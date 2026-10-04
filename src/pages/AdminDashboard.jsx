import React from "react";
import { useEffect, useState } from "react";

import api from "../services/api";
import formatCoursePrice from "../services/formatCurrency";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0
  });

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [
        analyticsResponse,
        usersResponse,
        coursesResponse
      ] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users"),
        api.get("/courses")
      ]);

      setStats(analyticsResponse.data);
      setUsers(usersResponse.data);
      setCourses(coursesResponse.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, {
        role
      });

      loadData();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update role."
      );
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);

      loadData();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete user."
      );
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);

      loadData();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete course."
      );
    }
  };

  return (
    <div className="container py-5">

      <div className="mb-4">

        <h1 className="fw-bold">
          Admin Dashboard
        </h1>

        <p className="text-muted">
          Manage users, courses and LMS analytics.
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
      ) : (
        <>
          {/* ANALYTICS */}

          <div className="row g-4 mb-5">

            <div className="col-md-4">

              <div className="stat-card">

                <h6>Total Users</h6>

                <h2>
                  {stats.users}
                </h2>

              </div>

            </div>

            <div className="col-md-4">

              <div className="stat-card">

                <h6>Total Courses</h6>

                <h2>
                  {stats.courses}
                </h2>

              </div>

            </div>

            <div className="col-md-4">

              <div className="stat-card">

                <h6>Total Enrollments</h6>

                <h2>
                  {stats.enrollments}
                </h2>

              </div>

            </div>

          </div>

          {/* USERS */}

          <div className="card shadow-sm mb-5">

            <div className="card-body">

              <h4 className="fw-bold mb-3">
                Manage Users
              </h4>

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {users.map((user) => (

                      <tr key={user._id}>

                        <td>
                          {user.name}
                        </td>

                        <td>
                          {user.email}
                        </td>

                        <td>

                          <select
                            className="form-select form-select-sm"
                            value={user.role}
                            onChange={(e) =>
                              updateRole(
                                user._id,
                                e.target.value
                              )
                            }
                          >

                            <option value="Student">
                              Student
                            </option>

                            <option value="Instructor">
                              Instructor
                            </option>

                            <option value="Admin">
                              Admin
                            </option>

                          </select>

                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              deleteUser(user._id)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* COURSES */}

          <div className="card shadow-sm">

            <div className="card-body">

              <h4 className="fw-bold mb-3">
                Manage Courses
              </h4>

              <div className="table-responsive">

                <table className="table table-hover">

                  <thead>

                    <tr>
                      <th>Course</th>
                      <th>Category</th>
                      <th>Instructor</th>
                      <th>Price (PKR)</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {courses.map((course) => (

                      <tr key={course._id}>

                        <td>
                          {course.title}
                        </td>

                        <td>
                          {course.category}
                        </td>

                        <td>
                          {course.instructor?.name || "N/A"}
                        </td>

                        <td>
                          {formatCoursePrice(course.price)}
                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              deleteCourse(course._id)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default AdminDashboard;