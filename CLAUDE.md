# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page dashboard (Saúde, Energia, Salário, Supermercado, Remédios) for a personal microservices system. The **entire application is `index.html`** — markup, CSS in one `<style>` block, and all JavaScript in one `<script>` block at the end of `<body>`. There is no build step, no bundler, no framework, no `package.json`, and no test suite. Dependencies (Bootstrap 5, Chart.js, `chartjs-plugin-datalabels`) are loaded from CDNs in `<head>`.

## Running / developing

- **Edit + refresh.** Open `index.html` directly in a browser, or serve the folder (`python3 -m http.server`, etc.). No compilation.
- **Backend selection is automatic** (`index.html`, `CONFIGURAÇÃO` section): `API_BASE` is `https://sistema-backend.guilhermejr.net` unless `window.location.hostname === 'localhost'`, in which case it is `http://localhost:8080` (the API gateway). To exercise the app against a local backend, browse via `localhost`, not `127.0.0.1` or a file URL.
- Using the dashboard requires valid credentials — login calls `autenticacao-service` and stores JWTs in `localStorage`.

## Deployment

Built as a static nginx image and run via Docker Compose on port `8081`:

```
docker build -t guilhermejr/sistema-frontend .
docker compose up -d
```

`Dockerfile` copies `index.html` + `nginx.conf` into `nginx:alpine`. `nginx.conf` routes all paths to `index.html`. The compose service joins an external Docker network named `rede` (shared with the backend containers).

## Backend it talks to

The gateway fronts several Spring services; this frontend calls six, all under `API_BASE`:

- `autenticacao-service` — `login` and `refresh-token`
- `energia-service` — `acompanhamentos/*` endpoints (solar generation/consumption/balance) and `total`
- `salario-service` — `folha/ano/{ano}` (payroll for a year) and `folha/{id}` (detail with line items)
- `saude-service` — `treinos/*` and `metricas/*` (weekly/moving-average health series)
- `supermercado-service` — `compras?page&size&sort` (paginated invoices, 20 per page) and `compras/{id}` (detail with items)
- `remedios-service` — `sintomas`, `remedios`, `remedios/vencendo`, `remedios/estoque-baixo` and `PUT remedios/consumir/{id}`

Sibling repos for these live at `../sistema-*-service`.

## Architecture of the script

Read these concerns together; they span the whole `<script>`:

- **Auth + auto-refresh.** `apiRequest({url, ...})` is the single entry point for every backend call. It calls `garantirAccessTokenValido()` first (refreshes proactively when the access token is expired or within `TOKEN_BUFFER_SECONDS` of expiry), then retries once on a 401/403 by calling `renovarToken()`. On terminal auth failure it throws `'Sessão expirada'` / `'não autenticado'`, which the loaders catch to force re-login. Tokens and the logged-in username live in `localStorage` (`salvar*`/`obter*`/`remover*` helpers).

- **Five tabs, five loaders.** `carregarEnergiaDashboard()`, `carregarSalarioDashboard(ano)`, `carregarSaudeDashboard()` and `carregarSupermercadoDashboard(pagina)` and `carregarRemediosDashboard()` each `Promise.all` their endpoints, transform, then build charts or tables. `carregarDashboard()` runs all five; `carregarSomenteSalario()` reloads just the Salário tab when the year `<select>` changes (year is persisted in `localStorage`), and `carregarSomenteSupermercado(pagina)` reloads just the Supermercado table when a pagination button is clicked.

- **Chart lifecycle.** Every chart has a module-level variable (`graficoXxx`), a `criarGraficoXxx(...)` factory, and is torn down by `destruirGraficos*()` before each reload — Chart.js leaks/duplicates canvases otherwise. All charts share `opcoesPadraoComDatalabels(titleText, formatter)` for options; per-chart `scales` are spread in *after* it and fully replace any scales it defines.

- **Data shaping.** Series come newest-first from the API; `ordenarCrescente()` reverses to chronological. `formatarPeriodoMesAno`, `parseMoedaBR`/`formatarMoedaBR` (BR number format: `.` thousands, `,` decimal), `formatarKwh`, `formatarDataUTC` (assumes naive UTC strings, converts to `America/Sao_Paulo`) are the shared formatters. Payroll aggregation: `agruparFolhasPorMes`, `agruparFolhasPorTipo`.

- **Mobile handling.** `isMobile()` is `window.innerWidth <= 768`, checked at chart-creation time (not reactive to rotation). `reduzirListaParaMobile()` drops the older half of every series on phones. `opcoesPadraoComDatalabels` scales fonts down, switches datalabels to `'auto'`, and relies on the fixed-height `.grafico-card .card-body` container plus `maintainAspectRatio: false` for vertical space. The `<style>` block also sets `viewport-fit=cover` / safe-area padding.

- **Detail modals.** Table rows carry `data-folha-id` / `data-compra-id`; a delegated click handler on each `<tbody>` calls `abrirDetalheFolha(id)` or `abrirDetalheCompra(id)`, which fetches the detail endpoint and renders sub-tables via template strings. All interpolated API strings go through `escapeHtml()`.

- **Supermercado pagination.** Server-side, 20 per page, `sort=data,desc`. `normalizarPaginaCompras()` accepts both Spring page shapes — metadata at the root (`PageImpl`) or nested under `page` (`PagedModel`) — so a change to `spring.data.web.pageable.serialization-mode` does not break the tab. `paginasVisiveis()` builds the windowed page list, using `null` for an ellipsis. Buttons carry `data-pagina-compras` and are read by a delegated handler on `#supermercado-paginacao`.

- **Remédios tab: one fetch, grouped client-side.** `GET /sintomas` does return each symptom's medicines, but only as `RemedioResumidoResponse` — no dose, posology or contraindication. So the tab fetches the full `GET /remedios` once and groups by symptom in `remediosParaSintoma()`, matching ids as strings. `sintomasCarregados` / `remediosCarregados` / `sintomaSelecionadoId` hold the tab's state; clicking a chip only re-renders, with no request. The two alert lists come from their own endpoints because the 30-day window is a server-side decision — don't reimplement it here.

- **Consuming is the only write in the app.** `PUT remedios/consumir/{id}` subtracts one dose from stock and records a `Consumo`. The backend rejects it when `quantidade < dose`, so `podeConsumir()` disables the button in that case rather than letting the request fail. After a successful consumption the whole tab reloads, because stock changed and the medicine may now belong in an alert list; `sintomaSelecionadoId` survives so the user stays where they were.

- **Backend messages reach the screen.** `apiRequest` runs a failed response through `extrairMensagemErro()`, which reads the services' `[{ "mensagem": "..." }]` error shape (their `ErrorHandler` / `ErrorDefaultDTO`). Without it an insufficient stock would surface as `Erro HTTP: 404` instead of the sentence the service wrote.

- **Three date shapes, three formatters.** `formatarDataUTC` is for fields written as `LocalDateTime.now(UTC)` (`criado`): it appends `Z` and converts to `America/Sao_Paulo`. `formatarDataHoraLocal` is for a naive local timestamp that must **not** be converted — the invoice emission date (`compra.data`), scraped from the SEFAZ page already in local time. Using the wrong one shifts the value by three hours. `formatarDataISO` is for a date with no time at all (`remedio.validade`, `"yyyy-MM-dd"`); parsing that through `new Date()` would land it in the previous day for negative UTC offsets.

## Conventions

- Identifiers, comments, commit messages, and UI copy are in **Portuguese**. Match that.
- Commit prefixes in history: `feat:` / `fix:`.
- Keep everything in `index.html` unless there's a strong reason to add a file — the deploy pipeline only copies `index.html` and `nginx.conf`.
