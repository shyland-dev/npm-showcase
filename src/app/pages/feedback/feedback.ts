import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { AlertComponent, AvatarComponent, BadgeComponent, ButtonComponent, EmptyStateComponent, IconComponent, ProgressCircularComponent, ProgressComponent, SkeletonComponent, SnackbarService, SpinnerComponent } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-feedback',
  imports: [AlertComponent, AvatarComponent, BadgeComponent, ButtonComponent, EmptyStateComponent, IconComponent, ProgressCircularComponent, ProgressComponent, SkeletonComponent, SpinnerComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './feedback.scss'],
  templateUrl: './feedback.html',
})
export class Feedback implements OnDestroy {
  private readonly snackbar = inject(SnackbarService);

  readonly sections = [
    { id: 'alert', label: 'Alert' },
    { id: 'badge', label: 'Badge' },
    { id: 'spinner', label: 'Spinner' },
    { id: 'progress', label: 'Progress' },
    { id: 'skeleton', label: 'Skeleton' },
    { id: 'snackbar', label: 'Snackbar' },
    { id: 'empty', label: 'EmptyState' },
  ];

  readonly spinners = ['ring', 'ring-track', 'dash', 'dots', 'bars', 'pulse', 'orbit', 'breathe'] as const;
  readonly intents = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;
  readonly variants = ['soft', 'solid', 'outline'] as const;

  readonly alertVisible = signal(true);
  readonly tags = signal(['Angular', 'Signals', 'Zoneless']);
  readonly progress = signal(35);
  readonly loading = signal(true);
  readonly items = signal<string[]>(['Relatório.pdf']);

  private timer?: ReturnType<typeof setInterval>;

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  startUpload(): void {
    clearInterval(this.timer);
    this.progress.set(0);
    this.timer = setInterval(() => {
      const next = Math.min(100, this.progress() + 8);
      this.progress.set(next);
      if (next === 100) clearInterval(this.timer);
    }, 250);
  }

  removeTag(tag: string): void {
    this.tags.update((t) => t.filter((x) => x !== tag));
  }

  toast(intent: 'neutral' | 'info' | 'success' | 'warning' | 'danger'): void {
    const text = { neutral: 'Preferências salvas', info: 'Nova versão disponível', success: 'Pagamento aprovado', warning: 'Sua sessão expira em 5 minutos', danger: 'Não foi possível salvar' }[intent];
    this.snackbar.show(text, { intent });
  }

  async undoToast(): Promise<void> {
    const ref = this.snackbar.show('Item excluído', { action: { label: 'Desfazer' }, position: 'bottom', align: 'start' });
    if ((await ref.closed) === 'action') this.snackbar.show('Item restaurado', { intent: 'success' });
  }
}
