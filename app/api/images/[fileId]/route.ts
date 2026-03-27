import { NextRequest, NextResponse } from 'next/server';
import { getFileFromGridFS } from '@/lib/gridfs';
import crypto from 'crypto';

// In-memory LRU cache for GridFS images
const IMAGE_CACHE = new Map<string, { buffer: Buffer; contentType: string; etag: string }>();
const MAX_CACHE_SIZE = 100; // max entries
const MAX_CACHE_BYTES = 200 * 1024 * 1024; // 200 MB total
let currentCacheBytes = 0;

function evictIfNeeded(incomingSize: number) {
    while (
        (IMAGE_CACHE.size >= MAX_CACHE_SIZE || currentCacheBytes + incomingSize > MAX_CACHE_BYTES) &&
        IMAGE_CACHE.size > 0
    ) {
        const oldestKey = IMAGE_CACHE.keys().next().value!;
        const entry = IMAGE_CACHE.get(oldestKey)!;
        currentCacheBytes -= entry.buffer.length;
        IMAGE_CACHE.delete(oldestKey);
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        if (!fileId || !/^[a-f\d]{24}$/i.test(fileId)) {
            return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
        }

        // Check in-memory cache first
        let cached = IMAGE_CACHE.get(fileId);

        if (!cached) {
            const result = await getFileFromGridFS(fileId);
            if (!result) {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }

            const chunks: Uint8Array[] = [];
            for await (const chunk of result.stream as AsyncIterable<Uint8Array>) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            const etag = `"${crypto.createHash('md5').update(buffer).digest('hex')}"`;

            // Cache the result
            evictIfNeeded(buffer.length);
            cached = { buffer, contentType: result.contentType, etag };
            IMAGE_CACHE.set(fileId, cached);
            currentCacheBytes += buffer.length;

            // Move to end (most recently used)
        } else {
            // Move to end of map for LRU ordering
            IMAGE_CACHE.delete(fileId);
            IMAGE_CACHE.set(fileId, cached);
        }

        // Support conditional requests (304 Not Modified)
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch === cached.etag) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    'ETag': cached.etag,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return new NextResponse(cached.buffer, {
            status: 200,
            headers: {
                'Content-Type': cached.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': cached.buffer.length.toString(),
                'ETag': cached.etag,
            },
        });
    } catch (error) {
        console.error('Error serving GridFS image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
