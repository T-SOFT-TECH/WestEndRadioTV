import {inject, Injectable} from '@angular/core';
import {Router} from 'express';
import {AppStateService} from './app-state.service';
import {NavigationEnd} from '@angular/router';
import {filter} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Hide mobile menu on navigation
      this.appState.toggleHeader(true);
    });
  }

  async navigateTo(path: string): Promise<void> {
    await this.router.navigate([path]);
  }

}
