import {AfterViewInit, Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import { AppwriteService } from '../../../services/appwrite.service';
import { AzuracastService } from '../../../services/azuracast.service';
import { RouterLink } from '@angular/router';
import {NgIcon, provideIcons} from '@ng-icons/core';
import { Chart, registerables } from 'chart.js';
import {
  heroUsers,
  heroMusicalNote,
  heroSignal,
  heroChartBar,
  heroArrowTrendingUp,
  heroArrowTrendingDown
} from '@ng-icons/heroicons/outline';
import {FormatTimeAgoPipe} from '../../../model/format-time-ago.pipe';
import {FormatUptimePipe} from '../../../pipe/format-time.pipe';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardStats {
  totalShows: number;
  activeShows: number;
  totalTracks: number;
  listeners: {
    current: number;
    total: number;
    unique: number;
    peak: number;
  };
  streamStatus: {
    isLive: boolean;
    streamerName: string;
    bitrate: number;
    format: string;
    uptime: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIcon,
    FormatTimeAgoPipe,
  ],
  providers: [
    provideIcons({
      heroUsers,
      heroMusicalNote,
      heroSignal,
      heroChartBar,
      heroArrowTrendingUp,
      heroArrowTrendingDown
    })
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private appwrite = inject(AppwriteService);
  private azuracast = inject(AzuracastService);

  // Stats and Data
  protected currentTrack = this.azuracast.currentTrack;
  protected isLive = this.azuracast.isLive;
  protected streamerName = this.azuracast.streamerName;
  protected isChartLoading = signal(true);

  protected listeners = computed(() => this.azuracast.listeners() || 0);
  protected songHistory = computed(() => this.azuracast.songHistory() || []);

  protected stats = signal<DashboardStats>({
    totalShows: 0,
    activeShows: 0,
    totalTracks: 0,
    listeners: {
      current: 0,
      total: 0,
      unique: 0,
      peak: 0
    },
    streamStatus: {
      isLive: false,
      streamerName: '',
      bitrate: 128,
      format: 'MP3',
      uptime: 0
    }
  });

  // Charts
  private listenerChart: Chart | null = null;
  private trackPopularityChart: Chart | null = null;

  protected listenerTrend = signal<{ time: string; count: number; }[]>([]);
  protected popularTracks = signal<{ title: string; plays: number; }[]>([]);

  async ngOnInit() {
    await this.loadDashboardData();
    this.startDataRefresh();
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  // Image error handler
  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/default-artwork.jpg';
    img.onerror = null;
  }

  private async loadDashboardData() {
    try {
      const [shows, tracks] = await Promise.all([
        this.appwrite.getShows(),
        this.appwrite.getTracks()
      ]);

      const azuracastData = this.azuracast.nowPlayingData();

      this.stats.set({
        totalShows: shows.total,
        activeShows: shows.documents.filter(show => show['active']).length,
        totalTracks: tracks.total,
        listeners: {
          current: azuracastData?.listeners.current ?? 0,
          total: azuracastData?.listeners.total ?? 0,
          unique: azuracastData?.listeners.unique ?? 0,
          peak: this.calculatePeakListeners(azuracastData?.listeners.total ?? 0),
        },
        streamStatus: {
          isLive: azuracastData?.live.is_live ?? false,
          streamerName: azuracastData?.live.streamer_name ?? 'AutoDJ',
          bitrate: this.getBitrate(azuracastData),
          format: this.getFormat(azuracastData),
          uptime: this.calculateUptime(azuracastData),
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  private initializeCharts() {
    this.isChartLoading.set(true);
    try {
      // Destroy existing charts if they exist
      if (this.listenerChart) {
        this.listenerChart.destroy();
      }
      if (this.trackPopularityChart) {
        this.trackPopularityChart.destroy();
      }

      this.initializeListenerChart();
      this.initializeTrackPopularityChart();
    } catch (error) {
      console.error('Error initializing charts:', error);
    } finally {
      this.isChartLoading.set(false);
    }
  }

  private initializeListenerChart() {
    const ctx = document.getElementById('listenerChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Listener chart canvas not found');
      return;
    }

    this.listenerChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Listeners',
          data: this.generateMockListenerData(),
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            }
          }
        }
      }
    });
  }

  private initializeTrackPopularityChart() {
    const ctx = document.getElementById('trackPopularityChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Track popularity chart canvas not found');
      return;
    }

    this.trackPopularityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.songHistory().slice(0, 5).map(track => track.song.title),
        datasets: [{
          label: 'Plays',
          data: this.songHistory().slice(0, 5).map(() => Math.floor(Math.random() * 100)),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              callback: function(value: number | string) {
                const label = String(this.getLabelForValue(Number(value)));
                return label.length > 15 ? label.substring(0, 15) + '...' : label;
              }
            }
          }
        }
      }
    });
  }

  private startDataRefresh() {
    setInterval(() => {
      this.loadDashboardData();
      this.updateCharts();
    }, 30000);
  }

  private updateCharts() {
    this.isChartLoading.set(true);
    try {
      if (this.listenerChart) {
        this.listenerChart.data.datasets[0].data = this.generateMockListenerData();
        this.listenerChart.update();
      }

      if (this.trackPopularityChart) {
        this.trackPopularityChart.data.labels =
          this.songHistory().slice(0, 5).map(track => track.song.title);
        this.trackPopularityChart.data.datasets[0].data =
          this.songHistory().slice(0, 5).map(() => Math.floor(Math.random() * 100));
        this.trackPopularityChart.update();
      }
    } catch (error) {
      console.error('Error updating charts:', error);
    } finally {
      this.isChartLoading.set(false);
    }
  }

  private generateMockListenerData(): number[] {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
  }

  private calculatePeakListeners(current: number): number {
    return Math.max(current, 100);
  }

  private getBitrate(data: any): number {
    return data?.station?.mounts?.[0]?.bitrate ?? 128;
  }

  private getFormat(data: any): string {
    return data?.station?.mounts?.[0]?.format ?? 'MP3';
  }

  private calculateUptime(data: any): number {
    return Math.floor((Date.now() - (data?.live?.broadcast_start ?? Date.now())) / 1000);
  }

  protected formatUptime(seconds: number): string {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  protected formatTimeAgo(timestamp: number): string {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  protected getArtworkUrl(url: string): string {
    return url || 'assets/img/default-artwork.jpg';
  }

  ngOnDestroy() {
    this.listenerChart?.destroy();
    this.trackPopularityChart?.destroy();
  }
}
