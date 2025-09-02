/* eslint-disable @typescript-eslint/no-non-null-assertion */
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { NextApiRequest, NextPageContext, NextApiResponse } from 'next';
import { PrismaAdapter } from '@/lib/auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res']
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    session: {
      strategy: 'jwt',
    },
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const user = await prisma.user.findUnique({
            where: { email: credentials?.email },
          });

          if (!user) {
            throw new Error('Incorrect email or password.');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials?.password ?? '',
            user.password ?? ''
          );

          if (!isPasswordValid) {
            throw new Error('Incorrect email or password.');
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.avatarUrl = (user as User & { avatarUrl: string }).avatarUrl;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user = {
            id: token.id as string,
            name: token.name as string,
            email: token.email as string,
            avatarUrl: token.avatarUrl as string,
            role: token.role as 'ADMIN' | 'USER',
          };
        }
        return session;
      },
    },
  };
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, buildNextAuthOptions(req, res));
}
