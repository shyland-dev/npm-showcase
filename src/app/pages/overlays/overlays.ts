import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DialogService, DividerComponent, DrawerService, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, MenuComponent, MenuDirective, MenuItemComponent, PopoverComponent, PopoverDirective, SnackbarService, TooltipDirective } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';
import { FiltersDrawer, RenameDialog } from './panels';

@Component({
  selector: 'app-overlays',
  imports: [FormsModule, ButtonComponent, DividerComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, MenuComponent, MenuDirective, MenuItemComponent, PopoverComponent, PopoverDirective, TooltipDirective, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './overlays.scss'],
  templateUrl: './overlays.html',
})
export class Overlays {
  private readonly dialogs = inject(DialogService);
  private readonly drawers = inject(DrawerService);
  private readonly snackbar = inject(SnackbarService);

  readonly sections = [
    { id: 'dialog', label: 'Dialog' },
    { id: 'drawer', label: 'Drawer' },
    { id: 'popover', label: 'Popover' },
    { id: 'menu', label: 'Menu' },
    { id: 'tooltip', label: 'Tooltip' },
  ];

  readonly projectName = signal('Loja online');
  readonly result = signal('');
  readonly placements = ['top', 'bottom', 'start', 'end'] as const;

  async rename(): Promise<void> {
    const name = await this.dialogs.open<RenameDialog, { current: string }, string>(RenameDialog, { data: { current: this.projectName() } }).closed;
    if (name) {
      this.projectName.set(name);
      this.result.set(`Renomeado para “${name}”`);
    } else this.result.set('Cancelado');
  }

  async remove(): Promise<void> {
    const ok = await this.dialogs.confirm({ title: 'Excluir projeto?', message: `“${this.projectName()}” e seus dados serão removidos. Não dá para desfazer.`, confirmLabel: 'Excluir', cancelLabel: 'Cancelar', intent: 'danger' });
    this.result.set(ok ? 'Projeto excluído' : 'Exclusão cancelada');
    if (ok) this.snackbar.show('Projeto excluído', { intent: 'success' });
  }

  async notice(): Promise<void> {
    await this.dialogs.alert({ title: 'Alterações salvas', message: 'Suas preferências já estão valendo.', okLabel: 'Entendi' });
    this.result.set('Alerta fechado');
  }

  async openDrawer(side: 'start' | 'end' | 'top' | 'bottom'): Promise<void> {
    const applied = await this.drawers.open<FiltersDrawer, unknown, boolean>(FiltersDrawer, { side, ariaLabel: 'Filtros' }).closed;
    this.result.set(applied ? 'Filtros aplicados' : 'Filtros fechados sem aplicar');
  }

  say(text: string): void {
    this.snackbar.show(text);
  }
}
