import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { categoriesRouter } from "./routes/categories.js";
import { createOrdersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";
import { waitersRouter } from "./routes/waiters.js";
import { registerSocketHandlers } from "./socket/index.js";

const port = Number(process.env.PORT ?? 4000);
const frontendOrigins = (process.env.FRONTEND_ORIGINS ?? process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string) {
  if (!origin || frontendOrigins.includes("*")) {
    return true;
  }

  return frontendOrigins.includes(origin);
}

const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    callback(null, isAllowedOrigin(origin));
  }
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: frontendOrigins.includes("*") ? "*" : frontendOrigins,
    methods: ["GET", "POST", "PATCH"]
  }
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/orders", createOrdersRouter(io));
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/waiters", waitersRouter);

registerSocketHandlers(io);

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Lloyd Orders backend running on http://localhost:${port}`);
});
