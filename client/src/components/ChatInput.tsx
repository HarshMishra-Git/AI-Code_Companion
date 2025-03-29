import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInput = () => {
  const { sendMessage, isProcessing } = useChatContext();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set to scrollHeight to expand
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isProcessing) return;
    
    sendMessage(message);
    setMessage('');
    
    // Reset height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-background p-4 sticky bottom-0 w-full">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative"
      >
        <div className="flex-1 relative">
          <Textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a coding question..."
            disabled={isProcessing}
            className="pr-12 min-h-[60px] max-h-[200px] resize-none w-full"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isProcessing}
            className="absolute right-2 bottom-2 h-8 w-8"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
      
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className="max-w-4xl mx-auto mt-3 p-2 rounded-md bg-muted/50 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
            <span className="text-sm text-muted-foreground">Processing your request...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;