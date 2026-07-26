import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const apiBase = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "");

  useEffect(() => {
    api.get("/certificates/mine").then((res) => setCerts(res.data));
  }, []);

  return (
    <div>
      <h2>My Certificates</h2>
      <ul className="cert-list">
        {certs.map((c) => (
          <li key={c._id}>
            <span>{c.course?.title}</span>
            <a href={`${apiBase}${c.fileUrl}`} target="_blank" rel="noreferrer">
              Download PDF
            </a>
          </li>
        ))}
        {certs.length === 0 && <p>No certificates yet — finish a course to earn one.</p>}
      </ul>
    </div>
  );
}
