import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IconComponent, ICONS, SnackbarComponent, SnackbarService } from '@shyland-dev/ui';
import { DebugService } from '@shyland-dev/utils';

@Component({
  selector: 'app-icons',
  imports: [IconComponent, SnackbarComponent],
  templateUrl: './icons.html',
  styleUrl: './icons.scss',
})
export class Icons implements OnInit, OnDestroy {
  @ViewChild('snackbar') snackbar!: SnackbarComponent;

  iconNames = Object.keys(ICONS).filter((name) => !name.endsWith('-filled'));

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

  async copyIcon(name: string): Promise<void> {
    await navigator.clipboard.writeText(`<shy-icon>${name}</shy-icon>`);
    this.snackbarService.show({
      element: this.snackbar,
      text: `Copiado: <shy-icon>${name}</shy-icon>`,
      delay: 2500,
    });
  }
}
