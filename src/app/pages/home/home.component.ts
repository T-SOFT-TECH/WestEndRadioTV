import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { SiteService } from '../../services/site.service';
import { AudioService } from '../../services/audio.service';
import { PocketbaseService } from '../../services/pocketbase.service';
import { FeaturedShowsComponent } from '../../components/featured-shows/featured-shows.component';
import { WeeklySchedulesComponent } from '../../components/weekly-schedules/weekly-schedules.component';
import { LatestNewsComponent } from '../../components/latest-news/latest-news.component';
import { UpcomingEventsComponent } from '../../components/upcoming-events/upcoming-events.component';


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

  protected windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1920);

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  protected siteService = inject(SiteService);
  protected pocketbase = inject(PocketbaseService);
  protected audioService = inject(AudioService);
  protected siteSettings = this.siteService.settings;

  protected isPlaying = computed(() => this.audioService.audioState().isPlaying);
  protected isBuffering = computed(() => this.audioService.audioState().isBuffering);




  constructor() {
    console.dir(this.heroImage())
  }

  protected heroImage = computed(() => {
    const settings = this.siteSettings();
    if (!settings?.heroImage) return 'assets/img/Hero.webp';

    const imageUrl = this.siteService.getImageUrl(settings, settings.heroImage);
    console.log('Hero image URL:', imageUrl); // Debug URL
    return imageUrl;
  });



  toggleStream(): void {
    this.audioService.toggleStream();
  }



}
