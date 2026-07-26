import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/courses/mine").then((res) => setCourses(res.data));
  }, []);

  return (
    <div>
      <div className="flex-between">
        <h2>Your Courses</h2>
        <Link to="/instructor/create" className="btn-primary">+ New course</Link>
      </div>
      <ul className="cert-list">
        {courses.map((c) => (
          <li key={c._id}>
            <span>{c.title} {c.published ? "(Published)" : "(Draft)"}</span>
            <span>{c.sections.reduce((s, sec) => s + sec.lectures.length, 0)} lectures</span>
          </li>
        ))}
        {courses.length === 0 && <p>You haven't created any courses yet.</p>}
      </ul>
    </div>
  );
}
