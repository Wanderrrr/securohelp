import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

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

    const categories = await prisma.documentCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Document categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document categories' }, { status: 500 });
  }
}
