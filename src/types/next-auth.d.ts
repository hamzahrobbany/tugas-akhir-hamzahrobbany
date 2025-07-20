    // src/types/next-auth.d.ts
    import NextAuth from 'next-auth';
    import { DefaultSession, DefaultUser } from 'next-auth';
    import { JWT } from 'next-auth/jwt';
    import { Role } from '@prisma/client'; // Import Role enum dari Prisma

    declare module 'next-auth' {
      interface Session {
        user: {
          id: string;
          role: Role; // Tambahkan role ke sesi
          isVerifiedByAdmin: boolean; // Tambahkan status verifikasi admin
        } & DefaultSession['user'];
      }

      interface User extends DefaultUser {
        role: Role; // Tambahkan role ke objek User
        isVerifiedByAdmin: boolean; // Tambahkan status verifikasi admin
      }
    }

    declare module 'next-auth/jwt' {
      interface JWT {
        id: string;
        role: Role; // Tambahkan role ke JWT
        isVerifiedByAdmin: boolean; // Tambahkan status verifikasi admin
      }
    }
    