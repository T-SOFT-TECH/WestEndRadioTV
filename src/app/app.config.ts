import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import {provideClientHydration, Title, Meta, withEventReplay} from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { routes } from './app.routes';
import { SeoService } from './services/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router Configuration
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),

    // Client Hydration
    provideClientHydration(withEventReplay()),

    // HTTP Client
    provideHttpClient(),



    // Animations
    provideAnimations(),

    // Toast Notifications
    provideHotToastConfig(),

    // SEO Related Providers
    Title,
    Meta,
    SeoService,

    // Experimental Features
    provideExperimentalZonelessChangeDetection()
  ]
};
