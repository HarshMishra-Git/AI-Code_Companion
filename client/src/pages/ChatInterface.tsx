import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useRoute } from 'wouter';
import Header from '@/components/Header';
import ChatArea from '@/components/ChatArea';
import ChatInput from '@/components/ChatInput';
import ChatHistory from '@/components/ChatHistory';
import SettingsModal from '@/components/SettingsModal';
import { useChatContext } from '@/context/ChatContext';
import { ArrowLeft, Menu, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatInterface = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const [match, params] = useRoute('/chat/:id');
  const { settings, setSessionId, loadSession } = useChatContext();
  
  // Load the session from the URL if available
  useEffect(() => {
    if (match && params && params.id) {
      // Track if component is mounted to prevent state updates after unmount
      let isMounted = true;
      
      // Set session ID first
      setSessionId(params.id);
      
      // Load the session data but only update state if component is still mounted
      const loadSessionData = async () => {
        try {
          await loadSession(params.id);
        } catch (error) {
          console.error("Failed to load session:", error);
        }
      };
      
      loadSessionData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [match, params?.id]); // Only depend on ID changes

  useEffect(() => {
    // Small delay to allow for proper animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fix iOS momentum scrolling issue
  useEffect(() => {
    // Apply fixed positioning and overflow hidden for chat interface
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Fix for iOS momentum scrolling
    const touchMoveHandler = function(event: TouchEvent) {
      // Check if the target has a scrollable container
      let target = event.target as HTMLElement;
      while (target && target !== document.body) {
        const { overflowY } = window.getComputedStyle(target);
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return;
        }
        target = target.parentElement as HTMLElement;
      }
      
      // Prevent default for non-scrollable elements
      event.preventDefault();
    };
    
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    
    return () => {
      // Reset all styles when component unmounts
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.removeEventListener('touchmove', touchMoveHandler);
    };
  }, []);

  return (
    <div 
      className={`flex flex-col h-screen ${settings.darkMode ? 'dark' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute left-4 top-4 md:left-6 md:top-6 z-10 flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Home</span>
            </Button>
          </Link>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 md:hidden"
              onClick={() => setIsHistorySidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Chat History</span>
            </Button>
          )}
        </div>
        
        <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      </motion.div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat History Sidebar - Desktop */}
        {!isMobile && (
          <div className="relative hidden md:block h-full">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                width: isSidebarCollapsed ? "60px" : "288px" // w-72 = 288px
              }}
              layout
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full border-r shrink-0 relative bg-background overflow-hidden"
              style={{ pointerEvents: "auto" }}
            >
              {isSidebarCollapsed ? (
                <div className="flex flex-col items-center py-4 h-full">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mb-4 hover:bg-primary/10 transition-colors"
                          onClick={() => setIsSidebarCollapsed(false)}
                        >
                          <PanelLeftOpen className="h-5 w-5" />
                          <span className="sr-only">Expand Sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Expand sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Collapsed New Chat Button */}
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-10 w-10 mx-auto mb-4 hover:bg-primary/10 transition-colors"
                          onClick={() => {
                            // First expand the sidebar then trigger new chat
                            setIsSidebarCollapsed(false);
                            setTimeout(() => {
                              const newChatButton = document.querySelector("[data-new-chat-button]") as HTMLButtonElement;
                              if (newChatButton) {
                                newChatButton.click();
                              }
                            }, 300);
                          }}
                        >
                          <Plus className="h-5 w-5" />
                          <span className="sr-only">New Chat</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>New conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 z-10 hover:bg-primary/10 transition-colors"
                          onClick={() => setIsSidebarCollapsed(true)}
                        >
                          <PanelLeftClose className="h-5 w-5" />
                          <span className="sr-only">Collapse Sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Collapse sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ChatHistory />
                </>
              )}
            </motion.div>
          </div>
        )}
        
        {/* Chat History Sidebar - Mobile */}
        {isMobile && (
          <ChatHistory 
            isMobile={true}
            isOpen={isHistorySidebarOpen}
            onClose={() => setIsHistorySidebarOpen(false)}
          />
        )}
        
        {/* Main Chat Area */}
        <motion.div 
          className="flex-1 overflow-auto flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            y: isLoaded ? 0 : 20 
          }}
          transition={{ 
            duration: 0.5,
            delay: 0.2
          }}
        >
          <div className="relative flex-1 overflow-auto">
            {/* Background gradient effects */}
            <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
              <motion.div 
                className="absolute -z-10 h-72 w-72 bg-primary/20 rounded-full blur-3xl opacity-20 -top-10 -right-10"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                  x: [0, 30, 0],
                  y: [0, -20, 0]
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              <motion.div 
                className="absolute -z-10 h-56 w-56 bg-blue-500/10 rounded-full blur-3xl opacity-20 bottom-20 left-10"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.2, 0.1],
                  x: [0, -20, 0],
                  y: [0, 20, 0]
                }}
                transition={{ 
                  duration: 18, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2
                }}
              />
            </div>
            
            <ChatArea />
          </div>
          
          <ChatInput />
        </motion.div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatInterface;