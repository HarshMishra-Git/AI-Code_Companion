import { Button } from "./ui/button";
import { Settings, Code, Bot, Trash } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  const { clearMessages } = useChatContext();

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h1 className="text-xl font-bold">Coding Assistant</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground mr-2">
            <Code className="h-4 w-4 mr-1" />
            <span>Powered by Gemini</span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => clearMessages()}
            title="Clear chat"
          >
            <Trash className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettingsClick}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;