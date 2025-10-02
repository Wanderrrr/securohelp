import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const caseFilter = searchParams.get('case') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { originalFileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { case: { caseNumber: { contains: search, mode: 'insensitive' } } },
        { case: { client: { firstName: { contains: search, mode: 'insensitive' } } } },
        { case: { client: { lastName: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (category) {
      whereClause.categoryId = parseInt(category);
    }

    if (caseFilter) {
      whereClause.case = {
        caseNumber: { contains: caseFilter, mode: 'insensitive' }
      };
    }

    // Fetch documents with relations
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        category: true,
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalDocuments = await prisma.document.count({
      where: whereClause
    });

    // Convert BigInt to number for JSON serialization
    const serializedDocuments = documents.map(doc => ({
      ...doc,
      fileSize: doc.fileSize ? Number(doc.fileSize) : null
    }));

    return NextResponse.json({
      documents: serializedDocuments,
      pagination: {
        page,
        limit,
        total: totalDocuments,
        pages: Math.ceil(totalDocuments / limit)
      }
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle multipart form data for file upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const documentDate = formData.get('documentDate') as string;

    if (!file || !caseId || !categoryId) {
      return NextResponse.json(
        { error: 'File, case ID, and category ID are required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG, GIF, DOC, DOCX' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      );
    }

    // Get case and client info
    const caseInfo = await prisma.case.findUnique({
      where: { id: caseId },
      select: { clientId: true }
    });

    if (!caseInfo) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Save to public/uploads/documents
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    
    // Ensure directories exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    const fullFilePath = path.join(uploadsDir, fileName);
    const filePath = `/uploads/documents/${fileName}`;

    // Calculate file hash and save file
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    
    // Save the file to disk
    fs.writeFileSync(fullFilePath, fileBuffer);
    console.log(`📁 File saved: ${fullFilePath}`);
    
    // Generate thumbnail for images
    let thumbnailPath = null;
    if (file.type.startsWith('image/')) {
      try {
        const thumbnailFileName = `thumb_${fileName.replace(/\.[^.]+$/, '.jpg')}`;
        thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);
        
        await sharp(fileBuffer)
          .resize(150, 150, { 
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: 80 
          })
          .toFile(thumbnailPath);
        
        console.log(`🖼️ Thumbnail generated: ${thumbnailPath}`);
      } catch (thumbError) {
        console.error('Thumbnail generation failed:', thumbError);
        // Continue without thumbnail
      }
    }

    // Create document record
    const newDocument = await prisma.document.create({
      data: {
        caseId,
        clientId: caseInfo.clientId,
        categoryId: parseInt(categoryId),
        fileName,
        originalFileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        fileHash,
        description: description || null,
        documentDate: documentDate ? new Date(documentDate) : null,
        uploadedByUserId: user.id
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        category: true,
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // File and thumbnail are already saved above

    // Convert BigInt to number for JSON serialization
    const serializedNewDocument = {
      ...newDocument,
      fileSize: newDocument.fileSize ? Number(newDocument.fileSize) : null
    };

    return NextResponse.json(serializedNewDocument, { status: 201 });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
