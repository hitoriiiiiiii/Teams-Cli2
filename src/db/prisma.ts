import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['error'],
    });

  globalForPrisma.prisma = prismaInstance;
  return prismaInstance;
}

// Direct initialization for better reliability
const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
