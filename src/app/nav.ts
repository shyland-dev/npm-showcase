export interface NavItem {
  path: string;
  label: string;
  icon: string;
  summary: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  { label: 'Início', items: [{ path: 'visao-geral', label: 'Visão geral', icon: 'house', summary: 'Todos os componentes num só lugar.' }] },
  {
    label: 'Componentes',
    items: [
      { path: 'acoes', label: 'Ações', icon: 'cursor', summary: 'Button e IconButton.' },
      { path: 'formularios', label: 'Formulários', icon: 'ui-checks', summary: 'Input, Checkbox, Switch, Radio, Select, Combobox, Slider e FileDropzone.' },
      { path: 'feedback', label: 'Feedback', icon: 'bell', summary: 'Alert, Badge, Spinner, Progress, Skeleton, Snackbar e EmptyState.' },
      { path: 'sobreposicoes', label: 'Sobreposições', icon: 'window', summary: 'Dialog, Drawer, Popover, Menu e Tooltip.' },
      { path: 'navegacao', label: 'Navegação', icon: 'layout-sidebar', summary: 'Tabs, Accordion, Breadcrumb, Pagination, Stepper e AppShell.' },
      { path: 'dados', label: 'Dados', icon: 'collection', summary: 'Avatar, List, Table, Card e Divider.' },
      { path: 'icones', label: 'Ícones', icon: 'grid', summary: 'Catálogo completo, carregado sob demanda.' },
    ],
  },
  {
    label: 'Novidades e fundamentos',
    items: [
      { path: 'novidades', label: 'Novidades da 1.3', icon: 'lightning', summary: 'Swipe, desfazer e promise em toast, Drawer arrastável, Dialog como folha, safe areas e delayedFlag.' },
      { path: 'tema', label: 'Tema e tokens', icon: 'palette2', summary: 'ThemeService, cores, tipografia, layout e playground de tokens.' },
    ],
  },
  {
    label: '@shyland-dev/utils',
    items: [
      { path: 'utils-logger', label: 'Logger ao vivo', icon: 'terminal', summary: 'createShyLogger, níveis, namespaces, sink próprio e entry de testing.' },
      { path: 'utils-helpers', label: 'Helpers', icon: 'braces', summary: 'shyStorage, injectShyMediaQuery, shyDebounced, helpers de dev, plataforma e type guards.' },
    ],
  },
  {
    label: 'Casos reais',
    items: [
      { path: 'caso-dashboard', label: 'Dashboard', icon: 'graph-up', summary: 'Métricas, tabela de faturas e atividade.' },
      { path: 'caso-configuracoes', label: 'Configurações', icon: 'gear', summary: 'Perfil, notificações, segurança e plano.' },
      { path: 'caso-checkout', label: 'Checkout', icon: 'bag', summary: 'Stepper com formulário e confirmação.' },
      { path: 'caso-inbox', label: 'Caixa de entrada', icon: 'inbox', summary: 'Lista, filtros em Drawer, menu e desfazer.' },
      { path: 'caso-tabela', label: 'Tabela com filtros', icon: 'table', summary: 'Busca com debounce, filtros salvos, seleção em massa, CSV e exclusão com desfazer.' },
      { path: 'caso-tarefas', label: 'Tarefas otimistas', icon: 'list-check', summary: 'Atualização otimista com rollback, promise() e undo().' },
      { path: 'caso-ao-vivo', label: 'Painel ao vivo', icon: 'activity', summary: 'Métricas em tempo real, sparklines SVG e alerta que atualiza o toast.' },
    ],
  },
];

export const ALL_ITEMS = NAV.flatMap((g) => g.items);
