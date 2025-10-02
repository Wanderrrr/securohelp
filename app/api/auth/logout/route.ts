import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/database'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Wylogowanie pomyślne'
    } as ApiResponse)

    // Usuń cookie z tokenem
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas wylogowania'
    } as ApiResponse, { status: 500 })
  }
}

