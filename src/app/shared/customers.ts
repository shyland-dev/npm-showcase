export type CustomerStatus = 'Ativo' | 'Inadimplente' | 'Cancelado';
export type CustomerPlan = 'Free' | 'Pro' | 'Time';

export interface Customer {
  id: string;
  name: string;
  email: string;
  plan: CustomerPlan;
  status: CustomerStatus;
  mrr: number;
  since: string;
}

export interface CustomerFilters {
  term: string;
  status: CustomerStatus[];
  plan: CustomerPlan[];
  minMrr: number;
}

export const NO_FILTERS: CustomerFilters = { term: '', status: [], plan: [], minMrr: 0 };

export const STATUS_OPTIONS: CustomerStatus[] = ['Ativo', 'Inadimplente', 'Cancelado'];
export const PLAN_OPTIONS: CustomerPlan[] = ['Free', 'Pro', 'Time'];

const names = ['Acme Ltda', 'Pixel Studio', 'Nuvem Tech', 'Padaria Central', 'Orbe Digital', 'Mercado Sul', 'Fênix Games', 'Clínica Vida', 'Auto Peças RP', 'Livraria Beta', 'Café Aroma', 'Studio Zen', 'Ótica Visão', 'Transportes Leste', 'Escola Horizonte'];
const plans: CustomerPlan[] = ['Free', 'Pro', 'Time', 'Pro', 'Free'];
const statuses: CustomerStatus[] = ['Ativo', 'Ativo', 'Inadimplente', 'Ativo', 'Cancelado', 'Ativo'];
const mrrByPlan: Record<CustomerPlan, number> = { Free: 0, Pro: 99, Time: 349 };

export const CUSTOMERS: Customer[] = Array.from({ length: 80 }, (_, i) => {
  const plan = plans[i % plans.length];
  const name = `${names[i % names.length]}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''}`;
  return {
    id: `CLI-${String(2001 + i)}`,
    name,
    email: `contato${i + 1}@${name
      .normalize('NFD')
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase()}.com.br`,
    plan,
    status: statuses[(i * 7) % statuses.length],
    mrr: mrrByPlan[plan] + (plan === 'Free' ? 0 : (i % 5) * 20),
    since: new Date(2024, i % 12, 1 + (i % 27)).toLocaleDateString('pt-BR'),
  };
});

const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Filtra sem diferenciar acento/maiúscula; listas vazias significam "todos". */
export function filterCustomers(list: Customer[], f: CustomerFilters): Customer[] {
  const term = fold(f.term.trim());
  return list.filter((c) => (!term || fold(c.name).includes(term) || fold(c.email).includes(term) || c.id.toLowerCase().includes(term)) && (!f.status.length || f.status.includes(c.status)) && (!f.plan.length || f.plan.includes(c.plan)) && c.mrr >= f.minMrr);
}

export function isCustomerFilters(v: unknown): v is CustomerFilters {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o['term'] === 'string' && Array.isArray(o['status']) && Array.isArray(o['plan']) && typeof o['minMrr'] === 'number';
}

export function toCsv(rows: Customer[]): string {
  const head = ['id', 'nome', 'email', 'plano', 'status', 'mrr', 'desde'];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [head.join(','), ...rows.map((c) => [c.id, c.name, c.email, c.plan, c.status, c.mrr, c.since].map(esc).join(','))].join('\n');
}
