import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Brak autoryzacji'
      } as ApiResponse, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowy token'
      } as ApiResponse, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: user
    } as ApiResponse)

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas pobierania danych użytkownika'
    } as ApiResponse, { status: 500 })
  }
}

