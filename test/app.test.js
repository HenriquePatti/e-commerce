const http = require("http");
const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");

const BASE_URL = "http://localhost:3000";

describe("GET /", () => {
  let server;

  before((done) => {
    const app = createApp();
    server = http.createServer(app);
    server.listen(3000, done);
  });

  after((done) => {
    server.close(done);
  });

  it("responde na base_url http://localhost:3000 com metadados da API", async () => {
    const res = await request(BASE_URL).get("/").expect(200);
    expect(res.body).to.have.property("service", "API de cadastro de produtos");
    expect(res.body.docs).to.equal("/api-docs");
    expect(res.body.openApiJson).to.equal("/openapi.json");
  });
});
