# Client guide

The React/Vite client is in `client/`. It uses React Router, Tailwind, Axios,
and route-level lazy loading.

```bash
cd client
npm run dev
npm run build
```

Routes include catalogue browsing, course detail, protected learning,
registration/sign-in, and the administrator dashboard. API calls are made by
`src/services/`; user state is verified through `UserContext` session
hydration. Managed video is fetched as an authenticated blob before playback.

Use [UI_STYLE.md](UI_STYLE.md) and [COMPONENT_CONTRACT.md](COMPONENT_CONTRACT.md)
when editing presentation components.
