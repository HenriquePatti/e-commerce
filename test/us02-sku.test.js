const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const store = require("../src/store/memoryStore");

const URL = "/api/v1/produtos";

const produtoBase = (sku) => ({
  nome: "Produto Teste",
  preco: 10.0,
  estoque: 5,
  sku,
  categoriaId: "eletronicos",
  descricao: "Descrição válida",
  imagens: ["https://exemplo.com/img.jpg"],
});

describe("US-02 — SKU único", () => {
  let app;

  before(() => {
    app = createApp();
  });

  beforeEach(() => {
    store._produtos.length = 0;
  });

  it("Cenário 1 — SKU válido e novo: deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("SKU-NOVO-001"));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body.sku).to.equal("SKU-NOVO-001");
  });

  it("Cenário 2 — SKU duplicado: deve retornar 409 com erro no campo sku", async () => {
    await request(app).post(URL).send(produtoBase("SKU-DUP-001"));
    const res = await request(app).post(URL).send(produtoBase("SKU-DUP-001"));
    expect(res.status).to.equal(409);
    expect(res.body.errors).to.have.property("sku");
  });
});
