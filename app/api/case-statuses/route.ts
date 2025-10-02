import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { mockDataStore } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statuses = mockDataStore.caseStatuses.getAll();

    return NextResponse.json(statuses);

  } catch (error) {
    console.error('Case statuses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
