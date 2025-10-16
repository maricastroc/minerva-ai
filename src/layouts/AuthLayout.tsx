import Image from 'next/image';
import React from 'react';
import { Icon } from '@iconify/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAppContext } from '@/contexts/AppContext';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  setIsLoading: (value: boolean) => void;
}

interface SocialProvider {
  name: string;
  icon: string;
  color?: string;
  provider: string;
}

const socialProviders: SocialProvider[] = [
  { name: 'Google', icon: 'flat-color-icons:google', provider: 'google' },
  {
    name: 'Github',
    icon: 'ant-design:github-outlined',
    provider: 'github',
  },
];

function SocialLoginButtons({
  handleSignIn,
}: {
  handleSignIn: (value: string) => void;
}) {
  return (
    <div className="flex gap-3 flex-col w-full">
      {socialProviders.map((provider) => (
        <button
          key={provider.name}
          className="cursor-pointer text-primary-text text-sm border border-input-border rounded-lg py-[0.65rem] flex items-center justify-center gap-3 w-full hover:bg-outline-button-hover hover:border-outline-button-hover transition-colors"
          onClick={() => handleSignIn(provider.provider)}
        >
          <Icon
            icon={provider.icon}
            fontSize={24}
            color={
              provider.provider === 'github' ? 'text-black dark:text-white' : ''
            }
          />
          <span>Login with {provider.name}</span>
        </button>
      ))}
    </div>
  );
}

export function AuthLayout({
  title,
  children,
  footer,
  setIsLoading,
}: AuthLayoutProps) {
  const router = useRouter();

  const { currentTheme } = useAppContext();

  async function handleSignIn(provider: string) {
    setIsLoading(true);

    if (provider === 'google') {
      await signIn('google', { callbackUrl: '/' });
    } else if (provider === 'github') {
      await signIn('github', { callbackUrl: '/' });
    } else router.push('/');

    setIsLoading(false);
  }

  return (
    <div
      data-theme={currentTheme}
      className="min-h-screen bg-login-background flex flex-col justify-center items-center sm:p-6 p-4 pt-8"
    >
      <div className="mb-8">
        <Image width={180} height={180} alt="Logo" src="/logo-full.svg" />
      </div>

      <div className="w-full border border-white/5 overflow-y-auto chat-scroll-container max-w-xl bg-login-card backdrop-blur-sm rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl text-primary-text text-center mb-6">{title}</h1>

        {children}

        {footer && (
          <>
            <div className="mt-3 text-center">{footer}</div>

            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-input-border"></div>
              <span className="flex-shrink mx-4 text-primary-text text-sm">
                or
              </span>
              <div className="flex-grow border-t border-input-border"></div>
            </div>

            <SocialLoginButtons handleSignIn={handleSignIn} />
          </>
        )}
      </div>
    </div>
  );
}
