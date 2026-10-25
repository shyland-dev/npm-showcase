import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardComponent } from '@shyland-dev/ui';

/** Seção de um componente: título, descrição, exemplo ao vivo e (opcional) o código de uso. */
@Component({
  selector: 'app-demo',
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="demo" [attr.id]="anchor()" [attr.aria-labelledby]="anchor() + '-h'">
      <h2 class="shy-h4" [attr.id]="anchor() + '-h'">{{ title() }}</h2>
      @if (description()) {
        <p class="shy-body desc">{{ description() }}</p>
      }
      <shy-card [elevation]="1">
        <div class="stage"><ng-content /></div>
        @if (code()) {
          <details slot="footer" class="code">
            <summary>Ver código</summary>
            <pre class="shy-code"><code>{{ code() }}</code></pre>
          </details>
        }
      </shy-card>
    </section>
  `,
  styles: `
    :host {
      display: block;
      scroll-margin-block-start: calc(var(--shy-responsive-unit) * 24);
    }
    .demo {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--shy-space-3);
    }
    h2,
    .desc {
      margin: 0;
    }
    .desc {
      color: var(--shy-color-text-muted);
    }
    .stage {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--shy-space-4);
      min-inline-size: 0;
    }
    summary {
      cursor: pointer;
      color: var(--shy-color-primary-text);
      font-size: var(--shy-text-sm);
    }
    pre {
      margin: var(--shy-space-3) 0 0;
      padding: var(--shy-space-4);
      overflow: auto;
      border-radius: var(--shy-radius-md);
      background: var(--shy-color-surface-sunken);
      font-size: var(--shy-text-sm);
    }
  `,
})
export class Demo {
  readonly anchor = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly code = input<string>();
}
