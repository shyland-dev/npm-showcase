import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionComponent, AccordionItemComponent, BreadcrumbComponent, BreadcrumbItemComponent, ButtonComponent, PaginationComponent, StepComponent, StepperComponent, TabComponent, TabsComponent } from '@shyland-dev/ui';
import { Demo } from '../../shared/demo';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, AccordionComponent, AccordionItemComponent, BreadcrumbComponent, BreadcrumbItemComponent, ButtonComponent, PaginationComponent, StepComponent, StepperComponent, TabComponent, TabsComponent, Demo, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../../shared/page.scss', './navigation.scss'],
  templateUrl: './navigation.html',
})
export class Navigation {
  readonly sections = [
    { id: 'tabs', label: 'Tabs' },
    { id: 'accordion', label: 'Accordion' },
    { id: 'breadcrumb', label: 'Breadcrumb' },
    { id: 'pagination', label: 'Pagination' },
    { id: 'stepper', label: 'Stepper' },
    { id: 'shell', label: 'AppShell' },
  ];

  readonly tab = signal('profile');
  readonly verticalTab = signal('a');
  readonly page = signal(4);
  readonly step = signal(1);
  readonly verticalStep = signal(2);
  readonly open = signal(true);

  readonly faq = [
    { q: 'Funciona sem JavaScript?', a: 'O tema escuro e os estilos sim; os componentes são Angular e precisam do JS.' },
    { q: 'Posso trocar as cores?', a: 'Sim: tudo vem de tokens --shy-* em três camadas (primitivo, semântico e componente).' },
    { q: 'Como lido com telas grandes?', a: 'Toda medida usa a responsive unit, que cresce com o menor lado da tela. Não há media query de largura.' },
  ];
}
