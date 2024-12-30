// guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';
import { HotToastService } from '@ngxpert/hot-toast';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const appwrite = inject(AppwriteService);
  const toast = inject(HotToastService);

  try {
    const session = await appwrite.getCurrentSession();

    if (session) {
      return true;
    } else {
      toast.error('Please login to access admin area');
      await router.navigate(['/admin/login']);
      return false;
    }
  } catch (error) {
    toast.error('Access denied');
    await router.navigate(['/admin/login']);
    return false;
  }
};
