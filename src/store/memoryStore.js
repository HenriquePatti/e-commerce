const { randomUUID } = require("crypto");

/** Categorias pré-definidas em memória (US-03). */
const categorias = [
  { id: "eletronicos", nome: "Eletrônicos" },
  { id: "moveis", nome: "Móveis" },
  { id: "vestuario", nome: "Vestuário" },
  { id: "alimentos", nome: "Alimentos" },
  { id: "livros", nome: "Livros" },
];

const produtos = [];

function listarCategorias() {
  return [...categorias];
}

function categoriaExiste(categoriaId) {
  return categorias.some((c) => c.id === categoriaId);
}

function skuExiste(sku) {
  return produtos.some((p) => p.sku === sku);
}

function inserirProduto(dados) {
  const id = randomUUID();
  const registro = { id, ...dados };
  produtos.push(registro);
  return registro;
}

module.exports = {
  listarCategorias,
  categoriaExiste,
  skuExiste,
  inserirProduto,
  _produtos: produtos,
};
