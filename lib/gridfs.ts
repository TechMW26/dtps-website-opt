import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import type { Readable } from 'stream';
import dbConnect from './mongodb';

let bucket: GridFSBucket | null = null;

async function getGridFSBucket(): Promise<GridFSBucket> {
    if (bucket) return bucket;

    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not established');

    bucket = new GridFSBucket(db, { bucketName: 'images' });
    return bucket;
}

export async function uploadToGridFS(
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<ObjectId> {
    const gridBucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = gridBucket.openUploadStream(filename, {
            metadata: { originalFilename: filename, contentType: mimeType, mimeType, uploadedAt: new Date() },
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id as ObjectId));
        uploadStream.end(buffer);
    });
}

export async function getFileFromGridFS(
    fileId: string
): Promise<{ stream: Readable; contentType: string; filename: string } | null> {
    const gridBucket = await getGridFSBucket();

    let objectId: ObjectId;
    try {
        objectId = new ObjectId(fileId);
    } catch {
        return null;
    }

    const files = await gridBucket.find({ _id: objectId }).toArray();
    if (files.length === 0) return null;

    const file = files[0];
    const stream = gridBucket.openDownloadStream(objectId);
    return {
        stream,
        contentType: (file.metadata?.contentType as string) || 'application/octet-stream',
        filename: file.filename,
    };
}

export async function fileExistsInGridFS(filename: string): Promise<ObjectId | null> {
    const gridBucket = await getGridFSBucket();
    const files = await gridBucket.find({ filename }).toArray();
    return files.length > 0 ? (files[0]._id as ObjectId) : null;
}

export function getImageUrl(fileId: string | ObjectId): string {
    return `/api/images/${fileId.toString()}`;
}
