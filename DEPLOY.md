# Deploy to Railway

Single-host deploy: Express serves both the API and the built SPA from `client/dist`. Atlas is the database; videos persist on Railway's ephemeral disk.

## One-time prep

1. **MongoDB Atlas**
   - Allow Railway's outgoing IPs (or, easier: allow `0.0.0.0/0` for the demo and rotate the password at the end).
   - SRV URI looks like `mongodb+srv://USER:PASS@learnify-cluster.1jnlfzf.mongodb.net/learnify?retryWrites=true&w=majority`.
   - The path segment `/learnify` is required — Atlas will otherwise dump collections into the default `admin` DB.

2. **Generate secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # ADMIN_TOKEN
   ```
   These are your `JWT_SECRET` and `ADMIN_TOKEN`. Keep them offline.

3. **First-time seed (run locally or via Railway's one-off shell)**
   ```bash
   cd server && npm install && npm run seed
   ```
   This populates 6 instructors, 6 courses, and 28 lectures. Without it the SPA lands on empty pages.

## Deploy

1. **New Project on Railway → Deploy from GitHub** (or whatever host points at this repo).
2. Railway reads `railway.json`: builder `NIXPACKS`, start command `npm run start`, healthcheck `/api/health`.
3. The root `package.json` `build` script installs `server` deps (with `--omit=dev`) and `client` deps (no omit), then runs `npm --prefix client run build`. Nixpacks runs this automatically.
4. **Variables** in the Railway dashboard — set every value below. Never commit any of these.

| Variable          | Example / notes                                                |
| ----------------- | -------------------------------------------------------------- |
| `NODE_ENV`        | `production`                                                   |
| `MONGODB_URI`     | Atlas SRV string with `/learnify` path segment, see step 1.    |
| `JWT_SECRET`      | Long random string from step 2.                                |
| `JWT_EXPIRES_IN`  | `7d`                                                           |
| `ADMIN_TOKEN`     | Long random string from step 2. Required in production.        |
| `CORS_ORIGINS`    | Your Railway app URL, no trailing slash (e.g. `https://foo.up.railway.app`). No need to include `http://localhost:5173`. |
| `TRUST_PROXY`     | `1`                                                            |

5. **Healthcheck** — Railway pings `/api/health`. The deploy is healthy when that returns `{"success":true,"data":{"ok":true}}`.
6. Visit the Railway URL. You should land on the SPA and the catalogue should load (proves the API + Atlas link).

## After deploy — what to verify

1. Browse to `/`. Hero loads.
2. Browse to `/courses`. Six courses rendered.
3. Open any course detail. The 5-lecture playlist is visible.
4. Hit *Enroll*, navigate to `/learn/:id`. The placeholder MP4 (or your real MP4 if you replaced it) plays.
5. Confirm the security posture:
   - `curl https://<your-app>.up.railway.app/api/admin/videos` returns **401** (no token).
   - `curl -H "X-Admin-Key: <admin_token>" ...` returns **200** with the file list.
6. Watch a lecture to completion → certificate downloads (a PDF rendered in-browser via jspdf).

## Replacing the placeholder MP4s

Pre-recommendation: drop the four files into `server/data/videos/`. On Railway this is ephemeral — every redeploy wipes uploaded files. For a real demo:

- Option A — store videos in Atlas as `Buffer` (small lectures only, fine for a demo).
- Option B — store videos in Cloudflare R2 / Backblaze B2 / S3 and stream them through `/api/videos/:filename` proxying from the bucket (currently the route only reads local disk; would need a small extension).
- Option C — accept that uploads get wiped on redeploy and re-upload after each deploy (tedious; only OK for a one-shot demo).

## Troubleshooting

- **Boot fails with `Missing required env var: ADMIN_TOKEN`.** Set it in Railway Variables and redeploy.
- **Boot fails with `bad auth : authentication failed`.** Your Atlas user/password is wrong, or the IP isn't allowed.
- **`/api/admin/videos` returns 401 when it shouldn't.** Check that the header is `X-Admin-Key` (capital X, capital K), and that `ADMIN_TOKEN` in Railway matches what you're sending.
- **Videos are 404.** Confirm the file exists in `server/data/videos/` at the exact filename you uploaded (filenames are exact, not fuzzy).
- **CORS errors from a custom domain.** Re-set `CORS_ORIGINS` to your custom domain, redeploy.
