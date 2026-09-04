import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  MoreVertical,
  CheckCheck,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Smile,
  Trash2,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { geminiChatService, ChatMessage, DEFAULT_QUICK_SUGGESTIONS } from '../../services/geminiChatService';

const POPULAR_EMOJIS = ['👋', '👗', '👟', '🧥', '📦', '💳', '✨', '🔥', '❤️', '👍', '😊', '🛍️'];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'bot',
    text: `Hello! 👋\nI can help you with products, orders, shipping, returns, payments and general purchase assistance.\nHow can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('veloura_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MESSAGES;
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem('veloura_chat_history', JSON.stringify(messages.slice(-20)));
    } catch {
      // Ignore quota errors
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessageId = 'msg_' + Date.now();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text,
      timestamp: timeNow,
      status: 'sent',
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setShowEmojiPicker(false);
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const replyText = await geminiChatService.sendMessage(text, historyPayload);

      const botMessageId = 'msg_bot_' + Date.now();
      const newBotMsg: ChatMessage = {
        id: botMessageId,
        role: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newBotMsg]);
    } catch {
      const errorBotMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'bot',
        text: "I'm having trouble connecting right now. Please check your internet or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setShowMenu(false);
    try {
      localStorage.removeItem('veloura_chat_history');
    } catch {
      // ignore
    }
  };

  const handleQuickSuggestion = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const insertEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package':
        return <Package className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Truck':
        return <Truck className="w-3.5 h-3.5 text-indigo-500" />;
      case 'RotateCcw':
        return <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />;
      case 'CreditCard':
        return <CreditCard className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div id="veloura-chatbot-container" className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div
          id="veloura-chat-window"
          className="w-[360px] sm:w-[390px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-100px)] mb-3 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#5c52e8] text-white px-4 py-3.5 flex items-center justify-between shadow-sm relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
                  Veloura Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-white/90 font-medium">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="chatbot-menu-toggle"
                onClick={() => setShowMenu((v) => !v)}
                aria-label="Chat options"
                className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <button
                id="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-8 h-8 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Dropdown */}
            {showMenu && (
              <div
                id="chatbot-menu-dropdown"
                className="absolute right-4 top-14 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl py-1.5 w-44 z-30 animate-in fade-in duration-150"
              >
                <button
                  onClick={handleClearChat}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Conversation
                </button>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div
            id="chatbot-messages-scroll"
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/70 dark:bg-stone-950/40"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 flex-shrink-0 mb-1 border border-stone-300 dark:border-stone-700">
                      <Bot className="w-4 h-4 text-[#5c52e8]" />
                    </div>
                  )}

                  <div
                    className={`px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#5c52e8] text-white rounded-tr-none'
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>

                {/* Timestamp & double check */}
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    {msg.timestamp}
                  </span>
                  {msg.role === 'user' && (
                    <CheckCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 flex-shrink-0 mb-1 border border-stone-300 dark:border-stone-700">
                  <Bot className="w-4 h-4 text-[#5c52e8]" />
                </div>
                <div className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            {/* Quick Action Suggestion Chips */}
            {messages.length <= 3 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mb-2 px-1">
                  Suggested topics:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEFAULT_QUICK_SUGGESTIONS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleQuickSuggestion(item.prompt)}
                      className="flex items-center gap-2 p-2 rounded-xl text-left text-xs font-medium bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-stone-700 dark:text-stone-200 transition-all shadow-2xs group"
                    >
                      <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 group-hover:scale-105 transition-transform">
                        {getSuggestionIcon(item.iconName)}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div
              id="chatbot-emoji-picker"
              className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-2 grid grid-cols-6 gap-1 animate-in fade-in duration-100"
            >
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 text-base rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-stone-100 dark:bg-stone-800/80 rounded-full px-3 py-1.5 border border-stone-200 dark:border-stone-700/60 focus-within:border-[#5c52e8] focus-within:ring-1 focus-within:ring-[#5c52e8] transition-all">
              <input
                ref={inputRef}
                id="chatbot-input-field"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none pr-7"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="absolute right-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
                aria-label="Insert emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              id="chatbot-send-btn"
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
              className="w-9 h-9 rounded-full bg-[#5c52e8] hover:bg-[#4d44d0] disabled:bg-stone-200 dark:disabled:bg-stone-800 text-white disabled:text-stone-400 flex items-center justify-center transition-colors flex-shrink-0 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Circular Launcher Button */}
      <button
        id="veloura-chatbot-launcher"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open Veloura AI Assistant"
        className="group relative w-14 h-14 rounded-full bg-[#5c52e8] hover:bg-[#4d44d0] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-200" />
        ) : (
          <>
            <Bot className="w-7 h-7 text-white transition-transform duration-200 group-hover:rotate-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm animate-bounce">
                1
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
