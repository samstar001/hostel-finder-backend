// Single shared Prisma Client instance for the whole app. Every
// controller/model imports `prisma` from here instead of creating
// its own client — this avoids opening multiple connection pools.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();