import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, IconComponent, ListComponent, ListItemComponent, MenuComponent, MenuDirective, MenuItemComponent, ProgressComponent, SelectComponent, ShySelectOption, SkeletonComponent, SnackbarService, TableCellDirective, TableColumnComponent, TableComponent } from '@shyland-dev/ui';
import { PageHeader } from '../../shared/page-header';
import { INVOICES, STATUS_INTENT, Invoice, brl } from '../../shared/data';

const RANGES: ShySelectOption[] = [
  { value: 7, label: 'Últimos 7 dias' },
  { value: 30, label: 'Últimos 30 dias' },
  { value: 90, label: 'Últimos 90 dias' },
];

@Component({
  selector: 'app-case-dashboard',
  imports: [AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, IconComponent, ListComponent, ListItemComponent, MenuComponent, MenuDirective, MenuItemComponent, ProgressComponent, SelectComponent, SkeletonComponent, TableCellDirective, TableColumnComponent, TableComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Dashboard" summary="Métricas, metas, faturas e atividade recente: Card, Badge, Progress, Table, List, Select, Menu e Skeleton juntos." />

      <div class="toolbar">
        <shy-select class="range" [options]="ranges" [(value)]="range" label="Período" />
        <button shyButton variant="outline" [shyMenu]="exportMenu"><shy-icon slot="start" name="download" />Exportar<shy-icon slot="end" name="chevron-down" /></button>
        <ng-template #exportMenu>
          <shy-menu label="Exportar">
            <button shyMenuItem (click)="exportAs('CSV')">CSV</button>
            <button shyMenuItem (click)="exportAs('PDF')"><shy-icon slot="start" name="file-earmark-pdf" />PDF</button>
          </shy-menu>
        </ng-template>
        <button shyButton variant="ghost" [loading]="refreshing()" loadingPosition="start" loadingText="Atualizando…" (click)="refresh()"><shy-icon slot="start" name="arrow-repeat" />Atualizar</button>
      </div>

      <section class="kpis" aria-label="Indicadores" [attr.aria-busy]="refreshing()">
        @for (k of kpis(); track k.label) {
          <shy-card>
            <span slot="header" class="kpi-label"><shy-icon [name]="k.icon" />{{ k.label }}</span>
            @if (refreshing()) {
              <shy-skeleton [lines]="2" />
            } @else {
              <strong class="kpi-value">{{ k.value }}</strong>
              <shy-badge [intent]="k.delta >= 0 ? 'success' : 'danger'" size="sm">{{ k.delta >= 0 ? '▲' : '▼' }} {{ k.delta >= 0 ? '+' : '' }}{{ k.delta }}%</shy-badge>
            }
          </shy-card>
        }
      </section>

      <div class="cols">
        <shy-card class="span-2">
          <span slot="header">Faturas recentes</span>
          <shy-table [rows]="rows" rowKey="id" label="Faturas recentes" [dense]="true" [pageSize]="5" paginationLabel="Paginação">
            <shy-column key="id" header="Fatura" [rowHeader]="true" />
            <shy-column key="customer" header="Cliente" />
            <shy-column key="status" header="Status">
              <ng-template shyCell let-row
                ><shy-badge size="sm" [intent]="statusIntent(row)">{{ row.status }}</shy-badge></ng-template
              >
            </shy-column>
            <shy-column key="total" header="Total" [numeric]="true">
              <ng-template shyCell let-value="value">{{ brl(value) }}</ng-template>
            </shy-column>
          </shy-table>
        </shy-card>

        <div class="side">
          <shy-card>
            <span slot="header">Metas do mês</span>
            <div class="goals">
              @for (g of goals; track g.label) {
                <div>
                  <div class="goal-head">
                    <span>{{ g.label }}</span
                    ><span class="shy-small">{{ g.value }}%</span>
                  </div>
                  <shy-progress [value]="g.value" [label]="g.label" />
                </div>
              }
            </div>
          </shy-card>

          <shy-card>
            <span slot="header">Atividade</span>
            <shy-list aria-label="Atividade recente">
              @for (a of activity; track a.who) {
                <shy-list-item>
                  <shy-avatar slot="start" [name]="a.who" size="sm" />
                  {{ a.who }}
                  <span slot="secondary">{{ a.what }}</span>
                </shy-list-item>
              }
            </shy-list>
          </shy-card>
        </div>
      </div>
    </div>
  `,
})
export class CaseDashboard {
  private readonly snackbar = inject(SnackbarService);

  readonly ranges = RANGES;
  readonly range = signal<number | null>(30);
  readonly refreshing = signal(false);
  readonly rows: Invoice[] = INVOICES;
  readonly brl = brl;
  readonly statusIntent = (r: Invoice) => STATUS_INTENT[r.status];

  readonly kpis = computed(() => {
    const f = (this.range() ?? 30) / 30;
    return [
      { label: 'Receita', icon: 'credit-card', value: brl(48230 * f), delta: 12 },
      { label: 'Pedidos', icon: 'bag', value: Math.round(312 * f).toLocaleString('pt-BR'), delta: 4 },
      { label: 'Clientes novos', icon: 'people', value: Math.round(87 * f).toLocaleString('pt-BR'), delta: -3 },
      { label: 'Entregas', icon: 'truck', value: Math.round(298 * f).toLocaleString('pt-BR'), delta: 8 },
    ];
  });

  readonly goals = [
    { label: 'Receita', value: 78 },
    { label: 'Novos clientes', value: 52 },
    { label: 'NPS', value: 91 },
  ];

  readonly activity = [
    { who: 'Ana Souza', what: 'aprovou a fatura INV-1004' },
    { who: 'Bruno Lima', what: 'publicou a versão 1.1.1' },
    { who: 'Carla Dias', what: 'comentou no pedido #312' },
    { who: 'Diego Reis', what: 'cadastrou um cliente' },
  ];

  refresh(): void {
    this.refreshing.set(true);
    setTimeout(() => this.refreshing.set(false), 1200);
  }

  exportAs(kind: string): void {
    this.snackbar.show(`Exportação ${kind} iniciada`, { intent: 'info' });
  }
}
