import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertComponent, BadgeComponent, ButtonComponent, FormFieldComponent, InputComponent, SnackbarService, SwitchComponent } from '@shyland-dev/ui';
import { assertShyInjectionContext, injectShyLogger, injectShyMediaQuery, injectShyPlatform, onShyDestroy, shyAssertNever, shyDebounced, shyDeprecated, shyDevOnly, shyInvariant, shyIsDefined, shyIsRecord, shyIsString, shyMeasure, shyStorage } from '@shyland-dev/utils';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';
import { isDevBuild } from '../../shared/log-store';

type Phase = 'draft' | 'review' | 'done';
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Filho que registra um callback com onShyDestroy; some e volta com o @if da página. */
@Component({
  selector: 'app-lifecycle-probe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="mono">componente vivo</span>`,
})
export class LifecycleProbe {
  private readonly snackbar = inject(SnackbarService);

  constructor() {
    // Devolve uma função que cancela o registro, caso a limpeza passe a ser feita à mão.
    onShyDestroy(() => this.snackbar.show('onShyDestroy: o componente foi destruído', { id: 'probe' }));
  }
}

@Component({
  selector: 'app-utils-helpers',
  imports: [FormsModule, AlertComponent, BadgeComponent, ButtonComponent, FormFieldComponent, InputComponent, SwitchComponent, LifecycleProbe, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './helpers.scss'],
  template: `
    <div class="page">
      <app-page-header title="Helpers da utils" summary="shyStorage, injectShyMediaQuery, shyDebounced, helpers de dev, plataforma, ciclo de vida e type guards, tudo funcionando de verdade." [sections]="sections" />

      <div class="demos">
        <app-demo anchor="storage" title="shyStorage" description="WritableSignal persistido em localStorage (JSON), sincronizado entre abas e seguro em SSR. Abra o showcase em duas abas." code="const notes = shyStorage('notes', '');&#10;const visits = shyStorage('visits', 0, { validate: isCount });">
          <div class="col">
            <shy-form-field label="Anotação (localStorage)" hint="Recarregue ou abra outra aba: continua aqui">
              <textarea shyInput rows="3" [ngModel]="notes()" (ngModelChange)="notes.set($event)"></textarea>
            </shy-form-field>
            <div class="row">
              <span class="value"
                >Visitas a esta página: <strong>{{ visits() }}</strong> (validate rejeita lixo no storage)</span
              >
              <button shyButton size="sm" variant="outline" (click)="visits.set(0)">Zerar</button>
            </div>
            <div class="row">
              <span class="value"
                >Sessão (sessionStorage): <strong>{{ session() }}</strong></span
              >
              <button shyButton size="sm" variant="soft" (click)="session.update(inc)">+1</button>
            </div>
          </div>
        </app-demo>

        <app-demo anchor="media" title="injectShyMediaQuery" description="Signal<boolean> de matchMedia. Mude o tema do sistema, gire o aparelho ou ligue o modo de movimento reduzido para ver reagir." code="readonly reduced = injectShyMediaQuery('(prefers-reduced-motion: reduce)');">
          <ul class="queries">
            @for (q of queries; track q.query) {
              <li>
                <span class="grow"
                  >{{ q.label }}<br /><code class="mono">{{ q.query }}</code></span
                >
                <shy-badge size="sm" [intent]="q.on() ? 'success' : 'neutral'">{{ q.on() ? 'sim' : 'não' }}</shy-badge>
              </li>
            }
          </ul>
        </app-demo>

        <app-demo anchor="debounce" title="shyDebounced" description="Signal derivado que só assume o valor após N ms sem mudança. Digite rápido: só uma “requisição” sai quando para." code="readonly term = signal('');&#10;readonly debounced = shyDebounced(this.term, 400);">
          <div class="col">
            <shy-form-field label="Buscar" hint="400 ms de espera">
              <input shyInput [ngModel]="term()" (ngModelChange)="onType($event)" placeholder="digite algo" autocomplete="off" />
            </shy-form-field>
            <dl class="insets">
              <dt>Digitado</dt>
              <dd class="mono">{{ term() || '—' }}</dd>
              <dt>Debounced</dt>
              <dd class="mono">{{ debounced() || '—' }}</dd>
              <dt>Teclas</dt>
              <dd class="mono">{{ keystrokes() }}</dd>
              <dt>“Requisições”</dt>
              <dd class="mono">{{ requests() }}</dd>
            </dl>
          </div>
        </app-demo>

        <app-demo class="wide" anchor="dev" title="Helpers de dev" description="shyInvariant, shyDevOnly, shyDeprecated e shyMeasure só agem em desenvolvimento; em produção são no-ops (o build de produção descarta o código)." code="shyInvariant(user, 'usuário obrigatório');&#10;shyDevOnly(() => console.table(state));&#10;shyDeprecated('oldApi', 'newApi');&#10;await shyMeasure('load', () => fetchAll());">
          <div class="col">
            @if (!dev) {
              <shy-alert intent="warning" heading="Build de produção">Os botões abaixo executam, mas os helpers são no-ops aqui. Rode <code>npm start</code> para ver o efeito.</shy-alert>
            }
            <div class="row">
              <button shyButton size="sm" variant="soft" (click)="invariant()">shyInvariant(false)</button>
              <button shyButton size="sm" variant="soft" (click)="devOnly()">shyDevOnly</button>
              <button shyButton size="sm" variant="soft" (click)="deprecated()">shyDeprecated (1×)</button>
              <button shyButton size="sm" variant="soft" (click)="measure()">shyMeasure (async)</button>
            </div>
            <p class="value" role="status">{{ devResult() }}</p>
          </div>
        </app-demo>

        <app-demo anchor="platform" title="Plataforma e ciclo de vida" description="injectShyPlatform, onShyDestroy e o erro claro de assertShyInjectionContext fora de contexto." code="const { isBrowser } = injectShyPlatform();&#10;onShyDestroy(() => cleanup());">
          <div class="col">
            <p class="value">
              isBrowser: <strong>{{ platform.isBrowser }}</strong> · isServer: <strong>{{ platform.isServer }}</strong>
            </p>
            <shy-switch [(checked)]="probeOn">Montar componente com onShyDestroy</shy-switch>
            @if (probeOn()) {
              <app-lifecycle-probe />
            }
            <button shyButton size="sm" variant="soft" (click)="outsideContext()">Chamar fora do contexto de injeção</button>
            <p class="value" role="status">{{ contextResult() }}</p>
          </div>
        </app-demo>

        <app-demo anchor="guards" title="Type guards e exaustividade" description="shyIsDefined, shyIsString, shyIsRecord e shyAssertNever. Cole um JSON para classificar." code="switch (phase) { case 'draft': … default: return shyAssertNever(phase); }">
          <div class="col">
            <shy-form-field label="JSON" [error]="jsonError()" [invalid]="!!jsonError()">
              <input shyInput [ngModel]="raw()" (ngModelChange)="raw.set($event)" class="mono" autocomplete="off" />
            </shy-form-field>
            <p class="value" role="status">{{ classified() }}</p>
            <div class="row">
              @for (p of phases; track p) {
                <shy-badge [intent]="phaseIntent(p)">{{ p }} → {{ phaseLabel(p) }}</shy-badge>
              }
            </div>
          </div>
        </app-demo>
      </div>
    </div>
  `,
})
export class UtilsHelpers {
  private readonly snackbar = inject(SnackbarService);
  private readonly log = injectShyLogger('Helpers');

  readonly dev = isDevBuild;
  readonly platform = injectShyPlatform();
  readonly sections = [
    { id: 'storage', label: 'shyStorage' },
    { id: 'media', label: 'MediaQuery' },
    { id: 'debounce', label: 'shyDebounced' },
    { id: 'dev', label: 'Dev' },
    { id: 'platform', label: 'Plataforma' },
    { id: 'guards', label: 'Type guards' },
  ];

  // shyStorage
  readonly notes = shyStorage('showcase-notes', '');
  readonly visits = shyStorage<number>('showcase-visits', 0, { validate: isCount });
  readonly session = shyStorage<number>('showcase-session', 0, { storage: 'session', validate: isCount });
  readonly inc = (n: number) => n + 1;

  // media queries
  readonly queries = [
    { label: 'Tema do sistema escuro', query: '(prefers-color-scheme: dark)' },
    { label: 'Movimento reduzido', query: '(prefers-reduced-motion: reduce)' },
    { label: 'Pode passar o mouse', query: '(hover: hover)' },
    { label: 'Ponteiro de toque', query: '(pointer: coarse)' },
    { label: 'Retrato', query: '(orientation: portrait)' },
    { label: 'Alto contraste forçado', query: '(forced-colors: active)' },
    { label: 'Contraste maior', query: '(prefers-contrast: more)' },
    { label: 'Instalado (PWA)', query: '(display-mode: standalone)' },
  ].map((q) => ({ ...q, on: injectShyMediaQuery(q.query) }));

  // debounce
  readonly term = signal('');
  readonly debounced = shyDebounced(this.term, 400);
  readonly keystrokes = signal(0);
  readonly requests = signal(0);

  // dev
  readonly devResult = signal('');

  // plataforma
  readonly probeOn = signal(true);
  readonly contextResult = signal('');

  // guards
  readonly raw = signal('{"nome":"Ana","idade":30}');
  readonly parsed = computed(() => {
    try {
      return { ok: true as const, value: JSON.parse(this.raw()) as unknown };
    } catch {
      return { ok: false as const };
    }
  });
  readonly jsonError = computed(() => (this.parsed().ok ? '' : 'JSON inválido'));
  readonly classified = computed(() => {
    const r = this.parsed();
    if (!r.ok) return 'Sem classificação.';
    const v = r.value;
    return `shyIsDefined: ${shyIsDefined(v)} · shyIsString: ${shyIsString(v)} · shyIsRecord: ${shyIsRecord(v)}`;
  });
  readonly phases: Phase[] = ['draft', 'review', 'done'];

  constructor() {
    this.visits.update(this.inc);
    this.log.info('visita registrada', this.visits());
    effect(() => {
      if (this.debounced()) untracked(() => this.requests.update(this.inc));
    });
  }

  onType(v: string): void {
    this.term.set(v);
    this.keystrokes.update(this.inc);
  }

  invariant(): void {
    try {
      shyInvariant(false, 'valor obrigatório ausente');
      this.devResult.set('Sem erro: em produção shyInvariant não faz nada.');
    } catch (e) {
      this.devResult.set(`Lançou: ${(e as Error).message}`);
    }
  }

  devOnly(): void {
    const r = shyDevOnly(() => 'executado só em dev');
    this.devResult.set(`shyDevOnly devolveu: ${r === undefined ? 'undefined (produção)' : r}`);
  }

  deprecated(): void {
    shyDeprecated('showcase.oldApi', 'showcase.newApi');
    this.devResult.set('shyDeprecated chamado: o aviso sai no console uma vez por nome (só em dev).');
  }

  async measure(): Promise<void> {
    await shyMeasure('carga-simulada', () => new Promise<void>((r) => setTimeout(r, 300)));
    this.devResult.set('shyMeasure concluído: veja performance.measure("shy:carga-simulada") e o log "perf" no console.');
  }

  outsideContext(): void {
    // Chamado de um handler, ou seja, sem contexto de injeção.
    try {
      assertShyInjectionContext(this.outsideContext);
      this.contextResult.set('Sem erro (inesperado).');
    } catch (e) {
      this.contextResult.set(`Erro esperado: ${(e as Error).message.split('\n')[0]}`);
    }
    try {
      onShyDestroy(() => undefined);
    } catch {
      /* mesmo erro, com o nome da função pública */
    }
  }

  phaseLabel(p: Phase): string {
    switch (p) {
      case 'draft':
        return 'Rascunho';
      case 'review':
        return 'Em revisão';
      case 'done':
        return 'Concluído';
      default:
        return shyAssertNever(p);
    }
  }

  phaseIntent(p: Phase): 'neutral' | 'warning' | 'success' {
    return p === 'draft' ? 'neutral' : p === 'review' ? 'warning' : 'success';
  }
}
