# Histórias de usuário — Cadastro de produto (e-commerce)

Documento de requisitos em formato de histórias de usuário, com critérios de aceite que materializam as regras de validação do cadastro.

---

## Épico: Cadastro de produtos no catálogo

Permitir que o sistema registre produtos com dados consistentes, para exibição e venda no e-commerce.

---

### US-01 — Cadastrar produto com dados mínimos válidos

**Como** administrador do catálogo  
**Eu quero** cadastrar um produto informando nome, preço e estoque  
**Para que** o item fique disponível para consulta e venda

**Critérios de aceite**

- O cadastro exige **nome** não vazio (após remover espaços nas extremidades).
- O **nome** respeita limites definidos (ex.: mínimo 2 e máximo 200 caracteres).
- O **preço** é obrigatório, numérico e **maior ou igual a 0,01**.
- A **quantidade em estoque** é obrigatória, inteira e **maior ou igual a 0**.
- Em caso de sucesso, a API retorna o produto criado (incluindo identificador gerado) e status HTTP adequado (ex.: 201).

---

### US-02 — Garantir identificação única do produto (SKU)

**Como** administrador do catálogo  
**Eu quero** informar um SKU único por produto  
**Para que** não haja duplicidade no estoque e na integração com outros sistemas

**Critérios de aceite**

- O **SKU** é obrigatório (se a regra de negócio assim definir).
- O SKU não pode ser apenas espaços; deve ter comprimento mínimo e máximo definidos.
- Não é permitido cadastrar dois produtos com o **mesmo SKU**; a API retorna erro claro (ex.: 409 ou 400 com mensagem específica).

---

### US-03 — Associar produto a uma categoria válida

**Como** administrador do catálogo  
**Eu quero** vincular o produto a uma categoria existente  
**Para que** os clientes encontrem o item na navegação do site

**Critérios de aceite**

- A **categoria** é obrigatória (se aplicável ao modelo).
- O identificador de categoria informado deve **existir** na lista de categorias permitidas; caso contrário, erro de validação com mensagem explícita.
- Categorias inexistentes ou vazias não são aceitas.

---

### US-04 — Descrever o produto de forma controlada

**Como** administrador do catálogo  
**Eu quero** incluir uma descrição opcional ou obrigatória do produto  
**Para que** a página do produto tenha informação suficiente para o cliente

**Critérios de aceite**

- Se a descrição for **obrigatória**, rejeitar cadastro sem descrição ou só com espaços.
- Se for **opcional**, aceitar ausência ou texto dentro do **limite máximo de caracteres** definido.
- Descrições acima do limite são rejeitadas com indicação do campo e do limite.

---

### US-05 — Cadastrar preço promocional coerente

**Como** administrador do catálogo  
**Eu quero** informar preço promocional quando houver campanha  
**Para que** o preço exibido reflita o desconto sem inconsistências

**Critérios de aceite**

- Se **preço promocional** for informado, deve ser numérico e **≥ 0,01**.
- O preço promocional **não pode ser maior** que o preço regular do produto.
- Se não houver promoção, o campo pode ser omitido ou nulo, conforme contrato da API.

---

### US-06 — Anexar imagens com URLs válidas

**Como** administrador do catálogo  
**Eu quero** informar uma ou mais URLs de imagem do produto  
**Para que** a vitrine mostre o visual correto do item

**Critérios de aceite**

- Se imagem for **obrigatória**, pelo menos uma URL válida deve ser enviada.
- URLs devem ter formato válido (ex.: esquema `http` ou `https`).
- Respeitar **quantidade máxima** de imagens por produto.
- URLs vazias ou inválidas geram erro de validação no campo correspondente.

---

### US-07 — Definir status do produto no cadastro

**Como** administrador do catálogo  
**Eu quero** definir se o produto nasce ativo, rascunho ou inativo  
**Para que** eu controle a publicação sem apagar dados

**Critérios de aceite**

- O **status** aceita apenas valores do conjunto permitido (ex.: `rascunho`, `ativo`, `inativo`).
- Valores fora do conjunto são rejeitados.
- Se o status tiver padrão (ex.: `rascunho`), documentar no contrato da API.

---

### US-08 — Informar peso e dimensões para logística (opcional)

**Como** administrador do catálogo  
**Eu quero** cadastrar peso e dimensões quando o frete depender disso  
**Para que** o cálculo de envio seja possível no futuro

**Critérios de aceite**

- Se informados, **peso** e dimensões (**comprimento**, **largura**, **altura**) são numéricos e **≥ 0**.
- Valores absurdos podem ser limitados por regra de negócio (teto máximo), se o grupo definir.
- Campos podem ser opcionais se o e-commerce não exigir frete no escopo atual.

---

### US-09 — Rejeitar cadastro com dados inválidos com resposta clara

**Como** consumidor da API (front ou integração)  
**Eu quero** receber erros estruturados indicando campo e motivo  
**Para que** eu corrija o formulário ou a carga enviada

**Critérios de aceite**

- Campos obrigatórios ausentes retornam erro (ex.: **400**) com lista ou mapa de erros por campo.
- Tipos incorretos (ex.: preço como string não numérica) são rejeitados com mensagem compreensível.
- Não expor detalhes internos do servidor em mensagens ao cliente.

---

## Resumo das regras de validação (referência rápida)

| Regra                         | Exemplo / nota                                      |
|------------------------------|-----------------------------------------------------|
| Nome obrigatório e limitado  | Trim; mín./máx. de caracteres                       |
| Preço mínimo                 | ≥ 0,01                                              |
| Estoque                      | Inteiro ≥ 0                                         |
| SKU único                    | Sem duplicidade no catálogo                         |
| Categoria                    | Deve existir / valor permitido                      |
| Descrição                    | Opcional ou obrigatória + limite de tamanho         |
| Preço promocional            | Se presente: ≥ 0,01 e ≤ preço regular               |
| Imagens                      | URLs válidas; limite de quantidade                  |
| Status                       | Valores enumerados permitidos                       |
| Peso / dimensões             | Se presentes: numéricos ≥ 0                         |

---

*Documento alinhado ao Desafio #4 (API de cadastro com validações e testes automatizados). Ajuste obrigatoriedade de campos conforme o contrato final acordado pelo grupo.*
