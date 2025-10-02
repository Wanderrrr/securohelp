import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📸 Thumbnail API called');
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      console.log('❌ Invalid auth token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    console.log(`🔍 Looking for document with ID: ${id}`);

    // Get document info from database
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        fileName: true,
        originalFileName: true,
        mimeType: true,
        filePath: true
      }
    });

    if (!document) {
      console.log(`❌ Document not found: ${id}`);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log(`📄 Document found:`, document);

    // Check if it's an image
    if (!document.mimeType?.startsWith('image/')) {
      console.log(`❌ Not an image: ${document.mimeType}`);
      return NextResponse.json({ error: 'Not an image file' }, { status: 400 });
    }

    // Check if thumbnail exists
    const thumbnailFileName = `thumb_${document.fileName.replace(/\.[^.]+$/, '.jpg')}`;
    const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', thumbnailFileName);
    
    console.log(`🔍 Looking for thumbnail: ${thumbnailPath}`);
    
    if (fs.existsSync(thumbnailPath)) {
      // Serve the thumbnail directly
      const thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
      console.log(`✅ Thumbnail found: ${thumbnailUrl}`);
      
      return NextResponse.json({
        thumbnailUrl: thumbnailUrl,
        fileName: document.originalFileName,
        mimeType: document.mimeType,
        isRealThumbnail: true,
        note: 'Real thumbnail from uploaded image'
      });
    } else {
      console.log(`❌ Thumbnail not found at: ${thumbnailPath}`);
      
      // Fallback to demo image for existing documents without thumbnails
      const demoImageSeed = parseInt(id.slice(-6), 16) % 1000;
      const thumbnailUrl = `https://picsum.photos/150/150?random=${demoImageSeed}`;
      
      return NextResponse.json({
        thumbnailUrl: thumbnailUrl,
        fileName: document.originalFileName,
        mimeType: document.mimeType,
        isRealThumbnail: false,
        note: 'Demo thumbnail - original file uploaded before thumbnail system was implemented'
      });
    }

  } catch (error) {
    console.error('💥 Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
