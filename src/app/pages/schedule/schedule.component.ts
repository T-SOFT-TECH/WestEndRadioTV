import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {Show} from '../../model/show.model';
import {SiteService} from '../../services/site.service';
import {AutoAnimationDirective} from '../../Directives/auto-Animate.directive';

@Component({
  selector: 'app-schedule',
  imports: [
    RouterLink,
    AutoAnimationDirective
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {

  protected weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  protected timeSlots = Array.from({length: 24}, (_, i) => i);
  protected activeDay = signal(this.getCurrentDay());
  protected siteService = inject(SiteService);

  protected getDayNumber(day: string): string {
    const date = new Date();
    const currentDay = date.getDay();
    const dayIndex = this.weekDays.indexOf(day);
    const diff = dayIndex - (currentDay || 7) + 1;
    date.setDate(date.getDate() + diff);
    return date.getDate().toString();
  }

  protected formatHour(hour: number): string {
    return new Date(0, 0, 0, hour).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  protected getShowPosition(show: Show): string {
    const [hours, minutes] = show.startTime.split(':').map(Number);
    const top = (hours * 60 + minutes) * 2;
    return `${top}px`;
  }

  protected getShowHeight(show: Show): string {
    const [startHours, startMinutes] = show.startTime.split(':').map(Number);
    const [endHours, endMinutes] = show.endTime.split(':').map(Number);
    const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return `${duration * 2}px`;
  }

  protected getShowDuration(show: Show): string {
    const [startHours, startMinutes] = show.startTime.split(':').map(Number);
    const [endHours, endMinutes] = show.endTime.split(':').map(Number);
    const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return `${Math.floor(duration / 60)}h ${duration % 60}m`;
  }

  protected filteredShows = computed(() => {
    const activeDayLower = this.activeDay().toLowerCase();
    return this.siteService.shows()
      .filter(show => show.days.some(day => day.toLowerCase() === activeDayLower))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  protected getCurrentDay(): string {
    const day = new Date().getDay();
    return this.weekDays[day === 0 ? 6 : day - 1];
  }

  protected setActiveDay(day: string) {
    this.activeDay.set(day);
  }

}
