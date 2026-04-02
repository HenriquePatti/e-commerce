const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const memoryStore = require("../src/store/memoryStore");

/**
 * US-01 (historias-usuario-cadastro-produto-v2.md): nome, preço e estoque.
 * A API atual exige campos adicionais para 201; o corpo base cobre isso
 * e os cenários alteram só nome, preço ou estoque conforme o BDD.
 */
describe("US-01 — Cadastrar produto com dados mínimos válidos", () => {
  const PATH = "/api/v1/produtos";

  function corpoBaseValido() {
    return {
      nome: "Produto Válido",
      preco: 0.01,
      estoque: 0,
      sku: `sku-us01-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      categoriaId: "eletronicos",
      descricao: "Descrição mínima para cadastro.",
      imagens: ["https://example.com/imagem.png"],
    };
  }

  beforeEach(() => {
    memoryStore._produtos.length = 0;
  });

  describe("Cenário: cadastro válido", () => {
    it("responde 201 e o corpo contém o produto com id gerado", async () => {
      const app = createApp();
      const body = corpoBaseValido();

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("id").that.is.a("string").and.not.empty;
      expect(res.body).to.include({
        nome: body.nome,
        preco: body.preco,
        estoque: body.estoque,
      });
    });
  });

  describe("Cenário: nome inválido", () => {
    it("responde 400 com erro de validação indicando o campo nome (ausente)", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      delete body.nome;

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body.errors).to.have.property("nome");
    });

    it("responde 400 indicando nome quando o valor é só espaços (após trim vazio)", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), nome: "   " };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("nome");
    });

    it("responde 400 indicando nome quando comprimento < 2 após trim", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), nome: "a" };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("nome");
    });

    it("responde 400 indicando nome quando comprimento > 200", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), nome: "x".repeat(201) };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("nome");
    });
  });

  describe("Cenário: preço ou estoque inválidos", () => {
    it("responde 400 indicando preco quando ausente", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      delete body.preco;

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("preco");
    });

    it("responde 400 indicando preco quando menor que 0,01", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), preco: 0 };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("preco");
    });

    it("responde 400 indicando preco quando não numérico", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), preco: "dez" };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("preco");
    });

    it("responde 400 indicando estoque quando ausente", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      delete body.estoque;

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("estoque");
    });

    it("responde 400 indicando estoque quando não é inteiro", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), estoque: 1.5 };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("estoque");
    });

    it("responde 400 indicando estoque quando negativo", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), estoque: -1 };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body.errors).to.have.property("estoque");
    });
  });
});
