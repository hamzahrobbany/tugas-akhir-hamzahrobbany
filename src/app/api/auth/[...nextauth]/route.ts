// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials'; // Import CredentialsProvider
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import { Adapter } from 'next-auth/adapters';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Import bcryptjs

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ===========================================
    // Tambahkan CredentialsProvider untuk login email/password
    // ===========================================
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password diperlukan.');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error('Kredensial tidak valid.');
        }

        // Bandingkan password yang dimasukkan dengan hash di database
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Kredensial tidak valid.');
        }

        // Jika valid, kembalikan objek user
        // Pastikan id adalah string karena NextAuth mengharapkannya
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isVerifiedByAdmin: user.isVerifiedByAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Ambil role dan isVerifiedByAdmin dari database
        const dbUser = await prisma.user.findUnique({
          where: { id: parseInt(user.id as string) },
          select: { role: true, isVerifiedByAdmin: true },
        });
        token.role = dbUser?.role || Role.CUSTOMER;
        token.isVerifiedByAdmin = dbUser?.isVerifiedByAdmin || false;
      }

      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role as Role;
      }
      if (typeof token?.isVerifiedByAdmin === 'boolean') {
        session.user.isVerifiedByAdmin = token.isVerifiedByAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
