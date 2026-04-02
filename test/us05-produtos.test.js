const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const memoryStore = require("../src/store/memoryStore");

/**
 * US-05 (historias-usuario-cadastro-produto-v2.md): preço promocional opcional e coerente.
 */
describe("US-05 — Cadastrar preço promocional coerente", () => {
  const PATH = "/api/v1/produtos";

  function corpoBaseValido(overrides = {}) {
    return {
      nome: "Produto Promo",
      preco: 100,
      estoque: 1,
      sku: `sku-us05-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      categoriaId: "eletronicos",
      descricao: "Descrição para teste de preço promocional.",
      imagens: ["https://example.com/imagem.png"],
      ...overrides,
    };
  }

  beforeEach(() => {
    memoryStore._produtos.length = 0;
  });

  describe("Cenário: sem promoção", () => {
    it("aceita cadastro quando precoPromocional é omitido", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      expect(body).to.not.have.property("precoPromocional");

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("id");
      expect(res.body).to.not.have.property("precoPromocional");
    });

    it("aceita cadastro quando precoPromocional é null", async () => {
      const app = createApp();
      const body = corpoBaseValido({ precoPromocional: null });

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("id");
      expect(res.body).to.not.have.property("precoPromocional");
    });
  });

  describe("Cenário: promoção coerente", () => {
    it("aceita preço regular 100 e preço promocional 79,99", async () => {
      const app = createApp();
      const body = corpoBaseValido({
        preco: 100,
        precoPromocional: 79.99,
      });

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.include({ preco: 100, precoPromocional: 79.99 });
    });
  });

  describe("Cenário: promoção maior que o preço regular", () => {
    it("rejeita com erro no campo precoPromocional", async () => {
      const app = createApp();
      const body = corpoBaseValido({
        preco: 100,
        precoPromocional: 100.01,
      });

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body.errors).to.have.property("precoPromocional");
    });
  });
});
