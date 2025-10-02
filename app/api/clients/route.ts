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
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Clients fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Błąd pobierania klientów'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Clients API error:', error);
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

    const supabase = getSupabaseServer();
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        pesel: body.pesel || null,
        id_number: body.idNumber || null,
        street: body.street || null,
        house_number: body.houseNumber || null,
        apartment_number: body.apartmentNumber || null,
        postal_code: body.postalCode || null,
        city: body.city,
        notes: body.notes || null,
        gdpr_consent: body.gdprConsent || false,
        gdpr_consent_date: body.gdprConsent ? new Date().toISOString() : null,
        marketing_consent: body.marketingConsent || false,
        assigned_agent_id: body.assignedAgentId || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Client creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Błąd tworzenia klienta'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newClient,
      message: 'Klient został utworzony'
    }, { status: 201 });

  } catch (error) {
    console.error('Client creation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera'
    }, { status: 500 });
  }
}
