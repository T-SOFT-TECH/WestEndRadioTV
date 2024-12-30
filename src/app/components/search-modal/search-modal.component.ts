import {Component, ElementRef, inject, OnInit, PLATFORM_ID, signal, ViewChild} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-search-modal',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AutoAnimationDirective
  ],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss'
})
export class SearchModalComponent implements OnInit {

  private router = inject(Router);
  private siteService = inject(SiteService);
  private platformId = inject(PLATFORM_ID);

  searchControl = new FormControl('');
  searchResults = signal<any[]>([]);

  @ViewChild('searchInput') searchInput!: ElementRef;



  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Focus search input when modal opens
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);

      // Setup search subscription
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(term => {
        if (term) {
          this.search(term);
        } else {
          this.searchResults.set([]);
        }
      });
    }
  }

  private search(term: string) {
    // Combine searches from different sources
    const results = [
      ...this.searchShows(term),
      ...this.searchNews(term),
      ...this.searchEvents(term)
    ];
    this.searchResults.set(results);
  }

  private searchShows(term: string) {
    return this.siteService.shows()
      .filter(show =>
        show.title.toLowerCase().includes(term.toLowerCase()) ||
        show.description.toLowerCase().includes(term.toLowerCase())
      )
      .map(show => ({
        id: show.$id,
        title: show.title,
        type: 'Show',
        url: `/shows/${show.slug}`,
        image: show.imageId ? this.siteService.getImageUrl(show.imageId) : null
      }));
  }

  private searchNews(term: string) {
    return this.siteService.news()
      .filter(news =>
        news.title.toLowerCase().includes(term.toLowerCase()) ||
        news.content.toLowerCase().includes(term.toLowerCase())
      )
      .map(news => ({
        id: news.$id,
        title: news.title,
        type: 'News',
        url: `/news/${news.slug}`,
        image: news.imageId ? this.siteService.getImageUrl(news.imageId) : null
      }));
  }

  private searchEvents(term: string) {
    return this.siteService.events()
      .filter(event =>
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.description.toLowerCase().includes(term.toLowerCase())
      )
      .map(event => ({
        id: event.$id,
        title: event.title,
        type: 'Event',
        url: `/events/${event.slug}`,
        image: event.imageId ? this.siteService.getImageUrl(event.imageId) : null
      }));
  }

  async navigateToResult(url: string) {
    await this.router.navigate([url]);
    this.close();
  }

  close() {
    // Remove the search param first
    this.router.navigate([], {
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    }).then(() => {
      // Clear the search results and input
      this.searchResults.set([]);
      this.searchControl.setValue('');
    });
  }

}
