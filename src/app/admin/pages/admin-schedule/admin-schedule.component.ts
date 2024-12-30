// admin-schedule.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppwriteService } from '../../../services/appwrite.service';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, DragDropModule } from '@angular/cdk/drag-drop';

interface ScheduleShow {
  $id: string;
  title: string;
  host: string;
  description: string;
  startTime: string;
  endTime: string;
  days: string[];
  active: boolean;
  imageId?: string;
}

interface TimeSlot {
  time: string;
  shows: {
    [key: string]: ScheduleShow | null;
  };
}

@Component({
  selector: 'app-admin-schedule',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './admin-schedule.component.html',
  styleUrl: './admin-schedule.component.scss'

})
export class AdminScheduleComponent implements OnInit {
  private appwrite = inject(AppwriteService);
  protected weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  protected timeSlots = signal<TimeSlot[]>([]);
  protected dropListIds: string[] = [];
  protected isDragOver = false;
  protected showMoveOptions = signal(false);
  protected selectedShow = signal<ScheduleShow | null>(null);
  protected pendingMove: any = null;

  ngOnInit() {
    this.loadSchedule();
    this.generateDropListIds();
  }

  private generateDropListIds() {
    this.dropListIds = this.timeSlots().flatMap(slot =>
      this.weekDays.map(day => this.getDropListId(slot.time, day))
    );
  }

  protected getDropListId(time: string, day: string): string {
    return `drop-list-${time}-${day.toLowerCase()}`;
  }

  async loadSchedule() {
    try {
      const shows = await this.appwrite.getShows();
      this.generateTimeSlots(shows.documents as unknown as ScheduleShow[]);
      this.generateDropListIds();
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  }

  private generateTimeSlots(shows: ScheduleShow[]) {
    const slots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      shows: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      }
    }));

    shows.forEach(show => {
      const startHour = parseInt(show.startTime.split(':')[0]);
      if (startHour >= 0 && startHour < 24) {
        show.days.forEach(day => {
          slots[startHour].shows[day] = show;
        });
      }
    });

    this.timeSlots.set(slots);
  }

  protected onDrop(event: CdkDragDrop<{ time: string; day: string }>) {
    const show = event.item.data as ScheduleShow;

    if (show.days.length > 1) {
      this.showMoveOptions.set(true);
      this.selectedShow.set(show);
      this.pendingMove = {
        event,
        show,
        newTime: event.container.data.time,
        newDay: event.container.data.day,
        oldDay: event.previousContainer.data.day
      };
      return;
    }

    this.processMoveShow(event);
  }

  protected processMoveShow(event: CdkDragDrop<{ time: string; day: string }>) {
    const show = event.item.data as ScheduleShow;
    const newTime = event.container.data.time;
    const oldDay = event.previousContainer.data.day;
    const newDay = event.container.data.day;

    const [_, originalMinutes] = show.startTime.split(':');
    const duration = this.getShowDurationMinutes(show.startTime, show.endTime);

    const newStartTime = `${newTime.split(':')[0]}:${originalMinutes}`;
    const newEndTime = this.addMinutesToTime(newStartTime, duration);

    if (show.$id) {
      const updatedShow = {
        ...show,
        startTime: newStartTime,
        endTime: newEndTime,
        days: [...show.days.filter(d => d !== oldDay), newDay]
      };

      const updatedSlots = [...this.timeSlots()];
      const oldSlotIndex = updatedSlots.findIndex(
        slot => slot.time.startsWith(show.startTime.split(':')[0])
      );
      const newSlotIndex = updatedSlots.findIndex(
        slot => slot.time === newTime
      );

      if (oldSlotIndex !== -1 && newSlotIndex !== -1) {
        updatedSlots[oldSlotIndex].shows[oldDay] = null;
        updatedSlots[newSlotIndex].shows[newDay] = {
          ...updatedShow,
          $id: show.$id
        };

        this.timeSlots.set(updatedSlots);
        this.updateShowSchedule(show.$id, updatedShow);
      }
    }
  }

  protected moveInstance() {
    if (!this.pendingMove) return;

    const [_, originalMinutes] = this.pendingMove.show.startTime.split(':');
    const duration = this.getShowDurationMinutes(
      this.pendingMove.show.startTime,
      this.pendingMove.show.endTime
    );

    const newStartTime = `${this.pendingMove.newTime.split(':')[0]}:${originalMinutes}`;
    const newEndTime = this.addMinutesToTime(newStartTime, duration);

    const newShow = {
      ...this.pendingMove.show,
      days: [this.pendingMove.newDay],
      startTime: newStartTime,
      endTime: newEndTime,
    };

    const updatedOriginalShow = {
      ...this.pendingMove.show,
      days: this.pendingMove.show.days.filter((d: string) => d !== this.pendingMove.oldDay)
    };

    if (this.pendingMove.show.$id) {
      this.updateShowSchedule(this.pendingMove.show.$id, updatedOriginalShow);
      this.createShow(newShow);
    }

    this.cleanupMove();
  }

  protected moveAllInstances() {
    if (!this.pendingMove) return;

    const [_, originalMinutes] = this.pendingMove.show.startTime.split(':');
    const duration = this.getShowDurationMinutes(
      this.pendingMove.show.startTime,
      this.pendingMove.show.endTime
    );

    const newStartTime = `${this.pendingMove.newTime.split(':')[0]}:${originalMinutes}`;
    const newEndTime = this.addMinutesToTime(newStartTime, duration);

    const updatedShow = {
      ...this.pendingMove.show,
      startTime: newStartTime,
      endTime: newEndTime,
      days: [
        ...this.pendingMove.show.days.filter((d: string) => d !== this.pendingMove.oldDay),
        this.pendingMove.newDay
      ]
    };

    if (this.pendingMove.show.$id) {
      this.updateShowSchedule(this.pendingMove.show.$id, updatedShow);
    }

    this.cleanupMove();
  }

  protected cancelMove() {
    this.cleanupMove();
    this.loadSchedule();
  }

  private cleanupMove() {
    this.showMoveOptions.set(false);
    this.selectedShow.set(null);
    this.pendingMove = null;
  }

  protected onDragEntered(event: CdkDragEnter) {
    this.isDragOver = true;
  }

  protected onDragExited(event: CdkDragExit) {
    this.isDragOver = false;
  }

  protected async updateShowTime(event: Event, show: ScheduleShow, type: 'start' | 'end') {
    const newTime = (event.target as HTMLInputElement).value;

    const updatedShow = {
      ...show,
      [type === 'start' ? 'startTime' : 'endTime']: newTime
    };

    if (type === 'start') {
      const updatedSlots = [...this.timeSlots()];

      const oldSlotIndex = updatedSlots.findIndex(
        slot => slot.time.startsWith(show.startTime.split(':')[0])
      );
      if (oldSlotIndex !== -1) {
        show.days.forEach(day => {
          updatedSlots[oldSlotIndex].shows[day] = null;
        });
      }

      const newHour = newTime.split(':')[0];
      const newSlotIndex = updatedSlots.findIndex(
        slot => slot.time.startsWith(newHour)
      );
      if (newSlotIndex !== -1) {
        show.days.forEach(day => {
          updatedSlots[newSlotIndex].shows[day] = updatedShow;
        });
      }

      this.timeSlots.set(updatedSlots);
    }

    if (show.$id) {
      try {
        await this.updateShowSchedule(show.$id, updatedShow);
      } catch (error) {
        console.error('Error updating show time:', error);
        await this.loadSchedule();
      }
    }
  }

  private getShowDurationMinutes(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  protected formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  protected getShowCardClass(show: ScheduleShow): string {
    return show.active
      ? 'bg-primary-500/80 hover:bg-primary-500/50 border border-primary-500/50 shadow-lg shadow-primary-500/20'
      : 'bg-status-error/20 hover:bg-status-error/30 border border-status-error/30';
  }

  protected getImageUrl(imageId: string): string {
    return this.appwrite.getFileView(imageId);
  }

  protected exportSchedule() {
    console.log('Exporting schedule...');
  }

  protected async createShow(showData: Partial<ScheduleShow>) {
    try {
      const newShowData = {
        title: showData.title!,
        host: showData.host!,
        description: showData.description || 'No description provided',
        startTime: showData.startTime!,
        endTime: showData.endTime!,
        days: showData.days!,
        active: showData.active!,
        imageId: showData.imageId
      };

      await this.appwrite.createShow(newShowData);
      await this.loadSchedule();
    } catch (error) {
      console.error('Error creating show:', error);
    }
  }

  private async updateShowSchedule(showId: string, updatedShow: Partial<ScheduleShow>) {
    try {
      const cleanedData = {
        title: updatedShow.title!,
        host: updatedShow.host!,
        description: updatedShow.description!,
        startTime: updatedShow.startTime!,
        endTime: updatedShow.endTime!,
        days: updatedShow.days!,
        active: updatedShow.active!,
        imageId: updatedShow.imageId
      };

      await this.appwrite.updateShow(showId, cleanedData);
    } catch (error) {
      console.error('Error updating show schedule:', error);
      await this.loadSchedule();
    }
  }
}
