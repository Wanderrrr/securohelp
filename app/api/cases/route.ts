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

    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        *,
        client:clients(id, first_name, last_name, email, phone),
        status:case_statuses(id, code, name, color),
        insurance_company:insurance_companies(id, name, short_name),
        assigned_agent:users!cases_assigned_agent_id_fkey(id, first_name, last_name)
      `)
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
  const supabase = getSupabaseServer();
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

    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        case_number: caseNumber,
        client_id: body.clientId,
        insurance_company_id: body.insuranceCompanyId || null,
        status_id: body.statusId || 1,
        assigned_agent_id: body.assignedAgentId || user.id,
        incident_date: body.incidentDate,
        policy_number: body.policyNumber || null,
        claim_number: body.claimNumber || null,
        claim_value: body.claimValue || null,
        incident_description: body.incidentDescription || null,
        incident_location: body.incidentLocation || null,
        vehicle_brand: body.vehicleBrand || null,
        vehicle_model: body.vehicleModel || null,
        vehicle_registration: body.vehicleRegistration || null,
        vehicle_year: body.vehicleYear || null,
        internal_notes: body.internalNotes || null,
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
