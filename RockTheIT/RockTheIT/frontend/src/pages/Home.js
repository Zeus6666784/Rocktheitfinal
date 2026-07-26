import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/courses", { params: { search } }).then((res) => setCourses(res.data));
  }, [search]);

  return (
    <div>
      <div className="hero">
        <h1>Learn skills that stick.</h1>
        <p>Every course on RockTheIT unlocks step-by-step — no skipping ahead.</p>
        <input
          className="search-input"
          placeholder="Search for anything"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="course-grid">
        {courses.map((c) => (
          <Link to={`/course/${c.slug}`} key={c._id} className="course-card">
            <img src={c.thumbnail || "https://placehold.co/400x225"} alt={c.title} />
            <h3>{c.title}</h3>
            <p className="instructor">{c.instructor?.name}</p>
            <p className="price">{c.price === 0 ? "Free" : `₹${c.price}`}</p>
          </Link>
        ))}
        {courses.length === 0 && <p>No courses found.</p>}
      </div>
    </div>
  );
}
