import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeComponent, ButtonComponent, CardComponent, CheckboxComponent, EmptyStateComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, ProgressComponent, SnackbarService, SwitchComponent, TooltipDirective } from '@shyland-dev/ui';
import { injectShyLogger, shyStorage } from '@shyland-dev/utils';
import { PageHeader } from '../../shared/page-header';

interface Task {
  id: number;
  title: string;
  done: boolean;
  pending?: boolean;
}

const SEED: Task[] = [
  { id: 1, title: 'Revisar o PR do design system', done: true },
  { id: 2, title: 'Publicar a 1.3.0', done: true },
  { id: 3, title: 'Testar os gestos no celular', done: false },
  { id: 4, title: 'Atualizar o showcase', done: false },
];

const isTasks = (v: unknown): v is Task[] => Array.isArray(v) && v.every((t) => typeof t?.id === 'number' && typeof t?.title === 'string' && typeof t?.done === 'boolean');

@Component({
  selector: 'app-case-tasks',
  imports: [FormsModule, BadgeComponent, ButtonComponent, CardComponent, CheckboxComponent, EmptyStateComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, ProgressComponent, SwitchComponent, TooltipDirective, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', '../../shared/blocks.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Tarefas (fluxo otimista)" summary="A tela muda primeiro; o servidor (simulado) responde depois. Falhas desfazem a mudança, exclusões ganham Desfazer. Tudo acompanhado por toasts com promise() e undo(), e logado no “Logger ao vivo”." />

      <shy-card>
        <span slot="header">Simulação</span>
        <div class="row">
          <shy-switch [(checked)]="offline">Simular falha de rede</shy-switch>
          <span class="value">{{ offline() ? 'Todas as chamadas vão falhar: veja o rollback.' : 'Chamadas funcionam (≈ 0,9 s).' }}</span>
        </div>
      </shy-card>

      <shy-card>
        <span slot="header" class="row"
          >Minhas tarefas <shy-badge size="sm" intent="primary">{{ doneCount() }}/{{ tasks().length }}</shy-badge></span
        >
        <div class="col">
          <shy-progress [value]="percent()" label="Progresso" />
          <form class="add" (ngSubmit)="add()">
            <shy-form-field label="Nova tarefa">
              <input shyInput name="title" [ngModel]="draft()" (ngModelChange)="draft.set($event)" placeholder="O que precisa ser feito?" autocomplete="off" />
            </shy-form-field>
            <button shyButton type="submit" [disabled]="!draft().trim()"><shy-icon slot="start" name="plus-lg" />Adicionar</button>
          </form>

          @if (tasks().length) {
            <ul class="tasks" aria-label="Tarefas">
              @for (t of tasks(); track t.id) {
                <li [class.done]="t.done" [class.pending]="t.pending" [attr.aria-busy]="t.pending">
                  <shy-checkbox [checked]="t.done" [disabled]="!!t.pending" (checkedChange)="toggle(t, $event)"
                    ><span class="title">{{ t.title }}</span></shy-checkbox
                  >
                  <span class="grow"></span>
                  @if (t.pending) {
                    <shy-badge size="sm" intent="warning">enviando…</shy-badge>
                  }
                  <button shyIconButton size="sm" variant="ghost" [label]="'Excluir ' + t.title" shyTooltip="Excluir" [disabled]="!!t.pending" (click)="remove(t)"><shy-icon name="trash" /></button>
                </li>
              }
            </ul>
          } @else {
            <shy-empty-state heading="Tudo feito" icon="check2-circle">Sem tarefas pendentes.<button slot="action" shyButton variant="outline" (click)="reset()">Restaurar exemplos</button></shy-empty-state>
          }
        </div>
      </shy-card>
    </div>
  `,
})
export class CaseTasks {
  private readonly snackbar = inject(SnackbarService);
  private readonly log = injectShyLogger('Tarefas');

  readonly tasks = shyStorage<Task[]>('showcase-tasks', SEED, { validate: isTasks });
  readonly offline = signal(false);
  readonly draft = signal('');
  readonly doneCount = computed(() => this.tasks().filter((t) => t.done).length);
  readonly percent = computed(() => (this.tasks().length ? Math.round((this.doneCount() / this.tasks().length) * 100) : 0));

  /** "Servidor": responde em ~0,9 s e falha se a simulação estiver ligada. */
  private api(op: string): Promise<void> {
    this.log.debug('→ requisição', op);
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (this.offline()) {
          this.log.warn('← falhou', op);
          reject(new Error('sem conexão'));
        } else {
          this.log.debug('← ok', op);
          resolve();
        }
      }, 900),
    );
  }

  private patch(id: number, p: Partial<Task>): void {
    this.tasks.update((l) => l.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  async toggle(t: Task, done: boolean): Promise<void> {
    this.patch(t.id, { done, pending: true }); // otimista
    try {
      await this.snackbar.promise(this.api(`toggle ${t.id}`), { loading: 'Salvando…', success: done ? 'Tarefa concluída' : 'Tarefa reaberta', error: (e) => `Não salvou (${(e as Error).message}); revertido` }, { id: `task-${t.id}` });
      this.patch(t.id, { pending: false });
    } catch {
      this.patch(t.id, { done: t.done, pending: false }); // rollback
    }
  }

  async add(): Promise<void> {
    const title = this.draft().trim();
    if (!title) return;
    const task: Task = { id: Date.now(), title, done: false, pending: true };
    this.tasks.update((l) => [task, ...l]);
    this.draft.set('');
    try {
      await this.snackbar.promise(this.api(`add ${task.id}`), { loading: 'Criando tarefa…', success: 'Tarefa criada', error: 'Não foi possível criar; removida da lista' }, { id: `task-${task.id}` });
      this.patch(task.id, { pending: false });
    } catch {
      this.tasks.update((l) => l.filter((x) => x.id !== task.id));
    }
  }

  async remove(t: Task): Promise<void> {
    const before = this.tasks();
    this.tasks.set(before.filter((x) => x.id !== t.id)); // otimista
    const decision = await this.snackbar.undo(`“${t.title}” excluída`);
    if (decision === 'undo') {
      this.tasks.set(before);
      this.log.info('exclusão desfeita', t.id);
      return;
    }
    try {
      await this.api(`delete ${t.id}`); // só chega ao servidor depois do prazo do Desfazer
    } catch {
      this.tasks.set(before);
      this.snackbar.show('Falha ao excluir no servidor; a tarefa voltou', { intent: 'danger' });
    }
  }

  reset(): void {
    this.tasks.set(SEED);
  }
}
