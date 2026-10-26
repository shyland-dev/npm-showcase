import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent, IconComponent } from '@shyland-dev/ui';
import { NAV } from '../../nav';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, CardComponent, IconComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../../shared/page.scss',
  template: `
    <div class="page">
      <app-page-header title="@shyland-dev/ui" summary="Catálogo de todos os componentes da ui 1.3 e dos helpers da utils 0.1 em exemplos reais e dinâmicos. Use a barra do topo para simular celular, tablet, notebook, desktop e TV; o layout só muda entre retrato e paisagem." />

      @for (g of groups; track g.label) {
        <section>
          <h2 class="shy-h5">{{ g.label }}</h2>
          <div class="shy-grid grid" style="--shy-grid-min: calc(var(--shy-responsive-unit) * 90)">
            @for (i of g.items; track i.path) {
              <a shyCard [routerLink]="'/' + i.path">
                <span slot="header" class="head"><shy-icon [name]="i.icon" />{{ i.label }}</span>
                {{ i.summary }}
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    h2 {
      margin: 0 0 var(--shy-space-3);
    }
    .head {
      display: inline-flex;
      align-items: center;
      gap: var(--shy-space-2);
    }
  `,
})
export class Overview {
  readonly groups = NAV.filter((g) => g.label !== 'Início');
}
