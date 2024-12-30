import {Component, computed, inject, signal} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-events',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    AutoAnimationDirective
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent {

  protected siteService = inject(SiteService);
  protected searchTerm = signal('');
  protected selectedCategory = signal('');
  protected dateFilter = signal('all');

  protected categories = computed(() =>
    [...new Set(this.siteService.events().map(e => e.category))]
  );

  protected filteredEvents = computed(() => {
    let events = this.siteService.events();
    const now = new Date();

    // Category filter
    if (this.selectedCategory()) {
      events = events.filter(e => e.category === this.selectedCategory());
    }

    // Date filter
    if (this.dateFilter() === 'upcoming') {
      events = events.filter(e => new Date(e.startDate) > now);
    } else if (this.dateFilter() === 'past') {
      events = events.filter(e => new Date(e.startDate) < now);
    }

    // Search filter
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.location.toLowerCase().includes(search)
      );
    }

    return events;
  });

}
