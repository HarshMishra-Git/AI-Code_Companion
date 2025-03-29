import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  isDarkMode = true 
}) => {
  // State to track which code blocks have been copied
  const [copiedBlocks, setCopiedBlocks] = useState<Record<string, boolean>>({});
  
  // Enhanced copy code function with better error handling
  const handleCopyCode = (code: string, blockId: string) => {
    try {
      // Use the clipboard API with a fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
          .then(() => {
            // Mark this block as copied
            setCopiedBlocks(prev => ({ ...prev, [blockId]: true }));
            
            // Show success toast
            toast({
              description: "Code copied to clipboard",
              duration: 2000
            });
            
            // Reset copy status after 2 seconds
            setTimeout(() => {
              setCopiedBlocks(prev => ({ ...prev, [blockId]: false }));
            }, 2000);
          })
          .catch(err => {
            console.error('Clipboard API failed:', err);
            // Fallback to document.execCommand (legacy method)
            copyUsingExecCommand(code, blockId);
          });
      } else {
        // Fallback for older browsers
        copyUsingExecCommand(code, blockId);
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast({
        variant: "destructive",
        description: "Failed to copy code",
        duration: 2000
      });
    }
  };
  
  // Fallback copy method using execCommand
  const copyUsingExecCommand = (text: string, blockId: string) => {
    try {
      // Create temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        // Mark this block as copied
        setCopiedBlocks(prev => ({ ...prev, [blockId]: true }));
        
        // Show success toast
        toast({
          description: "Code copied to clipboard",
          duration: 2000
        });
        
        // Reset copy status after 2 seconds
        setTimeout(() => {
          setCopiedBlocks(prev => ({ ...prev, [blockId]: false }));
        }, 2000);
      } else {
        throw new Error('execCommand returned false');
      }
    } catch (err) {
      console.error('execCommand failed:', err);
      toast({
        variant: "destructive",
        description: "Failed to copy code",
        duration: 2000
      });
    }
  };
  
  // Copy the entire response content
  const handleCopyAllContent = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content)
          .then(() => {
            toast({
              description: "Response copied to clipboard",
              duration: 2000
            });
          })
          .catch(err => {
            console.error('Clipboard API failed when copying full content:', err);
            copyUsingExecCommand(content, 'full-content');
          });
      } else {
        copyUsingExecCommand(content, 'full-content');
      }
    } catch (err) {
      console.error('Failed to copy full content:', err);
      toast({
        variant: "destructive",
        description: "Failed to copy response",
        duration: 2000
      });
    }
  };

  return (
    <div className="relative">
      {/* Copy All button */}
      <div className="absolute right-0 top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs bg-primary/5 hover:bg-primary/10 text-primary-foreground rounded-md flex items-center gap-1"
          onClick={handleCopyAllContent}
        >
          <Copy className="h-3 w-3" />
          <span>Copy All</span>
        </Button>
      </div>
      
      <div className={cn(
        "markdown-renderer prose prose-sm max-w-full break-words pt-8",
        isDarkMode ? "prose-invert" : "prose-stone"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              // Generate a unique ID for this code block
              const blockId = `code-block-${Math.random().toString(36).substr(2, 9)}`;
              
              return !inline && match ? (
                <div className="relative group">
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-primary/10 hover:bg-primary/20 text-primary-foreground rounded-md"
                      onClick={() => handleCopyCode(codeString, blockId)}
                    >
                      {copiedBlocks[blockId] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    // @ts-ignore
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }: any) => <p className="mb-4 last:mb-0">{children}</p>,
            h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
            ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
            li: ({ children }: any) => <li className="mb-1">{children}</li>,
            a: ({ href, children }: any) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }: any) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                {children}
              </blockquote>
            ),
            strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
            em: ({ children }: any) => <em className="italic">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;