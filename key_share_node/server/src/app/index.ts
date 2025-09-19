import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import { installSwaggerDocs } from "@keplr-ewallet-ksn-server/swagger";
import { setRoutes } from "@keplr-ewallet-ksn-server/routes";
import { rateLimitMiddleware } from "@keplr-ewallet-ksn-server/middlewares";

export function makeApp() {
  const app = express();

  app.use(morgan("dev"));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(cors());
  app.use(express.json());

  app.use(
    rateLimitMiddleware({
      windowSeconds: 60,
      maxRequests: 100,
    }),
  );

  app.get<{}, string>("/", async (req, res) => {
    try {
      const db = req.app.locals.db;
      if (!db) {
        res.status(500).send("Error");
        return;
      }

      await db.query("SELECT 1");
      res.send("Ok");
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).send("Error");
    }
  });

  setRoutes(app);

  installSwaggerDocs(app);

  return app;
}
