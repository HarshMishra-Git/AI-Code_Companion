import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './services/geminiService';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Chat API endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        message: z.string(),
        sessionId: z.string(),
        settings: z.object({
          temperature: z.number().min(0).max(1),
          maxLength: z.number().positive(),
          syntaxHighlighting: z.boolean().optional(),
          darkMode: z.boolean().optional(),
          autoScroll: z.boolean().optional()
        }).optional()
      });
      
      const validatedData = schema.parse(req.body);
      const { message, sessionId = uuidv4() } = validatedData;
      
      // Check if this session exists, if not create it with the message as the title
      const existingSession = await storage.getSession(sessionId);
      if (!existingSession) {
        // Use first 30 chars of message as the title, or "New Conversation" if empty
        const title = message.length > 0 
          ? message.substring(0, 30) + (message.length > 30 ? "..." : "") 
          : "New Conversation";
        await storage.createSession(sessionId, title);
      } else {
        // Update the session's updatedAt time
        await storage.updateSessionTitle(sessionId, existingSession.title);
      }
      
      // Save user message to storage
      await storage.createMessage({
        sessionId,
        content: message,
        role: 'user'
      });
      
      try {
        // Get response from the Gemini model
        const aiResponse = await geminiService.sendMessage(message);
        
        // Save bot response to storage
        await storage.createMessage({
          sessionId,
          content: aiResponse,
          role: 'assistant'
        });
        
        // Return response
        res.json({
          response: aiResponse,
          sessionId
        });
      } catch (aiError) {
        console.error('Error getting response from Gemini:', aiError);
        
        // Return a friendly error message
        const errorMessage = 'Sorry, I had trouble processing your request. Please try again.';
        
        // Save error message to storage
        await storage.createMessage({
          sessionId,
          content: errorMessage,
          role: 'assistant'
        });
        
        res.json({
          response: errorMessage,
          sessionId,
          error: true
        });
      }
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(400).json({ error: 'Invalid request data' });
    }
  });
  
  // Get session history
  app.get('/api/chat/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  });
  
  // Clear session history
  app.delete('/api/chat/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteMessages(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      res.status(500).json({ error: 'Failed to clear chat history' });
    }
  });
  
  // Chat sessions endpoints
  app.get('/api/sessions', async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getSessions();
      res.json({ sessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch chat sessions' });
    }
  });
  
  app.post('/api/sessions', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        title: z.string().optional(),
      });
      
      const { title = "New Conversation" } = schema.parse(req.body);
      const sessionId = uuidv4(); // Generate a new session ID
      
      const session = await storage.createSession(sessionId, title);
      res.json({ session });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(400).json({ error: 'Failed to create chat session' });
    }
  });
  
  app.patch('/api/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const schema = z.object({
        title: z.string(),
      });
      
      const { title } = schema.parse(req.body);
      
      const session = await storage.updateSessionTitle(sessionId, title);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json({ session });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(400).json({ error: 'Failed to update chat session' });
    }
  });
  
  app.delete('/api/sessions/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      await storage.deleteSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete chat session' });
    }
  });
  
  // Settings update endpoint
  app.post('/api/settings', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        temperature: z.number().min(0).max(1),
        maxLength: z.number().positive(),
      });
      
      const { temperature, maxLength } = schema.parse(req.body);
      
      // Update Gemini service settings
      geminiService.updateSettings({
        temperature,
        maxOutputTokens: maxLength
      });
      
      res.json({ 
        success: true, 
        settings: { temperature, maxLength }
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(400).json({ error: 'Invalid settings data' });
    }
  });
  
  // File processing support endpoint
  app.post('/api/upload/process', async (req: Request, res: Response) => {
    try {
      // This endpoint just verifies file processing capabilities are active
      // Actual file content is processed on the client side to avoid server storage issues
      res.json({ 
        success: true, 
        message: 'File processing endpoint is active' 
      });
    } catch (error) {
      console.error('Error with file processing endpoint:', error);
      res.status(500).json({ error: 'File processing service unavailable' });
    }
  });
  
  // Model configuration endpoints
  app.get('/api/models', async (_req: Request, res: Response) => {
    try {
      const models = await storage.getModelConfigs();
      res.json({ models });
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });
  
  app.get('/api/models/active', async (_req: Request, res: Response) => {
    try {
      const activeModel = await storage.getActiveModelConfig();
      if (!activeModel) {
        return res.status(404).json({ error: 'No active model found' });
      }
      res.json({ model: activeModel });
    } catch (error) {
      console.error('Error fetching active model:', error);
      res.status(500).json({ error: 'Failed to fetch active model' });
    }
  });
  
  app.post('/api/models/:id/activate', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedModel = await storage.setActiveModelConfig(id);
      
      if (!updatedModel) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      res.json({ model: updatedModel });
    } catch (error) {
      console.error('Error activating model:', error);
      res.status(500).json({ error: 'Failed to activate model' });
    }
  });
  
  app.post('/api/models/:id/update', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({
        modelName: z.string().optional(),
        baseModel: z.string().optional(),
        fineTuningMethod: z.string().optional(),
        deploymentPlatform: z.string().optional(),
        parameters: z.record(z.any()).optional(),
        isActive: z.boolean().optional()
      });
      
      const validatedData = schema.parse(req.body);
      const updatedModel = await storage.updateModelConfig(id, validatedData);
      
      if (!updatedModel) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      res.json({ model: updatedModel });
    } catch (error) {
      console.error('Error updating model:', error);
      res.status(500).json({ error: 'Failed to update model' });
    }
  });

  return httpServer;
}
