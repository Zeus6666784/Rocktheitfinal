# Lecture videos

Drop the downloaded MP4 files here using the filenames listed below. The
seed script (`server/scripts/seed.js`) and the demo catalog
(`client/src/mocks/catalog.js`) reference these exact filenames.

After dropping files in, re-seed so the lecture documents pick up the
new `videoUrl` paths:

```bash
cd server && npm run seed
```

## Required files for the current demo

| Filename                | Used by                                              | Suggested source |
| ----------------------- | ---------------------------------------------------- | ---------------- |
| `demo.mp4`              | All "Deep Focus" lectures + any lecture not yet mapped | Any short demo MP4 — keep under ~30MB so download stays snappy |
| `react-usestate.mp4`    | React Foundations lectures 1, 2, 3                    | `https://www.youtube.com/watch?v=O6P86uwfdR0` (Web Dev Simplified - "Learn useState In 15 Minutes") |
| `react-useeffect.mp4`   | React Foundations lectures 4, 5                      | `https://www.youtube.com/watch?v=0ZJgIjIuY7U` (Web Dev Simplified - "Learn useEffect In 13 Minutes") |
| `deep-work.mp4`         | Deep Focus for Builders lectures 1-4                  | `https://www.youtube.com/watch?v=xJYlhhT7hyE` (Cal Newport - "Core Idea: Deep Work") |

If a filename is missing, the Lecture document will point to a URL that
returns 404 and the player will render an empty state. That's the
intentional "drop the file and re-seed" workflow.

## Recommended yt-dlp command

```bash
yt-dlp -o "react-usestate.%(ext)s" -f "bv*[height<=720]+ba/b" --merge-output-format mp4 "https://www.youtube.com/watch?v=O6P86uwfdR0"
```

`-f "bv*[height<=720]+ba/b"` caps resolution at 720p (keeps file size
reasonable for a demo) and merges the best video + best audio into a
single MP4.