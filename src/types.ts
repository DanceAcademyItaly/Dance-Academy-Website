export interface Choreography {
  title: string;
  videoId: string;
}

export interface EpisodeData {
  id: number;
  season: number;
  seasonName: string;
  title: string;
  slug: string;
  mainVideoId: string;
  choreographies: Choreography[];
  thumbnail?: string;
}
