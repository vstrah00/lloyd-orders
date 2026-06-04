# Lloyd Orders

Simple waiter ordering system for a beach bar.

## Apps

- `frontend`: Next.js 15 waiter interface and bar dashboard
- `backend`: Express, Socket.IO, and SQLite API
- `print-agent`: Windows print agent that listens for new orders

## Local setup

Install and run each app in a separate terminal.

### Backend

```bash
cd lloyd-orders/backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

The backend dev command compiles TypeScript first, then runs plain Node. Restart it after code changes.

### Frontend

```bash
cd lloyd-orders/frontend
npm install
npm run dev
```

Open:

- Waiter: `http://localhost:3000/waiter`
- Bar: `http://localhost:3000/bar`
- Products admin: `http://localhost:3000/admin/products`

### Print agent

```bash
cd lloyd-orders/print-agent
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `PRINTER_NAME` for the Windows receipt printer.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The print agent dev command compiles TypeScript first, then runs plain Node. Restart it after code changes.

The print agent uses short polling instead of a permanent WebSocket. By default it checks for unprinted orders every 5 seconds:

```text
PRINT_POLL_INTERVAL_MS=5000
```

Increase this value to reduce backend activity, or lower it for faster printing.

## Deployment

Recommended low-cost setup:

- Frontend: Vercel Hobby
- Backend: Railway Free/Trial with a small volume
- Print agent: Windows laptop at the bar

### Backend on Railway

Create a Railway service from this GitHub repository and set the root directory to:

```text
lloyd-orders/backend
```

Use:

```text
Build command: npm install && npm run build
Start command: npm start
Health check path: /health
```

Add a Railway volume mounted at:

```text
/data
```

Set backend variables:

```text
DATABASE_PATH=/data/lloyd-orders.sqlite
FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000
```

Generate a public Railway domain for the backend.

### Frontend on Vercel

Create a Vercel project from this GitHub repository and set the root directory to:

```text
lloyd-orders/frontend
```

Set frontend variable:

```text
NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend.up.railway.app
```

Deploy, then copy the Vercel domain back into Railway's `FRONTEND_ORIGINS`.

### Print agent in production

On the Windows laptop connected to the receipt printer, set:

```text
BACKEND_URL=https://your-railway-backend.up.railway.app
PRINTER_NAME=Your Exact Windows Printer Name
PRINT_POLL_INTERVAL_MS=10000
SUMATRA_PDF_PATH=C:\Users\kompj\AppData\Local\SumatraPDF\SumatraPDF.exe
```

Then run:

```bash
cd lloyd-orders/print-agent
npm run dev
```

Stop the print agent after closing to keep backend usage low.

For easier daily use on Windows, double-click:

```text
lloyd-orders/print-agent/lloyd-print-control.bat
```

The control app lets you:

- save backend/printer/SumatraPDF settings
- start the print agent
- stop the print agent
- run a test print
- open agent logs

Use this instead of asking bar staff to run terminal commands.

## Phone testing

When testing from phones on the same Wi-Fi, use the laptop IP address instead of `localhost`.

Example:

```text
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.20:4000
```

## MVP scope

This phase only supports:

- table selection
- product quantity selection
- order sending
- real-time bar dashboard
- completion status
- automatic receipt printing
- SQLite order storage
- SQLite product storage
- product admin page

No payments, fiscalization, inventory, accounts, roles, reports, analytics, or multi-location support.
