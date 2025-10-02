import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: cases, error } = await supabase
      .from('cases')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Cases fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Błąd pobierania spraw'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: cases
    });

  } catch (error) {
    console.error('Cases API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const body = await request.json();

    const caseNumber = `${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;

    const supabase = getSupabaseServer();
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        client_id: body.clientId,
        insurance_company_id: body.insuranceCompanyId || null,
        status_id: body.statusId || 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        assigned_agent_id: body.assignedAgentId || user.id,
        accident_date: body.incidentDate,
        accident_description: body.incidentDescription || '',
        notes: body.internalNotes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Case creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Błąd tworzenia sprawy'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newCase,
      message: 'Sprawa została utworzona'
    }, { status: 201 });

  } catch (error) {
    console.error('Case creation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera'
    }, { status: 500 });
  }
}
