export interface MockUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'ADMIN' | 'AGENT' | 'ASSISTANT' | 'ACCOUNTANT';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'admin@securohelp.pl',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'System',
    phone: '+48 123 456 789',
    role: 'ADMIN',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    email: 'agent1@securohelp.pl',
    password: 'agent123',
    first_name: 'Jan',
    last_name: 'Kowalski',
    phone: '+48 987 654 321',
    role: 'AGENT',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function authenticateMockUser(email: string, password: string): MockUser | null {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as MockUser;
}

export function getMockUserById(id: string): MockUser | null {
  const user = MOCK_USERS.find(u => u.id === id);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as MockUser;
}

export function generateMockToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64');
}

export function verifyMockToken(token: string): { userId: string; exp: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
