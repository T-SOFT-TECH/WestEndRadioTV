import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AzuracastResponse, CurrentTrack} from '../model/azuracast.model';


@Injectable({
  providedIn: 'root'
})
export class AzuracastService {
  private readonly AZURACAST_WS_URL = 'wss://tsoft.stream/api/live/nowplaying/websocket';
  private ws: WebSocket | null = null;
  private platformId = inject(PLATFORM_ID);
  private currentTime = signal(0);
  nowPlayingData = signal<AzuracastResponse | null>(null);

  // Computed values
  readonly currentTrack = computed(() => {
    const data = this.nowPlayingData();
    if (!data) return null;

    return {
      title: data.now_playing.song.title,
      artist: data.now_playing.song.artist,
      art: data.now_playing.song.art,
      elapsed: data.now_playing.elapsed,
      duration: data.now_playing.duration,
      streamer: data.now_playing.streamer
    } as CurrentTrack;
  });

  readonly listeners = computed(() => this.nowPlayingData()?.listeners.current ?? 0);
  readonly isLive = computed(() => this.nowPlayingData()?.live.is_live ?? false);
  readonly streamerName = computed(() => this.nowPlayingData()?.live.streamer_name ?? '');
  readonly isOnline = computed(() => this.nowPlayingData()?.is_online ?? false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.AZURACAST_WS_URL);

      this.ws.onopen = () => {
        console.log('Connected to AzuraCast WebSocket');
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            "subs": {
              "station:westend_radio_tv": { "recover": true }
            }
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const jsonData = JSON.parse(event.data);
          this.handleWebSocketMessage(jsonData);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from AzuraCast WebSocket. Reconnecting...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  private handleWebSocketMessage(jsonData: any) {
    if ('connect' in jsonData) {
      const connectData = jsonData.connect;
      if ('data' in connectData) {
        // Legacy SSE data
        connectData.data.forEach((initialRow: any) =>
          this.handleSseData(initialRow)
        );
      } else {
        // New Centrifugo time format
        if ('time' in connectData) {
          this.currentTime.set(Math.floor(connectData.time / 1000));
        }
        // New Centrifugo cached NowPlaying initial push
        for (const subName in connectData.subs) {
          const sub = connectData.subs[subName];
          if ('publications' in sub && sub.publications.length > 0) {
            sub.publications.forEach((initialRow: any) =>
              this.handleSseData(initialRow, false)
            );
          }
        }
      }
    } else if ('pub' in jsonData) {
      this.handleSseData(jsonData.pub);
    }
  }

  private handleSseData(ssePayload: any, useTime = true) {
    try {
      const jsonData = ssePayload.data;
      if (useTime && 'current_time' in jsonData) {
        this.currentTime.set(jsonData.current_time);
      }
      if ('np' in jsonData) {
        this.nowPlayingData.set(jsonData.np);
      }
    } catch (error) {
      console.error('Error handling SSE data:', error);
    }
  }

  reconnect() {
    if (isPlatformBrowser(this.platformId)) {
      this.disconnect();
      this.initializeWebSocket();
    }
  }

  disconnect() {
    if (isPlatformBrowser(this.platformId) && this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }

  readonly songHistory = computed(() => {
    const data = this.nowPlayingData();
    return data?.song_history ?? [];
  });
}
