export interface Invoice {
  id: string;
  customer: string;
  status: 'Paga' | 'Pendente' | 'Atrasada' | 'Cancelada';
  due: string;
  total: number;
}

export const STATUS_INTENT = { Paga: 'success', Pendente: 'warning', Atrasada: 'danger', Cancelada: 'neutral' } as const;

export const brl = (v: number): string => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const customers = ['Acme Ltda', 'Pixel Studio', 'Nuvem Tech', 'Padaria Central', 'Orbe Digital', 'Mercado Sul', 'Fênix Games', 'Clínica Vida', 'Auto Peças RP', 'Livraria Beta', 'Café Aroma', 'Studio Zen'];
const statuses: Invoice['status'][] = ['Paga', 'Pendente', 'Paga', 'Atrasada', 'Paga', 'Cancelada', 'Pendente'];

export const INVOICES: Invoice[] = Array.from({ length: 24 }, (_, i) => ({
  id: `INV-${String(1001 + i)}`,
  customer: customers[i % customers.length],
  status: statuses[i % statuses.length],
  due: new Date(2026, 9, 28 - i * 2).toLocaleDateString('pt-BR'),
  total: 250 + ((i * 937) % 4800) + (i % 3) * 0.5,
}));
