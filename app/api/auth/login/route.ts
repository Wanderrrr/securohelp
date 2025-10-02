import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email i hasło są wymagane'
      }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowe dane logowania'
      }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowe dane logowania'
      }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
    };

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        session: {
          access_token: token,
          refresh_token: token,
          expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
        }
      },
      message: 'Logowanie pomyślne'
    }, { status: 200 });

    response.cookies.set('sb-access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    response.cookies.set('sb-refresh-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas logowania'
    }, { status: 500 });
  }
}
