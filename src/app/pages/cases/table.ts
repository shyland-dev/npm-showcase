import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeComponent, ButtonComponent, CardComponent, DrawerComponent, DrawerService, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, MenuComponent, MenuDirective, MenuItemComponent, ShyOverlayRef, SHY_OVERLAY_DATA, SelectComponent, ShySelectOption, SkeletonComponent, SliderComponent, SnackbarService, TableCellDirective, TableColumnComponent, TableComponent, TooltipDirective, delayedFlag } from '@shyland-dev/ui';
import { injectShyLogger, shyDebounced, shyStorage } from '@shyland-dev/utils';
import { PageHeader } from '../../shared/page-header';
import { brl } from '../../shared/data';
import { CUSTOMERS, Customer, CustomerFilters, NO_FILTERS, PLAN_OPTIONS, STATUS_OPTIONS, filterCustomers, isCustomerFilters, toCsv } from '../../shared/customers';

const STATUS_INTENT = { Ativo: 'success', Inadimplente: 'danger', Cancelado: 'neutral' } as const;
const toOptions = (l: string[]): ShySelectOption[] => l.map((v) => ({ value: v, label: v }));

/** Detalhe do cliente num Drawer com arrastar para fechar. */
@Component({
  selector: 'app-customer-drawer',
  imports: [BadgeComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <shy-drawer [heading]="c.name" closeLabel="Fechar" (dismissed)="ref.close()">
      <dl class="d">
        <dt>ID</dt>
        <dd>{{ c.id }}</dd>
        <dt>E-mail</dt>
        <dd>{{ c.email }}</dd>
        <dt>Plano</dt>
        <dd>{{ c.plan }}</dd>
        <dt>Status</dt>
        <dd>
          <shy-badge [intent]="intent[c.status]" [dot]="true">{{ c.status }}</shy-badge>
        </dd>
        <dt>MRR</dt>
        <dd>{{ brl(c.mrr) }}</dd>
        <dt>Cliente desde</dt>
        <dd>{{ c.since }}</dd>
      </dl>
    </shy-drawer>
  `,
  styles: `
    .d {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--shy-space-3) var(--shy-space-5);
      margin: 0;
    }
    dt {
      color: var(--shy-color-text-muted);
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
  `,
})
export class CustomerDrawer {
  readonly ref = inject<ShyOverlayRef<void>>(ShyOverlayRef);
  readonly c = inject<Customer>(SHY_OVERLAY_DATA);
  readonly intent = STATUS_INTENT;
  readonly brl = brl;
}

@Component({
  selector: 'app-case-table',
  imports: [FormsModule, BadgeComponent, ButtonComponent, CardComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, MenuComponent, MenuDirective, MenuItemComponent, SelectComponent, SkeletonComponent, SliderComponent, TableCellDirective, TableColumnComponent, TableComponent, TooltipDirective, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Tabela com filtros" summary="Busca com shyDebounced, filtros persistidos com shyStorage, carregamento sem piscar (delayedFlag), ordenação, paginação, seleção em massa e exclusão com desfazer." />

      <shy-card>
        <span slot="header">Filtros</span>
        <div class="filters">
          <shy-form-field label="Buscar" hint="Nome, e-mail ou ID (sem acento)">
            <shy-icon slot="prefix" name="search" />
            <input shyInput type="search" [ngModel]="filters().term" (ngModelChange)="set('term', $event)" placeholder="ex.: padaria" autocomplete="off" />
          </shy-form-field>
          <shy-form-field label="Status"><shy-select [options]="statusOptions" [value]="filters().status" (valueChange)="set('status', $any($event))" multiple placeholder="Todos os status" /></shy-form-field>
          <shy-form-field label="Plano"><shy-select [options]="planOptions" [value]="filters().plan" (valueChange)="set('plan', $any($event))" multiple placeholder="Todos os planos" /></shy-form-field>
          <shy-form-field label="MRR mínimo"><shy-slider [value]="filters().minMrr" (valueChange)="set('minMrr', $event)" [min]="0" [max]="500" [step]="20" [displayWith]="money" showValue /></shy-form-field>
        </div>
        <div slot="footer" class="row">
          <span class="value">{{ result().length }} de {{ total }} cliente(s){{ dirty() ? ' · filtros salvos neste navegador' : '' }}</span>
          <button shyButton size="sm" variant="ghost" intent="neutral" [disabled]="!dirty()" (click)="clear()"><shy-icon slot="start" name="x-lg" />Limpar filtros</button>
        </div>
      </shy-card>

      <shy-card>
        <span slot="header" class="row">
          Clientes
          @if (selected().length) {
            <shy-badge intent="primary" size="sm">{{ selected().length }} selecionado(s)</shy-badge>
          }
          <button shyButton size="sm" variant="outline" class="push" [shyMenu]="bulk" [disabled]="!selected().length">Ações em massa<shy-icon slot="end" name="chevron-down" /></button>
        </span>
        <ng-template #bulk>
          <shy-menu label="Ações em massa">
            <button shyMenuItem (click)="remove()"><shy-icon slot="start" name="trash" />Excluir selecionados</button>
            <button shyMenuItem (click)="exportCsv(true)"><shy-icon slot="start" name="download" />Exportar seleção (CSV)</button>
          </shy-menu>
        </ng-template>

        <div [attr.aria-busy]="showSkeleton()">
          @if (showSkeleton()) {
            <shy-skeleton [lines]="6" />
          } @else {
            <shy-table [rows]="result()" rowKey="id" label="Clientes" [selectable]="true" [(selection)]="selected" [(sort)]="sort" [(page)]="page" [pageSize]="8" [striped]="true" selectAllLabel="Selecionar todos" selectRowLabel="Selecionar linha" paginationLabel="Paginação dos clientes" emptyHeading="Nenhum cliente encontrado" emptyDescription="Ajuste os filtros ou limpe-os.">
              <shy-column key="name" header="Cliente" [rowHeader]="true" [sortable]="true" />
              <shy-column key="plan" header="Plano" [sortable]="true" />
              <shy-column key="status" header="Status" [sortable]="true">
                <ng-template shyCell let-row
                  ><shy-badge size="sm" [dot]="true" [intent]="statusIntent(row)">{{ row.status }}</shy-badge></ng-template
                >
              </shy-column>
              <shy-column key="mrr" header="MRR" [sortable]="true" [numeric]="true">
                <ng-template shyCell let-value="value">{{ brl(value) }}</ng-template>
              </shy-column>
              <shy-column key="id" header="Ver">
                <ng-template shyCell let-row
                  ><button shyIconButton size="sm" [label]="'Detalhes de ' + row.name" shyTooltip="Detalhes" (click)="details(row)"><shy-icon name="eye" /></button
                ></ng-template>
              </shy-column>
            </shy-table>
          }
        </div>
        <div slot="footer" class="row">
          <button shyButton size="sm" variant="outline" (click)="exportCsv(false)"><shy-icon slot="start" name="download" />Exportar resultado (CSV)</button>
          <span class="value">Receita recorrente do filtro: {{ brl(mrrTotal()) }}</span>
        </div>
      </shy-card>
    </div>
  `,
})
export class CaseTable {
  private readonly snackbar = inject(SnackbarService);
  private readonly drawers = inject(DrawerService);
  private readonly log = injectShyLogger('Tabela');

  readonly statusOptions = toOptions(STATUS_OPTIONS);
  readonly planOptions = toOptions(PLAN_OPTIONS);
  readonly statusIntent = (c: Customer) => STATUS_INTENT[c.status];
  readonly brl = brl;
  readonly money = (v: number) => brl(v);

  readonly data = signal<Customer[]>(CUSTOMERS);
  readonly total = CUSTOMERS.length;

  readonly filters = shyStorage<CustomerFilters>('showcase-customer-filters', NO_FILTERS, { validate: isCustomerFilters });
  /** A busca só filtra 300 ms depois da última tecla; os demais filtros entram na hora. */
  private readonly debouncedTerm = shyDebounced(
    computed(() => this.filters().term),
    300,
  );
  readonly effective = computed<CustomerFilters>(() => ({ ...this.filters(), term: this.debouncedTerm() }));
  readonly result = computed(() => filterCustomers(this.data(), this.effective()));
  readonly mrrTotal = computed(() => this.result().reduce((s, c) => s + c.mrr, 0));
  readonly dirty = computed(() => JSON.stringify(this.filters()) !== JSON.stringify(NO_FILTERS));

  readonly selected = signal<unknown[]>([]);
  readonly sort = signal<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'mrr', direction: 'desc' });
  readonly page = signal(1);

  /** Busca simulada: cargas curtas não mostram skeleton; longas mostram por pelo menos 400 ms. */
  readonly fetching = signal(false);
  readonly showSkeleton = delayedFlag(this.fetching, { delay: 200, minDuration: 400 });

  constructor() {
    effect((onCleanup) => {
      const key = JSON.stringify(this.effective());
      const latency = 100 + (key.length % 7) * 150;
      untracked(() => {
        this.fetching.set(true);
        this.page.set(1);
      });
      const id = setTimeout(() => {
        this.fetching.set(false);
        this.log.debug('resultado', this.result().length, 'em', latency, 'ms');
      }, latency);
      onCleanup(() => clearTimeout(id));
    });
  }

  set<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K] | null): void {
    this.filters.update((f) => ({ ...f, [key]: value ?? NO_FILTERS[key] }));
  }

  clear(): void {
    this.filters.set(NO_FILTERS);
  }

  details(c: Customer): void {
    this.drawers.open(CustomerDrawer, { side: 'end', data: c, dragToClose: true, ariaLabel: `Detalhes de ${c.name}` });
  }

  async remove(): Promise<void> {
    const ids = new Set(this.selected() as string[]);
    const before = this.data();
    this.data.set(before.filter((c) => !ids.has(c.id)));
    this.selected.set([]);
    const r = await this.snackbar.undo(`${ids.size} cliente(s) excluído(s)`);
    if (r === 'undo') this.data.set(before);
    this.log.info('exclusão em massa', r, ids.size);
  }

  exportCsv(onlySelected: boolean): void {
    const ids = new Set(this.selected() as string[]);
    const rows = onlySelected ? this.result().filter((c) => ids.has(c.id)) : this.result();
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.snackbar.show(`${rows.length} linha(s) exportada(s)`, { intent: 'success' });
  }
}
