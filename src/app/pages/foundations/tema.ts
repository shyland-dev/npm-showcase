import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeComponent, ButtonComponent, ProgressComponent, SliderComponent, ThemeService, ThemeToggleComponent, ShyThemeMode, FormFieldComponent, InputComponent, ru } from '@shyland-dev/ui';
import { injectShyMediaQuery } from '@shyland-dev/utils';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';

const THEME_LABELS = { group: 'Tema', light: 'Claro', system: 'Sistema', dark: 'Escuro' };
const SWATCHES = ['bg', 'surface', 'surface-raised', 'surface-sunken', 'border', 'text', 'text-muted', 'primary', 'primary-soft', 'primary-text', 'success', 'warning', 'danger', 'info'];
const SPACES = ['1', '2', '3', '4', '6', '8', '12'];
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
const SHADOWS = ['1', '2', '3', '4', '5'];
const TYPES = [
  { cls: 'shy-display', text: 'Display' },
  { cls: 'shy-h1', text: 'Título h1' },
  { cls: 'shy-h3', text: 'Título h3' },
  { cls: 'shy-h5', text: 'Título h5' },
  { cls: 'shy-body-lg', text: 'Corpo grande' },
  { cls: 'shy-body', text: 'Corpo' },
  { cls: 'shy-small', text: 'Pequeno' },
  { cls: 'shy-caption', text: 'Legenda' },
  { cls: 'shy-overline', text: 'Overline' },
  { cls: 'shy-code', text: 'código mono' },
];

@Component({
  selector: 'app-tema',
  imports: [FormsModule, BadgeComponent, ButtonComponent, FormFieldComponent, InputComponent, ProgressComponent, SliderComponent, ThemeToggleComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './tema.scss'],
  template: `
    <div class="page">
      <app-page-header title="Tema e tokens" summary="ThemeService, tokens semânticos, tipografia, classes de layout e um playground que sobrescreve tokens só dentro de uma caixa." [sections]="sections" />

      <div class="demos">
        <app-demo anchor="tema" title="ThemeService" description="Escuro é o padrão; claro e sistema são escolha da pessoa e ficam salvos. O script do index.html evita o flash." code="theme.setMode('system'); theme.resolved(); // 'dark' | 'light'">
          <div class="col">
            <shy-theme-toggle [labels]="labels" />
            <div class="row">
              @for (m of modes; track m) {
                <button shyButton size="sm" [variant]="theme.mode() === m ? 'solid' : 'outline'" (click)="theme.setMode(m)">{{ m }}</button>
              }
              <button shyButton size="sm" variant="ghost" intent="neutral" (click)="theme.toggle()">toggle()</button>
            </div>
            <p class="value">
              mode: <strong>{{ theme.mode() }}</strong> · resolved: <strong>{{ theme.resolved() }}</strong> · sistema prefere escuro: <strong>{{ systemDark() }}</strong>
            </p>
          </div>
        </app-demo>

        <app-demo anchor="playground" title="Playground de tokens" description="Sobrescreve --shy-color-primary e --shy-radius-md só nesta caixa (CSS custom properties em cascata). Atenção ao contraste do texto sobre a cor escolhida." code=".minha-marca { --shy-color-primary: #0a7; --shy-radius-md: calc(var(--shy-responsive-unit) * 6); }">
          <div class="col">
            <label class="picker">Cor primária <input type="color" [ngModel]="color()" (ngModelChange)="color.set($event)" /></label>
            <shy-slider [(value)]="radius" label="Raio (--shy-radius-md)" [min]="0" [max]="12" [step]="1" showValue />
            <div class="sandbox" [style.--shy-color-primary]="color()" [style.--shy-radius-md]="radiusValue()">
              <div class="row">
                <button shyButton>Primário</button>
                <button shyButton variant="outline">Outline</button>
                <shy-badge intent="primary">Badge</shy-badge>
              </div>
              <shy-form-field label="Campo"><input shyInput placeholder="foco usa o token" /></shy-form-field>
              <shy-progress [value]="64" label="Progresso" />
            </div>
          </div>
        </app-demo>

        <app-demo class="wide" anchor="cores" title="Cores semânticas" description="Trocam sozinhas com o tema. Componentes usam esta camada, nunca os primitivos.">
          <ul class="swatches">
            @for (s of swatches; track s) {
              <li>
                <span class="chip" [style.background]="'var(--shy-color-' + s + ')'"></span>
                <code class="mono">--shy-color-{{ s }}</code>
              </li>
            }
          </ul>
        </app-demo>

        <app-demo anchor="tipografia" title="Tipografia" description="JetBrains Mono self-hosted (licença OFL). Classes utilitárias da lib.">
          <div class="col">
            @for (t of types; track t.cls) {
              <div [class]="t.cls">
                {{ t.text }} <span class="value mono">.{{ t.cls }}</span>
              </div>
            }
          </div>
        </app-demo>

        <app-demo anchor="forma" title="Espaço, raio e sombra" description="Tudo em ru(): a unidade responsiva escala com o dispositivo.">
          <div class="col">
            <div class="bars">
              @for (s of spaces; track s) {
                <div class="bar-row">
                  <code class="mono">space-{{ s }}</code
                  ><span class="bar" [style.inline-size]="'var(--shy-space-' + s + ')'"></span>
                </div>
              }
            </div>
            <div class="tiles">
              @for (r of radii; track r) {
                <span class="tile" [style.border-radius]="'var(--shy-radius-' + r + ')'">{{ r }}</span>
              }
            </div>
            <div class="tiles">
              @for (s of shadows; track s) {
                <span class="tile" [style.box-shadow]="'var(--shy-shadow-' + s + ')'">{{ s }}</span>
              }
            </div>
            <p class="value">
              ru(4) no TypeScript → <code class="mono">{{ ru4 }}</code>
            </p>
          </div>
        </app-demo>

        <app-demo class="wide" anchor="layout" title="Classes de layout" description=".shy-stack, .shy-cluster, .shy-grid e .shy-container, ajustáveis por custom properties." code='<div class="shy-grid" style="--shy-grid-min: 40; --shy-grid-gap: 4">'>
          <div class="col">
            <div class="shy-stack" style="--shy-stack-gap: var(--shy-space-2)"><span class="tile">stack 1</span><span class="tile">stack 2</span></div>
            <div class="shy-cluster"><span class="tile">cluster</span><span class="tile">quebra</span><span class="tile">em</span><span class="tile">linhas</span></div>
            <div class="shy-grid" style="--shy-grid-min: calc(var(--shy-responsive-unit) * 40)"><span class="tile">grid</span><span class="tile">auto</span><span class="tile">fill</span><span class="tile">colunas</span></div>
          </div>
        </app-demo>
      </div>
    </div>
  `,
})
export class Tema {
  readonly theme = inject(ThemeService);
  readonly labels = THEME_LABELS;
  readonly modes: ShyThemeMode[] = ['dark', 'light', 'system'];
  readonly sections = [
    { id: 'tema', label: 'Tema' },
    { id: 'playground', label: 'Playground' },
    { id: 'cores', label: 'Cores' },
    { id: 'tipografia', label: 'Tipografia' },
    { id: 'forma', label: 'Forma' },
    { id: 'layout', label: 'Layout' },
  ];
  readonly swatches = SWATCHES;
  readonly spaces = SPACES;
  readonly radii = RADII;
  readonly shadows = SHADOWS;
  readonly types = TYPES;
  readonly ru4 = ru(4);
  readonly systemDark = injectShyMediaQuery('(prefers-color-scheme: dark)');

  readonly color = signal('#4c00ff');
  readonly radius = signal(3);
  readonly radiusValue = computed(() => ru(this.radius()));
}
