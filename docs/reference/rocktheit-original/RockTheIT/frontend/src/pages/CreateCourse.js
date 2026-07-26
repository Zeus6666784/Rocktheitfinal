import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const emptyLecture = () => ({ title: "", videoUrl: "", durationSeconds: 0 });
const emptySection = () => ({ title: "", lectures: [emptyLecture()] });

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    category: "General",
  });
  const [sections, setSections] = useState([emptySection()]);
  const [error, setError] = useState("");

  const updateSection = (i, field, value) => {
    const next = [...sections];
    next[i][field] = value;
    setSections(next);
  };

  const updateLecture = (si, li, field, value) => {
    const next = [...sections];
    next[si].lectures[li][field] = value;
    setSections(next);
  };

  const addSection = () => setSections([...sections, emptySection()]);
  const addLecture = (si) => {
    const next = [...sections];
    next[si].lectures.push(emptyLecture());
    setSections(next);
  };

  const submit = async (e, publish) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/courses", { ...form, sections });
      if (publish) {
        await api.put(`/courses/${res.data._id}`, { published: true });
      }
      navigate("/instructor");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  return (
    <div className="create-course-form">
      <h2>Create a new course</h2>
      {error && <p className="error">{error}</p>}
      <form>
        <input placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <input type="number" placeholder="Price (₹, 0 for free)" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

        <h3>Curriculum</h3>
        {sections.map((section, si) => (
          <div key={si} className="section-builder">
            <input
              placeholder={`Section ${si + 1} title`}
              value={section.title}
              onChange={(e) => updateSection(si, "title", e.target.value)}
            />
            {section.lectures.map((lec, li) => (
              <div key={li} className="lecture-builder">
                <input
                  placeholder="Lecture title"
                  value={lec.title}
                  onChange={(e) => updateLecture(si, li, "title", e.target.value)}
                />
                <input
                  placeholder="Video URL (hosted mp4 / cloud link)"
                  value={lec.videoUrl}
                  onChange={(e) => updateLecture(si, li, "videoUrl", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={lec.durationSeconds}
                  onChange={(e) => updateLecture(si, li, "durationSeconds", Number(e.target.value))}
                />
              </div>
            ))}
            <button type="button" className="btn-outline" onClick={() => addLecture(si)}>+ Add lecture</button>
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={addSection}>+ Add section</button>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={(e) => submit(e, false)}>Save as draft</button>
          <button type="button" className="btn-primary" onClick={(e) => submit(e, true)}>Publish course</button>
        </div>
      </form>
    </div>
  );
}
