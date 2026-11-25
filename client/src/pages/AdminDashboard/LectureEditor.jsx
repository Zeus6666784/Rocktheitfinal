import { useEffect, useState } from 'react';

const emptyLecture = { courseId: '', title: '', videoUrl: '', duration: '', order: '', locked: false };

export default function LectureEditor({ lecture, courses, onCancel, onSave }) {
  const [form, setForm] = useState(emptyLecture);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(lecture ? {
      courseId: lecture.courseId || '', title: lecture.title || '', videoUrl: lecture.videoUrl || '',
      duration: String(lecture.duration || ''), order: String(lecture.order || ''), locked: Boolean(lecture.locked),
    } : emptyLecture);
  }, [lecture]);

  const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try { await onSave({ ...form, duration: Number(form.duration), order: Number(form.order) }, lecture?.id); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded border bg-surface p-4 md:grid-cols-2">
      <h2 className="md:col-span-2 font-semibold">{lecture ? 'Edit lecture' : 'Create lecture'}</h2>
      <select name="courseId" value={form.courseId} onChange={update} required disabled={Boolean(lecture)} className="rounded border px-3 py-2 disabled:opacity-60">
        <option value="">Select course</option>
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <input name="title" value={form.title} onChange={update} placeholder="Title" required className="rounded border px-3 py-2" />
      <input name="videoUrl" value={form.videoUrl} onChange={update} placeholder="Video URL" required className="rounded border px-3 py-2" />
      <input name="duration" type="number" min="1" value={form.duration} onChange={update} placeholder="Duration (seconds)" required className="rounded border px-3 py-2" />
      <input name="order" type="number" min="1" value={form.order} onChange={update} placeholder="Order" required className="rounded border px-3 py-2" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.locked} onChange={(event) => setForm((previous) => ({ ...previous, locked: event.target.checked }))} /> Locked</label>
      <div className="flex justify-end gap-2">
        {lecture && <button type="button" onClick={onCancel} className="rounded border px-3 py-2 text-sm">Cancel</button>}
        <button type="submit" disabled={submitting} className="rounded bg-primary px-3 py-2 text-sm text-white disabled:opacity-50">{submitting ? 'Saving…' : 'Save lecture'}</button>
      </div>
    </form>
  );
}
