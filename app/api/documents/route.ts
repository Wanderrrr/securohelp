import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { mockDataStore } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    let documents = mockDataStore.documents.getAll();

    if (caseId) {
      documents = mockDataStore.documents.getByCaseId(caseId);
    }

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera'
    }, { status: 500 });
  }
}
