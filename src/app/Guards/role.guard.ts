// guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PocketbaseService } from '../services/pocketbase.service';

export const roleGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const pocketbase = inject(PocketbaseService);

  try {
    const user = await pocketbase.getCurrentUser();
    // PocketBase uses different role checking - check for admin in user record
    if (!user || !(user as any).admin) {
      setTimeout(() => {
        console.error('Access denied. Admin privileges required.');
      });
      await router.navigate(['/']);
      return false;
    }
    return true;
  } catch (error) {
    setTimeout(() => {
      console.error('Authentication error. Please try again.');
    });
    await router.navigate(['/']);
    return false;
  }
};
