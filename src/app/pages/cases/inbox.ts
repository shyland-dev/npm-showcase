import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, DrawerService, EmptyStateComponent, IconButtonComponent, IconComponent, ListComponent, ListItemComponent, MenuComponent, MenuDirective, MenuItemComponent, SnackbarService, TooltipDirective } from '@shyland-dev/ui';
import { PageHeader } from '../../shared/page-header';
import { FiltersDrawer } from '../overlays/panels';

interface Mail {
  id: number;
  from: string;
  subject: string;
  body: string;
  read: boolean;
}

@Component({
  selector: 'app-case-inbox',
  imports: [AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, EmptyStateComponent, IconButtonComponent, IconComponent, ListComponent, ListItemComponent, MenuComponent, MenuDirective, MenuItemComponent, TooltipDirective, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Caixa de entrada" summary="Lista selecionável + painel de leitura, filtros em Drawer, menu de ações e “Desfazer” no Snackbar. Em retrato os painéis empilham." />

      <div class="toolbar">
        <button shyButton variant="outline" (click)="filters()"><shy-icon slot="start" name="funnel" />Filtros</button>
        <span class="shy-small">{{ unread() }} não lida(s) · {{ mails().length }} no total</span>
      </div>

      <div class="inbox">
        <shy-card>
          @if (mails().length) {
            <shy-list aria-label="Mensagens">
              @for (m of mails(); track m.id) {
                <shy-list-item [interactive]="true" [selected]="current()?.id === m.id" (activated)="open(m)">
                  <shy-avatar slot="start" [name]="m.from" size="sm" />
                  <span [style.font-weight]="m.read ? 'normal' : 'bold'">{{ m.from }}</span>
                  <span slot="secondary">{{ m.subject }}</span>
                  @if (!m.read) {
                    <shy-badge slot="end" intent="primary" size="sm" [dot]="true" label="Não lida" />
                  }
                </shy-list-item>
              }
            </shy-list>
          } @else {
            <shy-empty-state heading="Caixa vazia" icon="inbox">Tudo em dia por aqui.<button slot="action" shyButton variant="outline" (click)="reset()">Restaurar mensagens</button></shy-empty-state>
          }
        </shy-card>

        <shy-card>
          @if (current(); as m) {
            <div class="mail-head">
              <shy-avatar [name]="m.from" size="lg" />
              <div class="grow">
                <h2 class="shy-h5">{{ m.subject }}</h2>
                <span class="shy-small">{{ m.from }}</span>
              </div>
              <button shyIconButton label="Ações da mensagem" shyTooltip="Ações" [shyMenu]="actions"><shy-icon name="three-dots-vertical" /></button>
              <ng-template #actions>
                <shy-menu label="Ações da mensagem">
                  <button shyMenuItem (click)="toggleRead(m)"><shy-icon slot="start" name="envelope" />Marcar como {{ m.read ? 'não lida' : 'lida' }}</button>
                  <button shyMenuItem (click)="remove(m)"><shy-icon slot="start" name="trash" />Excluir</button>
                </shy-menu>
              </ng-template>
            </div>
            <p class="body">{{ m.body }}</p>
            <button shyButton size="sm" (click)="reply(m)"><shy-icon slot="start" name="chat-square-text" />Responder</button>
          } @else {
            <shy-empty-state heading="Selecione uma mensagem" icon="envelope">Escolha uma na lista para ler.</shy-empty-state>
          }
        </shy-card>
      </div>
    </div>
  `,
})
export class CaseInbox {
  private readonly snackbar = inject(SnackbarService);
  private readonly drawers = inject(DrawerService);

  private readonly seed: Mail[] = [
    { id: 1, from: 'Ana Souza', subject: 'Revisão do design system', body: 'Oi! Vi o PR do showcase e ficou ótimo. Só falta testarmos na TV da sala de reunião.', read: false },
    { id: 2, from: 'Bruno Lima', subject: 'Deploy de sexta', body: 'O pipeline passou. Podemos publicar a 1.1.1 quando você quiser.', read: false },
    { id: 3, from: 'Carla Dias', subject: 'Novos tokens de cor', body: 'Atualizei a paleta primária; o contraste do texto no tema claro agora passa AA.', read: true },
    { id: 4, from: 'Diego Reis', subject: 'Acessibilidade', body: 'Testei com leitor de tela: os diálogos anunciam título e foco certinho.', read: true },
  ];

  readonly mails = signal<Mail[]>(this.seed);
  readonly currentId = signal<number | null>(null);
  readonly current = computed(() => this.mails().find((m) => m.id === this.currentId()) ?? null);
  readonly unread = computed(() => this.mails().filter((m) => !m.read).length);

  open(m: Mail): void {
    this.currentId.set(m.id);
    this.mails.update((l) => l.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  }

  toggleRead(m: Mail): void {
    this.mails.update((l) => l.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
  }

  async remove(m: Mail): Promise<void> {
    const before = this.mails();
    this.mails.set(before.filter((x) => x.id !== m.id));
    this.currentId.set(null);
    const ref = this.snackbar.show('Mensagem excluída', { action: { label: 'Desfazer' } });
    if ((await ref.closed) === 'action') this.mails.set(before);
  }

  reply(m: Mail): void {
    this.snackbar.show(`Resposta enviada para ${m.from}`, { intent: 'success' });
  }

  reset(): void {
    this.mails.set(this.seed);
  }

  filters(): void {
    this.drawers.open(FiltersDrawer, { side: 'end', ariaLabel: 'Filtros' });
  }
}
