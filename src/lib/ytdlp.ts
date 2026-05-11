import { execSync } from 'child_process';
import { VideoInfo, VideoFormat } from '@/types';
import { detectPlatform } from './platformDetect';

export async function getVideoInfo(url: string): Promise<VideoInfo | VideoInfo[]> {
  try {
    // Check if yt-dlp is installed
    try {
      execSync('python -m yt_dlp --version');
    } catch {
      throw new Error('yt-dlp is not installed. Run: pip install yt-dlp');
    }

    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      throw new Error('Platform not supported yet');
    }

    const isPlaylist = url.includes('playlist') || url.includes('&list=');
    const command = `python -m yt_dlp ${isPlaylist ? '--flat-playlist' : ''} --dump-json --no-warnings --no-check-certificate "${url}"`;
    const output = execSync(command, { encoding: 'utf8' });
    
    // For playlists, output might be multiple JSON lines
    const lines = output.trim().split('\n');
    const results = lines.map(line => JSON.parse(line));

    if (isPlaylist || results.length > 1) {
      return results.map((data: any) => ({
        url: data.webpage_url || (data.id ? `https://www.youtube.com/watch?v=${data.id}` : url),
        title: data.title,
        thumbnail: `/api/thumbnail?url=${encodeURIComponent(data.thumbnail || data.thumbnails?.[0]?.url || '')}`,
        duration: data.duration,
        formats: data.formats ? data.formats
          .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none')
          .map((f: any) => ({
            formatId: f.format_id,
            quality: f.format_note || f.resolution || 'unknown',
            ext: f.ext,
            filesize: f.filesize || f.filesize_approx || null,
            url: f.url,
          })) : [],
        platform: 'youtube',
      }));
    }

    const data = results[0];
    const formats: VideoFormat[] = data.formats
      .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none')
      .map((f: any) => ({
        formatId: f.format_id,
        quality: f.format_note || f.resolution || 'unknown',
        ext: f.ext,
        filesize: f.filesize || f.filesize_approx || null,
        url: f.url,
      }))
      .filter((f: VideoFormat, index: number, self: VideoFormat[]) => 
        index === self.findIndex((t) => t.quality === f.quality && t.ext === f.ext)
      );

    return {
      url,
      title: data.title,
      thumbnail: `/api/thumbnail?url=${encodeURIComponent(data.thumbnail)}`,
      duration: data.duration,
      formats,
      platform,
    };
  } catch (error: any) {
    if (error.message.includes('private') || error.message.includes('Sign in')) {
      throw new Error('This video is private or unavailable');
    }
    throw error;
  }
}
