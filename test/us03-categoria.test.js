const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const store = require("../src/store/memoryStore");

describe("US-03 - Associar produto a uma categoria válida", () => {
  let app;

  before(() => {
    app = createApp();
  });

  beforeEach(() => {
    store._produtos.length = 0;
  });

  const produtoBase = {
    nome: "Cadeira Gamer",
    preco: 499.99,
    estoque: 10,
    sku: "CADEIRA-GAMER-001",
    descricao: "Cadeira com apoio ergonômico e revestimento confortável.",
    imagens: ["https://example.com/cadeira.jpg"],
  };

  it("aceita quando a categoria existe", async () => {
    const payload = {
      ...produtoBase,
      categoriaId: "moveis",
    };

    const res = await request(app)
      .post("/api/v1/produtos")
      .send(payload)
      .expect(201);

    expect(res.body).to.have.property("id").that.is.a("string");
    expect(res.body).to.include({
      categoriaId: "moveis",
      nome: payload.nome,
      sku: payload.sku,
    });
  });

  it("rejeita quando a categoria não existe", async () => {
    const payload = {
      ...produtoBase,
      sku: "CADEIRA-GAMER-002",
      categoriaId: "categoria-invalida",
    };

    const res = await request(app)
      .post("/api/v1/produtos")
      .send(payload)
      .expect(400);

    expect(res.body).to.have.property("message", "Erro de validação.");
    expect(res.body).to.have.property("errors").that.is.an("object");
    expect(res.body.errors).to.have.property("categoriaId");
    expect(res.body.errors.categoriaId).to.be.a("string");
    expect(res.body.errors.categoriaId).to.match(/Categoria não encontrada/i);
  });
});
