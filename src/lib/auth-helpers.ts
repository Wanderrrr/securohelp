import { NextRequest } from 'next/server';
import { getSupabaseServer } from './supabase-server';

export async function getAuthUser(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return userData;
}
