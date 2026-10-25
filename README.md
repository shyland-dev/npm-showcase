# npm-showcase

Catálogo de **todos** os componentes do [`@shyland-dev/ui`](https://github.com/shyland-dev/npm) (1.1.1) em casos reais funcionando: formulários validados, dashboard, configurações, checkout e caixa de entrada. Feito para testar em celular, tablet, notebook, desktop e TV.

## Rodar

```bash
npm ci
npm start          # http://localhost:4200
npm run build      # dist/npm-showcase
```

## Como funciona

- **Simulador de dispositivo** (barra do topo): Celular 360×800, Tablet 768×1024, Notebook 1366×768, Desktop 1920×1080 e TV 4K 3840×2160. O app roda num `iframe` com o viewport do dispositivo (reduzido para caber), então a `--shy-responsive-unit` da lib reage como num aparelho real. Celular e tablet giram. Tema e rota ficam em sincronia entre a barra e o iframe.
- **Responsividade sem `@media` de largura**: o dimensionamento vem só de `ru()` / `--shy-responsive-unit` e de grids intrínsecos (`auto-fit`, `minmax`, `min()`). As únicas queries são `orientation: portrait` / `landscape` (as duas "versões"): em retrato a navegação vira Drawer e os painéis empilham; em paisagem a sidebar é fixa e os painéis ficam lado a lado.
- **Tema**: escuro por padrão, com `<shy-theme-toggle>` e script anti-flash no `index.html`.
- **Ícones**: só os usados entram no bundle (`provideShyIcons`). A página Ícones baixa o catálogo completo sob demanda.

## Páginas

Ações · Formulários · Feedback · Sobreposições · Navegação · Dados · Ícones · Casos reais (Dashboard, Configurações, Checkout, Caixa de entrada).

> `@shyland-dev/utils` foi despublicado do npm e deixou de ser dependência.
