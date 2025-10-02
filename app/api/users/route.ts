import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'
import { UserWithRelations, ApiResponse } from '@/types/database'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    // Build where clause
        const whereClause: Record<string, unknown> = {
      isActive: true
    }

    if (role) {
      const roles = role.split(',').map(r => r.trim());
      if (roles.length > 1) {
        whereClause.role = { in: roles };
      } else {
        whereClause.role = role;
      }
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        assignedClients: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        assignedCases: {
          select: {
            id: true,
            caseNumber: true
          }
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: users
    } as ApiResponse<UserWithRelations[]>)

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas pobierania użytkowników'
    } as ApiResponse, { status: 500 })
  }
}
