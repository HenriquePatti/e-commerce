/**
 * Testes automatizados - US-08: Informar peso e dimensões para logística
 * Opção A - Pacote completo:
 *   Se qualquer campo logístico for informado, todos são obrigatórios.
 *   Quando presentes, devem ser numéricos >= 0.
 */

"use strict";

const request = require("supertest");
const { expect } = require("chai");
const { createApp } = require("../src/app");

const app = createApp();

const produtoBase = () => ({
  nome: "Produto Teste US-08",
  preco: 99.9,
  estoque: 10,
  sku: `SKU-US08-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  categoriaId: "eletronicos",
  descricao: "Descricao valida para cenarios da US-08.",
  imagens: ["https://example.com/produto-us08.png"],
  status: "ativo",
});

const cadastrar = (body) =>
  request(app).post("/api/v1/produtos").send(body).set("Accept", "application/json");

describe("US-08 - Logística (Opção A: pacote completo)", () => {
  describe("Grupo 1 - Sem campos logísticos", () => {
    it("deve aceitar cadastro quando peso e dimensões são completamente omitidos", async () => {
      const res = await cadastrar(produtoBase());

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
    });

    it("deve aceitar cadastro quando logística é explicitamente null em todos os campos", async () => {
      const body = {
        ...produtoBase(),
        peso: null,
        comprimento: null,
        largura: null,
        altura: null,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
    });
  });

  describe("Grupo 2 - Pacote logístico completo e válido", () => {
    it("deve aceitar quando todos os quatro campos são enviados com valores positivos", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.5,
        comprimento: 30,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
    });

    it("deve aceitar quando todos os campos são zero", async () => {
      const body = {
        ...produtoBase(),
        peso: 0,
        comprimento: 0,
        largura: 0,
        altura: 0,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(201);
    });

    it("deve aceitar valores decimais precisos em todos os campos", async () => {
      const body = {
        ...produtoBase(),
        peso: 0.001,
        comprimento: 99.999,
        largura: 0.5,
        altura: 1.23,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(201);
    });

    it("deve persistir os valores logísticos na resposta 201", async () => {
      const body = {
        ...produtoBase(),
        peso: 2.0,
        comprimento: 40,
        largura: 25,
        altura: 15,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        peso: 2,
        comprimento: 40,
        largura: 25,
        altura: 15,
      });
    });
  });

  describe("Grupo 3 - Pacote logístico incompleto (400 esperado)", () => {
    const casosIncompletos = [
      {
        descricao: "apenas peso informado",
        extra: { peso: 1.0 },
        camposFaltando: ["comprimento", "largura", "altura"],
      },
      {
        descricao: "apenas comprimento informado",
        extra: { comprimento: 30 },
        camposFaltando: ["peso", "largura", "altura"],
      },
      {
        descricao: "apenas largura informada",
        extra: { largura: 20 },
        camposFaltando: ["peso", "comprimento", "altura"],
      },
      {
        descricao: "apenas altura informada",
        extra: { altura: 10 },
        camposFaltando: ["peso", "comprimento", "largura"],
      },
      {
        descricao: "peso e comprimento, sem largura e altura",
        extra: { peso: 1.0, comprimento: 30 },
        camposFaltando: ["largura", "altura"],
      },
      {
        descricao: "peso, comprimento e largura, sem altura",
        extra: { peso: 1.0, comprimento: 30, largura: 20 },
        camposFaltando: ["altura"],
      },
      {
        descricao: "peso, largura e altura, sem comprimento",
        extra: { peso: 1.0, largura: 20, altura: 10 },
        camposFaltando: ["comprimento"],
      },
    ];

    for (const { descricao, extra, camposFaltando } of casosIncompletos) {
      it(`deve retornar 400 quando ${descricao}`, async () => {
        const body = { ...produtoBase(), ...extra };
        const res = await cadastrar(body);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("errors");

        for (const campo of camposFaltando) {
          expect(res.body.errors).to.have.property(campo);
          expect(res.body.errors[campo]).to.be.a("string");
        }
      });
    }
  });

  describe("Grupo 4 - Valores inválidos em campos logísticos (400 esperado)", () => {
    it("deve retornar 400 quando peso é negativo", async () => {
      const body = {
        ...produtoBase(),
        peso: -1,
        comprimento: 30,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("peso");
    });

    it("deve retornar 400 quando comprimento é negativo", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.0,
        comprimento: -5,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("comprimento");
    });

    it("deve retornar 400 quando largura é negativa", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.0,
        comprimento: 30,
        largura: -10,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("largura");
    });

    it("deve retornar 400 quando altura é negativa", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.0,
        comprimento: 30,
        largura: 20,
        altura: -3,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("altura");
    });

    it("deve retornar 400 quando múltiplos campos têm valor negativo", async () => {
      const body = {
        ...produtoBase(),
        peso: -1,
        comprimento: -5,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("peso");
      expect(res.body.errors).to.have.property("comprimento");
    });

    it("deve retornar 400 quando peso é uma string", async () => {
      const body = {
        ...produtoBase(),
        peso: "pesado",
        comprimento: 30,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("peso");
    });

    it("deve retornar 400 quando altura é uma string numérica", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.0,
        comprimento: 30,
        largura: 20,
        altura: "10",
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("altura");
    });

    it("deve retornar 400 quando comprimento é booleano", async () => {
      const body = {
        ...produtoBase(),
        peso: 1.0,
        comprimento: true,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("comprimento");
    });
  });

  describe("Grupo 5 - Estrutura do corpo de erro (400)", () => {
    it('deve retornar body com "message" e "errors" ao falhar por pacote incompleto', async () => {
      const body = { ...produtoBase(), peso: 1.0 };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body).to.have.property("errors");
      expect(res.body.errors).to.be.an("object");
    });

    it('deve retornar body com "message" e "errors" ao falhar por valor inválido', async () => {
      const body = {
        ...produtoBase(),
        peso: -1,
        comprimento: 30,
        largura: 20,
        altura: 10,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body).to.have.property("errors");
    });

    it("erros de logística não devem suprimir erros de outros campos", async () => {
      const body = {
        preco: 50,
        estoque: 5,
        sku: `SKU-ERR-${Date.now()}`,
        categoriaId: "eletronicos",
        descricao: "Descricao valida.",
        imagens: ["https://example.com/erro-logistica.png"],
        status: "ativo",
        peso: 1.0,
      };

      const res = await cadastrar(body);

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.have.property("nome");
      expect(res.body.errors).to.satisfy((errs) =>
        ["comprimento", "largura", "altura"].some((campo) => campo in errs)
      );
    });
  });
});
