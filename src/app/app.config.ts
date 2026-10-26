import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideShyIcons, provideShySnackbar, provideShyTheme } from '@shyland-dev/ui';
import { provideShyLogger } from '@shyland-dev/utils';

import { routes } from './app.routes';
import { APP_ICONS } from './icons';
import { logStore } from './shared/log-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })),
    provideShyTheme(),
    provideShyIcons(...APP_ICONS),
    // Toasts em pt-BR; haptics e atalho de foco (Alt+T) são opt-in da 1.3.
    provideShySnackbar({ dismissLabel: 'Fechar', undoLabel: 'Desfazer', haptics: true, focusHotkey: 'Alt+T' }),
    // Todos os loggers injetados do app escrevem no logStore (página "Logger ao vivo").
    provideShyLogger({ sink: logStore }),
  ],
};
