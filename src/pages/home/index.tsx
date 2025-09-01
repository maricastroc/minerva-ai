'use client';

import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { Sidebar } from '@/components/Sidebar';
import { MessageItem } from '@/components/MessageItem';
import { LoadingComponent } from '@/components/LoadingComponent';
import { MOCK_CHAT_HISTORY } from '@/utils/constants';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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

  return (
    <div className="flex h-screen bg-[#212020] text-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={(value) => setIsSidebarOpen(value)}
        chatHistory={MOCK_CHAT_HISTORY}
      />

      <div className="flex-1 flex flex-col">
        <div
          className={`flex-1 flex flex-col items-center ${messages?.length === 0 ? 'justify-center' : 'justify-between'} p-4`}
        >
          {messages?.length === 0 && (
            <h1 className="text-2xl font-medium text-center mb-8">
              How can I help you today?
            </h1>
          )}

          <div className="flex flex-col chat-scroll-container overflow-y-auto w-full max-w-4xl bg-[#212020]">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

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
