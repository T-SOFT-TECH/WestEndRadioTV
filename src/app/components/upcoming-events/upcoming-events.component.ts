import {Component, computed, inject, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {SiteService} from '../../services/site.service';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-upcoming-events',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})
export class UpcomingEventsComponent {



  protected siteService = inject(SiteService);
  protected events = computed(() => this.siteService.events());
  protected targetEvent = computed(() => this.events()[0]); // Next upcoming event
  protected countdown = signal({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  constructor() {
    setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const event = this.targetEvent();
    if (!event) return;

    const now = new Date().getTime();
    const eventDate = new Date(event.startDate).getTime();
    const distance = eventDate - now;

    if (distance > 0) {
      this.countdown.set({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }
  }


}
