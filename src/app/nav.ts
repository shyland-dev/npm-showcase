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
    label: 'Casos reais',
    items: [
      { path: 'caso-dashboard', label: 'Dashboard', icon: 'graph-up', summary: 'Métricas, tabela de faturas e atividade.' },
      { path: 'caso-configuracoes', label: 'Configurações', icon: 'gear', summary: 'Perfil, notificações, segurança e plano.' },
      { path: 'caso-checkout', label: 'Checkout', icon: 'bag', summary: 'Stepper com formulário e confirmação.' },
      { path: 'caso-inbox', label: 'Caixa de entrada', icon: 'inbox', summary: 'Lista, filtros em Drawer, menu e desfazer.' },
    ],
  },
];

export const ALL_ITEMS = NAV.flatMap((g) => g.items);
