'use client';

import { faArrowUp, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

import { Sidebar } from '@/components/Sidebar';
import { MessageItem } from '@/components/MessageItem';
import { LoadingComponent } from '@/components/LoadingComponent';
import { MOCK_CHAT_HISTORY } from '@/utils/constants';
import { ChatProps } from '@/types/chat';
import { useScreenSize } from '@/hooks/useScreenSize';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatProps[] | []>(
    MOCK_CHAT_HISTORY
  );

  const isMobile = useScreenSize(768);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSmartTitle = async (firstMessage: string): Promise<string> => {
    try {
      setIsGeneratingTitle(true);

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a very short title: "${firstMessage}". Reply with title only.`,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar título');
      }

      const data = await res.json();
      console.log(data);
      let title = data.reply.trim();

      title = title.replace(/["'.]/g, '');

      const words = title.split(' ').slice(0, 5).join(' ');
      return words || firstMessage;
    } catch (error) {
      console.error('Erro ao gerar título:', error);

      const meaningfulWords = firstMessage
        .split(' ')
        .filter(
          (word) =>
            word.length > 3 &&
            !['como', 'qual', 'quando', 'onde', 'porque', 'sobre'].includes(
              word.toLowerCase()
            )
        )
        .slice(0, 4)
        .join(' ');

      return meaningfulWords || firstMessage.substring(0, 25) + '...';
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  useEffect(() => {
    const generateTitle = async () => {
      if (
        messages.length === 2 &&
        messages[0].role === 'user' &&
        messages[1].role === 'assistant'
      ) {
        const newChatId = Date.now().toString();
        setCurrentChatId(newChatId);

        const generatedTitle = await generateSmartTitle(messages[0].content);
        setCurrentChatTitle(generatedTitle);

        const newChat: ChatProps = {
          id: newChatId,
          title: generatedTitle,
          date: new Date(),
        };
        setChatHistory((prev) => [newChat, ...prev.slice(0, 9)]);
      }
    };

    generateTitle();
  }, [messages]);

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
      const { data } = await axios.post('/api/chatbot', {
        message: userMessage.content,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || 'Sorry, I could not generate a response.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
  console.log(currentChatTitle);
  return (
    <div className="flex h-screen bg-[#212020] text-gray-100 overflow-y-hidden">
      {!isMobile && (
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          chatHistory={chatHistory}
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
              <div className="w-10"></div> {/* Espaço para balancear */}
            </div>
          </div>
        )}

        <div
          className={`flex-1 flex flex-col items-center ${messages?.length === 0 ? 'justify-center' : 'justify-between'} p-4`}
        >
          {messages?.length === 0 &&
            (!currentChatTitle || isGeneratingTitle) && (
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
            <div className="flex items-center bg-[#303030] rounded-[3rem] p-3">
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
