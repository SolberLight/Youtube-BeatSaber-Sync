export type LikedSong = {
  id: string;
  videoId: string;
  title: string;
  artists: string[];
  album: string | null;
  durationText: string | null;
  durationSeconds: number | null;
  thumbnails: { url: string; width?: number; height?: number }[];
  isAvailable: boolean;
};

export interface MusicProvider {
  validateAuth(): Promise<void>;
  getLikedSongs(): Promise<LikedSong[]>;
  /** Free-text song search across YouTube Music, not just the likes list. */
  searchSongs(query: string, limit?: number): Promise<LikedSong[]>;
  /** Top of the listening history: the track most recently started. */
  getLastPlayed(): Promise<LikedSong | null>;
}
