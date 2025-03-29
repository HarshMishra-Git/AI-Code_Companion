import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import ChatInterface from "./pages/ChatInterface";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/not-found";
import { ChatProvider } from "./context/ChatContext";
import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/chat" component={ChatInterface} />
            <Route path="/chat/:id" component={ChatInterface} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
