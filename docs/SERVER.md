# Server guide

The Express server is in `server/`. It exposes the `/api` application, serves
the built client in production, and uses MongoDB through Mongoose.

## Local server commands

```bash
cd server
npm run dev
npm test
npm run seed
```

The service defaults to port `5000`. `GET /api/health` returns the health
response without requiring database access.

## Current server behaviour

- Authentication is JWT-based and checks the database user for every protected
  request.
- Admin routes require an authenticated database role of `admin`.
- Course progress and certificate access require course enrolment.
- Managed video playback is authorized through `GET /api/lectures/:id/video`.
- See [API.md](API.md), [DATABASE.md](DATABASE.md), and
  [SECURITY.md](SECURITY.md) for detailed contracts.
