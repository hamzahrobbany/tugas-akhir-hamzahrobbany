    // src/lib/db.ts
    import { PrismaClient } from '@prisma/client';

    // Deklarasikan variabel global untuk PrismaClient
    // Ini memastikan kita hanya memiliki satu instance PrismaClient di development
    declare global {
      var prisma: PrismaClient | undefined;
    }

    // Inisialisasi PrismaClient
    const prisma = global.prisma || new PrismaClient();

    // Di lingkungan development, simpan instance di global object
    if (process.env.NODE_ENV === 'development') {
      global.prisma = prisma;
    }

    export default prisma;
    