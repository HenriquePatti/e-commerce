const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const store = require("../src/store/memoryStore");

describe("US-09 - Rejeitar cadastro com dados inválidos com resposta clara", () => {
  let app;

  before(() => {
    app = createApp();
  });

  beforeEach(() => {
    store._produtos.length = 0;
  });

  const produtoValido = {
    nome: "Cafeteira Expresso",
    preco: 299.9,
    estoque: 12,
    sku: "CAFETEIRA-001",
    categoriaId: "eletronicos",
    descricao: "Cafeteira compacta com filtro e reservatório de 1 litro.",
    imagens: ["https://example.com/cafeteira.jpg"],
  };

  it("retorna vários erros de validação em um único payload inválido", async () => {
    const payload = {
      nome: " ",
      preco: 0,
      estoque: -5,
      sku: "",
      categoriaId: "",
      descricao: " ",
      imagens: [],
    };

    const res = await request(app)
      .post("/api/v1/produtos")
      .send(payload)
      .expect(400);

    expect(res.body).to.have.property("message", "Erro de validação.");
    expect(res.body).to.have.property("errors").that.is.an("object");
    expect(res.body.errors).to.include.keys([
      "nome",
      "preco",
      "estoque",
      "sku",
      "categoriaId",
      "descricao",
      "imagens",
    ]);
    expect(Object.values(res.body.errors)).to.satisfy((values) =>
      values.every((value) => typeof value === "string")
    );
  });

  it("indica erro de tipo quando preco não é numérico", async () => {
    const payload = {
      ...produtoValido,
      sku: "CAFETEIRA-002",
      preco: "duzentos e noventa e nove",
    };

    const res = await request(app)
      .post("/api/v1/produtos")
      .send(payload)
      .expect(400);

    expect(res.body).to.have.property("message", "Erro de validação.");
    expect(res.body).to.have.property("errors").that.is.an("object");
    expect(res.body.errors).to.have.property("preco");
    expect(res.body.errors.preco).to.be.a("string");
    expect(res.body.errors.preco).to.match(/número válido/i);
  });
});
