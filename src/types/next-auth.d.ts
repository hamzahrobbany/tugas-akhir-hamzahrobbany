// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Role } from '@prisma/client';

// Extend `Session`
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      isVerifiedByAdmin: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: Role;
    isVerifiedByAdmin: boolean;
  }
}

// Extend `JWT`
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    isVerifiedByAdmin: boolean;
  }
}
