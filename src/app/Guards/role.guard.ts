// guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const roleGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const appwrite = inject(AppwriteService);
  //const toast = inject(HotToastService);

  try {
    const user = await appwrite.getCurrentUser();
    if (!user || !user.labels?.includes('admin')) {
      // Use setTimeout to avoid the error
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
