import {Component, computed, effect, inject, signal} from '@angular/core';
import {SiteService} from '../../services/site.service';
import {AudioService} from '../../services/audio.service';
import {AppwriteService} from '../../services/appwrite.service';
import {FeaturedShowsComponent} from '../../components/featured-shows/featured-shows.component';
import {WeeklySchedulesComponent} from '../../components/weekly-schedules/weekly-schedules.component';
import {LatestNewsComponent} from '../../components/latest-news/latest-news.component';
import {UpcomingEventsComponent} from '../../components/upcoming-events/upcoming-events.component';


@Component({
  selector: 'app-home',
  imports: [
    FeaturedShowsComponent,
    WeeklySchedulesComponent,
    LatestNewsComponent,
    UpcomingEventsComponent

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  protected siteService = inject(SiteService);
  protected appwrite = inject(AppwriteService);
  protected audioService = inject(AudioService);
  protected siteSettings = this.siteService.settings;

  protected isPlaying = computed(() => this.audioService.audioState().isPlaying);
  protected isBuffering = computed(() => this.audioService.audioState().isBuffering);




  constructor() {

  }

  protected heroImage = computed(() => {
    const settings = this.siteSettings();
    return settings?.heroImage ?
      this.siteService.getImageUrl(settings.heroImage) :
      'assets/img/default-hero.jpg';
  });


  toggleStream(): void {
    this.audioService.toggleStream();
  }



}
