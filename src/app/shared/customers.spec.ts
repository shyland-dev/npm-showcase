import { describe, expect, it } from 'vitest';
import { CUSTOMERS, NO_FILTERS, filterCustomers, isCustomerFilters, toCsv } from './customers';

describe('filterCustomers', () => {
  it('sem filtros devolve todos', () => {
    expect(filterCustomers(CUSTOMERS, NO_FILTERS)).toHaveLength(CUSTOMERS.length);
  });

  it('busca ignora acento e maiúsculas', () => {
    const r = filterCustomers(CUSTOMERS, { ...NO_FILTERS, term: 'FENIX' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => c.name.startsWith('Fênix'))).toBe(true);
  });

  it('combina status, plano e MRR mínimo', () => {
    const r = filterCustomers(CUSTOMERS, { term: '', status: ['Ativo'], plan: ['Pro'], minMrr: 100 });
    expect(r.every((c) => c.status === 'Ativo' && c.plan === 'Pro' && c.mrr >= 100)).toBe(true);
  });
});

describe('isCustomerFilters', () => {
  it('aceita o formato salvo e rejeita lixo', () => {
    expect(isCustomerFilters(NO_FILTERS)).toBe(true);
    expect(isCustomerFilters({ term: 1 })).toBe(false);
    expect(isCustomerFilters(null)).toBe(false);
  });
});

describe('toCsv', () => {
  it('gera cabeçalho e uma linha por cliente, escapando aspas', () => {
    const csv = toCsv([{ ...CUSTOMERS[0], name: 'A "B"' }]).split('\n');
    expect(csv).toHaveLength(2);
    expect(csv[1]).toContain('"A ""B"""');
  });
});
