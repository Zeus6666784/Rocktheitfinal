import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get("/enrollments/mine").then((res) => setEnrollments(res.data));
  }, []);

  return (
    <div>
      <h2>My Learning</h2>
      <div className="course-grid">
        {enrollments.map((e) => (
          <Link to={`/learn/${e.course.slug}`} key={e._id} className="course-card">
            <img src={e.course.thumbnail || "https://placehold.co/400x225"} alt={e.course.title} />
            <h3>{e.course.title}</h3>
            <p>{e.completed ? "Completed ✅" : `${e.completedLectureIds.length} lectures done`}</p>
          </Link>
        ))}
        {enrollments.length === 0 && <p>You haven't enrolled in any courses yet.</p>}
      </div>
    </div>
  );
}
