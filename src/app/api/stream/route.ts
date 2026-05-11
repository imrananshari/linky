import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  const format = req.nextUrl.searchParams.get('format');
  const title = req.nextUrl.searchParams.get('title') || 'video';

  if (!url || !format) {
    return new Response('Missing parameters', { status: 400 });
  }

  const ytDlp = spawn('python', [
    '-m', 'yt_dlp',
    '-f', format,
    '-o', '-',
    '--no-warnings',
    '--no-check-certificate',
    url
  ]);

  const stream = new Readable({
    read() {}
  });

  ytDlp.stdout.on('data', (chunk) => {
    stream.push(chunk);
  });

  ytDlp.stderr.on('data', (data) => {
    console.error(`yt-dlp stderr: ${data}`);
  });

  ytDlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`yt-dlp process exited with code ${code}`);
    }
    stream.push(null);
  });

  // Sanitize filename
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return new Response(stream as any, {
    headers: {
      'Content-Disposition': `attachment; filename="${safeTitle}.mp4"`,
      'Content-Type': 'video/mp4',
    },
  });
}
