import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await prisma.insuranceCompany.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(companies);

  } catch (error) {
    console.error('Insurance companies fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, shortName, phone, email } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Generate unique code from name and timestamp
    const baseCode = (shortName || name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    const code = `${baseCode}_${timestamp}`;

    // Check if company with this name already exists
    const existingCompany = await prisma.insuranceCompany.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { shortName: { equals: shortName || '', mode: 'insensitive' } }
        ]
      }
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name or short name already exists' },
        { status: 409 }
      );
    }

    const newCompany = await prisma.insuranceCompany.create({
      data: {
        code,
        name,
        shortName: shortName || null,
        phone: phone || null,
        email: email || null
      }
    });

    console.log(`✅ New insurance company created: ${newCompany.name} (${newCompany.shortName})`);

    return NextResponse.json(newCompany, { status: 201 });

  } catch (error) {
    console.error('Insurance company creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}