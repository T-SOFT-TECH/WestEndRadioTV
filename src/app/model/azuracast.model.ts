// models/azuracast.model.ts
export interface AzuracastResponse {
  station: {
    name: string;
    listen_url: string;
  };
  listeners: {
    total: number;
    unique: number;
    current: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
    broadcast_start?: number;
  };
  now_playing: {
    streamer: string;
    song: {
      art: string;
      text: string;
      artist: string;
      title: string;
      album: string;
    };
    elapsed: number;
    duration: number;
  };
  playing_next: {
    song: {
      art: string;
      text: string;
      artist: string;
      title: string;
      album: string;
    };
  } | null;
  song_history: Array<{
    sh_id: number;
    played_at: number;
    duration: number;
    playlist: string;
    streamer: string;
    is_request: boolean;
    song: {
      id: string;
      art: string;
      text: string;
      artist: string;
      title: string;
      album: string;
    };
  }>;
  is_online: boolean;
}

// Optional: Create a simpler interface for just the track info
export interface CurrentTrack {
  title: string;
  artist: string;
  art: string;
  elapsed: number;
  duration: number;
  streamer: string;
}
