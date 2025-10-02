import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST() {
  const supabase = getSupabaseServer();
  try {
    await supabase.auth.signOut();

    const response = NextResponse.json({
      success: true,
      message: 'Wylogowanie pomyślne'
    });

    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas wylogowania'
    }, { status: 500 });
  }
}
