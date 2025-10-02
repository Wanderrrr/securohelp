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

    // Get current date info for monthly calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Parallel queries for better performance
    const [
      totalClients,
      activeCases,
      monthlyCompensation,
      closedCases,
      totalCases,
      recentCases
    ] = await Promise.all([
      // Total clients count
      prisma.client.count({
        where: {
          deletedAt: null
        }
      }),

      // Active cases (not closed)
      prisma.case.count({
        where: {
          status: {
            name: {
              notIn: ['closed', 'rejected']
            }
          }
        }
      }),

      // Monthly compensation sum
      prisma.case.aggregate({
        where: {
          compensationReceived: {
            not: null
          },
          updatedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          compensationReceived: true
        }
      }),

      // Closed cases with positive compensation
      prisma.case.count({
        where: {
          compensationReceived: {
            gt: 0
          }
        }
      }),

      // Total cases
      prisma.case.count(),

      // Recent cases (last 5)
      prisma.case.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
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
          },
          insuranceCompany: {
            select: {
              name: true,
              shortName: true
            }
          }
        }
      })
    ]);

    // Calculate success rate (percentage of cases with positive compensation)
    const successRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;

    // Format recent cases for frontend
    const formattedRecentCases = recentCases.map(case_ => ({
      id: case_.caseNumber,
      claimNumber: case_.claimNumber,
      client: `${case_.client.firstName} ${case_.client.lastName}`,
      status: case_.status.name,
      statusColor: case_.status.color,
      insuranceCompany: case_.insuranceCompany?.shortName || case_.insuranceCompany?.name || 'Brak',
      value: case_.claimValue ? `${case_.claimValue.toLocaleString('pl-PL')} zł` : 'Brak',
      date: case_.createdAt.toISOString().split('T')[0]
    }));

    const stats = {
      totalClients,
      activeCases,
      monthlyRevenue: monthlyCompensation._sum.compensationReceived || 0,
      successRate,
      recentCases: formattedRecentCases
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}