import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up database with initial data...');
  console.log('📍 Supabase URL:', supabaseUrl);

  try {
    console.log('\n🔑 Creating user accounts with hashed passwords...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const agentPasswordHash = await bcrypt.hash('agent123', 10);

    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@securohelp.pl',
        password_hash: adminPasswordHash,
        first_name: 'Jan',
        last_name: 'Kowalski',
        role: 'admin',
        is_active: true,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'agent1@securohelp.pl',
        password_hash: agentPasswordHash,
        first_name: 'Anna',
        last_name: 'Nowak',
        role: 'agent',
        is_active: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'agent2@securohelp.pl',
        password_hash: agentPasswordHash,
        first_name: 'Piotr',
        last_name: 'Wiśniewski',
        role: 'agent',
        is_active: true,
      },
    ];

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'email' })
        .select();

      if (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      } else {
        console.log(`✅ User created/updated: ${user.email}`);
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('  Admin: admin@securohelp.pl / admin123');
    console.log('  Agent: agent1@securohelp.pl / agent123');
    console.log('  Agent: agent2@securohelp.pl / agent123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
