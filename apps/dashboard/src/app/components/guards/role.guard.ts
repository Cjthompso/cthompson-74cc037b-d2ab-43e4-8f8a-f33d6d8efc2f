import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRole = route.data['role'];
  const userRole = authService.currentUser()?.role;

  if (userRole === requiredRole) {
    return true;
  }

  switch (userRole) {
    case 'owner':
      router.navigate(['/owner-dashboard']);
      break;
    case 'admin':
      router.navigate(['/admin-dashboard']);
      break;
    default:
      router.navigate(['/viewer-dashboard']);
  }

  return false;
};