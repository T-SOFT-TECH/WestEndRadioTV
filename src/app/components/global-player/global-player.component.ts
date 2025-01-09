import {Component, computed, effect, inject, signal} from '@angular/core';
import {AppStateService} from '../../services/app-state.service';
import {AudioService} from '../../services/audio.service';
import {SiteService} from '../../services/site.service';
import {AzuracastService} from '../../services/azuracast.service';

interface AudioState {
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  isMuted: boolean;
}

@Component({
  selector: 'app-global-player',
  imports: [],
  templateUrl: './global-player.component.html',
  styleUrl: './global-player.component.scss'
})
export class GlobalPlayerComponent {
  protected audioService = inject(AudioService);
  protected azuracast = inject(AzuracastService);

  // Access computed values directly from AzuracastService
  protected currentTrack = this.azuracast.currentTrack;
  protected isLive = this.azuracast.isLive;
  protected streamerName = this.azuracast.streamerName;

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  updateVolume(event: Event): void {
    const volume = +(event.target as HTMLInputElement).value / 100;
    this.audioService.updateVolume(volume);
  }

  seekAudio(event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * this.audioService.audioState().duration;
    this.audioService.seek(time);
  }

}
