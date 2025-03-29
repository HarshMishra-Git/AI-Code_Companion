import { v4 as uuidv4 } from 'uuid';
import { 
  users, type User, type InsertUser,
  messages, type Message, type InsertMessage,
  modelConfigs, type ModelConfig, type InsertModelConfig
} from "@shared/schema";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessages(sessionId: string): Promise<void>;
  
  // Chat sessions methods
  getSessions(): Promise<ChatSession[]>;
  getSession(sessionId: string): Promise<ChatSession | undefined>;
  createSession(sessionId: string, title: string): Promise<ChatSession>;
  updateSessionTitle(sessionId: string, title: string): Promise<ChatSession | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Model config methods
  getModelConfigs(): Promise<ModelConfig[]>;
  getActiveModelConfig(): Promise<ModelConfig | undefined>;
  createModelConfig(config: InsertModelConfig): Promise<ModelConfig>;
  updateModelConfig(id: number, config: Partial<InsertModelConfig>): Promise<ModelConfig | undefined>;
  deleteModelConfig(id: number): Promise<void>;
  setActiveModelConfig(id: number): Promise<ModelConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<string, Message[]>;
  private sessions: Map<string, ChatSession>;
  private modelConfigs: Map<number, ModelConfig>;
  private userIdCounter: number;
  private messageIdCounter: number;
  private modelConfigIdCounter: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.sessions = new Map();
    this.modelConfigs = new Map();
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
    this.modelConfigIdCounter = 1;
    
    // Initialize with default model configs
    this.createModelConfig({
      modelName: "Code Llama 7B",
      baseModel: "codellama",
      fineTuningMethod: "qlora",
      deploymentPlatform: "huggingface",
      parameters: { temperature: 0.7, maxLength: 512 },
      isActive: true
    });
    
    this.createModelConfig({
      modelName: "StarCoder 7B",
      baseModel: "starcoder",
      fineTuningMethod: "qlora",
      deploymentPlatform: "huggingface",
      parameters: { temperature: 0.7, maxLength: 512 },
      isActive: false
    });
    
    this.createModelConfig({
      modelName: "WizardCoder 7B",
      baseModel: "wizardcoder",
      fineTuningMethod: "qlora",
      deploymentPlatform: "huggingface",
      parameters: { temperature: 0.7, maxLength: 512 },
      isActive: false
    });
    
    this.createModelConfig({
      modelName: "Mistral 7B",
      baseModel: "mistral",
      fineTuningMethod: "qlora",
      deploymentPlatform: "huggingface",
      parameters: { temperature: 0.7, maxLength: 512 },
      isActive: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.get(sessionId) || [];
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    
    if (!this.messages.has(insertMessage.sessionId)) {
      this.messages.set(insertMessage.sessionId, []);
    }
    
    const sessionMessages = this.messages.get(insertMessage.sessionId)!;
    sessionMessages.push(message);
    
    return message;
  }
  
  async deleteMessages(sessionId: string): Promise<void> {
    this.messages.delete(sessionId);
  }
  
  // Chat sessions methods
  async getSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }
  
  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.sessions.get(sessionId);
  }
  
  async createSession(sessionId: string, title: string): Promise<ChatSession> {
    const now = new Date();
    const session: ChatSession = {
      id: sessionId,
      title,
      createdAt: now,
      updatedAt: now
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  async updateSessionTitle(sessionId: string, title: string): Promise<ChatSession | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      title,
      updatedAt: new Date()
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    // Also delete associated messages
    this.deleteMessages(sessionId);
  }
  
  // Model config methods
  async getModelConfigs(): Promise<ModelConfig[]> {
    return Array.from(this.modelConfigs.values());
  }
  
  async getActiveModelConfig(): Promise<ModelConfig | undefined> {
    return Array.from(this.modelConfigs.values()).find(config => config.isActive);
  }
  
  async createModelConfig(insertConfig: InsertModelConfig): Promise<ModelConfig> {
    const id = this.modelConfigIdCounter++;
    const createdAt = new Date();
    const config: ModelConfig = { 
      ...insertConfig, 
      id, 
      createdAt,
      isActive: insertConfig.isActive === undefined ? false : insertConfig.isActive
    };
    
    // If this config is set as active, deactivate all others
    if (config.isActive) {
      // Using forEach instead of for...of to avoid needing downlevelIteration
      this.modelConfigs.forEach((existingConfig, existingId) => {
        if (existingConfig.isActive) {
          this.modelConfigs.set(existingId, { ...existingConfig, isActive: false });
        }
      });
    }
    
    this.modelConfigs.set(id, config);
    return config;
  }
  
  async updateModelConfig(id: number, updateData: Partial<InsertModelConfig>): Promise<ModelConfig | undefined> {
    const existingConfig = this.modelConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig = { ...existingConfig, ...updateData };
    
    // If this config is being set as active, deactivate all others
    if (updateData.isActive && updateData.isActive !== existingConfig.isActive) {
      // Using forEach instead of for...of to avoid needing downlevelIteration
      this.modelConfigs.forEach((existingConfig, existingId) => {
        if (existingId !== id && existingConfig.isActive) {
          this.modelConfigs.set(existingId, { ...existingConfig, isActive: false });
        }
      });
    }
    
    this.modelConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
  
  async deleteModelConfig(id: number): Promise<void> {
    this.modelConfigs.delete(id);
  }
  
  async setActiveModelConfig(id: number): Promise<ModelConfig | undefined> {
    return this.updateModelConfig(id, { isActive: true });
  }
}

export const storage = new MemStorage();
