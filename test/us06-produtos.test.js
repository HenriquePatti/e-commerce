const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const memoryStore = require("../src/store/memoryStore");

/**
 * US-06 (historias-usuario-cadastro-produto-v2.md): imagens com URLs http/https válidas.
 */
describe("US-06 — Anexar imagens com URLs válidas", () => {
  const PATH = "/api/v1/produtos";

  function corpoBaseValido(overrides = {}) {
    return {
      nome: "Produto Imagens",
      preco: 10,
      estoque: 1,
      sku: `sku-us06-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      categoriaId: "eletronicos",
      descricao: "Descrição para teste de imagens do produto.",
      imagens: ["https://example.com/a.png"],
      ...overrides,
    };
  }

  function urlsHttpsValidas(n) {
    return Array.from({ length: n }, (_, i) => `https://example.com/img-${i}.png`);
  }

  beforeEach(() => {
    memoryStore._produtos.length = 0;
  });

  describe("Cenário: uma a cinco URLs válidas", () => {
    it("aceita cadastro com uma URL https válida", async () => {
      const app = createApp();
      const imagens = ["https://cdn.example.com/produto/1.jpg"];
      const body = corpoBaseValido({ imagens });

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body.imagens).to.deep.equal(imagens);
    });

    it("aceita cadastro com cinco URLs https válidas", async () => {
      const app = createApp();
      const imagens = urlsHttpsValidas(5);
      const body = corpoBaseValido({ imagens });

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body.imagens).to.deep.equal(imagens);
    });

    it("aceita URL com esquema http (critério http ou https)", async () => {
      const app = createApp();
      const imagens = ["http://example.org/foto.png"];
      const body = corpoBaseValido({ imagens });

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body.imagens).to.deep.equal(imagens);
    });
  });

  describe("Cenário: nenhuma imagem", () => {
    it("rejeita quando imagens está ausente", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      delete body.imagens;

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("imagens");
      expect(res.body.errors.imagens).to.match(/pelo menos uma|máximo 5/i);
    });

    it("rejeita quando a lista de imagens está vazia", async () => {
      const app = createApp();
      const body = corpoBaseValido({ imagens: [] });

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("imagens");
    });
  });

  describe("Cenário: mais de cinco imagens", () => {
    it("rejeita com erro citando o limite de 5", async () => {
      const app = createApp();
      const body = corpoBaseValido({ imagens: urlsHttpsValidas(6) });

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("imagens");
      expect(res.body.errors.imagens).to.include("5");
    });
  });

  describe("Critério: URL vazia ou malformada no campo imagens", () => {
    it("rejeita quando uma entrada da lista não é URL http/https válida", async () => {
      const app = createApp();
      const body = corpoBaseValido({
        imagens: ["https://example.com/ok.png", "ftp://bad.example/file"],
      });

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("imagens");
      expect(res.body.errors.imagens).to.match(/http|https|índice/i);
    });
  });
});
