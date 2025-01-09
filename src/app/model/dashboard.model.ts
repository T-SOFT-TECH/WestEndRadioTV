
export interface DashboardStats {
  listeners: {
    current: number;
    total: number;
    peak: number;
  };
  streamStatus: {
    isLive: boolean;
    streamer: string;
    bitrate: number;
    format: string;
  };
  currentTrack: {
    title: string;
    artist: string;
    artwork: string;
    duration: number;
    elapsed: number;
  };
  recentTracks: Array<{
    title: string;
    artist: string;
    playedAt: string;
    duration: number;
  }>;
}
