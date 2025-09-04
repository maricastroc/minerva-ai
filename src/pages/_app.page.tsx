import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Bai_Jamjuree } from 'next/font/google';

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
      <main className={baiJamuree.variable}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              backgroundColor: '#343538',
              color: '#fff',
            },
            success: {
              style: {
                backgroundColor: '#343538',
                color: '#fff',
              },
            },
            error: {
              style: {
                backgroundColor: '#343538',
                color: '#fff',
              },
            },
          }}
        />
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
