import { NextRequest, NextResponse } from 'next/server';
import { authenticateMockUser, generateMockToken } from '@/lib/mock-auth';

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

    const user = authenticateMockUser(email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowe dane logowania'
      }, { status: 401 });
    }

    const token = generateMockToken(user.id);

    const response = NextResponse.json({
      success: true,
      data: {
        user,
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
