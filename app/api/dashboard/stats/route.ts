import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getAuthUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer();
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count: totalClients, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: activeCases, error: casesError } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (clientsError) {
      console.error('Clients count error:', clientsError);
    }

    if (casesError) {
      console.error('Cases count error:', casesError);
    }

    return NextResponse.json({
      totalClients: totalClients || 0,
      activeCases: activeCases || 0,
      monthlyRevenue: 0,
      successRate: 0,
      recentCases: []
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalClients: 0,
      activeCases: 0,
      monthlyRevenue: 0,
      successRate: 0,
      recentCases: []
    }, { status: 200 });
  }
}
