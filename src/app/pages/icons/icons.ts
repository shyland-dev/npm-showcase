import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, FormFieldComponent, IconComponent, InputComponent, SnackbarService, SpinnerComponent } from '@shyland-dev/ui';
import { PageHeader } from '../../shared/page-header';

const PAGE = 120;

@Component({
  selector: 'app-icons',
  imports: [FormsModule, ButtonComponent, FormFieldComponent, IconComponent, InputComponent, SpinnerComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './icons.scss'],
  template: `
    <div class="page">
      <app-page-header title="Ícones" summary="Catálogo completo (~2000 ícones). Ele não entra no bundle inicial: esta página baixa o chunk sob demanda. Toque num ícone para copiar o nome." />

      <shy-form-field label="Buscar" [hint]="filtered().length + ' ícones'">
        <shy-icon slot="prefix" name="search" />
        <input shyInput type="search" placeholder="home, arrow, heart…" [ngModel]="query()" (ngModelChange)="query.set($event); shown.set(120)" />
      </shy-form-field>

      @if (loading()) {
        <shy-spinner label="Carregando catálogo" />
      } @else {
        <ul class="grid">
          @for (n of visible(); track n) {
            <li>
              <button type="button" class="tile" [attr.aria-label]="n" (click)="copy(n)">
                <shy-icon [name]="n" [hoverFill]="true" [hoverFillDelay]="150" />
                <span>{{ n }}</span>
              </button>
            </li>
          }
        </ul>
        @if (visible().length < filtered().length) {
          <button shyButton variant="outline" (click)="shown.set(shown() + 240)">Mostrar mais ({{ filtered().length - visible().length }})</button>
        }
      }
    </div>
  `,
})
export class Icons {
  private readonly snackbar = inject(SnackbarService);

  readonly names = signal<string[]>([]);
  readonly loading = signal(true);
  readonly query = signal('');
  readonly shown = signal(PAGE);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.names()
      .filter((n) => !n.endsWith('-fill') || q.includes('fill'))
      .filter((n) => n.includes(q));
  });
  readonly visible = computed(() => this.filtered().slice(0, this.shown()));

  constructor() {
    // Só os nomes: o entry `catalog` é o mesmo chunk que a lib baixa sob demanda. Importar `ICONS` de
    // '@shyland-dev/ui/icons' (mesmo módulo dos icon* individuais) puxaria o catálogo para o bundle inicial.
    import('@shyland-dev/ui/icons/catalog').then((m) => {
      this.names.set(Object.keys(m.ICONS));
      this.loading.set(false);
    });
  }

  async copy(name: string): Promise<void> {
    const exportName =
      'icon' +
      name
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');
    try {
      await navigator.clipboard.writeText(name);
      this.snackbar.show(`Copiado: ${name} (${exportName})`, { intent: 'success' });
    } catch {
      this.snackbar.show(`${name} (${exportName})`);
    }
  }
}
