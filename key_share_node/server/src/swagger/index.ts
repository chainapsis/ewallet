import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import swaggerJSDoc, { type SwaggerDefinition } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { type Express } from "express";

import { schemas } from "./schema";
import { logger } from "@keplr-ewallet-ksn-server/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apis = (function() {
  const ksNodeApi = path.resolve(__dirname, "../routes/**/*.ts");

  const paths = [ksNodeApi];

  return paths;
})();

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Key Share Node API documentation",
    version: "0.0.1",
    description: "Key Share Node API documentation",
  },
  servers: [
    {
      url: "http://localhost:4201",
      description: "Development server",
    },
    {
      url: "http://localhost:4201",
      description: "Production server",
    },
  ],
  tags: [{ name: "Key Share" }, { name: "PG Dump" }],
  components: {
    schemas,
  },
};

export function installSwaggerDocs(app: Express) {
  logger.debug("Serving Swagger docs, apis: %j", apis);

  const options = {
    swaggerDefinition,
    // Path to the API docs (for swagger-jsdoc to parse)
    apis,
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use(
    "/api_docs",
    swaggerUi.serve as any,
    swaggerUi.setup(swaggerSpec) as any,
  );
}
