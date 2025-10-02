import { NextRequest, NextResponse } from 'next/server';
import { verifyMockToken, getMockUserById } from '@/lib/mock-auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      }, { status: 401 });
    }

    const tokenData = verifyMockToken(accessToken);

    if (!tokenData) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowy token'
      }, { status: 401 });
    }

    const user = getMockUserById(tokenData.userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Użytkownik nie znaleziony'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas pobierania danych użytkownika'
    }, { status: 500 });
  }
}
