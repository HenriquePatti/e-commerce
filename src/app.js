const express = require("express");
const swaggerUi = require("swagger-ui-express");
const produtosRoutes = require("./routes/produtos.routes");
const { loadOpenApiSpec } = require("./loadOpenApi");

function createApp() {
  const app = express();
  app.use(express.json());

  const openApiSpec = loadOpenApiSpec();

  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "API Cadastro Produtos",
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      service: "API de cadastro de produtos",
      docs: "/api-docs",
      openApiJson: "/openapi.json",
      api: "POST /api/v1/produtos",
    });
  });

  app.use("/api/v1/produtos", produtosRoutes);

  return app;
}

module.exports = { createApp };
