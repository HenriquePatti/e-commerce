const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function loadOpenApiSpec() {
  const filePath = path.join(__dirname, "docs", "openapi.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw);
}

module.exports = { loadOpenApiSpec };
