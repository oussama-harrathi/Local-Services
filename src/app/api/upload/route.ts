import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${randomString}.${extension}`;

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Return the public URL
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls 
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}