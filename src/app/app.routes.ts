import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./features/welcome/welcome').then((m) => m.WelcomeComponent),
  },
  {
    path: 'info',
    loadComponent: () => import('./features/info/info-step').then((m) => m.InfoStepComponent),
  },
  {
    path: 'servers',
    loadComponent: () =>
      import('./features/servers/servers-step').then((m) => m.ServersStepComponent),
  },
  {
    path: 'entities',
    loadComponent: () =>
      import('./features/entities/entities-step').then((m) => m.EntitiesStepComponent),
  },
  {
    path: 'review',
    loadComponent: () => import('./features/review/review-step').then((m) => m.ReviewStepComponent),
  },
  {
    path: '**',
    redirectTo: 'welcome',
  },
];
