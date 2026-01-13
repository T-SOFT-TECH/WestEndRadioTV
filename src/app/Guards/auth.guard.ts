// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PocketbaseService } from '../services/pocketbase.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const pocketbase = inject(PocketbaseService);

  try {
    const session = await pocketbase.getCurrentSession();
    if (!session) {
      setTimeout(() => {
        console.error('Please login to continue');
      });
      await router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (error) {
    setTimeout(() => {
      console.error('Authentication error');
    });
    await router.navigate(['/login']);
    return false;
  }
};
