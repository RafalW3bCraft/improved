import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { applyMigrations } from "./db-migrations";
import { logSystemEvent } from "./db";
import { initializeCurriculum } from "./services/curriculum";
import { curriculumRouter } from "./curriculum-routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Apply database migrations
  try {
    log("Applying database migrations...");
    const migrationResult = await applyMigrations();
    log(`Migrations result: ${migrationResult.success ? "success" : "failed"} - ${migrationResult.message}`);
    
    // Initialize curriculum data if needed
    try {
      log("Initializing curriculum data...");
      await initializeCurriculum();
      log("Curriculum initialization complete");
    } catch (curriculumError) {
      log(`Curriculum initialization error: ${curriculumError instanceof Error ? curriculumError.message : String(curriculumError)}`);
      await logSystemEvent('error', `Curriculum initialization error: ${curriculumError instanceof Error ? curriculumError.message : String(curriculumError)}`);
    }
  } catch (error) {
    log(`Migration error: ${error instanceof Error ? error.message : String(error)}`);
    await logSystemEvent('error', `Migration error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Register curriculum routes
  app.use('/api/curriculum', curriculumRouter);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
