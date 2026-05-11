from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        url = data.get('url')

        if not url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'URL is required'}).encode())
            return

        import random
        user_agents = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UD1A.231105.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ]

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'user_agent': random.choice(user_agents),
            'no_cache_dir': True,
            'headers': {
                'Referer': 'https://www.instagram.com/',
                'Origin': 'https://www.instagram.com',
            },
            'extractor_args': {
                'youtube': {
                    'player_client': ['ios', 'android'],
                    'skip': ['dash', 'hls']
                },
                'instagram': {
                    'check_login': False
                }
            }
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Check if it's a playlist
                if 'entries' in info:
                    results = []
                    for entry in info['entries']:
                        results.append(self.serialize_info(entry, url))
                    response_data = results
                else:
                    response_data = self.serialize_info(info, url)

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def serialize_info(self, data, original_url):
        formats = []
        if 'formats' in data:
            # Filter for standard mp4 formats with both audio and video if possible
            for f in data['formats']:
                if f.get('vcodec') != 'none' and f.get('acodec') != 'none' and f.get('ext') == 'mp4':
                    formats.append({
                        'formatId': f.get('format_id'),
                        'quality': f.get('format_note') or f.get('resolution') or 'Video',
                        'ext': f.get('ext'),
                        'filesize': f.get('filesize') or f.get('filesize_approx'),
                        'url': f.get('url')
                    })
        
        # Sort formats by quality (resolution)
        formats.sort(key=lambda x: x.get('quality', ''), reverse=True)

        import urllib.parse
        return {
            'url': data.get('webpage_url') or original_url,
            'title': data.get('title'),
            'thumbnail': f"/api/thumbnail?url={urllib.parse.quote(data.get('thumbnail') or '')}",
            'duration': data.get('duration'),
            'formats': formats,
            'platform': 'youtube' if 'youtube' in original_url else 'social'
        }
