import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {SiteService} from './site.service';

export interface AudioState {
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  isMuted: boolean;
  isBuffering: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private platformId = inject(PLATFORM_ID);
  private siteService = inject(SiteService);
  private audio: HTMLAudioElement | null = null;

  audioState = signal<AudioState>({
    currentTime: 0,
    duration: 0,
    volume: 1,
    isPlaying: false,
    isMuted: false,
    isBuffering: false
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners(): void {
    if (!this.audio) return;

    // Add buffering event listeners
    this.audio.addEventListener('waiting', () => {
      this.audioState.update(state => ({
        ...state,
        isBuffering: true
      }));
    });

    this.audio.addEventListener('playing', () => {
      this.audioState.update(state => ({
        ...state,
        isBuffering: false
      }));
    });

    this.audio.addEventListener('timeupdate', () => {
      this.audioState.update(state => ({
        ...state,
        currentTime: this.audio?.currentTime || 0
      }));
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.audioState.update(state => ({
        ...state,
        duration: this.audio?.duration || 0
      }));
    });

    this.audio.addEventListener('ended', () => {
      this.audioState.update(state => ({
        ...state,
        isPlaying: false
      }));
    });

    this.audio.addEventListener('error', () => {
      this.audioState.update(state => ({
        ...state,
        isPlaying: false
      }));
    });
  }

  togglePlay(): void {
    if (!this.audio) return;

    if (this.audioState().isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }

    this.audioState.update(state => ({
      ...state,
      isPlaying: !state.isPlaying
    }));
  }

  toggleMute(): void {
    if (!this.audio) return;

    this.audio.muted = !this.audio.muted;
    this.audioState.update(state => ({
      ...state,
      isMuted: this.audio?.muted || false
    }));
  }

  updateVolume(volume: number): void {
    if (!this.audio) return;

    this.audio.volume = volume;
    this.audioState.update(state => ({
      ...state,
      volume
    }));
  }

  seek(time: number): void {
    if (!this.audio) return;

    this.audio.currentTime = time;
  }

  setStreamUrl(url: string): void {
    if (!this.audio) return;
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
      this.audio.preload = 'auto';
    }
  }


  toggleStream() {
    if (!this.audio) return;

    if (this.audioState().isPlaying) {
      this.audio.pause();
      this.audio.src = '';
    } else {
      // Set buffering state when starting stream
      this.audioState.update(state => ({
        ...state,
        isBuffering: true
      }));

      const streamUrl = this.siteService.settings()?.streamUrl;
      if (streamUrl) {
        this.audio.src = streamUrl;
        this.audio.load();
        this.audio.play();
      }
    }

    this.audioState.update(state => ({
      ...state,
      isPlaying: !state.isPlaying
    }));
  }


}
