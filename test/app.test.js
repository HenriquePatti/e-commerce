const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");

describe("GET /", () => {
  it("responde com metadados da API", async () => {
    const res = await request(createApp()).get("/").expect(200);

    expect(res.body).to.have.property("service", "API de cadastro de produtos");
    expect(res.body.docs).to.equal("/api-docs");
    expect(res.body.openApiJson).to.equal("/openapi.json");
  });
});
