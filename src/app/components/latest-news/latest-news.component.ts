import {Component, computed, inject} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-latest-news',
  imports: [

    DatePipe,
    RouterLink
  ],
  templateUrl: './latest-news.component.html',
  styleUrl: './latest-news.component.scss'
})
export class LatestNewsComponent {

  protected siteService = inject(SiteService);

  protected featuredNews = computed(() => this.siteService.news()[0]);
  protected recentNews = computed(() => this.siteService.news().slice(1, 4));


}
