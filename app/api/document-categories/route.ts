import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helpers';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: categories, error } = await supabase
      .from('document_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Document categories fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch document categories' }, { status: 500 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Document categories fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document categories' }, { status: 500 });
  }
}
