import {Component, computed, inject, signal} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-news',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    AutoAnimationDirective
  ],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {

  protected siteService = inject(SiteService);
  protected searchTerm = signal('');
  protected selectedTag = signal('');
  protected sortBy = signal('newest');

  protected allTags = computed(() => {
    const tags = this.siteService.news()
      .flatMap(n => n.tags)
      .filter((v, i, a) => a.indexOf(v) === i);
    return tags.sort();
  });

  protected filteredNews = computed(() => {
    let news = this.siteService.news();

    if (this.selectedTag()) {
      news = news.filter(n => n.tags.includes(this.selectedTag()));
    }

    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      news = news.filter(n =>
        n.title.toLowerCase().includes(search) ||
        n.summary.toLowerCase().includes(search) ||
        n.content.toLowerCase().includes(search) ||
        n.author.toLowerCase().includes(search)
      );
    }

    return news.sort((a, b) => {
      const dateA = new Date(a.publishDate).getTime();
      const dateB = new Date(b.publishDate).getTime();
      return this.sortBy() === 'newest' ? dateB - dateA : dateA - dateB;
    });
  });

}
