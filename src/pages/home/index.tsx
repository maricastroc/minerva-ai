'use client';

import { faArrowUp, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

import { Sidebar } from '@/components/Sidebar';
import { MessageItem } from '@/components/MessageItem';
import { LoadingComponent } from '@/components/LoadingComponent';
import { ChatProps } from '@/types/chat';
import { useScreenSize } from '@/hooks/useScreenSize';
import { api } from '@/lib/axios';
import useRequest from '@/hooks/useRequest';
import { MessageProps } from '@/types/message';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);

  const isMobile = useScreenSize(768);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, mutate } = useRequest<ChatProps[]>({
    url: '/user/chats',
    method: 'GET',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await api.get(`/user/chats/${chatId}/messages`);

      const messages: Message[] = response.data.data.messages.map(
        (msg: MessageProps) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          timestamp: new Date(msg.timestamp),
        })
      );

      setMessages(messages);
      setCurrentChatTitle(response.data.data.chatTitle);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (chatId === currentChatId) return;

    setMessages([]);

    await loadChatMessages(String(chatId));
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentChatTitle(null);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/chatbot', {
        message: userMessage.content,
        chatID: currentChatId,
        conversationHistory: messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.isNewConversation) {
        setCurrentChatId(data.chatID);

        await api.get('/user/chats');

        const chatResponse = await api.get<ChatProps>(
          `user/chats/${data.chatID}`
        );

        setCurrentChatTitle(chatResponse.data.title);
        mutate();
      }
    } catch (error) {
      console.error(error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Error connecting to the chatbot. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="fixed top-0 left-0 right-0 z-50 bg-[#181818] p-4 border-b border-[#303133]">
            <div className="flex items-center justify-between">
              <button className="p-2 rounded-md hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
              </button>
              {currentChatTitle ? (
                <h1 className="text-base font-medium text-white break-words line-clamp-1 flex-1 mx-4 text-center">
                  {currentChatTitle}
                </h1>
              ) : (
                <div className="flex-1 mx-4 flex justify-center">
                  <Image
                    width={140}
                    height={140}
                    alt="Logo"
                    src="/logo-full.svg"
                  />
                </div>
              )}
              <div className="w-10"></div>
            </div>
          </div>
        )}

        <div
          className={`flex-1 flex flex-col items-center ${messages?.length === 0 ? 'justify-center' : 'justify-between'} p-4`}
        >
          {messages?.length === 0 && !currentChatTitle && (
            <h1 className="text-2xl font-medium text-center mb-8">
              How can I help you today?
            </h1>
          )}

          <div
            className={`flex flex-col pr-3 max-h-[78vh] chat-scroll-container overflow-y-auto w-full max-w-4xl bg-[#212020] ${isMobile && 'mt-20'}`}
          >
            {!isMobile && currentChatTitle && (
              <div className="sticky top-0 z-10 bg-[#212020] w-full border-b border-[#303133] p-3">
                <h1 className="text-base font-medium text-center text-white break-words line-clamp-2">
                  {currentChatTitle}
                </h1>
              </div>
            )}

            <div className="mt-4">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>

            {isLoading && <LoadingComponent />}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-4xl mb-6 mt-4">
            <div className="flex items-center bg-primary-gray600 rounded-[3rem] p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask simplechat.ai anything"
                className="flex-1 px-4 py-2 focus:outline-none bg-transparent text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/40 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
