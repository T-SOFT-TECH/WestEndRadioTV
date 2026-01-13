// guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PocketbaseService } from '../services/pocketbase.service';
import { HotToastService } from '@ngxpert/hot-toast';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const pocketbase = inject(PocketbaseService);
  const toast = inject(HotToastService);

  try {
    const session = await pocketbase.getCurrentSession();

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
