import { NextRequest, NextResponse } from 'next/server';
import { getFileFromGridFS } from '@/lib/gridfs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        if (!fileId || !/^[a-f\d]{24}$/i.test(fileId)) {
            return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
        }

        const result = await getFileFromGridFS(fileId);
        if (!result) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const chunks: Uint8Array[] = [];
        for await (const chunk of result.stream as AsyncIterable<Uint8Array>) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': result.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error serving GridFS image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
