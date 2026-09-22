# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page dashboard (Saúde, Energia, Salário) for a personal microservices system. The **entire application is `index.html`** — markup, CSS in one `<style>` block, and all JavaScript in one `<script>` block at the end of `<body>`. There is no build step, no bundler, no framework, no `package.json`, and no test suite. Dependencies (Bootstrap 5, Chart.js, `chartjs-plugin-datalabels`) are loaded from CDNs in `<head>`.

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

The gateway fronts several Spring services; this frontend calls four, all under `API_BASE`:

- `autenticacao-service` — `login` and `refresh-token`
- `energia-service` — `acompanhamentos/*` endpoints (solar generation/consumption/balance) and `total`
- `salario-service` — `folha/ano/{ano}` (payroll for a year) and `folha/{id}` (detail with line items)
- `saude-service` — `treinos/*` and `metricas/*` (weekly/moving-average health series)

Sibling repos for these live at `../sistema-*-service`.

## Architecture of the script

Read these concerns together; they span the whole `<script>`:

- **Auth + auto-refresh.** `apiRequest({url, ...})` is the single entry point for every backend call. It calls `garantirAccessTokenValido()` first (refreshes proactively when the access token is expired or within `TOKEN_BUFFER_SECONDS` of expiry), then retries once on a 401/403 by calling `renovarToken()`. On terminal auth failure it throws `'Sessão expirada'` / `'não autenticado'`, which the loaders catch to force re-login. Tokens and the logged-in username live in `localStorage` (`salvar*`/`obter*`/`remover*` helpers).

- **Three tabs, three loaders.** `carregarEnergiaDashboard()`, `carregarSalarioDashboard(ano)`, `carregarSaudeDashboard()` each `Promise.all` their endpoints, transform, then build charts. `carregarDashboard()` runs all three; `carregarSomenteSalario()` reloads just the Salário tab when the year `<select>` changes (year is persisted in `localStorage`).

- **Chart lifecycle.** Every chart has a module-level variable (`graficoXxx`), a `criarGraficoXxx(...)` factory, and is torn down by `destruirGraficos*()` before each reload — Chart.js leaks/duplicates canvases otherwise. All charts share `opcoesPadraoComDatalabels(titleText, formatter)` for options; per-chart `scales` are spread in *after* it and fully replace any scales it defines.

- **Data shaping.** Series come newest-first from the API; `ordenarCrescente()` reverses to chronological. `formatarPeriodoMesAno`, `parseMoedaBR`/`formatarMoedaBR` (BR number format: `.` thousands, `,` decimal), `formatarKwh`, `formatarDataUTC` (assumes naive UTC strings, converts to `America/Sao_Paulo`) are the shared formatters. Payroll aggregation: `agruparFolhasPorMes`, `agruparFolhasPorTipo`.

- **Mobile handling.** `isMobile()` is `window.innerWidth <= 768`, checked at chart-creation time (not reactive to rotation). `reduzirListaParaMobile()` drops the older half of every series on phones. `opcoesPadraoComDatalabels` scales fonts down, switches datalabels to `'auto'`, and relies on the fixed-height `.grafico-card .card-body` container plus `maintainAspectRatio: false` for vertical space. The `<style>` block also sets `viewport-fit=cover` / safe-area padding.

- **Payroll detail modal.** Table rows carry `data-folha-id`; a delegated click handler on the `<tbody>` calls `abrirDetalheFolha(id)`, which fetches `folha/{id}` and renders proventos/descontos sub-tables via template strings. All interpolated API strings go through `escapeHtml()`.

## Conventions

- Identifiers, comments, commit messages, and UI copy are in **Portuguese**. Match that.
- Commit prefixes in history: `feat:` / `fix:`.
- Keep everything in `index.html` unless there's a strong reason to add a file — the deploy pipeline only copies `index.html` and `nginx.conf`.
