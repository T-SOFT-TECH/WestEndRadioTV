import {Component, inject, signal} from '@angular/core';
import {HeaderComponent} from '../header/header.component';
import {NavigationEnd, NavigationError, NavigationStart, RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {Router} from 'express';
import {LoadingIndicatorComponent} from '../loading-indicator/loading-indicator.component';
import {GlobalPlayerComponent} from '../global-player/global-player.component';
import {CtaComponent} from '../cta/cta.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    LoadingIndicatorComponent,
    GlobalPlayerComponent,
    CtaComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {



  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPlayer = signal(true);

  constructor() {
    // Handle router events

  }

  onActivate(event: any): void {
    // Handle new page component activation
    // You can add analytics tracking here
    if (event?.hasOwnProperty('hidePlayer')) {
      this.showPlayer.set(!event.hidePlayer);
    }
  }

  onDeactivate(event: any): void {
    // Handle page component deactivation
    // Clean up any subscriptions or resources
  }

}
