import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h1 class="shy-h2">{{ title() }}</h1>
      <p class="shy-body-lg">{{ summary() }}</p>
      @if (sections().length) {
        <nav aria-label="Nesta página" class="shy-cluster">
          @for (s of sections(); track s.id) {
            <a [routerLink]="[]" [fragment]="s.id">{{ s.label }}</a>
          }
        </nav>
      }
    </header>
  `,
  styles: `
    header {
      display: grid;
      gap: var(--shy-space-3);
    }
    h1,
    p {
      margin: 0;
    }
    p {
      color: var(--shy-color-text-muted);
    }
    a {
      padding: var(--shy-space-1) var(--shy-space-3);
      border-radius: var(--shy-radius-full);
      background: var(--shy-color-primary-soft);
      color: var(--shy-color-primary-text);
      text-decoration: none;
      font-size: var(--shy-text-sm);
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly summary = input.required<string>();
  readonly sections = input<{ id: string; label: string }[]>([]);
}
