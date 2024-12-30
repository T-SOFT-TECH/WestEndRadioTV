// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const appwrite = inject(AppwriteService);
 // const toast = inject(HotToastService);

  try {
    const session = await appwrite.getCurrentSession();
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
