import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/produits',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register)
      }
    ]
  },
  {
    path: 'produits',
    children: [
      {
        path: '',
        loadComponent: () => import('./produits/public/public').then(m => m.Public)
      },
      {
        path: 'mes-produits',
        canActivate: [() => import('./guards/auth-guard').then(m => m.authGuard)],
        loadComponent: () => import('./produits/list/list').then(m => m.List)
      },
      {
        path: 'create',
        canActivate: [() => import('./guards/auth-guard').then(m => m.authGuard)],
        loadComponent: () => import('./produits/create/create').then(m => m.Create)
      },
      {
        path: ':id',
        loadComponent: () => import('./produits/detail/detail').then(m => m.Detail)
      }
    ]
  },
  {
    path: 'profil',
    canActivate: [() => import('./guards/auth-guard').then(m => m.authGuard)],
    loadComponent: () => import('./profil/profil').then(m => m.Profil)
  },
  {
    path: 'notifications',
    canActivate: [() => import('./guards/auth-guard').then(m => m.authGuard)],
    loadComponent: () => import('./notifications/notifications').then(m => m.Notifications)
  },
  {
    path: 'moderation',
    canActivate: [() => import('./guards/auth-guard').then(m => m.moderatorGuard)],
    loadComponent: () => import('./moderation/moderation').then(m => m.Moderation)
  },
  {
    path: 'dashboard',
    canActivate: [() => import('./guards/auth-guard').then(m => m.moderatorGuard)],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: '**',
    redirectTo: '/produits'
  }
];
