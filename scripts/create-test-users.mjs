import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: 'admin@securohelp.pl',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'System',
    role: 'ADMIN'
  },
  {
    email: 'agent1@securohelp.pl',
    password: 'agent123',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'AGENT'
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          }
        }
      });

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      } else {
        console.log(`✓ Created user: ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.error(`❌ Exception for ${user.email}:`, err.message);
    }
  }

  console.log('\nDone!');
}

createTestUsers();
