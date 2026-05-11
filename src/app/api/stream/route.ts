import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const downloadUrl = req.nextUrl.searchParams.get('url');
  const title = req.nextUrl.searchParams.get('title') || 'video';
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

  if (!downloadUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  try {
    const response = await fetch(downloadUrl);
    
    if (!response.ok) throw new Error('Failed to fetch video');

    // Create a streaming response to bypass Vercel's 4.5MB limit
    return new Response(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'video/mp4',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return new Response('Error streaming video', { status: 500 });
  }
}
