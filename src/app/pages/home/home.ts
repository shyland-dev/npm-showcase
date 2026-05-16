import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DebugService } from '@shyland-dev/utils';
import { IconComponent, SelectComponent, SelectionChangeEvent, SelectOption, SnackbarComponent, SnackbarService } from '@shyland-dev/ui';

@Component({
  selector: 'app-home',
  imports: [IconComponent, SnackbarComponent, SelectComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  @ViewChild('snackbar') snackbar!: SnackbarComponent;

  selectedOption: string | null = null;

  array: SelectOption[] = [
    { id: 0, value: 'test1', label: 'Test' },
    { id: 1, value: 'test2', label: 'This is awesome' },
    { id: 2, value: 'test3', label: 'Testing the select' },
  ];

  constructor(
    private debugService: DebugService,
    private snackbarService: SnackbarService,
  ) {
    this.debugService.log(this);
  }

  ngOnInit(): void {
    this.debugService.log(this);
  }

  ngOnDestroy(): void {
    this.debugService.log(this);
  }

  showSnackbar(): void {
    this.snackbarService.show({
      element: this.snackbar,
      text: 'Olá, eu sou um Snackbar!',
      delay: 3000,
    });
  }

  updateSelection(event: SelectionChangeEvent) {
    this.selectedOption = event.selectedOption.value
  }
}
