import { useEffect, useState } from 'react';

const emptyCourse = {
  title: '', slug: '', description: '', thumbnail: '', category: '', duration: '', instructorId: '', published: false,
};

export default function CourseEditor({ course, instructors, onCancel, onSave }) {
  const [form, setForm] = useState(emptyCourse);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(course ? {
      title: course.title || '', slug: course.slug || '', description: course.description || '',
      thumbnail: course.thumbnail || '', category: course.category || '', duration: String(course.duration || ''),
      instructorId: course.instructor?.id || '', published: Boolean(course.published),
    } : emptyCourse);
  }, [course]);

  const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try { await onSave({ ...form, duration: Number(form.duration) }, course?.id); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 rounded border bg-surface p-4 md:grid-cols-2">
      <h2 className="md:col-span-2 font-semibold">{course ? 'Edit course' : 'Create course'}</h2>
      <input name="title" value={form.title} onChange={update} placeholder="Title" required className="rounded border px-3 py-2" />
      <input name="slug" value={form.slug} onChange={update} placeholder="Slug" required disabled={Boolean(course)} className="rounded border px-3 py-2 disabled:opacity-60" />
      <input name="category" value={form.category} onChange={update} placeholder="Category" required className="rounded border px-3 py-2" />
      <input name="duration" type="number" min="1" value={form.duration} onChange={update} placeholder="Duration (seconds)" required className="rounded border px-3 py-2" />
      <input name="thumbnail" value={form.thumbnail} onChange={update} placeholder="Thumbnail URL" required className="rounded border px-3 py-2" />
      <select name="instructorId" value={form.instructorId} onChange={update} required className="rounded border px-3 py-2">
        <option value="">Select instructor</option>
        {instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}
      </select>
      <textarea name="description" value={form.description} onChange={update} placeholder="Description" required className="min-h-24 rounded border px-3 py-2 md:col-span-2" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => setForm((previous) => ({ ...previous, published: event.target.checked }))} /> Published</label>
      <div className="flex justify-end gap-2">
        {course && <button type="button" onClick={onCancel} className="rounded border px-3 py-2 text-sm">Cancel</button>}
        <button type="submit" disabled={submitting} className="rounded bg-primary px-3 py-2 text-sm text-white disabled:opacity-50">{submitting ? 'Saving…' : 'Save course'}</button>
      </div>
    </form>
  );
}
