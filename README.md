# npm-showcase

Catálogo de **todos** os componentes do [`@shyland-dev/ui`](https://github.com/shyland-dev/npm) (1.3.0) em casos reais funcionando: formulários validados, dashboard, configurações, checkout e caixa de entrada, tabela com filtros, tarefas otimistas e painel ao vivo, além dos helpers do [`@shyland-dev/utils`](https://github.com/shyland-dev/npm) (0.1.0). Feito para testar em celular, tablet, notebook, desktop e TV.

## Rodar

```bash
npm ci
npm start          # http://localhost:4200
npm run build      # dist/npm-showcase (produção)
npm run build:dev  # build de desenvolvimento (logger da utils ativo)
npm test           # vitest (lógica de filtros da tabela)
```

## Como funciona

- **Simulador de dispositivo** (barra do topo): Celular 360×800, Tablet 768×1024, Notebook 1366×768, Desktop 1920×1080 e TV 4K 3840×2160. O app roda num `iframe` com o viewport do dispositivo (reduzido para caber), então a `--shy-responsive-unit` da lib reage como num aparelho real. Celular e tablet giram. Tema e rota ficam em sincronia entre a barra e o iframe.
- **Responsividade sem `@media` de largura**: o dimensionamento vem só de `ru()` / `--shy-responsive-unit` e de grids intrínsecos (`auto-fit`, `minmax`, `min()`). As únicas queries são `orientation: portrait` / `landscape` (as duas "versões"): em retrato a navegação vira Drawer (comportamento nativo do `shy-app-shell` desde a 1.2.0) e os painéis empilham; em paisagem a sidebar é fixa e os painéis ficam lado a lado.
- **Tema**: escuro por padrão, com `<shy-theme-toggle>` e script anti-flash no `index.html`.
- **Ícones**: só os usados entram no bundle (`provideShyIcons`). A página Ícones baixa o catálogo completo sob demanda.

## Páginas

| Grupo                   | Páginas                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Componentes             | Ações · Formulários · Feedback · Sobreposições · Navegação · Dados · Ícones                                                                                                                                                                                                                                       |
| Novidades e fundamentos | **Novidades da 1.3** (toast com swipe, `undo()`, `promise()`, `update()`, `id`; Drawer `dragToClose`/`showHandle`; Dialog `presentation`; `delayedFlag`; safe areas; haptics) · **Tema e tokens** (ThemeService, cores, tipografia, layout, playground de tokens)                                                 |
| `@shyland-dev/utils`    | **Logger ao vivo** (`createShyLogger`, `injectShyLogger`, `provideShyLogger({ sink })`, filtro de namespaces, `utils/testing`) · **Helpers** (`shyStorage`, `injectShyMediaQuery`, `shyDebounced`, `shyInvariant`, `shyDevOnly`, `shyDeprecated`, `shyMeasure`, `injectShyPlatform`, `onShyDestroy`, type guards) |
| Casos reais             | Dashboard · Configurações · Checkout · Caixa de entrada · **Tabela com filtros** · **Tarefas otimistas** · **Painel ao vivo**                                                                                                                                                                                     |

## Observações

- **Logger só em desenvolvimento:** a utils troca o logger por um no-op no build de produção (`ngDevMode`). No site publicado a página "Logger ao vivo" avisa isso e fica vazia; rode `npm start` (ou `npm run build:dev`) para ver as entradas. O mesmo vale para `shyInvariant`, `shyDevOnly`, `shyDeprecated` e `shyMeasure`.
- **Persistência:** filtros da tabela, tarefas e anotações usam `shyStorage` (`localStorage`, sincroniza entre abas).
- **Haptics e Alt+T:** `provideShySnackbar({ haptics: true, focusHotkey: 'Alt+T' })` em `app.config.ts`. A vibração só existe no Android; safe areas e gestos de toque não foram validados em aparelho real com notch.
- **Deploy:** o workflow publica no GitHub Pages a cada push na `prod`; em PR só valida o build.
