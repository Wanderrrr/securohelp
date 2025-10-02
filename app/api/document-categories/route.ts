import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { mockDataStore } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = mockDataStore.documentCategories.getAll();

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Document categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document categories' }, { status: 500 });
  }
}
