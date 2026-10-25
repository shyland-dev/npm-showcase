import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, CheckboxComponent, DialogComponent, DrawerComponent, FormFieldComponent, InputComponent, RadioComponent, RadioGroupComponent, ShyOverlayRef, SHY_OVERLAY_DATA, SliderComponent } from '@shyland-dev/ui';

/** Conteúdo de um Dialog aberto por DialogService.open(). */
@Component({
  selector: 'app-rename-dialog',
  imports: [FormsModule, ButtonComponent, DialogComponent, FormFieldComponent, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <shy-dialog heading="Renomear projeto" size="sm" closeLabel="Fechar" (dismissed)="ref.close()">
      <shy-form-field label="Nome" hint="Aparece no menu e nos relatórios">
        <input shyInput [(ngModel)]="name" (keydown.enter)="ref.close(name())" />
      </shy-form-field>
      <div slot="footer">
        <button shyButton variant="ghost" intent="neutral" (click)="ref.close()">Cancelar</button>
        <button shyButton [disabled]="!name().trim()" (click)="ref.close(name().trim())">Salvar</button>
      </div>
    </shy-dialog>
  `,
})
export class RenameDialog {
  readonly ref = inject<ShyOverlayRef<string>>(ShyOverlayRef);
  private readonly data = inject<{ current: string }>(SHY_OVERLAY_DATA);
  readonly name = signal(this.data.current);
}

/** Conteúdo de um Drawer aberto por DrawerService.open(). */
@Component({
  selector: 'app-filters-drawer',
  imports: [FormsModule, ButtonComponent, CheckboxComponent, DrawerComponent, RadioComponent, RadioGroupComponent, SliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <shy-drawer heading="Filtros" closeLabel="Fechar" (dismissed)="ref.close()">
      <div class="col">
        <shy-radio-group label="Ordenar por" [(value)]="sort">
          <shy-radio value="recent">Mais recentes</shy-radio>
          <shy-radio value="price">Menor preço</shy-radio>
          <shy-radio value="rating">Melhor avaliação</shy-radio>
        </shy-radio-group>
        <shy-slider [(value)]="maxPrice" label="Preço máximo" [min]="0" [max]="1000" [step]="50" showValue />
        <shy-checkbox [(checked)]="onlyStock">Somente em estoque</shy-checkbox>
      </div>
      <div slot="footer">
        <button shyButton variant="ghost" intent="neutral" (click)="ref.close()">Limpar</button>
        <button shyButton (click)="ref.close(true)">Aplicar</button>
      </div>
    </shy-drawer>
  `,
  styles: `
    .col {
      display: grid;
      gap: var(--shy-space-5);
    }
  `,
})
export class FiltersDrawer {
  readonly ref = inject<ShyOverlayRef<boolean>>(ShyOverlayRef);
  readonly sort = signal('recent');
  readonly maxPrice = signal(500);
  readonly onlyStock = signal(true);
}
