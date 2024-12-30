import {Component, computed, effect, inject, signal} from '@angular/core';
import {AppStateService} from '../../services/app-state.service';
import {AudioService} from '../../services/audio.service';
import {SiteService} from '../../services/site.service';

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

  protected appState = inject(AppStateService);
  protected siteService = inject(SiteService);
  protected audioService = inject(AudioService);
  currentShow = computed(() => this.appState.currentShow());
  protected siteSettings = this.siteService.settings;

  constructor() {
    effect(() => {
      const streamUrl = this.siteSettings()?.streamUrl;
      if (streamUrl) {
        this.audioService.setStreamUrl(streamUrl);
      }
    });
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

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

}
