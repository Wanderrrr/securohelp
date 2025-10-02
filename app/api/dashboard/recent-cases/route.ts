import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { RecentCase, ApiResponse } from '@/types/database'

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

    // Pobierz ostatnie sprawy
    const cases = await prisma.case.findMany({
      where: {
        deletedAt: null
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        status: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const recentCases: RecentCase[] = cases.map(case_ => ({
      id: case_.id,
      caseNumber: case_.caseNumber,
      clientName: `${case_.client.firstName} ${case_.client.lastName}`,
      statusName: case_.status.name,
      statusColor: case_.status.color,
      claimValue: case_.claimValue ? Number(case_.claimValue) : null,
      createdAt: case_.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: recentCases
    } as ApiResponse<RecentCase[]>)

  } catch (error) {
    console.error('Recent cases error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas pobierania ostatnich spraw'
    } as ApiResponse, { status: 500 })
  }
}

