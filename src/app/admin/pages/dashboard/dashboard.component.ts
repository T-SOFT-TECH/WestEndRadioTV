import {Component, inject, OnInit, signal} from '@angular/core';
import {AppwriteService} from '../../../services/appwrite.service';
import {RouterLink} from '@angular/router';

interface DashboardStats {
  totalShows: number;
  activeShows: number;
  totalTracks: number;
  liveListeners: number;
}

interface CurrentShow {
  $id: string;
  title: string;
  host: string;
  startTime: string;
  endTime: string;
  imageId?: string;
}

interface RecentTrack {
  $id: string;
  title: string;
  artist: string;
  playedAt: string;
  coverImageId?: string;
  showTitle: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private appwrite = inject(AppwriteService);

  protected stats = signal<DashboardStats | null>(null);
  protected currentShow = signal<CurrentShow | null>(null);
  protected recentTracks = signal<RecentTrack[]>([]);
  protected lastTrackAdded = signal<string>('');
  protected peakListeners = signal<number>(0);

  ngOnInit() {
    this.loadDashboardData();
    this.startLiveUpdates();
  }

  private async loadDashboardData() {
    try {
      // Load all data concurrently
      const [statsData, currentShowData, tracksData] = await Promise.all([
        this.loadStats(),
        this.loadCurrentShow(),
        this.loadRecentTracks()
      ]);

      // Update signals
      this.stats.set(statsData);
      this.currentShow.set(currentShowData);
      this.recentTracks.set(tracksData);

      // Calculate additional stats
      this.calculateLastTrackAdded(tracksData);
      this.calculatePeakListeners();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  private async loadStats(): Promise<DashboardStats> {
    const [shows, tracks] = await Promise.all([
      this.appwrite.getShows(),
      this.appwrite.getTracks()
    ]);

    return {
      totalShows: shows.total,
      activeShows: shows.documents.filter(show => show['active']).length,
      totalTracks: tracks.total,
      liveListeners: Math.floor(Math.random() * 1000) // Replace with actual listener count
    };
  }

  private async loadCurrentShow(): Promise<CurrentShow | null> {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    const shows = await this.appwrite.getShows();

    const currentShow = shows.documents.find(show => {
      const [startHour, startMinutes] = show['startTime'].split(':').map(Number);
      const [endHour, endMinutes] = show['endTime'].split(':').map(Number);

      const isCurrentTimeAfterStart =
        currentHour > startHour ||
        (currentHour === startHour && currentMinutes >= startMinutes);

      const isCurrentTimeBeforeEnd =
        currentHour < endHour ||
        (currentHour === endHour && currentMinutes <= endMinutes);

      return isCurrentTimeAfterStart && isCurrentTimeBeforeEnd && show['active'];
    });

    if (!currentShow) return null;

    // Map to CurrentShow interface
    return {
      $id: currentShow.$id,
      title: currentShow['title'],
      host: currentShow['host'],
      startTime: currentShow['startTime'],
      endTime: currentShow['endTime'],
      imageId: currentShow['imageId']
    };
  }

  private async loadRecentTracks(): Promise<RecentTrack[]> {
    const tracks = await this.appwrite.getTracks();
    return tracks.documents
      .slice(0, 5)
      .map(track => ({
        $id: track.$id,
        title: track['title'],
        artist: track['artist'],
        playedAt: track['playedAt'],
        coverImageId: track['coverImageId'],
        showTitle: this.getShowTitle(track['show'])
      }));
  }

  private calculateLastTrackAdded(tracks: RecentTrack[]) {
    if (tracks.length > 0) {
      const lastTrack = tracks[0];
      this.lastTrackAdded.set(this.formatTimeAgo(lastTrack.playedAt));
    }
  }

  private calculatePeakListeners() {
    // Replace with actual peak listener calculation
    this.peakListeners.set(1200);
  }

  private startLiveUpdates() {
    // Update current show and stats every minute
    setInterval(() => {
      this.loadCurrentShow().then(show => this.currentShow.set(show));
      this.loadStats().then(stats => this.stats.set(stats));
    }, 60000);
  }

  protected getShowTitle(showId: string): string {
    // Implementation depends on how you store/cache show data
    return 'Show Title'; // Replace with actual show title lookup
  }

  protected formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const hour12 = parseInt(hours) % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  }

  protected formatTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  protected getImageUrl(imageId: string): string {
    return this.appwrite.getFileView(imageId);
  }

}
