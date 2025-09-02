import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-primary-gray800 flex flex-col justify-center items-center sm:p-8 p-4 pt-8">
      <div className="mb-10">
        <Image width={180} height={180} alt="Logo" src="/logo-full.svg" />
      </div>

      <div className="w-full overflow-y-auto chat-scroll-container max-w-xl bg-primary-gray700 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl text-white/80 text-center mb-6">{title}</h1>

        {children}

        {footer && (
          <div className="mt-6">
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-white/50 text-sm">or</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>
            <div className="text-center">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
