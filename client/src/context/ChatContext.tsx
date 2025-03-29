import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { apiRequest } from '@/lib/queryClient';

// Define the shape of a message
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Define chat settings
interface ChatSettings {
  temperature: number;
  maxLength: number;
  syntaxHighlighting: boolean;
  darkMode: boolean;
  autoScroll: boolean;
}

// Define the context type
interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  loadSession: (id: string) => Promise<any>;
  settings: ChatSettings;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  isProcessing: boolean;
}

// Create the context with default values
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Default settings
const defaultSettings: ChatSettings = {
  temperature: 0.2,
  maxLength: 8192,
  syntaxHighlighting: true,
  darkMode: true,
  autoScroll: true,
};

// Provider component to wrap the app with
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Function to load a chat session by ID
  const loadSession = useCallback(async (id: string) => {
    // Prevent loading if already processing or if the session is the same
    if (isProcessing) {
      console.log('Skipping load - already processing');
      return;
    }
    
    setSessionId(id);
    setIsProcessing(true);
    
    // Use a single request with AbortController to cancel previous requests
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      console.log(`Loading session ${id}`);
      const data = await apiRequest('/api/chat/' + id, {
        method: 'GET',
        signal
      });
      
      // Check if we have actual data
      if (data && data.messages) {
        console.log(`Loaded ${data.messages.length} messages for session ${id}`);
        
        const formattedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          // Map backend role to UI sender format
          sender: msg.role === 'user' ? 'user' : 'bot'
        }));
        
        // Set messages and clear processing state
        setMessages(formattedMessages);
      } else {
        console.log(`No messages for session ${id}`);
        setMessages([]);
      }
    } catch (error) {
      if (signal.aborted) {
        console.log('Request was aborted');
      } else {
        console.error('Error loading session:', error);
        setMessages([]);
      }
    } finally {
      setIsProcessing(false);
    }
    
    // Return cleanup function to cancel request if component unmounts
    return () => {
      controller.abort();
    };
  }, []);

  // Send a message to the backend
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Call API
      const responseData = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: content,
          sessionId,
          settings
        })
      });
      
      // Create a bot message with the response
      const botMessage: Message = {
        id: uuidv4(),
        content: responseData.response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      // Add bot message to the chat
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create an error message
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Sorry, I had trouble processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      // Add error message to the chat
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Clear processing state
      setIsProcessing(false);
    }
  }, [sessionId, settings]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsProcessing(false); // Reset processing state when clearing messages
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<ChatSettings>) => {
    // Update local settings first for immediate UI response
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // If temperature or maxLength is changing, update the server settings
    if (newSettings.temperature !== undefined || newSettings.maxLength !== undefined) {
      try {
        await apiRequest('/api/settings', {
          method: 'POST',
          body: JSON.stringify({
            temperature: updatedSettings.temperature,
            maxLength: updatedSettings.maxLength
          })
        });
      } catch (error) {
        console.error('Error updating settings on the server:', error);
        // We don't rollback the UI settings to avoid confusion
      }
    }
  }, [settings]);

  // Context value
  const value: ChatContextType = {
    messages,
    sendMessage,
    clearMessages,
    sessionId,
    setSessionId: (id: string) => setSessionId(id),
    loadSession,
    settings,
    updateSettings,
    isProcessing
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}