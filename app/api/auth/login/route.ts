import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateJWT } from '@/lib/auth'
import { LoginCredentials, ApiResponse, JWTPayload } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email i hasło są wymagane'
      } as ApiResponse, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Nieprawidłowe dane logowania'
      } as ApiResponse, { status: 401 })
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    const token = generateJWT(payload)

    const response = NextResponse.json({
      success: true,
      data: { user, token },
      message: 'Logowanie pomyślne'
    } as ApiResponse, { status: 200 })

    // Ustaw cookie z tokenem
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dni
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Błąd serwera podczas logowania'
    } as ApiResponse, { status: 500 })
  }
}

