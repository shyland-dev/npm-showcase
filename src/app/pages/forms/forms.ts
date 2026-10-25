import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, CheckboxComponent, ComboboxComponent, FileDropzoneComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, RadioComponent, RadioGroupComponent, SelectComponent, ShySelectOption, SliderComponent, SnackbarService, SwitchComponent } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-forms',
  imports: [ReactiveFormsModule, ButtonComponent, CheckboxComponent, ComboboxComponent, FileDropzoneComponent, FormFieldComponent, IconButtonComponent, IconComponent, InputComponent, RadioComponent, RadioGroupComponent, SelectComponent, SliderComponent, SwitchComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './forms.scss'],
  templateUrl: './forms.html',
})
export class Forms {
  private readonly fb = inject(FormBuilder);
  private readonly snackbar = inject(SnackbarService);

  readonly sections = [
    { id: 'signup', label: 'Cadastro completo' },
    { id: 'input', label: 'Input' },
    { id: 'checkbox', label: 'Checkbox e Switch' },
    { id: 'radio', label: 'Radio' },
    { id: 'select', label: 'Select' },
    { id: 'combobox', label: 'Combobox' },
    { id: 'slider', label: 'Slider' },
    { id: 'dropzone', label: 'FileDropzone' },
  ];

  readonly countries: ShySelectOption[] = [
    { value: 'br', label: 'Brasil' },
    { value: 'pt', label: 'Portugal' },
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'jp', label: 'Japão', disabled: true },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'ca', label: 'Canadá' },
  ];
  readonly topics: ShySelectOption[] = ['Angular', 'TypeScript', 'Acessibilidade', 'Design System', 'Testes', 'DevOps'].map((t) => ({ value: t.toLowerCase(), label: t }));

  readonly showPassword = signal(false);
  readonly submitting = signal(false);

  readonly signup = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    country: this.fb.control<string | null>(null, Validators.required),
    plan: ['pro'],
    topics: this.fb.nonNullable.control<string[]>([]),
    newsletter: [true],
    terms: [false, Validators.requiredTrue],
  });

  // estados soltos (sem formulário)
  readonly notify = signal(true);
  readonly all = signal(false);
  readonly some = signal(true);
  readonly plan = signal('pro');
  readonly orientationPlan = signal('b');
  readonly country = signal<string | null>('br');
  readonly selectedTopics = signal<string[]>(['angular']);
  readonly comboCountry = signal<string | null>(null);
  readonly volume = signal(40);
  readonly price = this.fb.nonNullable.control(300);
  readonly docs = this.fb.nonNullable.control<File[]>([]);
  readonly avatar = signal<File[]>([]);

  readonly money = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
  readonly percent = (v: number) => `${v}%`;

  emailError(): string {
    const c = this.signup.controls.email;
    return c.hasError('required') ? 'Informe o e-mail' : 'E-mail inválido';
  }

  submit(): void {
    if (this.signup.invalid) {
      this.signup.markAllAsTouched();
      this.snackbar.show('Corrija os campos destacados', { intent: 'danger' });
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.snackbar.show(`Conta criada para ${this.signup.controls.name.value}`, { intent: 'success' });
    }, 1500);
  }

  onRejected(list: { file: File; reason: string }[]): void {
    this.snackbar.show(`${list.length} arquivo(s) recusado(s): ${list.map((r) => r.file.name + ' (' + (r.reason === 'size' ? 'tamanho' : 'tipo') + ')').join(', ')}`, { intent: 'warning' });
  }

  toggleAll(v: boolean): void {
    this.all.set(v);
    this.some.set(false);
  }
}
