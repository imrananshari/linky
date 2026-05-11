export interface VideoFormat {
  formatId: string;
  quality: string;
  ext: string;
  filesize: number | null;
  url: string;
}

export interface VideoInfo {
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  formats: VideoFormat[];
  platform: "youtube" | "instagram" | "facebook" | "snapchat" | "unknown";
}

export interface DownloadHistory {
  url: string;
  title: string;
  platform: "youtube" | "instagram" | "facebook" | "snapchat" | "unknown";
  timestamp: number;
  thumbnail: string;
}
