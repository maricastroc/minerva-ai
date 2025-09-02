import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: '#161D2F',
            color: '#fff',
          },
          success: {
            style: {
              backgroundColor: '#161D2F',
              color: '#fff',
            },
          },
          error: {
            style: {
              backgroundColor: '#161D2F',
              color: '#fff',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
