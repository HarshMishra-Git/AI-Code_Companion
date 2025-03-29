import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Clipboard, Check, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  language: string;
  code: string;
  theme?: 'dark' | 'light';
}

const CodeBlock = ({ language, code, theme = 'dark' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine the style based on the theme
  const codeStyle = theme === 'dark' ? vscDarkPlus : vs;
  
  // Normalize language name
  const normalizedLanguage = language.toLowerCase().trim();
  
  // Handle common language naming conventions
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'csharp': 'cs',
    'c#': 'cs',
    'c++': 'cpp',
    'shell': 'bash',
    'sh': 'bash',
    'zsh': 'bash',
  };
  
  const mappedLanguage = languageMap[normalizedLanguage] || normalizedLanguage;

  return (
    <motion.div 
      className={cn(
        "code-block relative my-6 rounded-md overflow-hidden shadow-md",
        theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100',
        "gradient-border" // Apply gradient border effect
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex items-center justify-between px-4 py-2 text-xs font-mono",
        theme === 'dark' ? 'bg-zinc-800/90 text-gray-200' : 'bg-gray-200 text-gray-700'
      )}>
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">{mappedLanguage.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-7 px-2 rounded-md",
              theme === 'dark' ? 'hover:bg-zinc-700/80' : 'hover:bg-gray-300',
              copied ? 'text-green-500' : 'text-gray-400'
            )}
            onClick={copyToClipboard}
          >
            {copied ? (
              <motion.div 
                className="flex items-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copied!</span>
              </motion.div>
            ) : (
              <div className="flex items-center">
                <Clipboard className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </div>
            )}
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <SyntaxHighlighter
          language={mappedLanguage}
          style={codeStyle}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '14px',
            padding: '1rem',
            background: theme === 'dark' ? '#1a1b26' : '#f8f9fa',
          }}
          showLineNumbers={code.split('\n').length > 5}
          lineNumberStyle={{ color: theme === 'dark' ? '#4d5566' : '#bdc3cf' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

export default CodeBlock;