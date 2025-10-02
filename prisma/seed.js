
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@securohelp.pl' },
    update: {},
    create: {
      email: 'admin@securohelp.pl',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Securo',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // 2. Create sample clients
  await prisma.client.create({
    data: {
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '123456789',
      pesel: '85010112345',
      idNumber: 'ABC123456',
      street: 'Kwiatowa',
      houseNumber: '10',
      postalCode: '00-001',
      city: 'Warszawa',
      gdprConsent: true,
      marketingConsent: false,
      createdByUserId: adminUser.id,
    },
  });

  await prisma.client.create({
    data: {
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@example.com',
      phone: '987654321',
      pesel: '92020223456',
      idNumber: 'DEF789012',
      street: 'Leśna',
      houseNumber: '5',
      apartmentNumber: '2',
      postalCode: '30-059',
      city: 'Kraków',
      gdprConsent: true,
      marketingConsent: true,
      createdByUserId: adminUser.id,
    },
  });

   await prisma.client.create({
    data: {
      firstName: 'Piotr',
      lastName: 'Zieliński',
      email: 'piotr.zielinski@example.com',
      phone: '555444333',
      pesel: '78030334567',
      idNumber: 'GHI345678',
      street: 'Słoneczna',
      houseNumber: '15',
      postalCode: '80-880',
      city: 'Gdańsk',
      gdprConsent: true,
      marketingConsent: false,
      createdByUserId: adminUser.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

