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

    const { data: categories, error } = await supabase
      .from('document_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Document categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document categories' }, { status: 500 });
  }
}
