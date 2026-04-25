import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'icons', loadComponent: () => import('./pages/icons/icons').then((m) => m.Icons) },

  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
