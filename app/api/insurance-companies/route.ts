import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { mockDataStore } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = mockDataStore.insuranceCompanies.getAll();

    return NextResponse.json(companies);

  } catch (error) {
    console.error('Insurance companies fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, shortName, phone, email } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });

  } catch (error) {
    console.error('Insurance company creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}