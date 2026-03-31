const store = require("../store/memoryStore");
const { validarCadastroProduto } = require("../validators/produto.validator");

function montarPayloadPersistencia(body) {
  const nome = body.nome.trim();
  const sku = body.sku.trim();
  const descricao = body.descricao.trim();
  const categoriaId = body.categoriaId.trim();
  const imagens = body.imagens.map((u) => String(u).trim());
  const status =
    body.status === undefined || body.status === null || body.status === ""
      ? "rascunho"
      : body.status;

  const payload = {
    nome,
    preco: body.preco,
    estoque: body.estoque,
    sku,
    categoriaId,
    descricao,
    imagens,
    status,
  };

  if (
    body.precoPromocional !== undefined &&
    body.precoPromocional !== null &&
    body.precoPromocional !== ""
  ) {
    payload.precoPromocional = body.precoPromocional;
  }

  for (const c of ["peso", "comprimento", "largura", "altura"]) {
    if (body[c] !== undefined && body[c] !== null && body[c] !== "") {
      payload[c] = body[c];
    }
  }

  return payload;
}

function cadastrarProduto(req, res) {
  const { errors } = validarCadastroProduto(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Erro de validação.",
      errors,
    });
  }

  const skuNormalizado = req.body.sku.trim();
  if (store.skuExiste(skuNormalizado)) {
    return res.status(409).json({
      message: "SKU já cadastrado.",
      errors: {
        sku: "Já existe um produto com este SKU.",
      },
    });
  }

  const dados = montarPayloadPersistencia(req.body);
  const criado = store.inserirProduto(dados);
  return res.status(201).json(criado);
}

module.exports = { cadastrarProduto };
