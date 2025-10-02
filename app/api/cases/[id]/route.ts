import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const case_ = await prisma.case.findUnique({
      where: { id },
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
        documents: {
          include: {
            category: true
          }
        },
        notes: true,
        tasks: true,
        statusHistory: {
          include: {
            fromStatus: true,
            toStatus: true,
            changedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            changedAt: 'desc'
          }
        }
      }
    });

    if (!case_) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(case_);

  } catch (error) {
    console.error('Case fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    console.log('🔍 Case edit request body:', JSON.stringify(body, null, 2));

    const {
      statusId,
      assignedAgentId,
      incidentDescription,
      incidentLocation,
      policyNumber,
      claimNumber,
      claimValue,
      compensationReceived,
      vehicleBrand,
      vehicleModel,
      vehicleRegistration,
      vehicleYear,
      internalNotes,
      statusComment
    } = body;

    console.log('👤 Assigned Agent ID:', assignedAgentId, typeof assignedAgentId);

    // Check if case exists
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: { status: true }
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      assignedAgentId: assignedAgentId || null,
      incidentDescription,
      incidentLocation,
      policyNumber,
      claimNumber,
      claimValue: claimValue ? parseFloat(claimValue) : null,
      compensationReceived: compensationReceived ? parseFloat(compensationReceived) : null,
      vehicleBrand,
      vehicleModel,
      vehicleRegistration,
      vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
      internalNotes,
      updatedByUserId: user.id
    };

    // Handle status change
    if (statusId && statusId !== existingCase.statusId) {
      updateData.statusId = parseInt(statusId);
      
      // Create status history entry
      await prisma.caseStatusHistory.create({
        data: {
          caseId: id,
          fromStatusId: existingCase.statusId,
          toStatusId: parseInt(statusId),
          comment: statusComment || 'Status zmieniony',
          changedByUserId: user.id
        }
      });

      // Update timestamps based on status
      const statusCode = await prisma.caseStatus.findUnique({
        where: { id: parseInt(statusId) },
        select: { code: true, isFinal: true }
      });

      if (statusCode) {
        switch (statusCode.code) {
          case 'SENT_TO_INSURER':
            updateData.documentsSentDate = new Date();
            break;
          case 'POSITIVE_DECISION':
          case 'NEGATIVE_DECISION':
            updateData.decisionDate = new Date();
            break;
          case 'APPEAL':
            updateData.appealDate = new Date();
            break;
          case 'LAWSUIT':
            updateData.lawsuitDate = new Date();
            break;
        }

        if (statusCode.isFinal) {
          updateData.closedDate = new Date();
        }
      }
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedCase);

  } catch (error) {
    console.error('Case update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete the case
    await prisma.case.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedByUserId: user.id
      }
    });

    return NextResponse.json({ message: 'Case deleted successfully' });

  } catch (error) {
    console.error('Case deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
