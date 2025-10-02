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

    const cases = mockDataStore.cases.getAll();

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

    const newCase = mockDataStore.cases.create({
      case_number: caseNumber,
      client_id: body.clientId,
      insurance_company_id: body.insuranceCompanyId || null,
      status_id: body.statusId || '1',
      assigned_agent_id: body.assignedAgentId || user.id,
      accident_date: body.incidentDate,
      accident_description: body.incidentDescription || '',
      notes: body.internalNotes || null,
      created_by: user.id,
    });

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
