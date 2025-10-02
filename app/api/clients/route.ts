import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { ClientWithRelations, ApiResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      } as ApiResponse, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowy token'
      } as ApiResponse, { status: 401 })
    }

    // Pobierz klientów z relacjami
    const clients = await prisma.client.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        pesel: true, // Nowe pole
        idNumber: true, // Nowe pole
        street: true, // Nowe pole
        houseNumber: true,
        apartmentNumber: true,
        postalCode: true,
        city: true,
        clientNotes: true, // Dodajemy pole tekstowe notatek
        gdprConsent: true,
        marketingConsent: true,
        assignedAgentId: true,
        createdAt: true,
        updatedAt: true,
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cases: {
          where: {
            deletedAt: null
          },
          include: {
            status: {
              select: {
                id: true,
                name: true,
                color: true,
                isFinal: true
              }
            },
            insuranceCompany: {
              select: {
                id: true,
                name: true,
                shortName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        notes: {
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        },
        tasks: {
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: clients
    } as ApiResponse<ClientWithRelations[]>)

  } catch (error) {
    console.error('Clients fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas pobierania klientów'
    } as ApiResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      } as ApiResponse, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowy token'
      } as ApiResponse, { status: 401 })
    }

    const body = await request.json()
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
    } = body

    // Validate required fields
    if (!firstName || !lastName || !city || !pesel || gdprConsent === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Wymagane pola: imię, nazwisko, miasto, PESEL i zgoda GDPR'
      } as ApiResponse, { status: 400 })
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        pesel: pesel || null,
        idNumber: idNumber || null,
        street: street || null,
        houseNumber: houseNumber || null,
        apartmentNumber: apartmentNumber || null,
        postalCode: postalCode || null,
        city,
        clientNotes: notes || null,
        gdprConsent,
        gdprConsentDate: gdprConsent ? new Date() : null,
        marketingConsent: marketingConsent || false,
        assignedAgentId: assignedAgentId || null,
        createdByUserId: user.id
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        cases: true,
        notes: true,
        tasks: true
      }
    })

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Klient został dodany pomyślnie'
    } as ApiResponse<ClientWithRelations>)

  } catch (error) {
    console.error('Client creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas tworzenia klienta'
    } as ApiResponse, { status: 500 })
  }
}
