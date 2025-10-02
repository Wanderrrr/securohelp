import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: companies, error } = await supabase
      .from('insurance_companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

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
    const user = await getAuthUser(request);
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

    const baseCode = (shortName || name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    const timestamp = Date.now().toString().slice(-4);
    const code = `${baseCode}_${timestamp}`;

    const { data: existingCompany } = await supabase
      .from('insurance_companies')
      .select('id')
      .or(`name.ilike.${name},short_name.ilike.${shortName || ''}`)
      .maybeSingle();

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name or short name already exists' },
        { status: 409 }
      );
    }

    const { data: newCompany, error } = await supabase
      .from('insurance_companies')
      .insert({
        code,
        name,
        short_name: shortName || null,
        phone: phone || null,
        email: email || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

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