import { NextResponse } from 'next/server';
import recoveredImages from '@/data/recovery/legacy-image-urls.json';

// These URLs were matched by exact original storage path and verified in the
// existing Blob store. Historical GridFS IDs stay usable without MongoDB.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  if (!/^[a-f\d]{24}$/i.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
  }
  const url = (recoveredImages as Record<string, string>)[fileId.toLowerCase()];
  if (!url) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  return NextResponse.redirect(url, {
    status: 307,
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
