import {Component, computed, inject, signal} from '@angular/core';
import {Show} from '../../model/show.model';
import {SiteService} from '../../services/site.service';
import {RouterLink} from '@angular/router';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';
import {ScrollAnimationDirective} from '../../Directives/scroll-observer.directive';


@Component({
  selector: 'app-weekly-schedules',
  imports: [
    RouterLink,
    AutoAnimationDirective,
    ScrollAnimationDirective

  ],
  templateUrl: './weekly-schedules.component.html',
  styleUrl: './weekly-schedules.component.scss'
})
export class WeeklySchedulesComponent {

  protected weekDays = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ];
  protected activeDay = signal('MONDAY');
  protected siteService = inject(SiteService);
  protected isLoading = signal(false);
  protected allShows = this.siteService.shows;

  // Filtered shows based on active day
  protected shows = computed(() => {
    return this.allShows().filter(show =>
      show.days.includes(this.activeDay().toLowerCase())
    );
  });



  setActiveDay(day: string) {
    this.activeDay.set(day);
  }

}
