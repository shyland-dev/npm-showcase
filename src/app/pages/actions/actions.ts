import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, IconButtonComponent, IconComponent, TooltipDirective } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-actions',
  imports: [ButtonComponent, IconButtonComponent, IconComponent, TooltipDirective, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './actions.scss'],
  templateUrl: './actions.html',
})
export class Actions {
  readonly sections = [
    { id: 'button', label: 'Button' },
    { id: 'icon-button', label: 'IconButton' },
  ];
  readonly variants = ['solid', 'soft', 'outline', 'ghost', 'link'] as const;
  readonly intents = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
  readonly iconVariants = ['solid', 'soft', 'outline', 'ghost'] as const;
  readonly saving = signal(false);
  readonly liked = signal(false);

  save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 2000);
  }
}
