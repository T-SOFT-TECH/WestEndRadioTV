import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {SiteService} from '../../services/site.service';
import {Events} from '../../model/events.model';
import {DatePipe, UpperCasePipe} from '@angular/common';
import {AppwriteService} from '../../services/appwrite.service';
import e from 'express';
import {SeoService} from '../../services/seo.service';
import {SafeHtmlPipe} from '../../pipe/safe-html.pipe';

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
export class EventsDetailComponent  {

  private route = inject(ActivatedRoute);
  private appwrite = inject(AppwriteService);
  protected siteService = inject(SiteService);
  private seo = inject(SeoService);
  protected events = signal<Events | null>(null);
  protected relatedEvents = signal<Events[]>([]);

  constructor() {
    // Original effect for loading the event
    effect(() => {
      const slug = this.route.snapshot.params['slug'];
      const event = this.siteService.events().find(e => e.slug === slug);
      this.events.set(event || null);

      // Add SEO update here, after the event is loaded
      if (event) {
        this.seo.updateMetaForDynamicContent({
          title: `${event.title} - WestEndRadioTV Events`,
          description: event.description,
          keywords: `${event.category}, events, ${event.location}`,
          ogImage: event.imageId ? this.siteService.getImageUrl(event.imageId) : 'default-event-image.jpg'
        });

        this.loadRelatedEvents(event.category, event.$id!);
      }
    });
  }

  private async loadRelatedEvents(category: string, currentEventId: string) {
    const related = await this.appwrite.getRelatedEvents(category, currentEventId);
    this.relatedEvents.set(related.documents as unknown as Events[]);
  }



}
