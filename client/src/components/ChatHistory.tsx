import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, X, Plus, Edit, Trash2, CheckCircle, 
  Clock, MoreVertical, XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  isMobile = false,
  isOpen = true,
  onClose
}) => {
  const [location, setLocation] = useLocation();
  const { sessionId, clearMessages, loadSession, setSessionId } = useChatContext();
  const queryClient = useQueryClient();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [sessionToRename, setSessionToRename] = useState<Session | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  // Fetch all chat sessions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/sessions'],
    queryFn: async () => {
      const response = await apiRequest<{ sessions: Session[] }>('/api/sessions');
      return response.sessions;
    }
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest<{ session: Session }>('/api/sessions', {
          method: 'POST',
          body: JSON.stringify({ title: 'New Conversation' })
        });
        return response.session;
      } catch (error) {
        console.error('Error creating new session:', error);
        throw error;
      }
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      clearMessages();
      setSessionId(newSession.id);
      // Set a small timeout to ensure the state is updated before navigating
      setTimeout(() => {
        setLocation(`/chat/${newSession.id}`);
        loadSession(newSession.id);
      }, 50);
    },
    onError: (error) => {
      console.error('Failed to create new conversation:', error);
    }
  });

  // Rename session mutation
  const renameSessionMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string, title: string }) => {
      const response = await apiRequest<{ session: Session }>(`/api/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
      });
      return response.session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setIsRenameDialogOpen(false);
      setSessionToRename(null);
      setNewTitle('');
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/sessions/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
      
      // If the current session was deleted, create a new one
      if (deletedId === sessionId) {
        createSessionMutation.mutate();
      }
    }
  });

  // Handle new chat button click
  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  // Handle session selection
  const handleSelectSession = (id: string) => {
    // Don't reload if it's the current session
    if (id === sessionId) return;
    
    setSessionId(id);
    setLocation(`/chat/${id}`);
    loadSession(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Handle session rename
  const handleRenameClick = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToRename(session);
    setNewTitle(session.title);
    setIsRenameDialogOpen(true);
  };

  // Handle session delete
  const handleDeleteClick = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
  };

  // Format the date to show how long ago the chat was updated
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // If there's no data and it's loading, show a loading message
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading conversations...
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <XCircle className="text-destructive h-10 w-10 mb-2" />
        <p className="text-destructive text-sm text-center">
          Failed to load conversations
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/sessions'] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full", 
      !isOpen && "hidden",
      isMobile ? "absolute inset-0 z-50 bg-background" : "relative"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Chat History</h2>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          className="w-full flex gap-2" 
          onClick={handleNewChat}
          disabled={createSessionMutation.isPending}
          data-new-chat-button
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          {data && data.length > 0 ? (
            data.map((session) => (
              <div 
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md cursor-pointer group hover:bg-muted/50 transition-colors",
                  session.id === sessionId && "bg-muted"
                )}
              >
                <MessageSquare className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium truncate text-sm">
                      {session.title}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1",
                      session.id === sessionId ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={(e) => handleRenameClick(session, e)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rename</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={(e) => handleDeleteClick(session, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start a new conversation to ask questions about programming and coding
              </p>
              <Button onClick={handleNewChat}>
                Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={renameSessionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (sessionToRename && newTitle.trim()) {
                  renameSessionMutation.mutate({
                    id: sessionToRename.id,
                    title: newTitle.trim()
                  });
                }
              }}
              disabled={!newTitle.trim() || renameSessionMutation.isPending}
            >
              {renameSessionMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this conversation?
              {sessionToDelete && (
                <span className="block mt-2 font-medium">{sessionToDelete.title}</span>
              )}
            </p>
            <p className="text-sm text-destructive mt-4">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteSessionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (sessionToDelete) {
                  deleteSessionMutation.mutate(sessionToDelete.id);
                }
              }}
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHistory;