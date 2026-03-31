# Histórias de usuário — Cadastro de produto (e-commerce) — v2

**Versão:** 2.0  
**Base:** revisão do arquivo `historias-usuario-cadastro-produto.md`, mantendo o escopo das nove histórias e harmonizando critérios de aceite, cenários e tabela de regras.

**Objetivo do documento:** servir de referência única para implementação da API de cadastro e para casos de teste automatizados (Desafio #4).

---

## Épico

**Cadastro de produtos no catálogo** — permitir que o sistema registre produtos com dados consistentes para exibição e venda no e-commerce.

---

## Mapa das histórias

| ID    | Título breve                          | Foco principal                          |
|-------|----------------------------------------|-----------------------------------------|
| US-01 | Dados mínimos válidos                  | Nome, preço, estoque, resposta 201      |
| US-02 | SKU único                              | Obrigatoriedade, formato, unicidade     |
| US-03 | Categoria válida                       | Obrigatoriedade, existência             |
| US-04 | Descrição controlada                   | Obrigatoriedade, limite 255 caracteres  |
| US-05 | Preço promocional coerente             | Opcional, regras quando presente        |
| US-06 | Imagens por URL                        | Obrigatório, formato, máx. 5 imagens    |
| US-07 | Status no cadastro                     | Enum + padrão `rascunho`                |
| US-08 | Peso e dimensões (logística)           | Opcional; se enviados, validação numérica |
| US-09 | Erros claros para o cliente da API     | 400 estruturado, sem vazamento interno  |

---

## US-01 — Cadastrar produto com dados mínimos válidos

**Como** administrador do catálogo  
**Eu quero** cadastrar um produto informando nome, preço e estoque  
**Para que** o item fique disponível para consulta e venda

### Critérios de aceite

- **Nome:** obrigatório; após `trim`, não vazio; comprimento entre **2** e **200** caracteres.
- **Preço:** obrigatório; numérico; **≥ 0,01**.
- **Estoque:** obrigatório; inteiro; **≥ 0**.
- **Sucesso:** resposta **201** com o produto criado, incluindo **identificador gerado** pelo sistema.

### Cenários (BDD)

1. **Cadastro válido**  
   *Dado* nome (2–200 caracteres após trim), preço ≥ 0,01 e estoque inteiro ≥ 0  
   *Quando* o cliente envia o cadastro  
   *Então* a API responde 201 e o corpo contém o produto com id gerado.

2. **Nome inválido**  
   *Dado* nome ausente, só espaços, ou fora do intervalo de tamanho  
   *Quando* o cliente envia o cadastro  
   *Então* a API responde com erro de validação (ex.: 400) indicando o campo `nome`.

3. **Preço ou estoque inválidos**  
   *Dado* preço ausente, menor que 0,01 ou não numérico; ou estoque não inteiro ou negativo  
   *Quando* o cliente envia o cadastro  
   *Então* a API responde com erro de validação indicando `preco` ou `estoque`.

---

## US-02 — Garantir identificação única do produto (SKU)

**Como** administrador do catálogo  
**Eu quero** informar um SKU único por produto  
**Para que** não haja duplicidade no estoque e na integração com outros sistemas

### Critérios de aceite

- **SKU** obrigatório; após `trim`, não vazio.
- Comprimento **mínimo e máximo** definidos pelo contrato da API (ex.: 3–50 caracteres); o grupo deve fixar os números no OpenAPI/README.
- Permitir apenas caracteres acordados (ex.: alfanumérico e hífen), se a regra de negócio exigir — documentar explicitamente.
- **Unicidade:** não permitir segundo cadastro com o mesmo SKU; resposta **409** ou **400** com mensagem específica de duplicidade (definir um padrão e manter nos testes).

### Cenários (BDD)

1. **SKU válido e novo**  
   *Dado* um SKU inexistente no catálogo em memória  
   *Quando* o cliente cadastra o produto  
   *Então* o cadastro é aceito (demais regras atendidas).

2. **SKU duplicado**  
   *Dado* um produto já cadastrado com SKU `X`  
   *Quando* o cliente tenta cadastrar outro produto com SKU `X`  
   *Então* a API rejeita com erro de duplicidade no campo `sku`.

---

## US-03 — Associar produto a uma categoria válida

**Como** administrador do catálogo  
**Eu quero** vincular o produto a uma categoria existente  
**Para que** os clientes encontrem o item na navegação do site

### Critérios de aceite

- **Categoria** obrigatória (identificador ou slug, conforme contrato).
- O valor informado deve **existir** na lista de categorias permitidas pelo sistema.
- Categoria vazia, nula ou inexistente → erro de validação com mensagem explícita (campo `categoria` ou equivalente).

### Cenários (BDD)

1. **Categoria existente**  
   *Dado* uma categoria válida cadastrada ou pré-definida em memória  
   *Quando* o produto é cadastrado referenciando essa categoria  
   *Então* a associação é aceita.

2. **Categoria inexistente**  
   *Dado* um identificador de categoria que não existe  
   *Quando* o cliente envia o cadastro  
   *Então* a API retorna erro de validação referente à categoria.

---

## US-04 — Descrever o produto de forma controlada

**Como** administrador do catálogo  
**Eu quero** incluir uma descrição obrigatória do produto  
**Para que** a página do produto tenha informação suficiente para o cliente

### Critérios de aceite

- **Descrição** obrigatória; após `trim`, não vazia.
- Tamanho máximo **255** caracteres; acima disso → rejeição com indicação do campo e do limite.

### Cenários (BDD)

1. **Descrição válida**  
   *Dado* descrição com 1–255 caracteres (após trim)  
   *Quando* o cadastro é enviado  
   *Então* a descrição é aceita.

2. **Descrição ausente ou só espaços**  
   *Quando* o cadastro é enviado sem descrição ou com descrição em branco  
   *Então* a API retorna erro no campo `descricao`.

3. **Descrição longa demais**  
   *Dado* descrição com mais de 255 caracteres  
   *Quando* o cadastro é enviado  
   *Então* a API retorna erro citando o limite de 255.

---

## US-05 — Cadastrar preço promocional coerente

**Como** administrador do catálogo  
**Eu quero** informar preço promocional quando houver campanha  
**Para que** o preço exibido reflita o desconto sem inconsistências

### Critérios de aceite

- **Preço promocional** opcional: pode ser omitido ou nulo conforme contrato da API.
- Se informado: valor numérico **≥ 0,01**.
- Se informado: **não pode ser maior** que o preço regular (`preco`) do mesmo cadastro.

### Cenários (BDD)

1. **Sem promoção**  
   *Quando* o campo de preço promocional é omitido  
   *Então* o cadastro pode ser válido se os demais campos estiverem corretos.

2. **Promoção coerente**  
   *Dado* preço regular 100 e preço promocional 79,99  
   *Quando* o cadastro é enviado  
   *Então* a API aceita.

3. **Promoção maior que o preço regular**  
   *Dado* preço promocional maior que o preço regular  
   *Quando* o cadastro é enviado  
   *Então* a API rejeita com erro no campo de preço promocional.

---

## US-06 — Anexar imagens com URLs válidas

**Como** administrador do catálogo  
**Eu quero** informar uma ou mais URLs de imagem do produto  
**Para que** a vitrine mostre o visual correto do item

### Critérios de aceite

- Pelo menos **uma** imagem é **obrigatória** (lista ou array de URLs).
- Cada URL deve ser válida, com esquema **http** ou **https**.
- **Máximo de 5** URLs por produto.
- URLs vazias, malformadas ou acima do limite geram erro de validação no campo de imagens.

### Cenários (BDD)

1. **Uma a cinco URLs válidas**  
   *Quando* o cliente envia de 1 a 5 URLs https válidas  
   *Então* o cadastro aceita as imagens.

2. **Nenhuma imagem**  
   *Quando* a lista está ausente ou vazia  
   *Então* a API retorna erro indicando obrigatoriedade de imagem.

3. **Mais de cinco imagens**  
   *Quando* o cliente envia 6 ou mais URLs  
   *Então* a API rejeita citando o limite de 5.

---

## US-07 — Definir status do produto no cadastro

**Como** administrador do catálogo  
**Eu quero** definir se o produto nasce ativo, rascunho ou inativo  
**Para que** eu controle a publicação sem apagar dados

### Critérios de aceite

- **Status** aceita apenas: `rascunho`, `ativo`, `inativo` (ou o conjunto exato definido pelo grupo — manter estável nos testes).
- Valores fora do conjunto são rejeitados.
- Se **status** não for informado, o padrão é **`rascunho`**.

### Cenários (BDD)

1. **Status explícito válido**  
   *Quando* o cliente envia `ativo`  
   *Então* o produto é salvo com esse status.

2. **Status omitido**  
   *Quando* o campo status não é enviado  
   *Então* o produto é salvo como `rascunho`.

3. **Status inválido**  
   *Quando* o cliente envia valor não permitido  
   *Então* a API retorna erro de validação no campo `status`.

---

## US-08 — Informar peso e dimensões para logística (opcional)

**Como** administrador do catálogo  
**Eu quero** cadastrar peso e dimensões quando o frete depender disso  
**Para que** o cálculo de envio seja possível no futuro

### Critérios de aceite (versão harmonizada)

- **Peso**, **comprimento**, **largura** e **altura** são **opcionais** no cadastro.
- **Quando qualquer um for enviado**, o grupo deve decidir:
  - **Opção A — pacote completo:** se um campo logístico for informado, todos passam a ser obrigatórios nessa requisição; valores numéricos **≥ 0**.
  - **Opção B — independentes:** cada campo opcional isoladamente; se presente, numérico **≥ 0**.

Documentar no contrato da API qual opção vale. Os testes devem cobrir a opção escolhida.

### Cenários (BDD) — exemplo para Opção B

1. **Sem logística**  
   *Quando* peso e dimensões são omitidos  
   *Então* o cadastro pode ser válido.

2. **Peso informado e válido**  
   *Dado* peso numérico ≥ 0  
   *Quando* o cadastro é enviado  
   *Então* o peso é aceito.

3. **Valor negativo**  
   *Dado* qualquer dimensão ou peso negativo  
   *Quando* o cadastro é enviado  
   *Então* a API rejeita o(s) campo(s) correspondente(s).

---

## US-09 — Rejeitar cadastro com dados inválidos com resposta clara

**Como** consumidor da API (front ou integração)  
**Eu quero** receber erros estruturados indicando campo e motivo  
**Para que** eu corrija o formulário ou a carga enviada

### Critérios de aceite

- Campos obrigatórios ausentes ou inválidos → **400** (ou código acordado) com **lista ou mapa** de erros por campo.
- Tipos incorretos (ex.: preço como string não numérica) → mensagem compreensível, sem stack trace ou detalhes internos.
- Não expor detalhes internos do servidor nas mensagens ao cliente.

### Cenários (BDD)

1. **Vários erros de uma vez**  
   *Dado* vários campos inválidos na mesma requisição  
   *Quando* o cliente envia o cadastro  
   *Então* a resposta agrupa os erros por campo (ou lista equivalente).

2. **Erro de tipo**  
   *Dado* `preco` enviado como valor não numérico  
   *Quando* o cadastro é enviado  
   *Então* a API indica problema de tipo ou formato em `preco`.

---

## Regras consolidadas (referência para testes)

| Campo / regra        | Obrigatório | Validação principal                                      |
|----------------------|------------|-----------------------------------------------------------|
| Nome                 | Sim        | Trim; 2–200 caracteres                                   |
| Preço                | Sim        | Numérico; ≥ 0,01                                         |
| Estoque              | Sim        | Inteiro; ≥ 0                                              |
| SKU                  | Sim        | Trim; tamanho e charset definidos; único no catálogo     |
| Categoria            | Sim        | Deve existir no conjunto permitido                        |
| Descrição            | Sim        | Trim não vazio; máx. 255 caracteres                       |
| Preço promocional    | Não        | Se presente: ≥ 0,01 e ≤ preço regular                      |
| Imagens (URLs)       | Sim (≥1)   | http/https; máx. 5 URLs                                 |
| Status               | Não        | Enum; padrão `rascunho`                                   |
| Peso / dimensões     | Não*       | *Ver US-08; se enviados, ≥ 0 (e regra pacote completo se A) |
| Erros                | —          | Resposta estruturada 400; sem vazamento interno          |

---

## Notas para o grupo

1. Fixar no README ou OpenAPI: limites exatos de **SKU**, formato de **categoria** (id vs slug) e **Opção A ou B** da US-08.  
2. Esta v2 substitui a versão anterior como referência normativa; o arquivo `historias-usuario-cadastro-produto.md` pode ser arquivado ou apontado como legado.  
3. Cada cenário BDD acima sugere pelo menos um caso de teste automatizado.
