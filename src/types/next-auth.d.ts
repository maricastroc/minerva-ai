/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface UserProps {
    role: string;
    id: string | number;
    name: string;
    email: string;
    avatarUrl: string;
    provider?: string;
  }

  interface Session {
    user: UserProps;
  }
}
