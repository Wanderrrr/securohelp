import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSupabaseServer } from './supabase-server';

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function getAuthUser(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;

    const supabase = getSupabaseServer();
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .maybeSingle();

    return user;
  } catch (error) {
    return null;
  }
}
