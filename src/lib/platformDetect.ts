export type Platform = "youtube" | "instagram" | "facebook" | "snapchat" | "unknown";

export function detectPlatform(url: string): Platform {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return "youtube";
    }
    if (domain.includes('instagram.com')) {
      return "instagram";
    }
    if (domain.includes('facebook.com') || domain.includes('fb.watch')) {
      return "facebook";
    }
    if (domain.includes('snapchat.com')) {
      return "snapchat";
    }
    
    return "unknown";
  } catch {
    return "unknown";
  }
}
