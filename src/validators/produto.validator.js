const store = require("../store/memoryStore");
const { validarLogistica } = require("./logistica.validator");

const SKU_MIN = 3;
const SKU_MAX = 50;
const SKU_REGEX = /^[a-zA-Z0-9-]+$/;
const NOME_MIN = 2;
const NOME_MAX = 200;
const DESCRICAO_MAX = 255;
const IMAGENS_MAX = 5;
const STATUS_VALORES = new Set(["rascunho", "ativo", "inativo"]);

function trimStr(v) {
  return typeof v === "string" ? v.trim() : v;
}

function isValidHttpUrl(s) {
  if (typeof s !== "string" || !s.trim()) return false;
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isInteiroNaoNegativo(n) {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}

/**
 * US-08 Opção A: se qualquer campo logístico for informado, todos se tornam obrigatórios
 * e cada um deve ser numérico e >= 0.
 * @returns {{ errors: Record<string, string> }}
 */
function validarCadastroProduto(body) {
  const errors = {};

  const resultadoLogistica = validarLogistica(body);
  if (!resultadoLogistica.valido) {
    Object.assign(errors, resultadoLogistica.errors);
  }

  const nome = trimStr(body?.nome);
  if (nome === undefined || nome === null || nome === "") {
    errors.nome = "Nome é obrigatório.";
  } else if (nome.length < NOME_MIN || nome.length > NOME_MAX) {
    errors.nome = `Nome deve ter entre ${NOME_MIN} e ${NOME_MAX} caracteres (após remover espaços nas extremidades).`;
  }

  const preco = body?.preco;
  if (preco === undefined || preco === null || preco === "") {
    errors.preco = "Preço é obrigatório.";
  } else if (typeof preco !== "number" || !Number.isFinite(preco)) {
    errors.preco = "Preço deve ser um número válido.";
  } else if (preco < 0.01) {
    errors.preco = "Preço deve ser maior ou igual a 0,01.";
  }

  const estoque = body?.estoque;
  if (estoque === undefined || estoque === null || estoque === "") {
    errors.estoque = "Estoque é obrigatório.";
  } else if (!isInteiroNaoNegativo(estoque)) {
    errors.estoque = "Estoque deve ser um número inteiro maior ou igual a 0.";
  }

  const skuRaw = body?.sku;
  const sku = trimStr(skuRaw);
  if (sku === undefined || sku === null || sku === "") {
    errors.sku = "SKU é obrigatório.";
  } else if (sku.length < SKU_MIN || sku.length > SKU_MAX) {
    errors.sku = `SKU deve ter entre ${SKU_MIN} e ${SKU_MAX} caracteres.`;
  } else if (!SKU_REGEX.test(sku)) {
    errors.sku = "SKU deve conter apenas letras, números e hífen (-).";
  }

  const categoriaId = trimStr(body?.categoriaId);
  if (!categoriaId) {
    errors.categoriaId = "categoriaId é obrigatório e deve identificar uma categoria existente.";
  } else if (!store.categoriaExiste(categoriaId)) {
    errors.categoriaId = "Categoria não encontrada. Use um categoriaId válido (consulte a documentação OpenAPI).";
  }

  const descricao = trimStr(body?.descricao);
  if (!descricao) {
    errors.descricao = "Descrição é obrigatória.";
  } else if (descricao.length > DESCRICAO_MAX) {
    errors.descricao = `Descrição deve ter no máximo ${DESCRICAO_MAX} caracteres.`;
  }

  const precoPromocional = body?.precoPromocional;
  if (precoPromocional !== undefined && precoPromocional !== null && precoPromocional !== "") {
    if (typeof precoPromocional !== "number" || !Number.isFinite(precoPromocional)) {
      errors.precoPromocional = "Preço promocional deve ser um número válido.";
    } else if (precoPromocional < 0.01) {
      errors.precoPromocional = "Preço promocional deve ser maior ou igual a 0,01.";
    } else if (typeof preco === "number" && Number.isFinite(preco) && precoPromocional > preco) {
      errors.precoPromocional = "Preço promocional não pode ser maior que o preço regular.";
    }
  }

  const imagens = body?.imagens;
  if (!Array.isArray(imagens) || imagens.length === 0) {
    errors.imagens = "Informe pelo menos uma URL de imagem (máximo 5).";
  } else if (imagens.length > IMAGENS_MAX) {
    errors.imagens = `No máximo ${IMAGENS_MAX} imagens por produto.`;
  } else {
    const idxInvalida = imagens.findIndex((url) => !isValidHttpUrl(url));
    if (idxInvalida !== -1) {
      errors.imagens = `Cada imagem deve ser uma URL http ou https válida (índice ${idxInvalida}).`;
    }
  }

  const statusRaw = body?.status;
  if (statusRaw !== undefined && statusRaw !== null && statusRaw !== "") {
    if (!STATUS_VALORES.has(statusRaw)) {
      errors.status = "Status deve ser um dos valores: rascunho, ativo, inativo.";
    }
  }

  return { errors };
}

module.exports = {
  validarCadastroProduto,
  SKU_MIN,
  SKU_MAX,
  NOME_MIN,
  NOME_MAX,
  DESCRICAO_MAX,
  IMAGENS_MAX,
  STATUS_VALORES: [...STATUS_VALORES],
};
