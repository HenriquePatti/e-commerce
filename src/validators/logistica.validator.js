const CAMPOS_LOGISTICA = ["peso", "comprimento", "largura", "altura"];

function validarLogistica(body = {}) {
  const errors = {};
  const temCampoLogisticoInformado = CAMPOS_LOGISTICA.some((campo) => {
    const valor = body[campo];
    return valor !== undefined && valor !== null && valor !== "";
  });

  if (!temCampoLogisticoInformado) {
    return {
      valido: true,
      errors,
    };
  }

  for (const campo of CAMPOS_LOGISTICA) {
    const valor = body[campo];

    if (valor === undefined || valor === null || valor === "") {
      errors[campo] = `${campo} é obrigatório quando qualquer campo logístico é informado.`;
      continue;
    }

    if (typeof valor !== "number" || !Number.isFinite(valor)) {
      errors[campo] = `${campo} deve ser um número válido.`;
      continue;
    }

    if (valor < 0) {
      errors[campo] = `${campo} deve ser maior ou igual a 0.`;
    }
  }

  return {
    valido: Object.keys(errors).length === 0,
    errors,
  };
}

module.exports = {
  CAMPOS_LOGISTICA,
  validarLogistica,
};
