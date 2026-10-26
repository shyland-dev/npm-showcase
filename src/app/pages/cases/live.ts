import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { BadgeComponent, ButtonComponent, CardComponent, IconComponent, ProgressCircularComponent, SelectComponent, ShySelectOption, SnackbarService, SwitchComponent } from '@shyland-dev/ui';
import { injectShyLogger } from '@shyland-dev/utils';
import { PageHeader } from '../../shared/page-header';

interface Sample {
  rps: number;
  p95: number;
  err: number;
  cpu: number;
}
interface LiveEvent {
  id: number;
  at: string;
  text: string;
  intent: 'info' | 'warning' | 'danger' | 'success';
}

const SPEEDS: ShySelectOption[] = [
  { value: 500, label: '0,5 s' },
  { value: 1000, label: '1 s' },
  { value: 2000, label: '2 s' },
];
const SIZE = 40;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Pontos de uma polyline num viewBox 100×30 (preserveAspectRatio="none"). */
function line(values: number[], max: number): string {
  if (!values.length) return '';
  return values.map((v, i) => `${((i / (SIZE - 1)) * 100).toFixed(1)},${(30 - (clamp(v, 0, max) / max) * 28 - 1).toFixed(1)}`).join(' ');
}

/** Histórico inicial com ruído, para as sparklines não nascerem planas. */
function history(): Sample[] {
  let rps = 420;
  let p95 = 120;
  return Array.from({ length: SIZE }, () => {
    rps = clamp(rps + (Math.random() - 0.5) * 120, 200, 800);
    p95 = clamp(p95 + (Math.random() - 0.5) * 40, 70, 300);
    return { rps: Math.round(rps), p95: Math.round(p95), err: 0.6, cpu: 38 };
  });
}

@Component({
  selector: 'app-case-live',
  imports: [BadgeComponent, ButtonComponent, CardComponent, IconComponent, ProgressCircularComponent, SelectComponent, SwitchComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Painel ao vivo" summary="Métricas simuladas atualizando em tempo real: sparklines em SVG, alerta que atualiza o mesmo toast (id), eventos e controle de ritmo. Sem biblioteca de gráficos." />

      <div class="toolbar">
        <button shyButton [variant]="running() ? 'outline' : 'solid'" (click)="running.set(!running())"><shy-icon slot="start" [name]="running() ? 'pause-fill' : 'play-fill'" />{{ running() ? 'Pausar' : 'Retomar' }}</button>
        <shy-select class="speed" [options]="speeds" [(value)]="every" label="Intervalo" />
        <button shyButton variant="soft" intent="danger" (click)="incident()"><shy-icon slot="start" name="lightning" />Injetar incidente</button>
        <shy-switch [(checked)]="toasts">Alertas em toast</shy-switch>
      </div>

      <section class="kpis" aria-label="Métricas" aria-live="off">
        <shy-card>
          <span slot="header" class="kpi-label"><shy-icon name="activity" />Requisições/s</span>
          <strong class="kpi-value">{{ last().rps }}</strong>
          <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" role="img" [attr.aria-label]="'Requisições por segundo, atual ' + last().rps"><polyline [attr.points]="rpsLine()" /></svg>
        </shy-card>
        <shy-card>
          <span slot="header" class="kpi-label"><shy-icon name="stopwatch" />Latência p95</span>
          <strong class="kpi-value">{{ last().p95 }} ms</strong>
          <svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" role="img" [attr.aria-label]="'Latência p95, atual ' + last().p95 + ' milissegundos'"><polyline [attr.points]="p95Line()" /></svg>
        </shy-card>
        <shy-card>
          <span slot="header" class="kpi-label"><shy-icon name="exclamation-triangle" />Taxa de erro</span>
          <strong class="kpi-value">{{ last().err.toFixed(1) }}%</strong>
          <shy-badge size="sm" [intent]="last().err > 5 ? 'danger' : last().err > 2 ? 'warning' : 'success'">{{ last().err > 5 ? 'Crítico' : last().err > 2 ? 'Atenção' : 'Saudável' }}</shy-badge>
        </shy-card>
        <shy-card>
          <span slot="header" class="kpi-label"><shy-icon name="cpu" />CPU</span>
          <shy-progress-circular [value]="last().cpu" size="lg" label="CPU" />
        </shy-card>
      </section>

      <shy-card>
        <span slot="header">Eventos</span>
        <ul class="events" aria-label="Eventos recentes">
          @for (e of events(); track e.id) {
            <li>
              <span class="value">{{ e.at }}</span
              ><shy-badge size="sm" [intent]="e.intent">{{ e.intent }}</shy-badge
              >{{ e.text }}
            </li>
          } @empty {
            <li class="value">Sem eventos ainda.</li>
          }
        </ul>
      </shy-card>
    </div>
  `,
  styles: `
    .speed {
      inline-size: calc(var(--shy-responsive-unit) * 40);
    }
  `,
})
export class CaseLive {
  private readonly snackbar = inject(SnackbarService);
  private readonly log = injectShyLogger('Painel');

  readonly speeds = SPEEDS;
  readonly running = signal(true);
  readonly every = signal<number | null>(1000);
  readonly toasts = signal(true);
  readonly samples = signal<Sample[]>(history());
  readonly events = signal<LiveEvent[]>([]);

  readonly last = computed(() => this.samples()[this.samples().length - 1]);
  readonly rpsLine = computed(() =>
    line(
      this.samples().map((s) => s.rps),
      900,
    ),
  );
  readonly p95Line = computed(() =>
    line(
      this.samples().map((s) => s.p95),
      800,
    ),
  );

  private spike = 0;
  private seq = 0;
  private alerting = false;

  constructor() {
    effect((onCleanup) => {
      if (!this.running()) return;
      const id = setInterval(() => untracked(() => this.tick()), this.every() ?? 1000);
      onCleanup(() => clearInterval(id));
    });
    this.push('info', 'Monitoramento iniciado');
  }

  private tick(): void {
    const p = this.last();
    const hot = this.spike > 0;
    if (hot) this.spike--;
    const next: Sample = {
      rps: Math.round(clamp(p.rps + (Math.random() - 0.5) * 80 + (hot ? 120 : 0), 150, 900)),
      p95: Math.round(clamp(p.p95 + (Math.random() - 0.5) * 30 + (hot ? 160 : -(p.p95 - 120) * 0.2), 60, 800)),
      err: clamp(p.err + (Math.random() - 0.5) * 0.6 + (hot ? 2.5 : -(p.err - 0.6) * 0.3), 0, 20),
      cpu: Math.round(clamp(p.cpu + (Math.random() - 0.5) * 10 + (hot ? 12 : -(p.cpu - 38) * 0.2), 5, 99)),
    };
    this.samples.update((l) => [...l.slice(1), next]);
    this.watch(next);
  }

  /** Mesmo id: o toast de alerta é atualizado em vez de empilhar um por tick. */
  private watch(s: Sample): void {
    if (s.err > 5 && !this.alerting) {
      this.alerting = true;
      this.push('danger', `Taxa de erro em ${s.err.toFixed(1)}%`);
      if (this.toasts()) this.snackbar.show(`Taxa de erro alta: ${s.err.toFixed(1)}%`, { id: 'live-alert', intent: 'danger', duration: 0 });
    } else if (s.err > 5 && this.toasts()) {
      this.snackbar.show(`Taxa de erro alta: ${s.err.toFixed(1)}%`, { id: 'live-alert', intent: 'danger', duration: 0 });
    } else if (s.err < 2 && this.alerting) {
      this.alerting = false;
      this.push('success', 'Taxa de erro normalizada');
      if (this.toasts()) this.snackbar.show('Taxa de erro normalizada', { id: 'live-alert', intent: 'success', duration: 4000 });
    }
  }

  incident(): void {
    this.spike = 8;
    this.push('warning', 'Incidente injetado (picos de erro e latência)');
    this.running.set(true);
  }

  private push(intent: LiveEvent['intent'], text: string): void {
    this.log[intent === 'danger' ? 'error' : intent === 'warning' ? 'warn' : 'info'](text);
    this.events.update((l) => [{ id: ++this.seq, at: new Date().toLocaleTimeString('pt-BR'), text, intent }, ...l].slice(0, 30));
  }
}
