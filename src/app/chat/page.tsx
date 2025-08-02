'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { api } from '@/lib/api';
import { ChatMessage as ChatMessageType, Rate } from '@/types';
import ChatMessage from '@/components/ChatMessage';
import { 
  Send, 
  MessageCircle, 
  RefreshCw, 
  Info, 
  Edit2, 
  Check, 
  X, 
  Brain, 
  Sparkles,
  Network,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isRateResponse } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// Generate deterministic particle positions
const generateParticlePositions = (count: number) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    // Use deterministic values based on index
    const angle = (i * 137.5) % 360; // Golden angle
    const radius = (i * 3.7) % 100;
    const x = 50 + (radius * Math.cos(angle * Math.PI / 180)) / 2;
    const y = 50 + (radius * Math.sin(angle * Math.PI / 180)) / 2;
    positions.push({ x, y });
  }
  return positions;
};

const particlePositions = generateParticlePositions(30);

export default function ChatPage() {
  const { 
    sessionId, 
    clearSession, 
    updateSessionId, 
    isEditing, 
    tempSessionId, 
    setTempSessionId,
    startEditing, 
    cancelEditing 
  } = useSession();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);
  const previousMessagesLengthRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Ensure client-side rendering for animated elements
  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Only scroll when new messages are added and we should scroll
  useEffect(() => {
    if (messages.length > previousMessagesLengthRef.current && shouldScrollRef.current) {
      // Scroll for both user and assistant messages
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Check if user should see scroll button
  useEffect(() => {
    const checkScrollPosition = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        setShowScrollButton(!isNearBottom && messages.length > 0);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Check initial position
      
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [messages]);

  const handleManualScroll = () => {
    scrollToBottom();
    setShowScrollButton(false);
  };

  // Safety timeout to clear loading if it gets stuck
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('Safety timeout: clearing loading state');
        setLoading(false);
      }, 15000); // Clear loading after 15 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId || !showHistory) return;
      
      setLoadingHistory(true);
      shouldScrollRef.current = false; // Don't scroll when loading history
      try {
        const response = await api.getSessionHistory(sessionId);
        const historyMessages: ChatMessageType[] = [];
        
        response.history.forEach((entry, index) => {
          // Add user message
          if (entry.user_message) {
            const timestamp = entry.timestamp || new Date().toISOString();
            historyMessages.push({
              id: `history-${timestamp}-user-${index}`,
              role: 'user',
              content: entry.user_message,
              timestamp: new Date(timestamp),
            });
          }
          
          // Add assistant response
          if (entry.assistant_response) {
            const timestamp = entry.timestamp || new Date().toISOString();
            historyMessages.push({
              id: `history-${timestamp}-assistant-${index}`,
              role: 'assistant',
              content: entry.assistant_response,
              timestamp: new Date(timestamp),
              isRateResponse: isRateResponse(entry.assistant_response),
            });
          }
        });
        
        setMessages(historyMessages);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoadingHistory(false);
        shouldScrollRef.current = true; // Re-enable scrolling after history is loaded
      }
    };

    loadChatHistory();
  }, [sessionId, showHistory]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || loading) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    console.log('Sending message:', { 
      messageId: userMessage.id, 
      content: userMessage.content,
      currentLoading: loading 
    });

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    console.log('Set loading to true');
    
    // Scroll immediately after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const response = await api.chat(userMessage.content, sessionId);
      
      if (response.success) {
        const assistantMessage: ChatMessageType = {
          id: uuidv4(),
          role: 'assistant',
          content: response.agent_response,
          timestamp: new Date(),
          isRateResponse: isRateResponse(response.agent_response),
        };

        console.log('Received assistant response:', { 
          messageId: assistantMessage.id, 
          contentLength: assistantMessage.content.length,
          isRateResponse: assistantMessage.isRateResponse 
        });

        console.log('Adding assistant message to state');
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Clear loading immediately after adding the assistant message
        console.log('Clearing loading state after adding assistant message');
        setLoading(false);
        
        // Scroll after assistant message is added
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        toast.error('Failed to get response from AI assistant.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please check your connection.');
      setLoading(false);
    }
  };

  const handleQuotationRequest = (rate: Rate) => {
    // Send a message to request quotation
    const quotationMessage = `Please send me a quotation for the ${rate.carrier} rate from ${rate.origin} to ${rate.destination} (${rate.container_type}) at ${rate.spot_rate_usd} USD.`;
    setInputValue(quotationMessage);
    toast.success('Quotation request prepared. Please provide your details.');
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      if (confirm('Start a new chat? Current conversation will be saved but hidden.')) {
        setMessages([]);
        setShowHistory(false);
        toast.success('New chat started!');
      }
    } else {
      setMessages([]);
      setShowHistory(false);
    }
  };

  const handleNewSession = () => {
    if (messages.length > 0) {
      if (confirm('Are you sure you want to start a new session? Current conversation will be saved.')) {
        clearSession();
        setMessages([]);
        setShowHistory(false);
        toast.success('New session started!');
      }
    } else {
      clearSession();
      setMessages([]);
      setShowHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        {/* Neural Network Background */}
        {isClient && (
          <div className="absolute inset-0">
            {particlePositions.map((pos, i) => (
              <motion.div
                key={`neural-node-${i}`}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + (i % 5),
                  repeat: Infinity,
                  delay: (i % 10) * 0.2,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Flowing Data Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`data-line-background-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              width: '100%',
            }}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ 
              x: '100%', 
              opacity: [0, 1, 0] 
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl"
        >
          {/* Futuristic Header */}
          <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    AI Freight Forwarder Agent
                  </h1>
                  <p className="text-sm text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Get instant shipping rates and quotations
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewChat}
                  className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
                  title="Start new chat"
                >
                  <MessageCircle className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-slate-200 font-medium">New Chat</span>
                </motion.button>
                
                {sessionId && !showHistory && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowHistory(true)}
                    className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
                    title="Load chat history"
                  >
                    <RefreshCw className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-200 font-medium">Load History</span>
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewSession}
                  className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
                  title="Start new session"
                >
                  <RefreshCw className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-slate-200 font-medium">New Session</span>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Futuristic Info Bar */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-b border-slate-700/50 px-6 py-4 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                <Info className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="flex-1">
                Ask me about shipping rates, request quotations, or any freight forwarding questions. 
                <span className="text-cyan-300 font-medium ml-2">
                  Try: &quot;I need rates from Karachi to Dubai for a 20GP container&quot;
                </span>
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300 font-medium">AI Online</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Futuristic Messages Area */}
          <div className="h-[60vh] overflow-y-auto bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30 relative" ref={messagesContainerRef}>
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Cpu className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-slate-300 font-medium">Loading conversation history...</p>
                  <div className="mt-2 flex justify-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`loading-dot-history-${i}`}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                  </div>
                </motion.div>
              </div>
            ) : !sessionId ? (
              <div className="flex items-center justify-center h-full">
                <motion.div 
                  className="text-center max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl mb-6 border border-slate-600/50">
                    <Network className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Enter Session ID</h3>
                  <p className="text-slate-300 mb-6">
                    Please enter your session ID to start chatting. This helps maintain conversation context.
                  </p>
                  <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-4 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                    <p className="text-sm text-cyan-200 mb-3 font-semibold">
                      <Sparkles className="inline w-4 h-4 mr-1" />
                      Session ID Examples:
                    </p>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>• user-123</p>
                      <p>• azfar-chat</p>
                      <p>• test-session</p>
                      <p>• demo-conversation</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <motion.div 
                  className="text-center max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6 inline-block">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
                  <p className="text-slate-300 mb-8">
                    I&apos;m here to help you with shipping rates, quotations, and freight forwarding questions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                      {
                        icon: "📦",
                        title: "Get Shipping Rates",
                        subtitle: "Karachi to Dubai",
                        action: () => setInputValue('Show me rates from Karachi to Dubai'),
                        color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
                      },
                      {
                        icon: "🚢",
                        title: "Container Rates",
                        subtitle: "40ft High Cube",
                        action: () => setInputValue('I need rates for a 40HC container'),
                        color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                      },
                      {
                        icon: "ℹ️",
                        title: "Our Services",
                        subtitle: "Learn about AHS",
                        action: () => setInputValue('What services does AHS Pakistan offer?'),
                        color: "from-purple-500/20 to-violet-500/20 border-purple-500/30"
                      },
                      {
                        icon: "📋",
                        title: "Quotations",
                        subtitle: "Get a quote",
                        action: () => setInputValue('How do I request a quotation?'),
                        color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                      }
                      ].map((item, index) => (
                        <motion.button
                          key={`quick-action-${index}-${item.title}`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={item.action}
                          className={`p-4 bg-gradient-to-br ${item.color} rounded-xl border backdrop-blur-sm transition-all text-left group hover:shadow-lg`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-semibold text-white group-hover:text-cyan-200 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors mt-1">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div>
                {messages.map((message, index) => {
                  console.log('Rendering message:', { 
                    index, 
                    id: message.id, 
                    role: message.role,
                    contentLength: message.content.length 
                  });
                  
                  // Ensure message has a valid ID
                  const messageKey = message.id || `fallback-${index}-${Date.now()}`;
                  console.log('Using message key:', messageKey);
                  
                  return (
                    <motion.div
                      key={messageKey}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ChatMessage
                        message={message}
                        onQuotationRequest={handleQuotationRequest}
                      />
                    </motion.div>
                  );
                })}
                
                {loading && (
                  <motion.div 
                    key="ai-thinking-indicator"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-4 mt-6"
                  >
                    <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600/50">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="h-6 w-6 text-cyan-400" />
                      </motion.div>
                    </div>
                    <div className="bg-slate-700/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-600/30">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300 font-medium">AI is thinking</span>
                        <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={`ai-thinking-dot-${i}`}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Manual Scroll Button */}
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleManualScroll}
                className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all backdrop-blur-sm border border-cyan-400/30"
                title="Scroll to latest message"
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.div>
              </motion.button>
            )}
          </div>

          {/* Futuristic Input Area */}
          <motion.div 
            className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <motion.input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }
                  }}
                  placeholder={!sessionId ? "Enter session ID first..." : "Type your message here..."}
                  className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                  disabled={loading || !sessionId}
                  whileFocus={{ scale: 1.01 }}
                />
                {inputValue && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </motion.div>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim() || !sessionId}
                className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Send className="h-6 w-6 relative z-10" />
              </motion.button>
            </form>
            
            {/* Futuristic Session ID Section */}
            <motion.div 
              className={`flex items-center justify-center space-x-3 mt-4 p-4 rounded-xl border backdrop-blur-sm ${
                !sessionId 
                  ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/30' 
                  : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${!sessionId ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-slate-600/50 border border-slate-500/30'}`}>
                  <Network className={`h-4 w-4 ${!sessionId ? 'text-yellow-400' : 'text-cyan-400'}`} />
                </div>
                <p className={`text-sm font-medium ${!sessionId ? 'text-yellow-300' : 'text-slate-300'}`}>
                  {!sessionId ? '⚠️ Session ID Required:' : 'Active Session:'}
                </p>
              </div>
              
              {isEditing ? (
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    type="text"
                    value={tempSessionId}
                    onChange={(e) => setTempSessionId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateSessionId(tempSessionId);
                      } else if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    className="text-sm px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm"
                    placeholder="Enter session ID"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateSessionId(tempSessionId)}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all"
                    title="Save session ID"
                  >
                    <Check className="h-4 w-4 text-green-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={cancelEditing}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all"
                    title="Cancel editing"
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </motion.button>
                </motion.div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-slate-200 bg-slate-600/50 px-3 py-2 rounded-lg border border-slate-500/30 backdrop-blur-sm">
                    {sessionId || 'Loading...'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={startEditing}
                    className="p-2 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/30 rounded-lg transition-all"
                    title="Edit session ID"
                  >
                    <Edit2 className="h-4 w-4 text-slate-300" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

