import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import executeRoutes from "./routes/executeRoute.js";
import problemsRoutes from "./routes/problemsRoute.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL || true, credentials: true }));
app.use(clerkMiddleware()); // adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/problems", problemsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", msg: "api is up and running" });
});




const startServer = () => {
  app.listen(ENV.PORT, () => {
    console.log("Server is running on port:", ENV.PORT);
    connectDB();
  });
};

startServer();
