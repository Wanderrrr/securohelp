import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        fileName: true,
        originalFileName: true,
        mimeType: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log(`🔍 View request for document:`, document);

    // Get file from local filesystem
    const fullFilePath = path.join(process.cwd(), 'public', 'uploads', 'documents', document.fileName);
    
    console.log(`📁 Looking for file at: ${fullFilePath}`);
    
    if (!fs.existsSync(fullFilePath)) {
      console.log(`❌ File not found on disk: ${fullFilePath}`);
      
      // Fallback for old documents without files
      return NextResponse.json({ 
        error: 'File not found on disk - document was uploaded before file storage was implemented' 
      }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullFilePath);
    console.log(`✅ File loaded for view, size: ${fileBuffer.length} bytes`);
    
    // Return file for inline viewing (no Content-Disposition: attachment)
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.mimeType || 'application/octet-stream',
        'Content-Length': fileBuffer.length.toString(),
        // For inline viewing - no attachment header
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Document view error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
