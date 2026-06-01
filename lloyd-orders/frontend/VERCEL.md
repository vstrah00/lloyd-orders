# Vercel Frontend Setup

Project root directory:

```text
lloyd-orders/frontend
```

Environment variable:

```text
NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend.up.railway.app
```

After deploying, copy the Vercel production URL into the Railway backend variable:

```text
FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
```
