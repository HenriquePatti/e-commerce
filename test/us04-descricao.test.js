const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const store = require("../src/store/memoryStore");

const URL = "/api/v1/produtos";

const produtoBase = (descricao) => ({
  nome: "Produto Teste",
  preco: 10.0,
  estoque: 5,
  sku: "SKU-US04",
  categoriaId: "eletronicos",
  descricao,
  imagens: ["https://exemplo.com/img.jpg"],
});

describe("US-04 — Descrição controlada", () => {
  let app;

  before(() => {
    app = createApp();
  });

  beforeEach(() => {
    store._produtos.length = 0;
  });

  it("Cenário 1 — Descrição válida (1–255 chars): deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("Descrição válida"));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("Cenário 2 — Descrição ausente: deve retornar 400 com erro em descricao", async () => {
    const res = await request(app).post(URL).send(produtoBase(undefined));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("descricao");
  });

  it("Cenário 3 — Descrição só espaços: deve retornar 400 com erro em descricao", async () => {
    const res = await request(app).post(URL).send(produtoBase("   "));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("descricao");
  });

  it("Cenário 4 — Descrição no limite mínimo exato (1 char): deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("A"));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("Cenário 5 — Descrição no limite máximo exato (255 chars): deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("A".repeat(255)));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("Cenário 6 — Descrição com 256 chars: deve retornar 400 citando o limite 255", async () => {
    const res = await request(app).post(URL).send(produtoBase("A".repeat(256)));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("descricao");
    expect(res.body.errors.descricao).to.include("255");
  });
});
