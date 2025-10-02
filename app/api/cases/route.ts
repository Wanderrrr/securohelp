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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const client = searchParams.get('client') || '';
    const agent = searchParams.get('agent') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { incidentDescription: { contains: search, mode: 'insensitive' } },
        { incidentLocation: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.status = { code: status };
    }

    if (client) {
      whereClause.clientId = client;
    }

    if (agent) {
      whereClause.assignedAgentId = agent;
    }

    // Pobierz sprawy z relacjami
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        status: true,
        insuranceCompany: true,
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        // Temporarily removed complex relations to debug
        // documents: {
        //   include: {
        //     category: true
        //   }
        // },
        // notes: true,
        // tasks: true,
        // statusHistory: {
        //   include: {
        //     fromStatus: true,
        //     toStatus: true,
        //     changedBy: {
        //       select: {
        //         id: true,
        //         firstName: true,
        //         lastName: true
        //       }
        //     }
        //   },
        //   orderBy: {
        //     changedAt: 'desc'
        //   },
        //   take: 5
        // }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Pobierz całkowitą liczbę spraw dla paginacji
    const totalCases = await prisma.case.count({
      where: whereClause
    });

    console.log('Cases API Debug:', {
      casesCount: cases.length,
      totalCases,
      firstCase: cases[0] ? { id: cases[0].id, caseNumber: cases[0].caseNumber } : null
    });

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total: totalCases,
        pages: Math.ceil(totalCases / limit)
      }
    });

  } catch (error) {
    console.error('Cases fetch error:', error);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 Case creation request body:', JSON.stringify(body, null, 2));
    
    const {
      clientId,
      insuranceCompanyId,
      statusId = 1, // Default to first status (usually "NEW")
      assignedAgentId,
      incidentDate,
      policyNumber,
      claimNumber,
      claimValue,
      incidentDescription,
      incidentLocation,
      vehicleBrand,
      vehicleModel,
      vehicleRegistration,
      vehicleYear,
      internalNotes
    } = body;

    console.log('🏢 Insurance Company ID:', insuranceCompanyId, typeof insuranceCompanyId);

    // Validate required fields
    if (!clientId || !incidentDate) {
      return NextResponse.json(
        { error: 'Client ID and incident date are required' },
        { status: 400 }
      );
    }

    // Generate case number (format: SH/YYYY/MM/XXXXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get the next case number for this month
    const lastCase = await prisma.case.findFirst({
      where: {
        caseNumber: {
          startsWith: `SH/${year}/${month}/`
        }
      },
      orderBy: {
        caseNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastCase) {
      const lastNumber = parseInt(lastCase.caseNumber.split('/').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    const caseNumber = `SH/${year}/${month}/${String(nextNumber).padStart(5, '0')}`;

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        clientId,
        insuranceCompanyId: insuranceCompanyId ? parseInt(insuranceCompanyId) : null,
        statusId,
        assignedAgentId: assignedAgentId || null,
        incidentDate: new Date(incidentDate),
        policyNumber,
        claimNumber,
        claimValue: claimValue ? parseFloat(claimValue) : null,
        incidentDescription,
        incidentLocation,
        vehicleBrand,
        vehicleModel,
        vehicleRegistration,
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        internalNotes,
        createdByUserId: user.id
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        status: true,
        insuranceCompany: true,
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create initial status history entry
    await prisma.caseStatusHistory.create({
      data: {
        caseId: newCase.id,
        toStatusId: statusId,
        comment: 'Sprawa utworzona',
        changedByUserId: user.id
      }
    });

    return NextResponse.json(newCase, { status: 201 });

  } catch (error) {
    console.error('Case creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
