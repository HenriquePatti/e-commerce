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

  it("Cenário 3 — SKU ausente: deve retornar 400 com erro em sku", async () => {
    const res = await request(app).post(URL).send(produtoBase(undefined));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("sku");
  });

  it("Cenário 4 — SKU só espaços: deve retornar 400 com erro em sku", async () => {
    const res = await request(app).post(URL).send(produtoBase("   "));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("sku");
  });

  it("Cenário 5 — SKU abaixo do mínimo (2 chars): deve retornar 400 com erro em sku", async () => {
    const res = await request(app).post(URL).send(produtoBase("AB"));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("sku");
  });

  it("Cenário 6 — SKU no limite mínimo exato (3 chars): deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("ABC"));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("Cenário 7 — SKU no limite máximo exato (50 chars): deve retornar 201", async () => {
    const res = await request(app).post(URL).send(produtoBase("A".repeat(50)));
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
  });

  it("Cenário 8 — SKU acima do máximo (51 chars): deve retornar 400 com erro em sku", async () => {
    const res = await request(app).post(URL).send(produtoBase("A".repeat(51)));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("sku");
  });

  it("Cenário 9 — SKU com caracteres inválidos: deve retornar 400 com erro em sku", async () => {
    const res = await request(app).post(URL).send(produtoBase("SKU@#!"));
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.have.property("sku");
  });
});
