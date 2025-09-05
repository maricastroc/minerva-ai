import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Bai_Jamjuree } from 'next/font/google';
import { AppProvider } from '@/contexts/AppContext';

const baiJamuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        <main className={baiJamuree.variable}>
          <Toaster
            toastOptions={{
              style: {
                backgroundColor: '#292a2d',
                color: '#fff',
              },
              success: {
                style: {
                  backgroundColor: '#292a2d',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  backgroundColor: '#292a2d',
                  color: '#fff',
                },
              },
            }}
          />
          <Component {...pageProps} />
        </main>
      </AppProvider>
    </SessionProvider>
  );
}
