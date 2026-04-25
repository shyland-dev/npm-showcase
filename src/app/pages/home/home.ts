import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DebugService } from '@shyland-dev/utils';
import { IconComponent, SnackbarComponent, SnackbarService } from '@shyland-dev/ui';

@Component({
  selector: 'app-home',
  imports: [IconComponent, SnackbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  @ViewChild('snackbar') snackbar!: SnackbarComponent;

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
}
