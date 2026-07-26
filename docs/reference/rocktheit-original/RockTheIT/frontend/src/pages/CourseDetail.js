import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CourseDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/courses/${slug}`).then((res) => setCourse(res.data));
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) return navigate("/login");
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${course._id}/enroll`);
      navigate(`/learn/${slug}`);
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) return <div className="page-loading">Loading...</div>;

  const totalLectures = course.sections.reduce((sum, s) => sum + s.lectures.length, 0);

  return (
    <div className="course-detail">
      <div className="course-detail-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <p className="instructor">By {course.instructor?.name}</p>
        <p>{totalLectures} lectures</p>
        <button className="btn-primary" onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? "Enrolling..." : course.price === 0 ? "Enroll for free" : `Enroll — ₹${course.price}`}
        </button>
      </div>

      <div className="curriculum">
        <h2>Course content</h2>
        {course.sections.map((section, si) => (
          <div key={si} className="curriculum-section">
            <h4>{section.title}</h4>
            <ul>
              {section.lectures.map((lec, li) => (
                <li key={li}>
                  🔒 {lec.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
