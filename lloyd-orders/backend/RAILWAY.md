# Railway Backend Setup

Service root directory:

```text
lloyd-orders/backend
```

Commands:

```text
Build: npm install && npm run build
Start: npm start
Health check: /health
```

Variables:

```text
DATABASE_PATH=/data/lloyd-orders.sqlite
FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
```

Volume:

```text
Mount path: /data
```

Public Networking:

Generate a Railway domain and use it as `NEXT_PUBLIC_BACKEND_URL` in Vercel and `BACKEND_URL` in the print agent.
