import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getAuthUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
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

    let query = supabase
      .from('documents')
      .select(`
        *,
        case:cases(id, case_number),
        client:clients(id, first_name, last_name),
        category:document_categories(id, name, code),
        uploaded_by_user:users!documents_uploaded_by_fkey(id, first_name, last_name)
      `)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Documents fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Błąd pobierania dokumentów'
      }, { status: 500 });
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
