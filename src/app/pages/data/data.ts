import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AvatarComponent, BadgeComponent, CardComponent, DividerComponent, IconComponent, ListComponent, ListItemComponent, TableCellDirective, TableColumnComponent, TableComponent } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';
import { INVOICES, Invoice, STATUS_INTENT, brl } from '../../shared/data';

@Component({
  selector: 'app-data',
  imports: [AvatarComponent, BadgeComponent, CardComponent, DividerComponent, IconComponent, ListComponent, ListItemComponent, TableCellDirective, TableColumnComponent, TableComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './data.scss'],
  templateUrl: './data.html',
})
export class Data {
  readonly sections = [
    { id: 'table', label: 'Table' },
    { id: 'list', label: 'List' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'card', label: 'Card' },
    { id: 'divider', label: 'Divider' },
  ];

  readonly invoices = signal<Invoice[]>(INVOICES);
  readonly empty = signal<Invoice[]>([]);
  readonly selected = signal<unknown[]>([]);
  readonly sort = signal<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'total', direction: 'desc' });
  readonly page = signal(1);
  readonly selectedTotal = computed(() =>
    brl(
      this.invoices()
        .filter((i) => this.selected().includes(i.id))
        .reduce((s, i) => s + i.total, 0),
    ),
  );
  readonly statusIntent = (r: Invoice) => STATUS_INTENT[r.status];
  readonly brl = brl;

  readonly team = [
    { id: 'ana', name: 'Ana Souza', email: 'ana@shyland.dev', role: 'Admin' },
    { id: 'bruno', name: 'Bruno Lima', email: 'bruno@shyland.dev', role: 'Dev' },
    { id: 'carla', name: 'Carla Dias', email: 'carla@shyland.dev', role: 'Design' },
    { id: 'diego', name: 'Diego Reis', email: 'diego@shyland.dev', role: 'Dev' },
  ];
  readonly member = signal('ana');
  readonly sizes = ['sm', 'md', 'lg', 'xl'] as const;
}
