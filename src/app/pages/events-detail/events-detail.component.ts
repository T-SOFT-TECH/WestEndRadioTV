import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { Events } from '../../model/events.model';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { PocketbaseService } from '../../services/pocketbase.service';
import e from 'express';
import { SeoService } from '../../services/seo.service';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';

@Component({
  selector: 'app-events-detail',
  imports: [
    DatePipe,
    UpperCasePipe,
    RouterLink,
    SafeHtmlPipe,
  ],
  templateUrl: './events-detail.component.html',
  styleUrl: './events-detail.component.scss'
})
export class EventsDetailComponent {

  private route = inject(ActivatedRoute);
  private pocketbase = inject(PocketbaseService);
  protected siteService = inject(SiteService);
  private seo = inject(SeoService);
  protected eventSignal = signal<Events | null>(null);
  protected relatedEvents = signal<Events[]>([]);

  constructor() {
    // Original effect for loading the event
    effect(() => {
      const slug = this.route.snapshot.params['slug'];
      const event = this.siteService.events().find(e => e.slug === slug);
      this.eventSignal.set(event || null);

      // Add SEO update here, after the event is loaded
      if (event) {
        this.seo.updateMetaForDynamicContent({
          title: `${event.title} - WestEndRadioTV Events`,
          description: event.description,
          keywords: `${event.category}, events, ${event.location}`,
          ogImage: event.image ? this.siteService.getImageUrl(event, event.image) : 'default-event-image.jpg'
        });

        this.loadRelatedEvents(event.category, event.id!);
      }
    });
  }

  private async loadRelatedEvents(category: string, currentEventId: string) {
    const related = await this.pocketbase.getRelatedEvents(category, currentEventId);
    this.relatedEvents.set(related.documents as unknown as Events[]);
  }



}
