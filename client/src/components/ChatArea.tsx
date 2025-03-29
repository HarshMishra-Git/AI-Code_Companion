import { useRef, useEffect, useState } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import MarkdownRenderer from './MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';

const ChatArea = () => {
  const { messages, settings } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Hide welcome message when messages are present
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages, settings.autoScroll]);

  // If there are no messages yet, show a welcome message
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={chatContainerRef}>
        <AnimatePresence>
          <motion.div 
            className="flex items-center justify-center min-h-[calc(100vh-200px)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-2xl text-center p-8 rounded-xl bg-card border border-border shadow-lg relative overflow-hidden">
              <motion.div 
                className="absolute -z-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-30 top-0 right-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 mr-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="36" 
                    height="36" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
                  Welcome to CodeAssist AI
                </h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                How can I help you with your programming tasks today? I can assist with:
              </p>
              
              <motion.ul 
                className="text-left text-muted-foreground space-y-3 mb-6 max-w-md mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[
                  "Writing code in multiple programming languages",
                  "Fixing bugs and errors in your code",
                  "Understanding programming concepts",
                  "Best practices and code optimization",
                  "Problem-solving approaches"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="flex items-start"
                  >
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary mr-2 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col items-center space-y-4"
              >
                <p className="text-muted-foreground text-lg mb-2">
                  Start by typing your question below!
                </p>
                <div 
                  className="flex justify-center items-center relative overflow-hidden group transition-all duration-200"
                  onClick={() => {
                    // Scroll to input field and focus it
                    const inputElement = document.querySelector('#chat-input') as HTMLInputElement;
                    if (inputElement) {
                      inputElement.focus();
                      window.scrollTo(0, document.body.scrollHeight);
                    }
                  }}
                >
                  <button 
                    className="relative px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                      Ask a question
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 will-change-scroll scroll-smooth" 
      ref={chatContainerRef}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div 
              key={message.id} 
              className={cn(
                "flex flex-col",
                message.sender === 'user' ? "items-end" : "items-start"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={cn(
                  "max-w-[85%]",
                  "rounded-lg px-4 py-3",
                  message.sender === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                {message.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <MarkdownRenderer 
                    content={message.content} 
                    isDarkMode={settings.darkMode}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;