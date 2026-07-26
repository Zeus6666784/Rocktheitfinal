# Lecture videos

This folder is the video storage. It is **NOT publicly served** - the
SPA streams videos through the token-gated `/api/videos/:filename`
route. Files live here between admin uploads; if you redeploy the
server (Railway, Render, etc.) without a persistent volume, uploaded
files are wiped - the four placeholder files committed to the repo get
back in their place automatically.

## Required files for the current demo

| Filename                  | Used by                                              | Status      |
| ------------------------- | ---------------------------------------------------- | ----------- |
| `demo.mp4`                | Other courses' lectures                              | Placeholder |
| `react-usestate.mp4`      | React Foundations lectures 1, 2, 3                    | Placeholder |
| `react-useeffect.mp4`     | React Foundations lectures 4, 5                      | Placeholder |
| `deep-work.mp4`           | Deep Focus for Builders lectures 1-4                  | Placeholder |

## Replacing a placeholder

Once you have a real MP4 (downloaded with yt-dlp, see below), drop it
into this folder with the same filename. You DON'T need to re-seed -
the Lecture documents still point at the unchanged URL `/api/videos/<filename>`,
and the serving route reads whatever file is in the directory.

For an even cleaner flow use the admin upload route at
`POST /api/admin/videos` with `X-Admin-Key: <ADMIN_TOKEN>` and form-data
`file=<mp4>` + `filename=<slug>`.

## yt-dlp command

```bash
yt-dlp -o "react-usestate.%(ext)s" \
  -f "bv*[height<=720]+ba/b" \
  --merge-output-format mp4 \
  "https://www.youtube.com/watch?v=O6P86uwfdR0"
```

`-f "bv*[height<=720]+ba/b"` caps resolution at 720p (keeps the file
small for a demo) and merges the best video + best audio into a
single MP4.
