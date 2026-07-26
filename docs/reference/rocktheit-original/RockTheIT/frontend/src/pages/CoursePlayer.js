import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

// Enforces: (1) only the currently-unlocked lecture is playable, (2) users
// cannot scrub/seek past what they've actually watched, (3) a lecture only
// becomes "complete" (and the next one unlocks) once ~95% of it was watched,
// verified server-side, not just trusted from the player.
export default function CoursePlayer() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const lastReportedRef = useRef(0);

  const loadAll = useCallback(async () => {
    const courseRes = await api.get(`/courses/${slug}`);
    setCourse(courseRes.data);
    const progressRes = await api.get(`/enrollments/${courseRes.data._id}/progress`);
    setProgress(progressRes.data);

    const firstUnwatched = progressRes.data.lectures.find((l) => l.unlocked && !l.completed);
    const fallback = progressRes.data.lectures.find((l) => l.unlocked);
    setActiveLectureId((firstUnwatched || fallback || progressRes.data.lectures[0])?._id);
  }, [slug]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const activeLecture = progress?.lectures.find((l) => l._id === activeLectureId);

  // Block seeking forward beyond what the server has recorded as watched.
  const handleSeeking = (e) => {
    const video = e.target;
    const maxAllowed = (progress?.maxWatchedSeconds || 0) + 5;
    if (video.currentTime > maxAllowed) {
      video.currentTime = maxAllowed;
      setMessage("You can't skip ahead — finish watching to unlock the rest.");
    }
  };

  // Periodically report watch progress to the server (every ~4 seconds of playback).
  const handleTimeUpdate = async (e) => {
    const current = e.target.currentTime;
    if (current - lastReportedRef.current < 4) return;
    lastReportedRef.current = current;
    try {
      const res = await api.post(`/enrollments/${course._id}/watch-time`, {
        lectureId: activeLectureId,
        currentSeconds: current,
      });
      if (!res.data.accepted && videoRef.current) {
        videoRef.current.currentTime = res.data.maxWatchedSeconds;
        setMessage(res.data.message);
      }
    } catch (err) {
      // non-fatal; ignore transient network errors during playback
    }
  };

  const handleEnded = async () => {
    try {
      const res = await api.post(`/enrollments/${course._id}/complete-lecture`, {
        lectureId: activeLectureId,
      });
      setMessage(res.data.message || "Lecture completed! Next one unlocked.");
      const progressRes = await api.get(`/enrollments/${course._id}/progress`);
      setProgress(progressRes.data);
      const next = progressRes.data.lectures.find((l) => l.unlocked && !l.completed);
      if (next) setActiveLectureId(next._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not mark lecture complete.");
    }
  };

  const claimCertificate = async () => {
    const res = await api.post(`/certificates/${course._id}/claim`);
    setMessage(res.data.message);
  };

  if (!course || !progress) return <div className="page-loading">Loading...</div>;

  return (
    <div className="player-layout">
      <div className="player-main">
        <h2>{activeLecture?.title || "Select a lecture"}</h2>
        {activeLecture?.videoUrl ? (
          <video
            key={activeLecture._id}
            ref={videoRef}
            src={activeLecture.videoUrl}
            controls
            controlsList="nodownload"
            onSeeking={handleSeeking}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={{ width: "100%", maxHeight: "480px", background: "#000" }}
          />
        ) : (
          <p>This lecture is locked. Complete the previous one first.</p>
        )}
        {message && <p className="notice">{message}</p>}

        {progress.allCompleted && (
          <div className="certificate-box">
            <p>🎉 You've completed every lecture in this course!</p>
            <button className="btn-primary" onClick={claimCertificate}>
              {progress.certificateIssued ? "View certificate" : "Claim your certificate"}
            </button>
          </div>
        )}
      </div>

      <div className="player-sidebar">
        <h4>{progress.completedCount}/{progress.totalLectures} completed</h4>
        <ul>
          {progress.lectures.map((lec) => (
            <li
              key={lec._id}
              className={`lecture-item ${lec._id === activeLectureId ? "active" : ""} ${
                !lec.unlocked ? "locked" : ""
              }`}
              onClick={() => lec.unlocked && setActiveLectureId(lec._id)}
            >
              {lec.completed ? "✅" : lec.unlocked ? "▶️" : "🔒"} {lec.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
