# Lecture videos

Drop the downloaded MP4 files here using the filenames listed below. The
seed script (`server/scripts/seed.js`) and the demo catalog
(`client/src/mocks/catalog.js`) reference these exact filenames.

After dropping files in, re-seed so the lecture documents pick up the
new `videoUrl` paths:

```bash
cd server && npm run seed
```

## Demo placeholders

To make the demo playable before you download anything, four small
placeholder MP4s were generated with ffmpeg and committed. They are
obvious test patterns (5 seconds, dark purple background, white text
with the file's purpose). Replace them whenever you want.

| Filename                  | Used by                                              | Status    |
| ------------------------- | ---------------------------------------------------- | --------- |
| `demo.mp4`                | Other courses' lectures                              | Placeholder |
| `react-usestate.mp4`      | React Foundations lectures 1, 2, 3                    | Placeholder |
| `react-useeffect.mp4`     | React Foundations lectures 4, 5                      | Placeholder |
| `deep-work.mp4`           | Deep Focus for Builders lectures 1-4                  | Placeholder |

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