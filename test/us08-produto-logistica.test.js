const chai = require("chai");
const { expect } = chai;
const request = require("supertest");
const { createApp } = require("../src/app");
const memoryStore = require("../src/store/memoryStore");

const PATH = "/api/v1/produtos";

describe('US-08 — Campos logísticos (Opção B)', () => {
    let app;

    beforeEach(() => {
        if (Array.isArray(memoryStore.produtos)) {
            memoryStore.produtos.length = 0;
        }
        app = createApp();
    });

    const gerarProdutoBase = () => ({
        nome: "Produto Válido",
        preco: 0.01,
        estoque: 0,
        sku: `sku-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        categoriaId: "eletronicos",
        descricao: "Descrição mínima para cadastro.",
        imagens: ["https://example.com/imagem.png"],
        status: "ativo"
        // Não inclui peso, comprimento, largura, altura
    });

    /**
         * Cenário: Cadastro sem informações de peso ou dimensões
            Dado que o administrador preenche os campos obrigatórios do produto
            E omite os campos peso, comprimento, largura e altura
            Quando enviar o cadastro para a API
            Então a resposta deve retornar status 201 (Produto criado)
            E o payload retornado não deve conter valores para peso, comprimento, largura ou altura
        */

    it('Cadastro sem peso e dimensões', async () => {
        const res = await request(app)
            .post(PATH)
            .send(gerarProdutoBase());

        expect(res.status).to.equal(201);
        expect(res.body).to.not.have.any.keys('peso', 'comprimento', 'largura', 'altura');
    });

    it('Cadastro com peso positivo', async () => {
        const res = await request(app)
            .post(PATH)
            .send({ ...gerarProdutoBase(), peso: 2.5 });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('peso', 2.5);
    });
        /**
         *  Cenário: Cadastro com dimensões positivas
            Dado que o administrador preenche os campos obrigatórios do produto
            E define "comprimento" = 10, "largura" = 5, "altura" = 3
            Quando enviar o cadastro para a API
            Então a resposta deve retornar status 201 (Produto criado)
            E o produto cadastrado deve refletir os valores de comprimento, largura e altura
         */
        it('Cadastro com dimensões positivas', async () => {
                const res = await request(app)
                    .post(PATH)
                    .send({
                        ...gerarProdutoBase(),
                        comprimento: 10,
                        largura: 5,
                        altura: 3
                    });
        
                expect(res.status).to.equal(201);
                expect(res.body).to.include({
                    comprimento: 10,
                    largura: 5,
                    altura: 3
                });
        });

            /**
             *  Cenário: Cadastro com peso ou dimensão negativa
                Dado que o administrador preenche os campos obrigatórios do produto
                E define "peso" = -1
                Ou "comprimento" = -10
                Ou "largura" = -5
                Ou "altura" = -3
                Quando enviar o cadastro para a API
                Então a resposta deve retornar status 400 (Bad Request)
                E a mensagem de erro deve indicar qual(is) campo(s) possuem valor negativo
             */
        
        it('Cadastro com valores negativos deve retornar 400', async () => {
            const res = await request(app)
                .post(PATH)
                .send({
                    ...gerarProdutoBase(),
                    peso: -1,
                    comprimento: -10,
                    largura: -5,
                    altura: -3
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message');
        });

                /**
                    Cenário: Cadastro com alguns campos logísticos
                    Dado que o administrador preenche os campos obrigatórios do produto
                    E define "peso" = 1.2
                    E omite comprimento, largura e altura
                    Quando enviar o cadastro para a API
                    Então a resposta deve retornar status 201 (Produto criado)
                    E o peso deve ser registrado
                    E os campos de dimensão permanecem vazios
                 * 
                 */
        it('Cadastro com campos logísticos parciais', async () => {
            const res = await request(app)
                .post(PATH)
                .send({
                    ...gerarProdutoBase(),
                    peso: 1.2
                });
                
                    expect(res.status).to.equal(201);
                    expect(res.body).to.have.property('peso', 1.2);
                    expect(res.body).to.not.have.any.keys('comprimento', 'largura', 'altura');
        });

});