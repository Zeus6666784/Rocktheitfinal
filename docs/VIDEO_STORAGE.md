# Video storage and access

Managed uploads are stored in `server/data/videos/`. This directory must be on
persistent storage in production; ephemeral deployment filesystems will lose
uploads on redeploy.

- Administrators upload and list managed videos through `/api/admin/videos`.
- Administrators open managed files through authenticated `/api/videos/:filename`.
- Enrolled learners stream a lecture's managed video through
  `/api/lectures/:id/video`, including HTTP range requests.
- Only `demo.mp4` is intentionally public for the product walkthrough.

The server validates extensions, MIME type, filename characters, size, and
path containment. Do not publish managed filenames through a public static
directory.
