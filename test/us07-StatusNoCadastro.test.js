const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const memoryStore = require("../src/store/memoryStore");

/**
 * US-07 (historias-usuario-cadastro-produto-v2.md): Definir status do produto no cadastro
 * 
 * **Como** administrador do catálogo  
 * **Eu quero** definir se o produto nasce ativo, rascunho ou inativo  
 * **Para que** eu controle a publicação sem apagar dados
 * 
 * Critérios de aceite:
 * - Status aceita apenas: `rascunho`, `ativo`, `inativo`
 * - Valores fora do conjunto são rejeitados.
 * - Se status não for informado, o padrão é `rascunho`.
 */
describe("US-07 — Definir status do produto no cadastro", () => {
  const PATH = "/api/v1/produtos";

  function corpoBaseValido() {
    return {
      nome: "Produto com Status",
      preco: 25.99,
      estoque: 10,
      sku: `sku-us07-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      categoriaId: "eletronicos",
      descricao: "Produto para testar definição de status.",
      imagens: ["https://example.com/imagem.png"],
    };
  }

  beforeEach(() => {
    memoryStore._produtos.length = 0;
  });

  describe("Cenário: Status explícito válido", () => {
    it("deve salvar com status 'rascunho' quando enviado explicitamente", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "rascunho" };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "rascunho");
    });

    it("deve salvar com status 'ativo' quando enviado explicitamente", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "ativo" };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "ativo");
    });

    it("deve salvar com status 'inativo' quando enviado explicitamente", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "inativo" };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "inativo");
    });
  });

  describe("Cenário: Status omitido", () => {
    it("deve salvar com status padrão 'rascunho' quando o campo não é enviado", async () => {
      const app = createApp();
      const body = corpoBaseValido();
      // não incluir status

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "rascunho");
    });

    it("deve salvar com status padrão 'rascunho' quando status é null", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: null };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "rascunho");
    });

    it("deve salvar com status padrão 'rascunho' quando status é string vazia", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "" };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.have.property("status", "rascunho");
    });
  });

  describe("Cenário: Status inválido", () => {
    it("deve retornar 400 com erro de validação quando status é 'publicado' (inválido)", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "publicado" };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body).to.have.property("errors");
      expect(res.body.errors).to.have.property("status");
      expect(res.body.errors.status).to.include("deve ser um dos valores: rascunho, ativo, inativo");
    });

    it("deve retornar 400 com erro de validação quando status é 'cancelado' (inválido)", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "cancelado" };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body.errors).to.have.property("status");
    });

    it("deve retornar 400 com erro de validação quando status é um número (inválido)", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: 1 };

      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body.errors).to.have.property("status");
    });

    it("deve retornar 400 com erro de validação quando status é apenas espaços (inválido)", async () => {
      const app = createApp();
      const body = { ...corpoBaseValido(), status: "   " };

      // Uma string com apenas espaços não é vazia (não é "") e não é um valor válido
      const res = await request(app).post(PATH).send(body).expect(400);

      expect(res.body).to.have.property("message", "Erro de validação.");
      expect(res.body.errors).to.have.property("status");
    });

    it("deve retornar 400 com erro quando status está fora do conjunto permitido", async () => {
      const app = createApp();
      const invalidos = ["deletado", "suspenso", "pausado", "temporario"];

      for (const statusInvalido of invalidos) {
        const body = { ...corpoBaseValido(), status: statusInvalido };
        const res = await request(app).post(PATH).send(body).expect(400);

        expect(res.body.errors).to.have.property("status");
      }
    });
  });

  describe("Integração: Status com outros campos", () => {
    it("deve permitir alterar nome e status independentemente", async () => {
      const app = createApp();
      const body1 = { ...corpoBaseValido(), status: "ativo" };
      const res1 = await request(app).post(PATH).send(body1).expect(201);
      expect(res1.body.status).to.equal("ativo");

      const body2 = { ...corpoBaseValido(), nome: "Outro Produto", status: "inativo" };
      const res2 = await request(app).post(PATH).send(body2).expect(201);
      expect(res2.body.status).to.equal("inativo");
    });

    it("deve manter status ao enviar produto com status e outros campos válidos", async () => {
      const app = createApp();
      const body = {
        ...corpoBaseValido(),
        status: "ativo",
        preco: 99.99,
        estoque: 5,
      };

      const res = await request(app).post(PATH).send(body).expect(201);

      expect(res.body).to.include({
        status: "ativo",
        preco: 99.99,
        estoque: 5,
      });
    });
  });
});
