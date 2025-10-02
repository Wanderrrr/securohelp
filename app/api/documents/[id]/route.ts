import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

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

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const serializedDocument = {
      ...document,
      fileSize: document.fileSize ? Number(document.fileSize) : null
    };

    return NextResponse.json(serializedDocument);

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Soft delete the document
    await prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId: user.id
      }
    });

    return NextResponse.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
