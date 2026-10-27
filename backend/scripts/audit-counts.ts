import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('--- TABLES IN POSTGRESQL ---');
    console.log(tables.map(t => t.table_name));

    const tableNames = tables.map(t => t.table_name);
    for (const name of tableNames) {
      if (name.startsWith('_')) continue;
      try {
        const countRes: Array<{ count: bigint }> = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${name}"`);
        console.log(`${name}: ${countRes[0].count.toString()} rows`);
      } catch (err: any) {
        console.log(`${name}: error querying (${err.message})`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
