/**
 * Testes unitários - validarLogistica()
 */

"use strict";

const { expect } = require("chai");
const { validarLogistica } = require("../src/validators/logistica.validator");

describe("validarLogistica() - unidade", () => {
  describe("Sem campos logísticos", () => {
    it("retorna válido para objeto vazio", () => {
      const { valido, errors } = validarLogistica({});
      expect(valido).to.be.true;
      expect(errors).to.deep.equal({});
    });

    it("retorna válido quando todos são null", () => {
      const { valido } = validarLogistica({
        peso: null,
        comprimento: null,
        largura: null,
        altura: null,
      });
      expect(valido).to.be.true;
    });

    it("retorna válido quando todos são undefined", () => {
      const { valido } = validarLogistica({
        peso: undefined,
        comprimento: undefined,
        largura: undefined,
        altura: undefined,
      });
      expect(valido).to.be.true;
    });
  });

  describe("Pacote completo válido", () => {
    it("retorna válido para valores positivos", () => {
      const { valido } = validarLogistica({
        peso: 2,
        comprimento: 30,
        largura: 20,
        altura: 10,
      });
      expect(valido).to.be.true;
    });

    it("retorna válido quando todos são zero", () => {
      const { valido } = validarLogistica({
        peso: 0,
        comprimento: 0,
        largura: 0,
        altura: 0,
      });
      expect(valido).to.be.true;
    });

    it("retorna válido para valores decimais", () => {
      const { valido } = validarLogistica({
        peso: 0.001,
        comprimento: 9.99,
        largura: 0.5,
        altura: 1.1,
      });
      expect(valido).to.be.true;
    });
  });

  describe("Pacote incompleto (campos faltando)", () => {
    const camposTodos = ["peso", "comprimento", "largura", "altura"];

    for (const campoPresente of camposTodos) {
      it(`retorna inválido e aponta os 3 faltantes quando só "${campoPresente}" é enviado`, () => {
        const body = { [campoPresente]: 1 };
        const { valido, errors } = validarLogistica(body);

        expect(valido).to.be.false;

        const faltantes = camposTodos.filter((campo) => campo !== campoPresente);
        for (const campo of faltantes) {
          expect(errors).to.have.property(campo);
          expect(errors[campo]).to.include("obrigatório");
        }
      });
    }

    it("retorna inválido com dois campos faltando quando dois são enviados", () => {
      const { valido, errors } = validarLogistica({ peso: 1, comprimento: 30 });

      expect(valido).to.be.false;
      expect(errors).to.have.property("largura");
      expect(errors).to.have.property("altura");
      expect(errors).to.not.have.property("peso");
      expect(errors).to.not.have.property("comprimento");
    });
  });

  describe("Valores inválidos no pacote completo", () => {
    it("retorna inválido quando peso < 0", () => {
      const { valido, errors } = validarLogistica({
        peso: -1,
        comprimento: 30,
        largura: 20,
        altura: 10,
      });

      expect(valido).to.be.false;
      expect(errors).to.have.property("peso");
      expect(errors.peso).to.include("maior ou igual a 0");
    });

    it("retorna inválido quando comprimento é string", () => {
      const { valido, errors } = validarLogistica({
        peso: 1,
        comprimento: "abc",
        largura: 20,
        altura: 10,
      });

      expect(valido).to.be.false;
      expect(errors).to.have.property("comprimento");
    });

    it("retorna inválido quando largura é booleano", () => {
      const { valido, errors } = validarLogistica({
        peso: 1,
        comprimento: 30,
        largura: true,
        altura: 10,
      });

      expect(valido).to.be.false;
      expect(errors).to.have.property("largura");
    });

    it("acumula erros de múltiplos campos negativos", () => {
      const { valido, errors } = validarLogistica({
        peso: -1,
        comprimento: -5,
        largura: 20,
        altura: 10,
      });

      expect(valido).to.be.false;
      expect(errors).to.have.property("peso");
      expect(errors).to.have.property("comprimento");
      expect(errors).to.not.have.property("largura");
      expect(errors).to.not.have.property("altura");
    });
  });
});
