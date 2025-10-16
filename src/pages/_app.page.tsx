import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Bai_Jamjuree } from 'next/font/google';
import { AppProvider } from '@/contexts/AppContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { useEffect } from 'react';

const baiJamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {

  useEffect(() => {
    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme');

      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        console.log('dark')
        document.documentElement.classList.remove('light');
      } else {
        console.log(document.documentElement.classList)
        document.documentElement.classList.add('light');
      }
    };

    loadTheme();
  }, []);

  return (
    <SessionProvider session={session}>
      <AppProvider>
        <AudioProvider>
          <main className={`${baiJamjuree.variable} font-sans`}>
            <Toaster
              toastOptions={{
                style: {
                  backgroundColor: 'var(--color-gray-700)',
                  color: 'var(--color-foreground)',
                },
                success: {
                  style: {
                    backgroundColor: 'var(--color-gray-700)',
                    color: 'var(--color-foreground)',
                  },
                  iconTheme: {
                    primary: 'var(--color-blue-500)',
                    secondary: 'var(--color-foreground)',
                  },
                },
                error: {
                  style: {
                    backgroundColor: 'var(--color-gray-700)',
                    color: 'var(--color-foreground)',
                  },
                  iconTheme: {
                    primary: 'var(--color-red-500)',
                    secondary: 'var(--color-foreground)',
                  },
                },
              }}
            />
            <Component {...pageProps} />
          </main>
        </AudioProvider>
      </AppProvider>
    </SessionProvider>
  );
}
