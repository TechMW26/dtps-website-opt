import { NextResponse } from 'next/server';
import { getFileFromGridFS } from '@/lib/gridfs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
};

export async function GET(
    _request: Request,
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

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': result.contentType,
                'Content-Length': buffer.length.toString(),
                ...noCacheHeaders,
            },
        });
    } catch (error) {
        console.error('Error serving GridFS image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
