import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertComponent, ButtonComponent, CardComponent, ComboboxComponent, DividerComponent, FormFieldComponent, IconComponent, InputComponent, ProgressComponent, RadioComponent, RadioGroupComponent, ShySelectOption, StepComponent, StepperComponent } from '@shyland-dev/ui';
import { PageHeader } from '../../shared/page-header';
import { brl } from '../../shared/data';

@Component({
  selector: 'app-case-checkout',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, CardComponent, ComboboxComponent, DividerComponent, FormFieldComponent, IconComponent, InputComponent, ProgressComponent, RadioComponent, RadioGroupComponent, StepComponent, StepperComponent, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './cases.scss'],
  template: `
    <div class="page">
      <app-page-header title="Checkout" summary="Stepper linear + um formulário por etapa + resumo do pedido. Cada etapa só avança se for válida." />

      <shy-stepper label="Etapas da compra" [linear]="true" [(value)]="step" completeLabel="Concluído" errorLabel="Erro">
        <shy-step label="Contato" />
        <shy-step label="Entrega" />
        <shy-step label="Pagamento" />
        <shy-step label="Revisão" />
      </shy-stepper>

      <div class="checkout">
        <shy-card>
          @switch (step()) {
            @case (0) {
              <form class="form" [formGroup]="contact" (ngSubmit)="next(contact)" novalidate>
                <shy-form-field label="Nome completo" error="Informe seu nome"><shy-icon slot="prefix" name="person-fill" /><input shyInput formControlName="name" autocomplete="name" required /></shy-form-field>
                <shy-form-field label="E-mail" error="E-mail inválido"><shy-icon slot="prefix" name="envelope" /><input shyInput type="email" formControlName="email" autocomplete="email" required /></shy-form-field>
                <shy-form-field label="Celular" hint="Com DDD"><shy-icon slot="prefix" name="phone" /><input shyInput type="tel" formControlName="phone" autocomplete="tel" inputmode="tel" /></shy-form-field>
                <div class="actions">
                  <button shyButton type="submit">Continuar<shy-icon slot="end" name="arrow-right" /></button>
                </div>
              </form>
            }
            @case (1) {
              <form class="form" [formGroup]="address" (ngSubmit)="next(address)" novalidate>
                <div class="two">
                  <shy-form-field label="CEP" error="CEP com 8 dígitos"><input shyInput formControlName="zip" inputmode="numeric" maxlength="9" required /></shy-form-field>
                  <shy-form-field label="Cidade" error="Escolha a cidade"><shy-combobox [options]="cities" formControlName="city" placeholder="Digite para buscar" /></shy-form-field>
                </div>
                <shy-form-field label="Endereço" error="Informe o endereço"><input shyInput formControlName="street" autocomplete="street-address" required /></shy-form-field>
                <shy-radio-group label="Entrega" formControlName="shipping">
                  <shy-radio value="normal">Normal · 5 dias · {{ brl(19.9) }}</shy-radio>
                  <shy-radio value="express">Expressa · 1 dia · {{ brl(39.9) }}</shy-radio>
                </shy-radio-group>
                <div class="actions">
                  <button shyButton type="button" variant="ghost" intent="neutral" (click)="step.set(0)"><shy-icon slot="start" name="arrow-left" />Voltar</button>
                  <button shyButton type="submit">Continuar<shy-icon slot="end" name="arrow-right" /></button>
                </div>
              </form>
            }
            @case (2) {
              <form class="form" [formGroup]="payment" (ngSubmit)="next(payment)" novalidate>
                <shy-radio-group label="Forma de pagamento" formControlName="method" orientation="horizontal">
                  <shy-radio value="card">Cartão</shy-radio>
                  <shy-radio value="pix">Pix</shy-radio>
                </shy-radio-group>
                @if (payment.controls.method.value === 'card') {
                  <shy-form-field label="Número do cartão" error="Cartão com 16 dígitos"><shy-icon slot="prefix" name="credit-card" /><input shyInput formControlName="number" inputmode="numeric" autocomplete="cc-number" maxlength="19" /></shy-form-field>
                  <div class="two">
                    <shy-form-field label="Validade" error="MM/AA"><input shyInput formControlName="expiry" placeholder="MM/AA" autocomplete="cc-exp" maxlength="5" /></shy-form-field>
                    <shy-form-field label="CVV" error="3 dígitos"><input shyInput formControlName="cvv" inputmode="numeric" autocomplete="cc-csc" maxlength="3" /></shy-form-field>
                  </div>
                } @else {
                  <shy-alert intent="info" heading="Pix">O QR Code aparece na revisão. Pagamento aprovado na hora.</shy-alert>
                }
                <div class="actions">
                  <button shyButton type="button" variant="ghost" intent="neutral" (click)="step.set(1)"><shy-icon slot="start" name="arrow-left" />Voltar</button>
                  <button shyButton type="submit">Revisar<shy-icon slot="end" name="arrow-right" /></button>
                </div>
              </form>
            }
            @default {
              <div class="form">
                @if (done()) {
                  <shy-alert intent="success" heading="Pedido confirmado!">Enviamos o comprovante para {{ contact.controls.email.value }}.</shy-alert>
                } @else {
                  <p>Confira os dados e confirme:</p>
                  <ul>
                    <li>{{ contact.controls.name.value }} · {{ contact.controls.email.value }}</li>
                    <li>{{ address.controls.street.value }} — {{ address.controls.city.value }}</li>
                    <li>{{ payment.controls.method.value === 'pix' ? 'Pix' : 'Cartão final ' + payment.controls.number.value.slice(-4) }}</li>
                  </ul>
                  @if (paying()) {
                    <shy-progress label="Processando pagamento" />
                  }
                  <div class="actions">
                    <button shyButton type="button" variant="ghost" intent="neutral" [disabled]="paying()" (click)="step.set(2)"><shy-icon slot="start" name="arrow-left" />Voltar</button>
                    <button shyButton type="button" [loading]="paying()" loadingPosition="start" loadingText="Pagando…" (click)="pay()"><shy-icon slot="start" name="lock" />Pagar {{ brl(total()) }}</button>
                  </div>
                }
              </div>
            }
          }
        </shy-card>

        <shy-card>
          <span slot="header">Resumo</span>
          @for (i of items; track i.name) {
            <div class="summary-line">
              <span>{{ i.qty }}× {{ i.name }}</span
              ><span>{{ brl(i.qty * i.price) }}</span>
            </div>
          }
          <shy-divider />
          <div class="summary-line">
            <span>Entrega</span><span>{{ brl(shippingPrice()) }}</span>
          </div>
          <div class="summary-line total">
            <span>Total</span><span>{{ brl(total()) }}</span>
          </div>
        </shy-card>
      </div>
    </div>
  `,
})
export class CaseCheckout {
  private readonly fb = inject(FormBuilder);
  readonly brl = brl;

  readonly step = signal(0);
  readonly paying = signal(false);
  readonly done = signal(false);

  readonly cities: ShySelectOption[] = ['Ribeirão Preto', 'São Paulo', 'Campinas', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Rio de Janeiro', 'Salvador'].map((c) => ({ value: c, label: c }));
  readonly items = [
    { name: 'Teclado mecânico', qty: 1, price: 349.9 },
    { name: 'Mousepad XL', qty: 2, price: 59.9 },
  ];

  readonly contact = this.fb.nonNullable.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phone: [''] });
  readonly address = this.fb.nonNullable.group({ zip: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]], city: this.fb.control<string | null>(null, Validators.required), street: ['', Validators.required], shipping: ['normal'] });
  readonly payment = this.fb.nonNullable.group({ method: ['card'], number: ['', [Validators.pattern(/^(\d{4} ?){3}\d{4}$/)]], expiry: ['', [Validators.pattern(/^\d{2}\/\d{2}$/)]], cvv: ['', [Validators.pattern(/^\d{3}$/)]] });

  readonly shippingPrice = computed(() => (this.address.controls.shipping.value === 'express' ? 39.9 : 19.9));
  readonly total = computed(() => this.items.reduce((s, i) => s + i.qty * i.price, 0) + this.shippingPrice());

  next(form: { invalid: boolean; markAllAsTouched(): void }): void {
    if (form === this.payment && this.payment.controls.method.value === 'card') {
      const c = this.payment.controls;
      [c.number, c.expiry, c.cvv].forEach((x) => x.addValidators(Validators.required));
      [c.number, c.expiry, c.cvv].forEach((x) => x.updateValueAndValidity());
    }
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.step.update((s) => s + 1);
  }

  pay(): void {
    this.paying.set(true);
    setTimeout(() => {
      this.paying.set(false);
      this.done.set(true);
    }, 1800);
  }
}
