import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
// import { config as dotenvConfig } from "dotenv";

import { installSwaggerDocs } from "@keplr-ewallet-ksn-server/swagger";
import { setRoutes } from "@keplr-ewallet-ksn-server/routes";
import { rateLimitMiddleware } from "@keplr-ewallet-ksn-server/middlewares";

// dotenvConfig();

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

  app.get<{}, string>("/", (_, res) => {
    res.send("Ok");
  });

  setRoutes(app);

  installSwaggerDocs(app);

  return app;
}
