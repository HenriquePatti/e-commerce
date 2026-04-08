# API de cadastro de produtos (e-commerce)

Aplicação **Node.js** com **Express** que expõe apenas a operação de **cadastro de produtos**, com dados mantidos **em memória** (sem banco de dados). O projeto atende ao escopo do **Desafio #4** (M2.0 - API de cadastro com validações) e segue as regras descritas nas histórias de usuário em [docs/historias-usuario-cadastro-produto-v2.md](docs/historias-usuario-cadastro-produto-v2.md).

Há **testes automatizados** (Mocha, Chai, Supertest); use `npm test` (funciona em **Windows, macOS e Linux** via `cross-env`). Os demais cenários do documento de histórias podem ser exercidos manualmente via Swagger ou Postman.

## Histórias de usuário

As regras de negócio e critérios de aceite (nome, preço, SKU, categoria, descrição, imagens, status, logística, erros estruturados etc.) estão detalhados em:

**[docs/historias-usuario-cadastro-produto-v2.md](docs/historias-usuario-cadastro-produto-v2.md)**

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Node.js (>= 18) | Runtime |
| Express | Framework HTTP |
| js-yaml | Leitura do arquivo OpenAPI |
| swagger-ui-express | Interface Swagger UI em `/api-docs` |
| OpenAPI 3 | Contrato da API (YAML + JSON em runtime) |
| cross-env | `NODE_ENV` nos scripts de teste em qualquer SO |

## Estrutura de pastas

```text
e-commerce/
├── docs/
│   ├── historias-usuario-cadastro-produto-v2.md   # Requisitos / histórias
│   └── historias-usuario-cadastro-produto.md      # Versão anterior (legado)
├── src/
│   ├── docs/
│   │   └── openapi.yaml                           # Especificação OpenAPI 3
│   ├── controllers/
│   │   └── produtos.controller.js                 # Orquestra cadastro e 409 SKU
│   ├── routes/
│   │   └── produtos.routes.js                     # POST / (montado em /api/v1/produtos)
│   ├── store/
│   │   └── memoryStore.js                         # Categorias fixas + lista de produtos
│   ├── validators/
│   │   ├── logistica.validator.js                 # US-08 Opção A: pacote logístico completo quando informado
│   │   └── produto.validator.js                   # Validações alinhadas ao doc v2
│   ├── app.js                                     # Express, Swagger, rotas
│   ├── loadOpenApi.js                             # Carrega openapi.yaml
│   └── server.js                                  # Entrada e porta
├── test/
│   ├── app.test.js                                # Smoke test da raiz e metadados da API
│   └── us*.test.js                                # Cenários automatizados por história
├── package.json
├── .gitignore
└── README.md
```

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) **18 ou superior**
- npm (vem com o Node)

### Passo a passo

1. **Clone ou entre na pasta do projeto** (raiz do repositório `e-commerce`).

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Inicie o servidor:**

   ```bash
   npm start
   ```

   Para reiniciar automaticamente ao editar arquivos (Node 18+):

   ```bash
   npm run dev
   ```

4. **Testes (mesmo comando em Windows, macOS e Linux):**

   ```bash
   npm test
   ```

   Relatório HTML (Mochawesome):

   ```bash
   npm run test:report
   ```

5. **Porta:** por padrão o serviço sobe em `http://localhost:3000`. Para outra porta:

   Linux/macOS:

   ```bash
   PORT=4000 npm start
   ```

   PowerShell:

   ```powershell
   $env:PORT=4000
   npm start
   ```

## Acessar o Swagger (documentação interativa)

Com o servidor em execução:

1. Abra o navegador em **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** (troque `3000` se usou outra `PORT`).
2. Expanda **POST /produtos**, clique em **Try it out**, edite o JSON e **Execute**.

A raiz da API informativa é [http://localhost:3000/](http://localhost:3000/) e retorna links úteis (`api-docs`, `openapi.json`).

## Importar no Postman

1. Abra o Postman: **Import** -> aba **Link** (ou **Import** -> cole a URL, conforme a versão do Postman).
2. Informe a URL do OpenAPI em JSON (o servidor precisa estar rodando):

   `http://localhost:3000/openapi.json`

3. Confirme a importação. A coleção usará o `servers` definido no OpenAPI (`http://localhost:3000/api/v1`); ajuste a variável de ambiente ou a URL base se mudar a porta.

Alternativa: importe o arquivo **`src/docs/openapi.yaml`** via **Import** -> **File** (não exige servidor, mas a URL base pode precisar de ajuste manual).

## Endpoint principal

| Método | Caminho | Descrição |
|---|---|---|
| POST | `/api/v1/produtos` | Cadastro de produto |

**Categorias válidas** (`categoriaId`): `eletronicos`, `moveis`, `vestuario`, `alimentos`, `livros` (pré-carregadas em memória).

**Logística (US-08):** o projeto implementa a **Opção A**. `peso`, `comprimento`, `largura` e `altura` são opcionais em conjunto; se qualquer um for enviado, todos passam a ser obrigatórios e devem ser números maiores ou iguais a `0`.

**Respostas usuais:**

- `201` - produto criado (corpo inclui `id` UUID).
- `400` - validação; corpo com `message` e `errors` por campo.
- `409` - SKU duplicado.

## Licença

MIT.
