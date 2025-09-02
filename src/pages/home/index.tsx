'use client';

import { Sidebar } from '@/components/Sidebar';
import { ChatInput } from '@/components/ChatInput';
import { MessageList } from '@/components/MessageList';
import { MobileHeader } from '@/components/MobileHeader';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useChat } from '@/hooks/useChat';
import { useState } from 'react';

export default function Home() {
  const isMobile = useScreenSize(768);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <div className="flex h-screen bg-[#212020] text-gray-100 overflow-y-hidden">
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
            currentChatTitle={currentChatTitle}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
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

          <MessageList
            messages={messages}
            isLoading={isLoading}
            currentChatTitle={currentChatTitle}
            isMobile={isMobile}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
