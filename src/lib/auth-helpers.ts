import { NextRequest } from 'next/server';
import { verifyMockToken, getMockUserById } from './mock-auth';

export async function getAuthUser(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;
  }

  const tokenData = verifyMockToken(accessToken);

  if (!tokenData) {
    return null;
  }

  const user = getMockUserById(tokenData.userId);

  return user;
}
