import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertComponent, BadgeComponent, ButtonComponent, FormFieldComponent, IconComponent, InputComponent, SelectComponent, ShySelectOption, SwitchComponent } from '@shyland-dev/ui';
import { ShyLogLevel, createShyLogger, injectShyLogger, shyMatchNamespace } from '@shyland-dev/utils';
import { createShyMemorySink } from '@shyland-dev/utils/testing';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';
import { StoredLog, isDevBuild, logStore } from '../../shared/log-store';

const LEVELS: ShySelectOption[] = [
  { value: 'debug', label: 'debug (tudo)' },
  { value: 'info', label: 'info' },
  { value: 'warn', label: 'warn' },
  { value: 'error', label: 'error' },
];
const INTENT = { debug: 'neutral', info: 'info', warn: 'warning', error: 'danger' } as const;
const NAMESPACES = ['Cart', 'Cart.verbose', 'Auth', 'Api'] as const;

@Component({
  selector: 'app-utils-logger',
  imports: [FormsModule, AlertComponent, BadgeComponent, ButtonComponent, FormFieldComponent, IconComponent, InputComponent, SelectComponent, SwitchComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './logger.scss'],
  template: `
    <div class="page">
      <app-page-header title="Logger ao vivo" summary="createShyLogger / injectShyLogger com níveis, namespaces e sink próprio. Tudo que os outros exemplos do showcase logam também cai aqui." [sections]="sections" />

      @if (!dev) {
        <shy-alert intent="warning" heading="Build de produção: o logger é vazio (de propósito)"> O logger só escreve com <code>ngDevMode</code> ligado (<code>ng serve</code>). Aqui o código do logger saiu do bundle e nada aparece nesta página. Rode <code>npm start</code> para ver ao vivo. </shy-alert>
      } @else {
        <shy-alert intent="info" heading="Modo desenvolvimento">Logs também vão para o console do navegador. Filtro global do pacote: <code>localStorage.shyLog = 'Cart*'</code> e recarregue.</shy-alert>
      }

      <div class="demos">
        <app-demo class="wide" anchor="emitir" title="Emitir e filtrar" description="O nível mínimo e o filtro de namespaces abaixo valem para o logger criado aqui (createShyLogger com config). O filtro segue o padrão do pacote debug: vírgula, * e - para excluir." code="const log = createShyLogger('Cart', { level: 'info', namespaces: 'Cart*,-Cart.verbose', sink });">
          <div class="col">
            <div class="controls">
              <shy-select [options]="levels" [(value)]="level" label="Nível mínimo" />
              <shy-form-field label="Namespaces" hint="Ex.: Cart*,-Cart.verbose">
                <input shyInput [(ngModel)]="filter" placeholder="vazio = tudo" autocomplete="off" />
              </shy-form-field>
            </div>
            <div class="row">
              @for (ns of namespaces; track ns) {
                <button shyButton size="sm" variant="soft" (click)="emit(ns, 'info')">{{ ns }}</button>
              }
              <button shyButton size="sm" variant="soft" intent="neutral" (click)="emit('Cart', 'debug')">Cart debug</button>
              <button shyButton size="sm" variant="soft" intent="warning" (click)="emit('Api', 'warn')">Api warn</button>
              <button shyButton size="sm" variant="soft" intent="danger" (click)="emit('Auth', 'error')">Auth error</button>
            </div>
            <div class="row">
              <shy-switch [(checked)]="stream">Rajada automática (1 log/s)</shy-switch>
              <button shyButton size="sm" variant="outline" (click)="consoleOnly()"><shy-icon slot="start" name="terminal" />group, time, table, assert, trace</button>
            </div>
          </div>
        </app-demo>

        <app-demo class="wide" anchor="ao-vivo" title="Log ao vivo" description="Últimas 200 entradas do sink do app (provideShyLogger({ sink })).">
          <div class="col">
            <div class="row">
              <span class="value">{{ visible().length }} de {{ all().length }} entradas</span>
              <shy-form-field class="grow" label="Mostrar namespaces">
                <input shyInput [(ngModel)]="viewFilter" placeholder="ex.: Tarefas*,Cart" autocomplete="off" />
              </shy-form-field>
              <button shyButton size="sm" variant="ghost" intent="neutral" (click)="store.clear()"><shy-icon slot="start" name="eraser" />Limpar</button>
            </div>
            <ol class="log" role="log" aria-live="off" aria-label="Entradas do logger">
              @for (e of visible(); track e.id) {
                <li>
                  <time class="mono value" [attr.datetime]="iso(e)">{{ time(e) }}</time>
                  <shy-badge size="sm" [intent]="intent[e.level]">{{ e.level }}</shy-badge>
                  <span class="mono ns">{{ e.namespace }}</span>
                  <span class="mono msg">{{ fmt(e) }}</span>
                </li>
              } @empty {
                <li class="value">Nada ainda. Emita acima ou use as páginas “Tarefas” e “Tabela”.</li>
              }
            </ol>
          </div>
        </app-demo>

        <app-demo anchor="testing" title="@shyland-dev/utils/testing" description="createShyMemorySink guarda as entradas em memória, ideal para asserts em testes. Aqui rodamos um mini-teste ao vivo." code="const sink = createShyMemorySink();&#10;TestBed.configureTestingModule({ providers: [provideShyLogger({ sink })] });&#10;expect(sink.entries).toHaveLength(2);">
          <div class="col">
            <button shyButton variant="outline" (click)="runSelfTest()">Rodar mini-teste</button>
            <p class="value" [attr.role]="'status'">{{ selfTest() }}</p>
          </div>
        </app-demo>
      </div>
    </div>
  `,
})
export class UtilsLogger {
  readonly store = logStore;
  readonly dev = isDevBuild;
  readonly levels = LEVELS;
  readonly namespaces = NAMESPACES;
  readonly intent = INTENT;
  readonly sections = [
    { id: 'emitir', label: 'Emitir' },
    { id: 'ao-vivo', label: 'Ao vivo' },
    { id: 'testing', label: 'Testing' },
  ];

  readonly level = signal<string | null>('debug');
  readonly filter = signal('');
  readonly stream = signal(false);
  readonly viewFilter = signal('');
  readonly selfTest = signal('');

  readonly all = this.store.entries;
  readonly visible = computed(() => this.all().filter((e) => shyMatchNamespace(e.namespace, this.viewFilter())));

  private readonly page = injectShyLogger('Logger');
  private readonly cache = new Map<string, ReturnType<typeof createShyLogger>>();
  private n = 0;

  constructor() {
    this.page.info('página aberta');
    // Recria os loggers quando nível ou filtro mudam.
    effect(() => {
      this.level();
      this.filter();
      this.cache.clear();
    });
    effect((onCleanup) => {
      if (!this.stream()) return;
      const id = setInterval(() => {
        const ns = NAMESPACES[this.n % NAMESPACES.length];
        const lv: ShyLogLevel = (['debug', 'info', 'warn', 'error'] as const)[this.n % 4];
        this.n++;
        untracked(() => this.emit(ns, lv));
      }, 1000);
      onCleanup(() => clearInterval(id));
    });
    inject(DestroyRef).onDestroy(() => this.page.info('página fechada'));
  }

  private logger(ns: string) {
    let l = this.cache.get(ns);
    if (!l) {
      l = createShyLogger(ns, { level: (this.level() ?? 'debug') as ShyLogLevel, namespaces: this.filter(), sink: this.store });
      this.cache.set(ns, l);
    }
    return l;
  }

  emit(ns: string, level: ShyLogLevel): void {
    this.logger(ns)[level](`evento #${++this.n}`, { ns, level });
  }

  consoleOnly(): void {
    const log = this.logger('Console');
    log.group('checkout');
    log.time('load');
    log.table([
      { item: 'Camiseta', qtd: 2 },
      { item: 'Caneca', qtd: 1 },
    ]);
    log.assert(false, 'assert falso aparece no console como erro');
    log.timeEnd('load');
    log.trace('de onde veio');
    log.groupEnd();
    this.page.info('métodos de console disparados: veja o DevTools');
  }

  runSelfTest(): void {
    const sink = createShyMemorySink();
    const log = createShyLogger('Teste', { sink });
    log.info('um');
    log.warn('dois');
    const ok = !isDevBuild || (sink.entries.length === 2 && sink.entries[1].level === 'warn');
    this.selfTest.set(isDevBuild ? `${ok ? 'OK' : 'FALHOU'}: ${sink.entries.length} entradas capturadas (${sink.entries.map((e) => e.level).join(', ')})` : 'Produção: logger vazio, sink.entries.length = ' + sink.entries.length + ' (esperado).');
    sink.clear();
  }

  fmt(e: StoredLog): string {
    return e.args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  }
  time(e: StoredLog): string {
    return new Date(e.at).toLocaleTimeString('pt-BR');
  }
  iso(e: StoredLog): string {
    return new Date(e.at).toISOString();
  }
}
