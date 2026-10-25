import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideShyIcons, provideShyTheme } from '@shyland-dev/ui';

import { routes } from './app.routes';
import { APP_ICONS } from './icons';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection(), provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })), provideShyTheme(), provideShyIcons(...APP_ICONS)],
};
