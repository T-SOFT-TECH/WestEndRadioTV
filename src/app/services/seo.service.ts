
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const route = this.getRoute(this.router.routerState.root);
      if (route?.data?.['meta']) {
        this.updateMetaTags(route.data['meta']);
      }
    });
  }

  private getRoute(route: any): any {
    if (route.firstChild) {
      return this.getRoute(route.firstChild);
    }
    return route;
  }

  private updateMetaTags(meta: any) {
    // Update basic meta tags
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
    this.meta.updateTag({ name: 'keywords', content: meta.keywords });

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: meta.title });
    this.meta.updateTag({ property: 'og:description', content: meta.description });
    this.meta.updateTag({ property: 'og:image', content: meta.ogImage });
    this.meta.updateTag({ property: 'og:url', content: window.location.href });

    // Update Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: meta.title });
    this.meta.updateTag({ name: 'twitter:description', content: meta.description });
    this.meta.updateTag({ name: 'twitter:image', content: meta.ogImage });
  }

  updateMetaForDynamicContent(meta: any) {
    this.updateMetaTags(meta);
  }
}
