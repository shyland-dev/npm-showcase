import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { ButtonComponent, DialogService, DrawerService, IconComponent, SkeletonComponent, SnackbarService, ShyDialogPresentation, delayedFlag } from '@shyland-dev/ui';
import { injectShyLogger, injectShyMediaQuery } from '@shyland-dev/utils';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';
import { FiltersDrawer, RenameDialog } from '../overlays/panels';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

@Component({
  selector: 'app-novidades',
  imports: [ButtonComponent, IconComponent, SkeletonComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './novidades.scss'],
  template: `
    <div class="page">
      <app-page-header title="Novidades da 1.3" summary="Gestos, desfazer, promessas em toast, folhas, safe areas e carregamento sem piscar. Teste em toque (ou no simulador de celular) para sentir os gestos." [sections]="sections" />

      <div class="demos">
        <app-demo class="wide" anchor="toast" title="Toast: swipe, desfazer, promise e update" description="Em toque e caneta, arraste o toast para o lado para fechar (o mouse não arrasta). O X continua como alternativa. Alt+T leva o foco ao toast mais recente." code="await snackbar.undo('Item excluído', { label: 'Desfazer' }) // 'undo' | 'commit'&#10;snackbar.promise(save(), { loading: 'Salvando…', success: 'Salvo', error: 'Falhou' })">
          <div class="col">
            <div class="row">
              <button shyButton variant="soft" (click)="swipe()"><shy-icon slot="start" name="arrow-repeat" />Toast para arrastar</button>
              <button shyButton variant="soft" intent="danger" (click)="undo()"><shy-icon slot="start" name="trash" />Excluir com desfazer</button>
              <button shyButton variant="soft" intent="success" (click)="promise(true)">Promise: sucesso</button>
              <button shyButton variant="soft" intent="warning" (click)="promise(false)">Promise: erro</button>
              <button shyButton variant="soft" intent="info" (click)="upload()">Upload com update()</button>
              <button shyButton variant="outline" (click)="sameId()">Mesmo id ({{ clicks() }})</button>
              <button shyButton variant="ghost" intent="neutral" (click)="snackbar.dismissAll()">Fechar todos</button>
            </div>
            <p class="value">{{ lastResult() }}</p>
          </div>
        </app-demo>

        <app-demo anchor="drawer" title="Drawer: dragToClose e handle" description="Arraste o cabeçalho (ou o handle) na direção da borda; passou de 40% ou foi um flick, fecha. Senão volta. Haptics vibra no Android." code="drawers.open(Panel, { side: 'bottom', dragToClose: true, showHandle: true, haptics: true })">
          <div class="row">
            <button shyButton variant="outline" (click)="drawer('bottom')">Folha inferior</button>
            <button shyButton variant="outline" (click)="drawer('end')">Lateral (fim)</button>
            <button shyButton variant="outline" (click)="drawer('start')">Lateral (início)</button>
          </div>
          <p class="value">{{ drawerResult() }}</p>
        </app-demo>

        <app-demo anchor="dialog" title="Dialog como folha" description="presentation: center (padrão), sheet (cola na base) ou auto (folha só em retrato)." code="dialogs.open(Rename, { presentation: 'auto' })">
          <div class="row">
            <button shyButton variant="outline" (click)="dialog('center')">center</button>
            <button shyButton variant="outline" (click)="dialog('sheet')">sheet</button>
            <button shyButton variant="outline" (click)="dialog('auto')">auto</button>
          </div>
          <p class="value">{{ dialogResult() }}</p>
        </app-demo>

        <app-demo class="wide" anchor="delayed" title="delayedFlag: carregamento sem piscar" description="Cargas mais rápidas que 200 ms nunca mostram skeleton; se mostrou, fica ao menos 400 ms. Compare com o skeleton “cru”." code="readonly showSkeleton = delayedFlag(this.loading, { delay: 200, minDuration: 400 });">
          <div class="col">
            <div class="row">
              <button shyButton size="sm" (click)="load(80)">Carga rápida (80 ms)</button>
              <button shyButton size="sm" (click)="load(1500)">Carga lenta (1,5 s)</button>
              <span class="value">Cru: {{ loading() ? 'carregando' : 'pronto' }} · delayedFlag: {{ shown() ? 'skeleton' : 'conteúdo' }} · piscadas evitadas: {{ avoided() }}</span>
            </div>
            <div class="compare">
              <section class="box" [attr.aria-busy]="loading()">
                <h3 class="shy-h6">Cru (pisca)</h3>
                @if (loading()) {
                  <shy-skeleton [lines]="2" />
                } @else {
                  <p>Conteúdo carregado.</p>
                }
              </section>
              <section class="box" [attr.aria-busy]="shown()">
                <h3 class="shy-h6">delayedFlag</h3>
                @if (shown()) {
                  <shy-skeleton [lines]="2" />
                } @else {
                  <p>Conteúdo carregado.</p>
                }
              </section>
            </div>
          </div>
        </app-demo>

        <app-demo anchor="safe" title="Safe areas" description="--shy-safe-area-{top,end,bottom,start} valem env(safe-area-inset-*) quando o index.html tem viewport-fit=cover (este tem). Em aparelho sem notch tudo é 0.">
          <div class="col">
            <div #probe class="probe" aria-hidden="true"></div>
            <dl class="insets">
              @for (s of insets(); track s.side) {
                <dt>{{ s.side }}</dt>
                <dd class="mono">{{ s.value }}</dd>
              }
            </dl>
            <pre class="shy-code"><code>.bar &#123; padding-block-end: calc(var(--shy-space-4) + var(--shy-safe-area-bottom)); &#125;</code></pre>
          </div>
        </app-demo>

        <app-demo anchor="touch" title="Toque e movimento" description="Com pointer: coarse o alvo de toque dos ícones e do X do toast ganha ~44 px sem mudar o layout.">
          <div class="col">
            <p class="value">pointer: coarse → {{ coarse() ? 'sim (toque)' : 'não (mouse/trackpad)' }}</p>
            <p class="value">hover: hover → {{ hover() ? 'sim' : 'não' }}</p>
            <p class="value">prefers-reduced-motion → {{ reduced() ? 'reduzido (gestos e vibração desligados)' : 'normal' }}</p>
          </div>
        </app-demo>
      </div>
    </div>
  `,
})
export class Novidades {
  readonly snackbar = inject(SnackbarService);
  private readonly dialogs = inject(DialogService);
  private readonly drawers = inject(DrawerService);
  private readonly log = injectShyLogger('Novidades');

  readonly sections = [
    { id: 'toast', label: 'Toast' },
    { id: 'drawer', label: 'Drawer' },
    { id: 'dialog', label: 'Dialog' },
    { id: 'delayed', label: 'delayedFlag' },
    { id: 'safe', label: 'Safe areas' },
    { id: 'touch', label: 'Toque' },
  ];

  readonly coarse = injectShyMediaQuery('(pointer: coarse)');
  readonly hover = injectShyMediaQuery('(hover: hover)');
  readonly reduced = injectShyMediaQuery('(prefers-reduced-motion: reduce)');

  readonly lastResult = signal('Nenhuma ação ainda.');
  readonly clicks = signal(0);
  readonly drawerResult = signal('');
  readonly dialogResult = signal('');

  readonly loading = signal(false);
  readonly shown = delayedFlag(this.loading, { delay: 200, minDuration: 400 });
  readonly avoided = signal(0);

  private readonly probe = viewChild<ElementRef<HTMLElement>>('probe');
  readonly insets = signal<{ side: string; value: string }[]>([]);

  constructor() {
    afterNextRender(() => {
      this.readInsets();
      window.addEventListener('resize', () => this.readInsets());
    });
  }

  private readInsets(): void {
    const el = this.probe()?.nativeElement;
    if (!el) return;
    const s = getComputedStyle(el);
    this.insets.set([
      { side: 'top', value: s.paddingBlockStart },
      { side: 'end', value: s.paddingInlineEnd },
      { side: 'bottom', value: s.paddingBlockEnd },
      { side: 'start', value: s.paddingInlineStart },
    ]);
  }

  swipe(): void {
    this.snackbar.show('Arraste para o lado (toque) ou use o X', { duration: 0, intent: 'info', align: 'start' });
  }

  async undo(): Promise<void> {
    this.lastResult.set('Item excluído da tela; aguardando a decisão…');
    const result = await this.snackbar.undo('Item excluído', { position: 'bottom', align: 'center' });
    this.lastResult.set(result === 'undo' ? 'Você desfez: nada foi enviado ao servidor.' : 'Confirmado: a exclusão seria enviada agora.');
    this.log.info('undo()', result);
  }

  async promise(ok: boolean): Promise<void> {
    const op = wait(1500).then(() => {
      if (!ok) throw new Error('timeout do servidor');
      return { id: 42 };
    });
    try {
      const v = await this.snackbar.promise(op, { loading: 'Salvando…', success: (r) => `Salvo (id ${r.id})`, error: (e) => `Falhou: ${(e as Error).message}` });
      this.lastResult.set(`promise() resolveu com id ${v.id}`);
    } catch (e) {
      this.lastResult.set(`promise() rejeitou: ${(e as Error).message} (o erro chega ao chamador)`);
      this.log.error('promise() falhou', e);
    }
  }

  async upload(): Promise<void> {
    const ref = this.snackbar.show('Enviando 0%', { loading: true, duration: 0, intent: 'info' });
    for (let p = 25; p <= 100; p += 25) {
      await wait(500);
      ref.update(p < 100 ? { message: `Enviando ${p}%` } : { message: 'Envio concluído', loading: false, intent: 'success', duration: 3000, action: { label: 'Abrir' } });
    }
    if ((await ref.closed) === 'action') this.snackbar.show('Abrindo arquivo…');
  }

  sameId(): void {
    this.clicks.update((n) => n + 1);
    this.snackbar.show(`Clicado ${this.clicks()}×: o mesmo toast é atualizado, não empilhado`, { id: 'same-id', intent: 'neutral' });
  }

  async drawer(side: 'bottom' | 'start' | 'end'): Promise<void> {
    const applied = await this.drawers.open<FiltersDrawer, unknown, boolean>(FiltersDrawer, { side, dragToClose: true, showHandle: true, haptics: true, ariaLabel: 'Filtros' }).closed;
    this.drawerResult.set(applied ? 'Filtros aplicados' : 'Fechado (X, Esc, fundo ou arrasto)');
  }

  async dialog(presentation: ShyDialogPresentation): Promise<void> {
    const name = await this.dialogs.open<RenameDialog, { current: string }, string>(RenameDialog, { presentation, data: { current: 'Loja online' } }).closed;
    this.dialogResult.set(name ? `presentation “${presentation}”: salvo como “${name}”` : `presentation “${presentation}”: cancelado`);
  }

  load(ms: number): void {
    this.loading.set(true);
    const flagged = this.shown();
    setTimeout(() => {
      this.loading.set(false);
      if (ms < 200 && !flagged) this.avoided.update((n) => n + 1);
    }, ms);
  }
}
