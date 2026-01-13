import { inject, Injectable, signal } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Show } from '../model/show.model';
import { News } from '../model/news.model';
import { Events } from '../model/events.model';
import { SiteSettings } from '../model/site-settings.model';




@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private pocketbase = inject(PocketbaseService);
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
    const settings = await this.pocketbase.getSettings();
    // Store the full record to preserve metadata like collectionId/id
    this.settings.set(settings as unknown as SiteSettings);
  }

  getImageUrl(record: any, filename: string): string {
    if (!record || !filename) return '';
    return this.pocketbase.getImageUrl(record, filename);
  }

  private async loadFeaturedShows() {
    const shows = await this.pocketbase.getFeaturedShows();
    this.featuredShows.set(shows.documents as unknown as Show[]);
  }

  private async loadAllShows() {
    const shows = await this.pocketbase.getShows();
    this.shows.set(shows.documents as unknown as Show[]);
  }

  getShowsByDay(day: string): Show[] {
    const dayLower = day.toLowerCase();
    return this.shows().filter(show =>
      show.days.some(d => d.toLowerCase() === dayLower) &&
      show.active
    ).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }

  private async loadNewsAndEvents() {
    const [news, events] = await Promise.all([
      this.pocketbase.getNews(),
      this.pocketbase.getEvents()
    ]);
    this.news.set(news.documents as unknown as News[]);
    this.events.set(events.documents as unknown as Events[]);
  }

}
