import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from './auth'

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.json({
      success: false,
      error: 'Brak autoryzacji'
    }, { status: 401 })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({
      success: false,
      error: 'Nieprawidłowy token autoryzacji'
    }, { status: 401 })
  }

  // Dodaj użytkownika do headers dla kolejnych middleware/handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-role', user.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const userRole = request.headers.get('x-user-role')
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({
        success: false,
        error: 'Brak uprawnień do tej operacji'
      }, { status: 403 })
    }

    return NextResponse.next()
  }
}

