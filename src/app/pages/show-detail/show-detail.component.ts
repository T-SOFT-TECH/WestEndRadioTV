import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Show } from '../../model/show.model';
import { PocketbaseService } from '../../services/pocketbase.service';
import { SeoService } from '../../services/seo.service';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-show-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafeHtmlPipe,
    UpperCasePipe
  ],
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.scss'
})
export class ShowDetailComponent {
  private route = inject(ActivatedRoute);
  private pocketbase = inject(PocketbaseService);
  protected siteService = inject(SiteService);
  private seo = inject(SeoService);

  protected showSignal = signal<Show | null>(null);
  protected episodes = signal<any[]>([]);
  protected recentTracks = signal<any[]>([]);

  constructor() {
    effect(() => {
      const param = this.route.snapshot.params['slug'];
      // Try finding by slug first, then by ID as fallback
      const show = this.siteService.shows().find(s => s.slug === param || s.id === param);
      this.showSignal.set(show || null);

      if (show) {
        this.seo.updateMetaForDynamicContent({
          title: `${show.title} - WestEndRadioTV`,
          description: show.description,
          keywords: `radio show, ${show.host}, ${show.title}`,
          ogImage: show.image ? this.siteService.getImageUrl(show, show.image) : 'assets/img/og-shows.jpg'
        });

        this.loadShowData(show.id!);
      }
    });
  }

  private async loadShowData(showId: string) {
    try {
      const [episodesRes, tracksRes] = await Promise.all([
        this.pocketbase.getShowEpisodes(showId),
        this.pocketbase.getShowTracks(showId)
      ]);
      
      this.episodes.set(episodesRes.documents);
      this.recentTracks.set(tracksRes.documents);
    } catch (error) {
      console.error('Error loading show detail data:', error);
    }
  }

  protected formatDays(days: string[]): string {
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
  }
}