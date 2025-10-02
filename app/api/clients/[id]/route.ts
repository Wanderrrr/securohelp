import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';
import { encrypt } from '@/lib/encryption';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      pesel,
      idNumber,
      street,
      houseNumber,
      apartmentNumber,
      postalCode,
      city,
      notes,
      gdprConsent,
      marketingConsent,
      assignedAgentId
    } = body;

    // Sprawdź czy klient istnieje
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    // Przygotuj dane do aktualizacji
    const updateData: Record<string, unknown> = {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      houseNumber: houseNumber || null,
      apartmentNumber: apartmentNumber || null,
      postalCode: postalCode || null,
      city,
      clientNotes: notes || null,
      gdprConsent,
      marketingConsent,
      updatedByUserId: user.id
    };

    // Dodaj assignedAgentId tylko jeśli jest podany
    if (assignedAgentId) {
      updateData.assignedAgentId = assignedAgentId;
    }

    // Zaktualizuj nowe, nieszyfrowane pola
    if (pesel) updateData.pesel = pesel;
    if (idNumber) updateData.idNumber = idNumber;
    if (street) updateData.street = street;

    // Aktualizuj klienta
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cases: {
          include: {
            status: true
          }
        },
        notes: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: 'Klient został zaktualizowany pomyślnie'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas aktualizacji klienta' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Sprawdź czy klient istnieje
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Klient nie został znaleziony' },
        { status: 404 }
      );
    }

    // Soft delete - ustaw deletedAt
    const deletedClient = await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: deletedClient,
      message: 'Klient został usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas usuwania klienta' },
      { status: 500 }
    );
  }
}
