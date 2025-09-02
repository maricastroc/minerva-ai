'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatInput } from '@/components/ChatInput';
import { MessageList } from '@/components/MessageList';
import { MobileHeader } from '@/components/MobileHeader';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useChat } from '@/hooks/useChat';
import { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Home() {
  const isMobile = useScreenSize(768);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isClient, setIsClient] = useState(false);

  const {
    messages,
    input,
    setInput,
    isLoading,
    currentChatId,
    currentChatTitle,
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
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
        title="Home | Simple Chat AI"
        additionalMetaTags={[
          {
            name: 'viewport',
            content:
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
        ]}
      />
      {isClient && (
        <div className="flex h-[100vh] bg-[#212020] text-gray-100 overflow-y-hidden">
          {!isMobile && (
            <Sidebar
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
              chatHistory={chatHistory}
              handleSelectChat={handleSelectChat}
              currentChatId={currentChatId}
              handleNewChat={handleNewChat}
            />
          )}

          <div className="flex-1 flex flex-col">
            {isMobile && (
              <MobileHeader
                chatHistory={chatHistory}
                handleSelectChat={handleSelectChat}
                currentChatId={currentChatId}
                handleNewChat={handleNewChat}
              />
            )}

            <div
              className={`flex-1 flex flex-col items-center ${messages.length === 0 ? 'justify-center' : 'justify-between'} p-4`}
            >
              {messages.length === 0 && !currentChatTitle && (
                <h1 className="text-2xl font-medium text-center mb-8">
                  How can I help you today?
                </h1>
              )}

              {messages.length > 0 && (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  currentChatTitle={currentChatTitle}
                  isMobile={isMobile}
                />
              )}

              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                hasMessages={hasMessages}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
