import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { RoleUtilisateur } from '../models';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return authService.getProfile().pipe(
      map(response => {
        if (response.success) {
          return true;
        } else {
          router.navigate(['/auth/login']);
          return false;
        }
      }),
      tap(result => {
        if (!result) {
          router.navigate(['/auth/login']);
        }
      })
    );
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return authService.getProfile().pipe(
    map(response => {
      if (response.success) {
        const user = response.data;
        const requiredRoles = route.data?.['roles'] as RoleUtilisateur[];

        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.includes(user.role);

          if (!hasRequiredRole) {
            router.navigate(['/produits']);
            return false;
          }
        }

        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    }),
    tap(result => {
      if (!result) {
        router.navigate(['/auth/login']);
      }
    })
  );
};

export const moderatorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return authService.getProfile().pipe(
    map(response => {
      if (response.success) {
        const user = response.data;
        const hasModeratorRole = user.role === RoleUtilisateur.MODERATEUR ||
                                user.role === RoleUtilisateur.ADMINISTRATEUR;

        if (!hasModeratorRole) {
          router.navigate(['/produits']);
          return false;
        }

        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    }),
    tap(result => {
      if (!result) {
        router.navigate(['/auth/login']);
      }
    })
  );
};
