import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertComponent, AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, DialogService, FormFieldComponent, IconComponent, InputComponent, RadioComponent, RadioGroupComponent, SelectComponent, ShySelectOption, SnackbarService, SwitchComponent, TabComponent, TabsComponent } from '@shyland-dev/ui';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-case-settings',
  imports: [ReactiveFormsModule, AlertComponent, AvatarComponent, BadgeComponent, ButtonComponent, CardComponent, FormFieldComponent, IconComponent, InputComponent, RadioComponent, RadioGroupComponent, SelectComponent, SwitchComponent, TabComponent, TabsComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Configurações" summary="Tabs + formulários reativos + Switch + Radio + confirmação de descarte. O botão Salvar só habilita quando há mudança." />

      <shy-tabs label="Configurações da conta" [(value)]="tab">
        <shy-tab value="profile" label="Perfil">
          <form class="form" [formGroup]="profile" (ngSubmit)="save()" novalidate>
            <div class="profile">
              <shy-avatar [name]="profile.controls.name.value" size="xl" />
              <div>
                <strong>{{ profile.controls.name.value || 'Sem nome' }}</strong>
                <p class="shy-small">{{ profile.controls.email.value }}</p>
              </div>
            </div>
            <shy-form-field label="Nome" error="Informe o nome"><input shyInput formControlName="name" required /></shy-form-field>
            <shy-form-field label="E-mail" error="E-mail inválido"><input shyInput type="email" formControlName="email" required /></shy-form-field>
            <shy-form-field label="Idioma"><shy-select [options]="languages" formControlName="language" /></shy-form-field>
            <shy-form-field label="Bio" hint="Opcional" [counter]="true"><textarea shyInput rows="3" maxlength="160" formControlName="bio"></textarea></shy-form-field>
            <div class="actions">
              <button shyButton type="submit" [disabled]="profile.pristine" [loading]="saving()" loadingPosition="start" loadingText="Salvando…">Salvar</button>
              <button shyButton type="button" variant="ghost" intent="neutral" [disabled]="profile.pristine" (click)="discard()">Descartar</button>
            </div>
          </form>
        </shy-tab>

        <shy-tab value="notifications" label="Notificações">
          <div class="form">
            <div class="switches" [formGroup]="notifications">
              <shy-switch formControlName="email">Resumo diário por e-mail</shy-switch>
              <shy-switch formControlName="push">Notificações push</shy-switch>
              <shy-switch formControlName="marketing">Novidades e promoções</shy-switch>
            </div>
            <shy-radio-group label="Frequência" [formControl]="frequency">
              <shy-radio value="now">Imediata</shy-radio>
              <shy-radio value="hour">A cada hora</shy-radio>
              <shy-radio value="day">Uma vez ao dia</shy-radio>
            </shy-radio-group>
          </div>
        </shy-tab>

        <shy-tab value="security" label="Segurança">
          <div class="form">
            <shy-alert intent="warning" heading="Verificação em duas etapas desligada">Ative para proteger sua conta.<button slot="action" shyButton size="sm" variant="outline" intent="warning" (click)="snackbar.show('Verificação ativada', { intent: 'success' })">Ativar</button></shy-alert>
            <shy-form-field label="Senha atual"><input shyInput type="password" autocomplete="current-password" /></shy-form-field>
            <shy-form-field label="Nova senha" hint="Mínimo de 8 caracteres"><input shyInput type="password" autocomplete="new-password" /></shy-form-field>
            <div class="actions">
              <button shyButton intent="danger" variant="outline" (click)="signOutAll()"><shy-icon slot="start" name="box-arrow-right" />Sair de todos os dispositivos</button>
            </div>
          </div>
        </shy-tab>

        <shy-tab value="plan" label="Plano">
          <div class="form">
            <div class="plans">
              @for (p of plans; track p.name) {
                <shy-card [elevation]="p.current ? 2 : 1">
                  <span slot="header"
                    >{{ p.name }}
                    @if (p.current) {
                      <shy-badge intent="primary" size="sm">Atual</shy-badge>
                    }
                  </span>
                  <p class="price">{{ p.price }}</p>
                  <p class="shy-small">{{ p.desc }}</p>
                  <button slot="footer" shyButton size="sm" [variant]="p.current ? 'outline' : 'solid'" [disabled]="p.current" (click)="snackbar.show('Plano ' + p.name + ' selecionado')">{{ p.current ? 'Seu plano' : 'Escolher' }}</button>
                </shy-card>
              }
            </div>
          </div>
        </shy-tab>
      </shy-tabs>
    </div>
  `,
})
export class CaseSettings {
  private readonly fb = inject(FormBuilder);
  private readonly dialogs = inject(DialogService);
  readonly snackbar = inject(SnackbarService);

  readonly tab = signal('profile');
  readonly saving = signal(false);
  readonly languages: ShySelectOption[] = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  readonly initial = { name: 'Ana Souza', email: 'ana@shyland.dev', language: 'pt-BR', bio: 'Engenheira de software.' };
  readonly profile = this.fb.nonNullable.group({
    name: [this.initial.name, Validators.required],
    email: [this.initial.email, [Validators.required, Validators.email]],
    language: [this.initial.language],
    bio: [this.initial.bio],
  });
  readonly notifications = this.fb.nonNullable.group({ email: true, push: false, marketing: false });
  readonly frequency = this.fb.nonNullable.control('hour');

  readonly plans = [
    { name: 'Grátis', price: 'R$ 0', desc: '1 projeto, suporte pela comunidade.', current: false },
    { name: 'Pro', price: 'R$ 49/mês', desc: 'Projetos ilimitados e suporte prioritário.', current: true },
    { name: 'Time', price: 'R$ 199/mês', desc: 'Até 20 pessoas, SSO e auditoria.', current: false },
  ];

  save(): void {
    if (this.profile.invalid) {
      this.profile.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.profile.markAsPristine();
      this.snackbar.show('Perfil salvo', { intent: 'success' });
    }, 1000);
  }

  async discard(): Promise<void> {
    const ok = await this.dialogs.confirm({ title: 'Descartar alterações?', message: 'O que você editou será perdido.', confirmLabel: 'Descartar', cancelLabel: 'Continuar editando', intent: 'danger' });
    if (ok) this.profile.reset(this.initial);
  }

  async signOutAll(): Promise<void> {
    if (await this.dialogs.confirm({ title: 'Sair de todos os dispositivos?', message: 'Você precisará entrar de novo em cada um.', confirmLabel: 'Sair', intent: 'danger' })) this.snackbar.show('Sessões encerradas', { intent: 'success' });
  }
}
