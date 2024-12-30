import {inject, Injectable, signal} from '@angular/core';
import { AppwriteService } from './appwrite.service';
import {Show} from '../model/show.model';
import {News} from '../model/news.model';
import {Events} from '../model/events.model';
import {SiteSettings} from '../model/site-settings.model';




@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private appwrite = inject(AppwriteService);
  settings = signal<SiteSettings | null>(null);
   featuredShows = signal<Show[]>([]);
   shows = signal<Show[]>([]);
  news = signal<News[]>([]);
  events = signal<Events[]>([]);

  constructor() {
    this.loadSettings();
    this.loadFeaturedShows();
    this.loadAllShows();
    this.loadNewsAndEvents();
  }

  private async loadSettings() {
    const settings = await this.appwrite.getSettings();
    this.settings.set({
      stationName: settings['stationName'],
      stationSlogan: settings['stationSlogan'],
      streamUrl: settings['streamUrl'],
      heroImage: settings['heroImage'],
        email: settings['email'],
        phone: settings['phone'],
        address: settings['address'],
        businessHours: settings['businessHours'],
        supportEmail: settings['supportEmail'],



        facebookUrl: settings['facebookUrl'],
        twitterUrl: settings['twitterUrl'],
        instagramUrl: settings['instagramUrl'],
        youtubeUrl: settings['youtubeUrl']
    } as SiteSettings);
  }

  getImageUrl(imageId: string): string | undefined {
    return this.appwrite.getFileView(imageId);
  }

  private async loadFeaturedShows() {
    const shows = await this.appwrite.getFeaturedShows();
    this.featuredShows.set(shows.documents as unknown as Show[]);
  }

  private async loadAllShows() {
    const shows = await this.appwrite.getShows();
    this.shows.set(shows.documents as unknown as Show[]);
  }

  getShowsByDay(day: string): Show[] {
    return this.shows().filter(show =>
      show.days.includes(day.toLowerCase()) &&
      show.active
    ).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }

  private async loadNewsAndEvents() {
    const [news, events] = await Promise.all([
      this.appwrite.getNews(),
      this.appwrite.getEvents()
    ]);
    this.news.set(news.documents as unknown as News[]);
    this.events.set(events.documents as unknown as Events[]);
  }

}
