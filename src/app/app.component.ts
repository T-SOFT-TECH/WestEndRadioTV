import {Component, inject, PLATFORM_ID, signal} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';

import {filter} from 'rxjs/operators';
import {SearchModalComponent} from './components/search-modal/search-modal.component';
import {isPlatformBrowser} from '@angular/common';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SearchModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'westendradiotv-v2';

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  showSearch = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        const queryParams = new URLSearchParams(location.search);
        this.showSearch.set(queryParams.get('search') === 'true');
      });
    }
  }
}
