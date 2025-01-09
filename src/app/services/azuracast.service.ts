import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {AzuracastResponse, CurrentTrack} from '../model/azuracast.model';
import {Observable} from 'rxjs';
import {Listener} from '../model/listeners.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AzuracastService {
  private readonly AZURACAST_WS_URL = 'wss://tsoft.stream/api/live/nowplaying/websocket';
  private readonly AZURACAST_URL = 'http://tsoft.stream';
  private readonly STATION_ID = 'westend_radio_tv';
  private readonly API_KEY = '8fe3697a1e1fa55b:ae3c046191c39f0260307692a17554a7';

  private ws: WebSocket | null = null;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

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


  private headers = new HttpHeaders({
    'X-API-Key': this.API_KEY
  });


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

  getListeners(): Observable<Listener[]> {
    return this.http.get<Listener[]>(
      `${this.AZURACAST_URL}/api/station/${this.STATION_ID}/listeners`,
      { headers: this.headers }
    );
  }

  getListenerAnalytics(start: Date, end: Date) {
    return this.http.get(
      `${this.AZURACAST_URL}/api/station/${this.STATION_ID}/listeners/analytics`,
      {
        headers: this.headers,
        params: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    );
  }

  getHistoricalListeners(start: Date, end: Date): Observable<Listener[]> {
    const headers = new HttpHeaders({
      'X-API-Key': this.API_KEY
    });

    // Format the dates to match the API's expected format
    const params = {
      start: start.toISOString(),
      end: end.toISOString()
    };

    return this.http.get<Listener[]>(
      `${this.AZURACAST_URL}/api/station/${this.STATION_ID}/listeners`,
      { headers, params }
    );
  }

}
