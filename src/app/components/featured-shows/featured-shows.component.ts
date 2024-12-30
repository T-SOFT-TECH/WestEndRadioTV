import {Component, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {Show} from '../../model/show.model';
import { Swiper } from 'swiper/types';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-featured-shows',
  imports: [
    RouterLink
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './featured-shows.component.html',
  styleUrl: './featured-shows.component.scss'
})
export class FeaturedShowsComponent {

  protected siteService = inject(SiteService)

  protected featuredShows = this.siteService.featuredShows;

  @ViewChild('swiper') swiperRef: ElementRef<HTMLElement> | undefined;
  swiper?: Swiper;



  getImageUrl(show: Show): string {
    return show.imageId ? this.siteService.getImageUrl(show.imageId) || '' : '';
  }



}

