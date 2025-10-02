import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './database'
import { AuthUser, JWTPayload } from '@/types/database'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return null
    }

    // Aktualizuj lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyJWT(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) return null

    return user
  } catch (error) {
    console.error('Get user from token error:', error)
    return null
  }
}
