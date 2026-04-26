const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const conversations = await prisma.conversation.findMany({
    where: {
      messages: { some: {} }
    },
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(conversations, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
