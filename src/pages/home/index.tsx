'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatInput } from '@/components/ChatInput';
import { MessageList } from '@/components/MessageList';

import { useScreenSize } from '@/hooks/useScreenSize';
import { useChat } from '@/hooks/useChat';
import { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { MobileHeader } from '@/components/MobileHeader';
import { useAppContext } from '@/contexts/AppContext';
import Image from 'next/image';
import { LoadingComponent } from '@/components/LoadingComponent';

export default function Home() {
  const isMobile = useScreenSize(768);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isClient, setIsClient] = useState(false);

  const { currentChatTitle, messages } = useAppContext();

  const {
    input,
    setInput,
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
    mutate,
    isValidating,
  } = useChat();

  const hasMessages = messages.length !== 0;

  const router = useRouter();

  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <NextSeo
        title="Home | Minerva AI"
        additionalMetaTags={[
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
        ]}
      />
      {isClient && (
        <div className="flex h-[100dvh] bg-gray-900 text-gray-50 overflow-hidden safe-area">
          {isValidating && <LoadingComponent />}
          {!isMobile && (
            <Sidebar
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
              chatHistory={chatHistory}
              handleSelectChat={handleSelectChat}
              handleNewChat={handleNewChat}
              mutate={mutate}
            />
          )}

          <div className="flex-1 flex flex-col">
            {isMobile && (
              <MobileHeader
                chatHistory={chatHistory}
                handleSelectChat={handleSelectChat}
                handleNewChat={handleNewChat}
                mutate={mutate}
              />
            )}

            <div
              className={`flex-1 flex flex-col items-center ${messages?.length === 0 ? 'justify-center' : 'justify-between'} p-4`}
            >
              {messages?.length === 0 && !currentChatTitle && (
                <div className="mb-4 flex w-full justify-center items-center gap-4 lg:mb-12">
                  {!isMobile && (
                    <Image
                      className="md:opacity-100 opacity-0"
                      width={30}
                      height={30}
                      alt="Logo"
                      src="/logo.svg"
                    />
                  )}
                  <h1 className="text-2xl lg:text-3xl font-medium text-center">
                    How can I help you today?
                  </h1>
                </div>
              )}

              {messages?.length > 0 && (
                <MessageList messages={messages} isMobile={isMobile} />
              )}

              <ChatInput
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                hasMessages={hasMessages}
                isMobile={isMobile}
                isSidebarOpen={isSidebarOpen}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
